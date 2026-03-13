"""
OTP Service — Generate, send, and verify one-time passwords.

Supports:
- Email OTP via SMTP (Gmail App Password recommended)
- Phone OTP via console log (production: integrate Twilio/MSG91)

Environment variables:
  SMTP_HOST        (default: smtp.gmail.com)
  SMTP_PORT        (default: 587)
  SMTP_USER        Your Gmail address
  SMTP_PASSWORD    Your Gmail App Password (not your main password)
  SMTP_FROM_NAME   (default: IdeaProbe)
"""

import os
import random
import string
import datetime
import logging
import asyncio

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from models import OTPCode, User

logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 10


# ── OTP Generation ────────────────────────────────────────────────────────────

def generate_otp(length: int = 6) -> str:
    """Generate a secure 6-digit numeric OTP."""
    return "".join(random.choices(string.digits, k=length))


# ── Email Sending ─────────────────────────────────────────────────────────────

async def send_email_otp(to_email: str, otp: str, purpose: str) -> bool:
    """
    Send OTP via email using SMTP.
    Returns True on success, False on failure.
    Falls back to console log if SMTP is not configured.
    """
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    from_name = os.getenv("SMTP_FROM_NAME", "IdeaProbe")

    subject_map = {
        "forgot_password": "Reset your IdeaProbe password",
        "email_otp": "Your IdeaProbe login code",
        "verify_email": "Verify your IdeaProbe email",
    }
    subject = subject_map.get(purpose, "Your IdeaProbe OTP code")

    body = f"""
Hello,

Your IdeaProbe verification code is:

  {otp}

This code expires in {OTP_EXPIRY_MINUTES} minutes.

If you did not request this code, please ignore this email.

— The IdeaProbe Team
https://ideaprobe-app.netlify.app
"""

    if not smtp_user or not smtp_password:
        # No SMTP configured — log to console (development mode)
        logger.warning(f"[OTP DEV MODE] Email OTP for {to_email}: {otp} (purpose: {purpose})")
        print(f"\n{'='*50}")
        print(f"  OTP for {to_email}: {otp}")
        print(f"  Purpose: {purpose}")
        print(f"{'='*50}\n")
        return "dev"  # Signal dev mode so caller can surface the code

    try:
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{smtp_user}>"
        msg["To"] = to_email
        msg.attach(MIMEText(body, "plain"))

        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True,
        )
        logger.info(f"OTP email sent to {to_email} (purpose: {purpose})")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        # Fallback: log to console so dev can still test
        print(f"\n[OTP FALLBACK] {to_email}: {otp} (purpose: {purpose})\n")
        return False


async def send_phone_otp(phone: str, otp: str, purpose: str) -> bool:
    """
    Send OTP via SMS.
    Currently logs to console. For production, integrate Twilio or MSG91.

    To enable Twilio:
      pip install twilio
      Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env
    """
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_from = os.getenv("TWILIO_FROM_NUMBER", "")

    message = f"Your IdeaProbe code is: {otp}. Valid for {OTP_EXPIRY_MINUTES} minutes."

    if twilio_sid and twilio_token and twilio_from:
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)
            client.messages.create(body=message, from_=twilio_from, to=phone)
            logger.info(f"OTP SMS sent to {phone}")
            return True
        except Exception as e:
            logger.error(f"Twilio SMS failed to {phone}: {e}")

    # Fallback: console log
    logger.warning(f"[OTP DEV MODE] SMS OTP for {phone}: {otp} (purpose: {purpose})")
    print(f"\n{'='*50}")
    print(f"  SMS OTP for {phone}: {otp}")
    print(f"  Purpose: {purpose}")
    print(f"{'='*50}\n")
    return "dev"


# ── OTP Database Operations ───────────────────────────────────────────────────

async def create_and_send_otp(
    db: AsyncSession,
    identifier: str,
    purpose: str,
    is_phone: bool = False,
) -> dict:
    """
    Generate an OTP, store it in the database, and send it.
    Returns {"success": True} or {"error": "..."}.
    """
    # Invalidate any existing unused OTPs for this identifier+purpose
    existing = await db.execute(
        select(OTPCode).where(
            and_(
                OTPCode.identifier == identifier,
                OTPCode.purpose == purpose,
                OTPCode.used == False,
            )
        )
    )
    for old_otp in existing.scalars().all():
        old_otp.used = True
    await db.commit()

    # Create new OTP
    code = generate_otp()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp_record = OTPCode(
        identifier=identifier,
        code=code,
        purpose=purpose,
        expires_at=expires_at,
        used=False,
    )
    db.add(otp_record)
    await db.commit()

    # Send OTP
    if is_phone:
        sent = await send_phone_otp(identifier, code, purpose)
    else:
        sent = await send_email_otp(identifier, code, purpose)

    if sent:
        result = {"success": True, "message": f"OTP sent to {identifier}"}
        if sent == "dev":
            result["dev_code"] = code  # Expose in dev mode since no email/SMS is configured
        return result
    else:
        return {"error": "Failed to send OTP. Please try again."}


async def verify_otp(
    db: AsyncSession,
    identifier: str,
    code: str,
    purpose: str,
) -> dict:
    """
    Verify an OTP code.
    Returns {"valid": True} or {"valid": False, "error": "..."}.
    """
    result = await db.execute(
        select(OTPCode).where(
            and_(
                OTPCode.identifier == identifier,
                OTPCode.code == code,
                OTPCode.purpose == purpose,
                OTPCode.used == False,
            )
        )
    )
    otp_record = result.scalar_one_or_none()

    if not otp_record:
        return {"valid": False, "error": "Invalid OTP code. Please check and try again."}

    if datetime.datetime.utcnow() > otp_record.expires_at:
        otp_record.used = True
        await db.commit()
        return {"valid": False, "error": "OTP has expired. Please request a new one."}

    # Mark as used
    otp_record.used = True
    await db.commit()

    return {"valid": True}
