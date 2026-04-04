"""
Auth Router — Register, Login, OTP, Forgot Password, Scan History.
Supports email+password, phone+password, OTP login, and password reset via OTP.
"""

import hashlib
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database import AsyncSessionLocal
from services.auth_service import (
    register_user,
    login_user,
    login_or_create_with_otp,
    reset_password_with_otp,
    get_current_user,
)
from services.otp_service import create_and_send_otp, verify_otp

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


def _is_phone(identifier: str) -> bool:
    """Detect if identifier is a phone number."""
    s = identifier.strip()
    return s.startswith("+") or (s.replace(" ", "").isdigit() and len(s.replace(" ", "")) >= 10)


# ── Request Models ────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    password: str


class LoginRequest(BaseModel):
    identifier: str   # email or phone number
    password: str


class SendOTPRequest(BaseModel):
    identifier: str   # email or phone
    purpose: str      # "forgot_password" | "phone_login" | "email_otp"


class VerifyOTPRequest(BaseModel):
    identifier: str
    code: str
    purpose: str


class OTPLoginRequest(BaseModel):
    identifier: str
    code: str


class ResetPasswordRequest(BaseModel):
    identifier: str
    code: str
    new_password: str


# ── Registration ──────────────────────────────────────────────────────────────

@router.post("/register")
async def register(request: Request, req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and/or phone + password."""
    result = await register_user(
        db,
        full_name=req.full_name or "",
        email=req.email or "",
        phone=req.phone or "",
        password=req.password,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Retroactively link scans from the last 2 hours from this IP (session scans only)
    user_id = result.get("user_id")
    if user_id:
        try:
            import datetime as dt
            client_ip = request.client.host if request.client else "unknown"
            ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
            session_cutoff = dt.datetime.utcnow() - dt.timedelta(hours=2)
            await db.execute(
                text(
                    "UPDATE scans SET user_id = :uid "
                    "WHERE user_id IS NULL AND ip_hash = :ip AND created_at > :cutoff"
                ),
                {"uid": user_id, "ip": ip_hash, "cutoff": session_cutoff},
            )
            await db.commit()
        except Exception:
            pass

    return result


# ── Login (email or phone + password) ────────────────────────────────────────

@router.post("/login")
async def login(request: Request, req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email or phone number + password."""
    result = await login_user(db, req.identifier, req.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])

    # Retroactively link scans from the last 2 hours from this IP (session scans only)
    user_id = result.get("user_id")
    if user_id:
        try:
            import datetime as dt
            client_ip = request.client.host if request.client else "unknown"
            ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
            session_cutoff = dt.datetime.utcnow() - dt.timedelta(hours=2)
            await db.execute(
                text(
                    "UPDATE scans SET user_id = :uid "
                    "WHERE user_id IS NULL AND ip_hash = :ip AND created_at > :cutoff"
                ),
                {"uid": user_id, "ip": ip_hash, "cutoff": session_cutoff},
            )
            await db.commit()
        except Exception:
            pass

    return result


# ── OTP: Send ─────────────────────────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(req: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Send a 6-digit OTP to email or phone.
    purpose: "forgot_password" | "phone_login" | "email_otp"
    """
    identifier = req.identifier.strip()
    is_ph = _is_phone(identifier)
    result = await create_and_send_otp(db, identifier, req.purpose, is_phone=is_ph)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    medium = "phone" if is_ph else "email"
    response = {"message": f"OTP sent to your {medium}. Valid for 10 minutes."}
    if "dev_code" in result:
        response["dev_code"] = result["dev_code"]
    return response


# ── OTP: Verify only (for multi-step flows) ───────────────────────────────────

@router.post("/verify-otp")
async def verify_otp_endpoint(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP without logging in. Used before password reset."""
    result = await verify_otp(db, req.identifier, req.code, req.purpose)
    if not result["valid"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"valid": True}


# ── OTP Login (verify + auto-login/create) ────────────────────────────────────

@router.post("/otp-login")
async def otp_login(req: OTPLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify OTP and log in (auto-creates account if new user).
    Used for: phone login, email OTP login.
    """
    identifier = req.identifier.strip()
    is_ph = _is_phone(identifier)
    purpose = "phone_login" if is_ph else "email_otp"

    otp_result = await verify_otp(db, identifier, req.code, purpose)
    if not otp_result["valid"]:
        raise HTTPException(status_code=400, detail=otp_result["error"])

    result = await login_or_create_with_otp(db, identifier, is_phone=is_ph)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# ── Forgot Password: Reset via OTP ───────────────────────────────────────────

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Reset password using OTP.
    Flow:
      1. POST /api/auth/send-otp  { identifier, purpose: "forgot_password" }
      2. POST /api/auth/reset-password  { identifier, code, new_password }
    """
    identifier = req.identifier.strip()
    is_ph = _is_phone(identifier)

    otp_result = await verify_otp(db, identifier, req.code, "forgot_password")
    if not otp_result["valid"]:
        raise HTTPException(status_code=400, detail=otp_result["error"])

    result = await reset_password_with_otp(db, identifier, req.new_password, is_phone=is_ph)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# ── Current User ──────────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user info."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user = await get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {
        "user_id": user.id,
        "email": user.email or "",
        "phone": user.phone or "",
        "full_name": user.full_name or "",
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


# ── Scan History ──────────────────────────────────────────────────────────────

@router.get("/history")
async def get_scan_history(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all scans for the logged-in user, ordered most recent first.
    Returns up to 50 scans.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user = await get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    result = await db.execute(
        text(
            "SELECT id, idea_text, score, verdict, status, created_at, report_json "
            "FROM scans "
            "WHERE user_id = :user_id "
            "ORDER BY created_at DESC "
            "LIMIT 50"
        ),
        {"user_id": user.id},
    )
    rows = result.fetchall()

    history = []
    for row in rows:
        scan_id, idea_text, score, verdict, status, created_at, report_json = row

        # Fallback: pull score/verdict from report_json if DB columns are null
        if (score is None or verdict is None) and report_json:
            try:
                rj = json.loads(report_json)
                score = score if score is not None else rj.get("score")
                verdict = verdict if verdict is not None else rj.get("verdict")
            except Exception:
                pass

        history.append({
            "scan_id": scan_id,
            "idea_text": idea_text,
            "score": score,
            "verdict": verdict,
            "status": status,
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
        })

    return {"history": history, "total": len(history)}
