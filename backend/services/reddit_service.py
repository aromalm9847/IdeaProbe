import os
import asyncio
import logging

logger = logging.getLogger(__name__)

STOPWORDS = {"a", "an", "the", "for", "to", "that", "is", "in", "on", "of", "and", "or", "with"}


def _extract_keywords(text: str) -> list:
    words = text.lower().split()
    keywords = [w.strip(".,!?;:") for w in words if w.strip(".,!?;:") not in STOPWORDS and len(w) > 2]
    return keywords[:3]


def _search_reddit_sync(idea_text: str) -> dict:
    try:
        import praw
        client_id = os.getenv("REDDIT_CLIENT_ID", "")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET", "")
        user_agent = os.getenv("REDDIT_USER_AGENT", "IdeaProbe/1.0")

        if not client_id or not client_secret:
            raise ValueError("Reddit credentials not configured")

        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent,
        )

        keywords = _extract_keywords(idea_text)
        query = " ".join(keywords)
        subreddit = reddit.subreddit("startups+entrepreneur+SaaS+indiehackers+smallbusiness")
        posts = list(subreddit.search(query, limit=10, sort="relevance", time_filter="year"))

        pain_points = [post.title for post in posts[:3]]
        sample_signal = ""
        for post in posts:
            if hasattr(post, "selftext") and post.selftext and len(post.selftext) > 20:
                sample_signal = post.selftext[:200]
                break

        return {
            "signal_count": len(posts),
            "pain_points": pain_points,
            "sample_signal": sample_signal,
            "competitors_mentioned": [],
        }
    except Exception as e:
        logger.warning(f"Reddit search failed: {e}")
        return {
            "signal_count": 0,
            "pain_points": [],
            "sample_signal": "",
            "competitors_mentioned": [],
        }


async def search_reddit(idea_text: str) -> dict:
    return await asyncio.to_thread(_search_reddit_sync, idea_text)
