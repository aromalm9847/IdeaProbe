import asyncio
import logging
from typing import List
from schemas import SearchTrend

logger = logging.getLogger(__name__)

STOPWORDS = {"a", "an", "the", "for", "to", "that", "is", "in", "on", "of", "and", "or", "with"}


def _extract_keywords(text: str) -> list:
    words = text.lower().split()
    keywords = [w.strip(".,!?;:") for w in words if w.strip(".,!?;:") not in STOPWORDS and len(w) > 2]
    return keywords[:3]


def _get_trends_sync(idea_text: str) -> List[SearchTrend]:
    try:
        from pytrends.request import TrendReq
        keywords = _extract_keywords(idea_text)
        if not keywords:
            keywords = [idea_text[:30]]

        pytrends = TrendReq(hl="en-US", tz=360)
        pytrends.build_payload(keywords[:3], timeframe="today 12-m", geo="")
        df = pytrends.interest_over_time()

        results = []
        for kw in keywords[:3]:
            if df is None or df.empty or kw not in df.columns:
                results.append(SearchTrend(keyword=kw, trend_direction="+0%", is_rising=False))
                continue
            first_half = df[kw].iloc[:26].mean()
            second_half = df[kw].iloc[26:].mean()
            if first_half == 0:
                pct_str = "+0%"
                is_rising = False
            else:
                pct = int((second_half - first_half) / first_half * 100)
                is_rising = second_half > first_half
                pct_str = f"+{pct}%" if is_rising else f"{pct}%"
            results.append(SearchTrend(keyword=kw, trend_direction=pct_str, is_rising=is_rising))

        # Pad to 3 if needed
        while len(results) < 3:
            kw = keywords[len(results)] if len(results) < len(keywords) else f"keyword{len(results)+1}"
            results.append(SearchTrend(keyword=kw, trend_direction="+0%", is_rising=False))

        return results[:3]
    except Exception as e:
        logger.warning(f"Google Trends failed: {e}")
        keywords = _extract_keywords(idea_text)
        while len(keywords) < 3:
            keywords.append(f"keyword{len(keywords)+1}")
        return [SearchTrend(keyword=kw, trend_direction="+0%", is_rising=False) for kw in keywords[:3]]


async def get_trends(idea_text: str) -> List[SearchTrend]:
    return await asyncio.to_thread(_get_trends_sync, idea_text)
