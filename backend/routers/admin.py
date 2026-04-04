"""
Admin Router — Full platform data for admin users only.
"""
import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database import AsyncSessionLocal
from services.auth_service import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


async def require_admin(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]

    admin_secret = os.getenv("ADMIN_SECRET", "")
    if admin_secret and token == admin_secret:
        return True

    user = await get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/stats")
async def get_stats(
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_scans = (await db.execute(text("SELECT COUNT(*) FROM scans"))).scalar() or 0
    guest_scans = (await db.execute(text("SELECT COUNT(*) FROM scans WHERE user_id IS NULL"))).scalar() or 0
    total_users = (await db.execute(text("SELECT COUNT(*) FROM users"))).scalar() or 0
    scans_today = (await db.execute(text("SELECT COUNT(*) FROM scans WHERE DATE(created_at) = DATE('now')"))).scalar() or 0
    users_today = (await db.execute(text("SELECT COUNT(*) FROM users WHERE DATE(created_at) = DATE('now')"))).scalar() or 0
    complete_scans = (await db.execute(text("SELECT COUNT(*) FROM scans WHERE status = 'complete'"))).scalar() or 0
    failed_scans = (await db.execute(text("SELECT COUNT(*) FROM scans WHERE status = 'failed'"))).scalar() or 0
    avg_score_row = (await db.execute(text("SELECT AVG(score) FROM scans WHERE score IS NOT NULL"))).scalar()
    avg_score = round(float(avg_score_row), 1) if avg_score_row else 0

    return {
        "total_scans": total_scans,
        "guest_scans": guest_scans,
        "registered_scans": total_scans - guest_scans,
        "total_users": total_users,
        "scans_today": scans_today,
        "users_today": users_today,
        "complete_scans": complete_scans,
        "failed_scans": failed_scans,
        "avg_score": avg_score,
    }


@router.get("/scan-history")
async def get_all_scan_history(
    page: int = 1,
    limit: int = 50,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    result = await db.execute(
        text(
            "SELECT s.id, s.idea_text, s.industry, s.score, s.verdict, s.status, "
            "s.error_message, s.created_at, s.ip_hash, "
            "s.user_id, u.email, u.full_name, u.phone "
            "FROM scans s "
            "LEFT JOIN users u ON s.user_id = u.id "
            "ORDER BY s.created_at DESC "
            "LIMIT :limit OFFSET :offset"
        ),
        {"limit": limit, "offset": offset},
    )
    rows = result.fetchall()

    count_result = await db.execute(text("SELECT COUNT(*) FROM scans"))
    total = count_result.scalar() or 0

    scans = []
    for row in rows:
        scan_id, idea_text, industry, score, verdict, status, error_message, created_at, ip_hash, user_id, email, full_name, phone = row
        scans.append({
            "scan_id": scan_id,
            "idea_text": idea_text,
            "industry": industry or "",
            "score": score,
            "verdict": verdict or "",
            "status": status,
            "error_message": error_message or "",
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
            "ip_hash": ip_hash or "",
            "is_guest": user_id is None,
            "user_id": user_id,
            "user_email": email or "",
            "user_name": full_name or "",
            "user_phone": phone or "",
        })

    return {"scans": scans, "total": total, "page": page, "limit": limit}


@router.get("/scan-detail/{scan_id}")
async def get_scan_detail(
    scan_id: int,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text(
            "SELECT s.id, s.idea_text, s.industry, s.score, s.verdict, s.report_json, "
            "s.status, s.error_message, s.created_at, s.ip_hash, s.user_id, "
            "u.email, u.full_name, u.phone "
            "FROM scans s "
            "LEFT JOIN users u ON s.user_id = u.id "
            "WHERE s.id = :scan_id"
        ),
        {"scan_id": scan_id},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")

    sid, idea_text, industry, score, verdict, report_json, status, error_message, created_at, ip_hash, user_id, email, full_name, phone = row
    return {
        "scan_id": sid,
        "idea_text": idea_text,
        "industry": industry or "",
        "score": score,
        "verdict": verdict or "",
        "report_json": report_json or "",
        "status": status,
        "error_message": error_message or "",
        "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
        "ip_hash": ip_hash or "",
        "is_guest": user_id is None,
        "user_id": user_id,
        "user_email": email or "",
        "user_name": full_name or "",
        "user_phone": phone or "",
    }


@router.get("/users")
async def get_all_users(
    page: int = 1,
    limit: int = 50,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    result = await db.execute(
        text(
            "SELECT u.id, u.email, u.phone, u.full_name, u.is_admin, u.is_active, "
            "u.created_at, u.last_login, COUNT(s.id) as scan_count "
            "FROM users u "
            "LEFT JOIN scans s ON s.user_id = u.id "
            "GROUP BY u.id "
            "ORDER BY u.created_at DESC "
            "LIMIT :limit OFFSET :offset"
        ),
        {"limit": limit, "offset": offset},
    )
    rows = result.fetchall()

    count_result = await db.execute(text("SELECT COUNT(*) FROM users"))
    total = count_result.scalar() or 0

    users = []
    for row in rows:
        user_id, email, phone, full_name, is_admin, is_active, created_at, last_login, scan_count = row
        users.append({
            "user_id": user_id,
            "email": email or "",
            "phone": phone or "",
            "full_name": full_name or "",
            "is_admin": bool(is_admin),
            "is_active": bool(is_active),
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
            "last_login": last_login.isoformat() if last_login and hasattr(last_login, "isoformat") else None,
            "scan_count": scan_count or 0,
        })

    return {"users": users, "total": total, "page": page, "limit": limit}
