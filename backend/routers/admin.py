"""
Admin Router — Full platform data for admin users only.
Endpoints:
  GET /stats           — overview KPIs
  GET /analytics       — charts (scans over time, verdicts, top countries, top industries)
  GET /scan-history    — paginated, filterable list of all scans (with geo + user)
  GET /scan-detail/:id — full report JSON for one scan
  GET /users           — paginated list of all users (with scan count + last login)
  GET /login-history   — paginated audit trail of every login event
"""
import datetime
import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database import AsyncSessionLocal, DATABASE_URL
from services.auth_service import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

_IS_PG = DATABASE_URL.startswith("postgresql")


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


# ── Overview KPIs ────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - datetime.timedelta(days=7)

    async def scalar(sql, params=None):
        return (await db.execute(text(sql), params or {})).scalar() or 0

    total_scans = await scalar("SELECT COUNT(*) FROM scans")
    guest_scans = await scalar("SELECT COUNT(*) FROM scans WHERE user_id IS NULL")
    total_users = await scalar("SELECT COUNT(*) FROM users")
    scans_today = await scalar("SELECT COUNT(*) FROM scans WHERE created_at >= :d", {"d": today_start})
    users_today = await scalar("SELECT COUNT(*) FROM users WHERE created_at >= :d", {"d": today_start})
    scans_week = await scalar("SELECT COUNT(*) FROM scans WHERE created_at >= :d", {"d": week_start})
    users_week = await scalar("SELECT COUNT(*) FROM users WHERE created_at >= :d", {"d": week_start})
    complete_scans = await scalar("SELECT COUNT(*) FROM scans WHERE status = 'complete'")
    failed_scans = await scalar("SELECT COUNT(*) FROM scans WHERE status = 'failed'")
    pending_scans = await scalar("SELECT COUNT(*) FROM scans WHERE status = 'pending'")
    try:
        logins_today = await scalar(
            "SELECT COUNT(*) FROM login_events WHERE created_at >= :d", {"d": today_start}
        )
        logins_week = await scalar(
            "SELECT COUNT(*) FROM login_events WHERE created_at >= :d", {"d": week_start}
        )
    except Exception:
        logins_today = 0
        logins_week = 0

    avg_score_row = (await db.execute(
        text("SELECT AVG(score) FROM scans WHERE score IS NOT NULL")
    )).scalar()
    avg_score = round(float(avg_score_row), 1) if avg_score_row else 0

    return {
        "total_scans": total_scans,
        "guest_scans": guest_scans,
        "registered_scans": total_scans - guest_scans,
        "total_users": total_users,
        "scans_today": scans_today,
        "users_today": users_today,
        "scans_week": scans_week,
        "users_week": users_week,
        "complete_scans": complete_scans,
        "failed_scans": failed_scans,
        "pending_scans": pending_scans,
        "logins_today": logins_today,
        "logins_week": logins_week,
        "avg_score": avg_score,
    }


# ── Analytics (chart-ready aggregates) ───────────────────────────────────────

