import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ideaprobe.db")

# Railway injects postgres:// or postgresql:// — SQLAlchemy async needs postgresql+asyncpg://
if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _raw_url.startswith("postgresql://") and "+asyncpg" not in _raw_url:
    _raw_url = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DATABASE_URL = _raw_url

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _migrate_user_oauth_columns(conn)


async def _migrate_user_oauth_columns(conn):
    """Idempotent ALTER TABLE for OAuth columns on the users table.
    Works on both SQLite (local) and PostgreSQL (Railway)."""
    from sqlalchemy import text
    is_pg = DATABASE_URL.startswith("postgresql")

    if is_pg:
        statements = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email'",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT",
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_sub ON users (google_sub)",
        ]
        for stmt in statements:
            try:
                await conn.execute(text(stmt))
            except Exception:
                pass
    else:
        # SQLite: PRAGMA to check existing columns, ADD if missing
        result = await conn.execute(text("PRAGMA table_info(users)"))
        existing = {row[1] for row in result.fetchall()}
        adds = [
            ("auth_provider", "ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email'"),
            ("google_sub", "ALTER TABLE users ADD COLUMN google_sub TEXT"),
            ("avatar_url", "ALTER TABLE users ADD COLUMN avatar_url TEXT"),
        ]
        for col, stmt in adds:
            if col not in existing:
                try:
                    await conn.execute(text(stmt))
                except Exception:
                    pass
        try:
            await conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_sub ON users (google_sub)"))
        except Exception:
            pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
