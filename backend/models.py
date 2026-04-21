import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(Text, unique=True, nullable=True, index=True)       # nullable: phone-only users
    phone = Column(Text, unique=True, nullable=True, index=True)       # phone number (with country code)
    full_name = Column(Text, nullable=True)
    hashed_password = Column(Text, nullable=True)                      # nullable: OTP-only / OAuth users
    auth_provider = Column(Text, default="email", nullable=True)       # "email" | "google" | "phone"
    google_sub = Column(Text, unique=True, nullable=True, index=True)  # Google's stable user id
    avatar_url = Column(Text, nullable=True)                           # profile picture from OAuth
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class OTPCode(Base):
    """Stores one-time passwords for email/phone verification and password reset."""
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    identifier = Column(Text, nullable=False, index=True)  # email or phone number
    code = Column(Text, nullable=False)                    # 6-digit OTP
    purpose = Column(Text, nullable=False)                 # "forgot_password" | "phone_login" | "email_otp"
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    idea_text = Column(Text, nullable=False)
    industry = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    verdict = Column(Text, nullable=True)
    report_json = Column(Text, nullable=True)
    status = Column(Text, default="pending")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    ip_hash = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null = guest
    country = Column(Text, nullable=True)    # ISO country name (GeoIP)
    region = Column(Text, nullable=True)     # state / region
    city = Column(Text, nullable=True)
    country_code = Column(Text, nullable=True)  # 2-letter ISO


class LoginEvent(Base):
    """Audit trail: every successful login attempt."""
    __tablename__ = "login_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    email = Column(Text, nullable=True, index=True)   # denormalized for fast search
    provider = Column(Text, nullable=False)           # "password" | "google" | "otp"
    ip = Column(Text, nullable=True)
    country = Column(Text, nullable=True)
    country_code = Column(Text, nullable=True)
    region = Column(Text, nullable=True)
    city = Column(Text, nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=True)
    idea_text = Column(Text, nullable=False)
    score = Column(Integer, nullable=False)
    week_number = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)


class MRREstimate(Base):
    __tablename__ = "mrr_estimates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    idea_text = Column(Text, nullable=False)
    business_model = Column(Text, nullable=True)
    target_market = Column(Text, nullable=True)
    mrr_low = Column(Integer, nullable=True)
    mrr_high = Column(Integer, nullable=True)
    reasoning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
