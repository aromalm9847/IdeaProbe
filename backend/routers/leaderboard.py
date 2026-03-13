import datetime
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database import get_db
from schemas import LeaderboardEntry
from services.scoring import get_verdict

router = APIRouter()


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    iso = datetime.date.today().isocalendar()
    week_number = iso[1]
    year = iso[0]

    # Get current week top entries
    result = await db.execute(
        text(
            "SELECT le.idea_text, le.score, s.verdict "
            "FROM leaderboard_entries le "
            "LEFT JOIN scans s ON le.scan_id = s.id "
            "WHERE le.week_number=:week AND le.year=:year "
            "ORDER BY le.score DESC LIMIT 3"
        ),
        {"week": week_number, "year": year},
    )
    rows = result.fetchall()
    entries = []
    for row in rows:
        idea_text, score, verdict = row
        entries.append(
            LeaderboardEntry(
                rank=len(entries) + 1,
                idea_text=idea_text,
                score=score,
                verdict=verdict or get_verdict(score),
            )
        )

    # Backfill with all-time top if fewer than 3
    if len(entries) < 3:
        result = await db.execute(
            text(
                "SELECT le.idea_text, le.score, s.verdict "
                "FROM leaderboard_entries le "
                "LEFT JOIN scans s ON le.scan_id = s.id "
                "ORDER BY le.score DESC LIMIT 10"
            )
        )
        all_rows = result.fetchall()
        existing_texts = {e.idea_text for e in entries}
        for row in all_rows:
            if len(entries) >= 3:
                break
            idea_text, score, verdict = row
            if idea_text not in existing_texts:
                entries.append(
                    LeaderboardEntry(
                        rank=len(entries) + 1,
                        idea_text=idea_text,
                        score=score,
                        verdict=verdict or get_verdict(score),
                    )
                )
                existing_texts.add(idea_text)

    # Pad to exactly 3
    while len(entries) < 3:
        entries.append(
            LeaderboardEntry(
                rank=len(entries) + 1,
                idea_text="---",
                score=0,
                verdict="---",
            )
        )

    return entries[:3]
