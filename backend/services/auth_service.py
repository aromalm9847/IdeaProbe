"""
Auth Service — JWT-based authentication.
Supports: email+password, phone+password, OTP login, OTP password reset.
Uses SHA-256 password hashing (no passlib dependency).
"""

import os
import datetime
import hashlib
import logging
import secrets
from typing import Optional
from jose import JWTError, jwt
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from models import User

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ideaprobe-super-secret-jwt-key-change-in-production-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days


# ── Password Hashing ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with a random salt."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"sha256${salt}${hashed}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify a SHA-256 hashed password."""
    try:
        parts = stored_hash.split("$")
        if len(parts) != 3 or parts[0] != "sha256":
            return False
        _, salt, hashed = parts
        expected = hashlib.sha256((salt + plain_password).encode("utf-8")).hexdigest()
        return expected == hashed
    except Exception:
        return False


# ── JWT Tokens ────────────────────────────────────────────────────────────────

def create_access_token(user_id: int, identifier: str) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(user_id),
        "identifier": identifier,
        "exp": expire,
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ── Registration ──────────────────────────────────────────────────────────────

async def register_user(
    db: AsyncSession,
    full_name: str = "",
    email: str = "",
    phone: str = "",
    password: str = "",
) -> dict:
    """
    Register a new user with email and/or phone.
    At least one of email or phone is required.
    """
    email = email.lower().strip() if email else ""
    phone = phone.strip() if phone else ""
    full_name = full_name.strip() if full_name else ""

    if not email and not phone:
        return {"error": "Email or phone number is required."}

    if len(password) < 6:
        return {"error": "Password must be at least 6 characters."}

    # Check for duplicate email
    if email:
        result = await db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            return {"error": "Email already registered. Please log in."}

    # Check for duplicate phone
    if phone:
        result = await db.execute(select(User).where(User.phone == phone))
        if result.scalar_one_or_none():
            return {"error": "Phone number already registered. Please log in."}

    user = User(
        email=email or None,
        phone=phone or None,
        full_name=full_name,
        hashed_password=hash_password(password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    identifier = email or phone
    token = create_access_token(user.id, identifier)
    logger.info(f"New user registered: {identifier}")

    return {
        "user_id": user.id,
        "email": user.email or "",
        "phone": user.phone or "",
        "full_name": user.full_name or "",
        "access_token": token,
        "token_type": "bearer",
    }


# ── Login ─────────────────────────────────────────────────────────────────────

async def login_user(
    db: AsyncSession,
    identifier: str,
    password: str,
) -> dict:
    """Login with email or phone + password."""
    identifier = identifier.strip()

    result = await db.execute(
        select(User).where(
            or_(User.email == identifier.lower(), User.phone == identifier)
        )
    )
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
        return {"error": "Invalid credentials. Please check your email/phone and password."}

    if not user.is_active:
        return {"error": "Account is disabled. Please contact support."}

    user.last_login = datetime.datetime.utcnow()
    await db.commit()

    login_id = user.email or user.phone or str(user.id)
    token = create_access_token(user.id, login_id)
    logger.info(f"User logged in: {login_id}")

    return {
        "user_id": user.id,
        "email": user.email or "",
        "phone": user.phone or "",
        "full_name": user.full_name or "",
        "access_token": token,
        "token_type": "bearer",
    }


# ── OTP Login / Auto-create ───────────────────────────────────────────────────

async def login_or_create_with_otp(
    db: AsyncSession,
    identifier: str,
    is_phone: bool = False,
) -> dict:
    """After OTP is verified, log in the user (or auto-create account if new)."""
    identifier = identifier.strip()

    if is_phone:
        result = await db.execute(select(User).where(User.phone == identifier))
    else:
        result = await db.execute(select(User).where(User.email == identifier.lower()))

    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=identifier.lower() if not is_phone else None,
            phone=identifier if is_phone else None,
            full_name="",
            hashed_password=None,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"Auto-created user via OTP: {identifier}")

    if not user.is_active:
        return {"error": "Account is disabled."}

    user.last_login = datetime.datetime.utcnow()
    await db.commit()

    token = create_access_token(user.id, identifier)
    return {
        "user_id": user.id,
        "email": user.email or "",
        "phone": user.phone or "",
        "full_name": user.full_name or "",
        "access_token": token,
        "token_type": "bearer",
    }


# ── Password Reset ────────────────────────────────────────────────────────────

async def reset_password_with_otp(
    db: AsyncSession,
    identifier: str,
    new_password: str,
    is_phone: bool = False,
) -> dict:
    """Reset a user's password after OTP verification."""
    if len(new_password) < 6:
        return {"error": "Password must be at least 6 characters."}

    identifier = identifier.strip()

    if is_phone:
        result = await db.execute(select(User).where(User.phone == identifier))
    else:
        result = await db.execute(select(User).where(User.email == identifier.lower()))

    user = result.scalar_one_or_none()

    if not user:
        return {"error": "No account found with this email/phone."}

    user.hashed_password = hash_password(new_password)
    await db.commit()

    token = create_access_token(user.id, identifier)
    logger.info(f"Password reset for: {identifier}")

    return {
        "user_id": user.id,
        "email": user.email or "",
        "phone": user.phone or "",
        "full_name": user.full_name or "",
        "access_token": token,
        "token_type": "bearer",
    }


# ── Google OAuth ──────────────────────────────────────────────────────────────

async def login_or_create_with_google(
    db: AsyncSession,
    id_token_str: str,
) -> dict:
    """
    Verify a Google ID token and log in (or auto-create) the user.
    Accepts ID tokens issued for any of the GOOGLE_CLIENT_ID values configured
    (web, iOS, Android can have different audiences).
    """
    # Lazy import so the dependency is only required when Google login is actually used
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
    except ImportError:
        return {"error": "Google authentication is not configured on the server."}

    # Comma-separated list of allowed client IDs (web, ios, android)
    raw_audiences = os.getenv("GOOGLE_CLIENT_IDS") or os.getenv("GOOGLE_CLIENT_ID", "")
    audiences = [a.strip() for a in raw_audiences.split(",") if a.strip()]
    if not audiences:
        return {"error": "Google sign-in is not enabled. Missing GOOGLE_CLIENT_ID."}

    try:
        # google-auth verifies the signature against Google's public keys and checks `exp`/`iss`.
        info = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            audience=audiences if len(audiences) > 1 else audiences[0],
        )
    except ValueError as e:
        logger.warning(f"Google token verification failed: {e}")
        return {"error": "Invalid Google token. Please try again."}

    if info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        return {"error": "Invalid token issuer."}

    google_sub = info.get("sub")
    email = (info.get("email") or "").lower().strip()
    full_name = info.get("name") or ""
    avatar_url = info.get("picture") or ""
    email_verified = info.get("email_verified", False)

    if not google_sub:
        return {"error": "Google token missing subject id."}
    if not email or not email_verified:
        return {"error": "Google email is missing or not verified."}

    # 1. Find by google_sub
    result = await db.execute(select(User).where(User.google_sub == google_sub))
    user = result.scalar_one_or_none()

    # 2. Otherwise, link to existing email account
    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            if not user.is_active:
                return {"error": "Account is disabled."}
            user.google_sub = google_sub
            if not user.avatar_url:
                user.avatar_url = avatar_url
            if not user.full_name:
                user.full_name = full_name
    elif not user.is_active:
        return {"error": "Account is disabled."}

    # 3. Otherwise, create a new user
    if not user:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=None,
            auth_provider="google",
            google_sub=google_sub,
            avatar_url=avatar_url,
            is_active=True,
        )
        db.add(user)
        logger.info(f"New user via Google OAuth: {email}")

    user.last_login = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id, email)
    return {
        "user_id": user.id,
        "email": user.email or "",
        "phone": user.phone or "",
        "full_name": user.full_name or "",
        "avatar_url": user.avatar_url or "",
        "access_token": token,
        "token_type": "bearer",
    }


# ── Token Verification ────────────────────────────────────────────────────────

async def get_current_user(db: AsyncSession, token: str) -> Optional[User]:
    """Verify token and return user. Returns None for invalid/expired tokens."""
    payload = decode_token(token)
    if not payload:
        return None
    user_id = int(payload.get("sub", 0))
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