@router.get("/analytics")
async def get_analytics(
    days: int = Query(30, ge=1, le=365),
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Time series + top-N aggregates for dashboard charts."""
    since = datetime.datetime.utcnow() - datetime.timedelta(days=days)

    # Scans per day — portable: group by substr of ISO date
    if _IS_PG:
        ts_sql = (
            "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS d, COUNT(*) "
            "FROM scans WHERE created_at >= :since GROUP BY d ORDER BY d"
        )
    else:
        ts_sql = (
            "SELECT strftime('%Y-%m-%d', created_at) AS d, COUNT(*) "
            "FROM scans WHERE created_at >= :since GROUP BY d ORDER BY d"
        )
    rows = (await db.execute(text(ts_sql), {"since": since})).fetchall()
    scans_over_time = [{"date": r[0], "count": r[1]} for r in rows]

    # Signups per day
    if _IS_PG:
        su_sql = (
            "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS d, COUNT(*) "
            "FROM users WHERE created_at >= :since GROUP BY d ORDER BY d"
        )
    else:
        su_sql = (
            "SELECT strftime('%Y-%m-%d', created_at) AS d, COUNT(*) "
            "FROM users WHERE created_at >= :since GROUP BY d ORDER BY d"
        )
    rows = (await db.execute(text(su_sql), {"since": since})).fetchall()
    signups_over_time = [{"date": r[0], "count": r[1]} for r in rows]

    # Verdict distribution
    rows = (await db.execute(text(
        "SELECT COALESCE(verdict, 'unknown'), COUNT(*) "
        "FROM scans WHERE status = 'complete' GROUP BY verdict ORDER BY COUNT(*) DESC"
    ))).fetchall()
    verdict_distribution = [{"verdict": r[0] or "unknown", "count": r[1]} for r in rows]

    # Top countries by scan count
    rows = (await db.execute(text(
        "SELECT COALESCE(country, 'Unknown'), COALESCE(country_code, ''), COUNT(*) "
        "FROM scans WHERE country IS NOT NULL AND country <> '' "
        "GROUP BY country, country_code ORDER BY COUNT(*) DESC LIMIT 10"
    ))).fetchall()
    top_countries = [{"country": r[0], "code": r[1] or "", "count": r[2]} for r in rows]

    # Top industries
    rows = (await db.execute(text(
        "SELECT COALESCE(industry, 'Uncategorized'), COUNT(*) "
        "FROM scans WHERE industry IS NOT NULL AND industry <> '' "
        "GROUP BY industry ORDER BY COUNT(*) DESC LIMIT 10"
    ))).fetchall()
    top_industries = [{"industry": r[0], "count": r[1]} for r in rows]

    # Top users by scan count
    rows = (await db.execute(text(
        "SELECT u.id, u.email, u.full_name, COUNT(s.id) "
        "FROM users u JOIN scans s ON s.user_id = u.id "
        "GROUP BY u.id, u.email, u.full_name ORDER BY COUNT(s.id) DESC LIMIT 10"
    ))).fetchall()
    top_users = [
        {"user_id": r[0], "email": r[1] or "", "full_name": r[2] or "", "scan_count": r[3]}
        for r in rows
    ]

    # Score distribution (buckets of 10)
    rows = (await db.execute(text(
        "SELECT CAST(score / 10 AS INTEGER) * 10 AS bucket, COUNT(*) "
        "FROM scans WHERE score IS NOT NULL "
        "GROUP BY bucket ORDER BY bucket"
    ))).fetchall()
    score_distribution = [{"bucket": int(r[0]) if r[0] is not None else 0, "count": r[1]} for r in rows]

    # Auth provider breakdown
    try:
        rows = (await db.execute(text(
            "SELECT COALESCE(provider, 'unknown'), COUNT(*) "
            "FROM login_events GROUP BY provider ORDER BY COUNT(*) DESC"
        ))).fetchall()
        provider_breakdown = [{"provider": r[0], "count": r[1]} for r in rows]
    except Exception:
        provider_breakdown = []

    return {
        "days": days,
        "scans_over_time": scans_over_time,
        "signups_over_time": signups_over_time,
        "verdict_distribution": verdict_distribution,
        "top_countries": top_countries,
        "top_industries": top_industries,
        "top_users": top_users,
        "score_distribution": score_distribution,
        "provider_breakdown": provider_breakdown,
    }


# ── Scan history (searchable, filterable) ────────────────────────────────────

@router.get("/scan-history")
async def get_all_scan_history(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    status: Optional[str] = None,
    country_code: Optional[str] = None,
    from_date: Optional[str] = None,   # ISO yyyy-mm-dd
    to_date: Optional[str] = None,
    guest_only: Optional[bool] = None,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    where = []
    params: dict = {"limit": limit, "offset": offset}

    if search:
        where.append("(LOWER(s.idea_text) LIKE :q OR LOWER(COALESCE(u.email, '')) LIKE :q "
                     "OR LOWER(COALESCE(u.full_name, '')) LIKE :q)")
        params["q"] = f"%{search.lower()}%"
    if status:
        where.append("s.status = :status")
        params["status"] = status
    if country_code:
        where.append("UPPER(s.country_code) = UPPER(:cc)")
        params["cc"] = country_code
    if from_date:
        where.append("s.created_at >= :from_d")
        params["from_d"] = from_date
    if to_date:
        where.append("s.created_at <= :to_d")
        params["to_d"] = to_date
    if guest_only is True:
        where.append("s.user_id IS NULL")
    elif guest_only is False:
        where.append("s.user_id IS NOT NULL")

    where_sql = f"WHERE {' AND '.join(where)}" if where else ""

    result = await db.execute(
        text(
            "SELECT s.id, s.idea_text, s.industry, s.score, s.verdict, s.status, "
            "s.error_message, s.created_at, s.ip_hash, "
            "s.country, s.country_code, s.region, s.city, "
            "s.user_id, u.email, u.full_name, u.phone "
            "FROM scans s "
            "LEFT JOIN users u ON s.user_id = u.id "
            f"{where_sql} "
            "ORDER BY s.created_at DESC "
            "LIMIT :limit OFFSET :offset"
        ),
        params,
    )
    rows = result.fetchall()

    count_result = await db.execute(
        text(f"SELECT COUNT(*) FROM scans s LEFT JOIN users u ON s.user_id = u.id {where_sql}"),
        {k: v for k, v in params.items() if k not in ("limit", "offset")},
    )
    total = count_result.scalar() or 0

    scans = []
    for row in rows:
        (scan_id, idea_text, industry, score, verdict, status_, error_message,
         created_at, ip_hash, country, country_code_v, region, city,
         user_id, email, full_name, phone) = row
        scans.append({
            "scan_id": scan_id,
            "idea_text": idea_text,
            "industry": industry or "",
            "score": score,
            "verdict": verdict or "",
            "status": status_,
            "error_message": error_message or "",
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
            "ip_hash": ip_hash or "",
            "country": country or "",
            "country_code": country_code_v or "",
            "region": region or "",
            "city": city or "",
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
            "s.status, s.error_message, s.created_at, s.ip_hash, "
            "s.country, s.country_code, s.region, s.city, "
            "s.user_id, u.email, u.full_name, u.phone "
            "FROM scans s "
            "LEFT JOIN users u ON s.user_id = u.id "
            "WHERE s.id = :scan_id"
        ),
        {"scan_id": scan_id},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")

    (sid, idea_text, industry, score, verdict, report_json, status_, error_message,
     created_at, ip_hash, country, country_code_v, region, city,
     user_id, email, full_name, phone) = row
    return {
        "scan_id": sid,
        "idea_text": idea_text,
        "industry": industry or "",
        "score": score,
        "verdict": verdict or "",
        "report_json": report_json or "",
        "status": status_,
        "error_message": error_message or "",
        "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
        "ip_hash": ip_hash or "",
        "country": country or "",
        "country_code": country_code_v or "",
        "region": region or "",
        "city": city or "",
        "is_guest": user_id is None,
        "user_id": user_id,
        "user_email": email or "",
        "user_name": full_name or "",
        "user_phone": phone or "",
    }


# ── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    where = []
    params: dict = {"limit": limit, "offset": offset}
    if search:
        where.append("(LOWER(COALESCE(u.email, '')) LIKE :q OR LOWER(COALESCE(u.full_name, '')) LIKE :q "
                     "OR COALESCE(u.phone, '') LIKE :q)")
        params["q"] = f"%{search.lower()}%"
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""

    result = await db.execute(
        text(
            "SELECT u.id, u.email, u.phone, u.full_name, u.is_admin, u.is_active, "
            "COALESCE(u.auth_provider, 'email') AS auth_provider, "
            "u.avatar_url, u.created_at, u.last_login, COUNT(s.id) AS scan_count "
            "FROM users u "
            "LEFT JOIN scans s ON s.user_id = u.id "
            f"{where_sql} "
            "GROUP BY u.id, u.email, u.phone, u.full_name, u.is_admin, u.is_active, "
            "u.auth_provider, u.avatar_url, u.created_at, u.last_login "
            "ORDER BY u.created_at DESC "
            "LIMIT :limit OFFSET :offset"
        ),
        params,
    )
    rows = result.fetchall()

    count_result = await db.execute(
        text(f"SELECT COUNT(*) FROM users u {where_sql}"),
        {k: v for k, v in params.items() if k not in ("limit", "offset")},
    )
    total = count_result.scalar() or 0

    users = []
    for row in rows:
        (user_id, email, phone, full_name, is_admin, is_active,
         auth_provider, avatar_url, created_at, last_login, scan_count) = row
        users.append({
            "user_id": user_id,
            "email": email or "",
            "phone": phone or "",
            "full_name": full_name or "",
            "is_admin": bool(is_admin),
            "is_active": bool(is_active),
            "auth_provider": auth_provider or "email",
            "avatar_url": avatar_url or "",
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
            "last_login": last_login.isoformat() if last_login and hasattr(last_login, "isoformat") else None,
            "scan_count": scan_count or 0,
        })

    return {"users": users, "total": total, "page": page, "limit": limit}


# ── Login history (audit trail) ──────────────────────────────────────────────

@router.get("/login-history")
async def get_login_history(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    provider: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Every successful login. Supports search by email/IP, provider filter, date range."""
    offset = (page - 1) * limit
    where = []
    params: dict = {"limit": limit, "offset": offset}
    if search:
        where.append("(LOWER(COALESCE(le.email, '')) LIKE :q OR COALESCE(le.ip, '') LIKE :q "
                     "OR LOWER(COALESCE(le.country, '')) LIKE :q OR LOWER(COALESCE(le.city, '')) LIKE :q)")
        params["q"] = f"%{search.lower()}%"
    if provider:
        where.append("le.provider = :provider")
        params["provider"] = provider
    if from_date:
        where.append("le.created_at >= :from_d")
        params["from_d"] = from_date
    if to_date:
        where.append("le.created_at <= :to_d")
        params["to_d"] = to_date
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""

    try:
        result = await db.execute(
            text(
                "SELECT le.id, le.user_id, le.email, le.provider, le.ip, "
                "le.country, le.country_code, le.region, le.city, "
                "le.user_agent, le.created_at, u.full_name "
                "FROM login_events le "
                "LEFT JOIN users u ON le.user_id = u.id "
                f"{where_sql} "
                "ORDER BY le.created_at DESC "
                "LIMIT :limit OFFSET :offset"
            ),
            params,
        )
        rows = result.fetchall()
        count_result = await db.execute(
            text(f"SELECT COUNT(*) FROM login_events le {where_sql}"),
            {k: v for k, v in params.items() if k not in ("limit", "offset")},
        )
        total = count_result.scalar() or 0
    except Exception:
        # Table may not exist yet on first deploy; degrade gracefully.
        return {"events": [], "total": 0, "page": page, "limit": limit}

    events = []
    for row in rows:
        (eid, user_id, email, provider_v, ip, country, country_code_v,
         region, city, user_agent, created_at, full_name) = row
        events.append({
            "id": eid,
            "user_id": user_id,
            "email": email or "",
            "full_name": full_name or "",
            "provider": provider_v or "",
            "ip": ip or "",
            "country": country or "",
            "country_code": country_code_v or "",
            "region": region or "",
            "city": city or "",
            "user_agent": user_agent or "",
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
        })

    return {"events": events, "total": total, "page": page, "limit": limit}
