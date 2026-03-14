import hashlib
import json
import datetime
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
from fastapi import Header
from services.auth_service import get_current_user

from database import get_db
from schemas import ScanRequest, ScanResponse, ScanStatus, ReportData
from services import pipeline

router = APIRouter()


@router.post("/scan", response_model=ScanResponse)
async def create_scan(
    request: Request,
    body: ScanRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    # Rate limiting: hash IP, check 5+ scans in last 3600s
    client_ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()

    cutoff = datetime.datetime.utcnow() - datetime.timedelta(seconds=3600)
    result = await db.execute(
        text("SELECT COUNT(*) FROM scans WHERE ip_hash=:ip_hash AND created_at > :cutoff"),
        {"ip_hash": ip_hash, "cutoff": cutoff},
    )
    count = result.scalar()
    if count and count >= 5:
        raise HTTPException(status_code=429, detail="Too many scans. Please wait before scanning again.")

    # Get user_id from token if provided
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        user = await get_current_user(db, token)
        if user:
            user_id = user.id

    # Insert new scan row
    result = await db.execute(
        text(
            "INSERT INTO scans (idea_text, status, ip_hash, user_id, created_at) "
            "VALUES (:idea_text, 'pending', :ip_hash, :user_id, :created_at)"
        ),
        {
            "idea_text": body.idea_text,
            "ip_hash": ip_hash,
            "user_id": user_id,
            "created_at": datetime.datetime.utcnow(),
        },
    )
    await db.commit()
    scan_id = result.lastrowid

    # Launch background pipeline
    background_tasks.add_task(pipeline.run_full_scan, scan_id, body.idea_text)

    return ScanResponse(scan_id=scan_id, status=ScanStatus.pending)


@router.get("/scan/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, status, report_json, error_message FROM scans WHERE id=:id"),
        {"id": scan_id},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan_id_db, status, report_json, error_message = row

    if status == "complete" and report_json:
        try:
            report_dict = json.loads(report_json)
            report = ReportData(**report_dict)
            return ScanResponse(scan_id=scan_id_db, status=ScanStatus.complete, report=report)
        except Exception as e:
            return ScanResponse(
                scan_id=scan_id_db,
                status=ScanStatus.failed,
                error=f"Report parse error: {str(e)}",
            )

    if status == "failed":
        return ScanResponse(
            scan_id=scan_id_db,
            status=ScanStatus.failed,
            error=error_message or "Scan failed.",
        )

    return ScanResponse(scan_id=scan_id_db, status=ScanStatus(status))
