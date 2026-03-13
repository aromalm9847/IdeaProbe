"""
Web search service — fetches real competitor and market data from multiple sources.
Uses DuckDuckGo Instant Answer API (no key needed), Wikipedia, and other free sources.
"""

import asyncio
import logging
import re
import json
from typing import List, Dict, Any
import httpx

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; IdeaProbe/2.0; +https://ideaprobe.netlify.app)"
}


async def search_duckduckgo(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """Search DuckDuckGo for real competitor/market information."""
    try:
        async with httpx.AsyncClient(timeout=8.0, headers=HEADERS) as client:
            # DuckDuckGo Instant Answer API
            resp = await client.get(
                "https://api.duckduckgo.com/",
                params={
                    "q": query,
                    "format": "json",
                    "no_html": "1",
                    "skip_disambig": "1",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                results = []

                # Abstract (main result)
                if data.get("Abstract"):
                    results.append({
                        "title": data.get("Heading", query),
                        "snippet": data["Abstract"][:300],
                        "source": data.get("AbstractSource", "DuckDuckGo"),
                    })

                # Related topics
                for topic in data.get("RelatedTopics", [])[:max_results]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        results.append({
                            "title": topic.get("Text", "")[:100],
                            "snippet": topic.get("Text", "")[:300],
                            "source": "DuckDuckGo",
                        })

                return results[:max_results]
    except Exception as e:
        logger.warning(f"DuckDuckGo search failed for '{query}': {e}")
    return []


async def search_google_maps_places(query: str, location: str = "") -> List[Dict[str, str]]:
    """
    Search for local businesses using a free approach.
    Falls back to DuckDuckGo with location context.
    """
    try:
        search_query = f"{query} {location} competitors reviews" if location else f"{query} top competitors"
        results = await search_duckduckgo(search_query, max_results=3)
        return results
    except Exception as e:
        logger.warning(f"Maps search failed: {e}")
    return []


async def search_product_hunt(idea_text: str) -> List[Dict[str, str]]:
    """Search Product Hunt for similar products."""
    try:
        # Use DuckDuckGo to search Product Hunt
        query = f"site:producthunt.com {idea_text}"
        results = await search_duckduckgo(query, max_results=3)
        return results
    except Exception as e:
        logger.warning(f"Product Hunt search failed: {e}")
    return []


async def search_g2_crunchbase(idea_text: str) -> List[Dict[str, str]]:
    """Search G2 and Crunchbase for competitor data."""
    results = []
    try:
        # G2 search
        g2_query = f"site:g2.com {idea_text} alternatives"
        g2_results = await search_duckduckgo(g2_query, max_results=2)
        results.extend(g2_results)
    except Exception as e:
        logger.warning(f"G2 search failed: {e}")

    try:
        # Crunchbase search
        cb_query = f"site:crunchbase.com {idea_text} startup"
        cb_results = await search_duckduckgo(cb_query, max_results=2)
        results.extend(cb_results)
    except Exception as e:
        logger.warning(f"Crunchbase search failed: {e}")

    return results


async def search_justdial(idea_text: str, location: str = "") -> List[Dict[str, str]]:
    """Search JustDial for local business competitors (India-specific)."""
    try:
        query = f"justdial {idea_text} {location}" if location else f"justdial {idea_text}"
        results = await search_duckduckgo(query, max_results=3)
        return results
    except Exception as e:
        logger.warning(f"JustDial search failed: {e}")
    return []


async def search_twitter_discussions(idea_text: str) -> List[Dict[str, str]]:
    """Search Twitter/X for discussions about the idea space."""
    try:
        query = f"twitter {idea_text} startup founder"
        results = await search_duckduckgo(query, max_results=3)
        return results
    except Exception as e:
        logger.warning(f"Twitter search failed: {e}")
    return []


async def search_linkedin_companies(idea_text: str) -> List[Dict[str, str]]:
    """Search LinkedIn for companies in this space."""
    try:
        query = f"site:linkedin.com/company {idea_text}"
        results = await search_duckduckgo(query, max_results=3)
        return results
    except Exception as e:
        logger.warning(f"LinkedIn search failed: {e}")
    return []


def _extract_location(idea_text: str) -> str:
    """Extract location from idea text if mentioned."""
    # Common Indian cities
    cities = [
        "koramangala", "bangalore", "bengaluru", "mumbai", "delhi", "hyderabad",
        "chennai", "pune", "kolkata", "ahmedabad", "jaipur", "surat", "lucknow",
        "indiranagar", "whitefield", "hsr layout", "bandra", "andheri", "powai",
        "new york", "san francisco", "london", "singapore", "dubai",
    ]
    idea_lower = idea_text.lower()
    for city in cities:
        if city in idea_lower:
            return city.title()
    return ""


def _detect_business_type(idea_text: str) -> str:
    """Detect the type of business from the idea text."""
    idea_lower = idea_text.lower()

    local_keywords = {
        "barber": "local_grooming",
        "salon": "local_grooming",
        "hair": "local_grooming",
        "restaurant": "local_food",
        "cafe": "local_food",
        "coffee": "local_food",
        "gym": "local_fitness",
        "fitness": "local_fitness",
        "clinic": "local_healthcare",
        "hospital": "local_healthcare",
        "shop": "local_retail",
        "store": "local_retail",
        "hotel": "local_hospitality",
    }

    for kw, btype in local_keywords.items():
        if kw in idea_lower:
            return btype

    saas_keywords = ["saas", "software", "app", "platform", "tool", "dashboard", "api", "automation"]
    for kw in saas_keywords:
        if kw in idea_lower:
            return "saas"

    marketplace_keywords = ["marketplace", "connect", "platform for", "uber for", "airbnb for"]
    for kw in marketplace_keywords:
        if kw in idea_lower:
            return "marketplace"

    return "general"


async def gather_all_signals(idea_text: str) -> Dict[str, Any]:
    """
    Gather signals from ALL data sources in parallel.
    Returns a consolidated dict of signals for GPT to analyze.
    """
    location = _extract_location(idea_text)
    business_type = _detect_business_type(idea_text)

    # Build targeted search queries based on business type
    if "local" in business_type:
        search_queries = [
            search_duckduckgo(f"{idea_text} competitors market", 5),
            search_google_maps_places(idea_text, location),
            search_justdial(idea_text, location),
            search_duckduckgo(f"how much does {idea_text} cost {location}", 3),
            search_duckduckgo(f"{idea_text} market size India revenue", 3),
            search_twitter_discussions(idea_text),
        ]
    elif business_type == "saas":
        search_queries = [
            search_duckduckgo(f"{idea_text} competitors alternatives", 5),
            search_product_hunt(idea_text),
            search_g2_crunchbase(idea_text),
            search_duckduckgo(f"{idea_text} pricing market size", 3),
            search_linkedin_companies(idea_text),
            search_twitter_discussions(idea_text),
        ]
    else:
        search_queries = [
            search_duckduckgo(f"{idea_text} competitors", 5),
            search_product_hunt(idea_text),
            search_duckduckgo(f"{idea_text} market size revenue", 3),
            search_g2_crunchbase(idea_text),
            search_twitter_discussions(idea_text),
            search_linkedin_companies(idea_text),
        ]

    # Run all searches in parallel
    results = await asyncio.gather(*search_queries, return_exceptions=True)

    consolidated = {
        "location": location,
        "business_type": business_type,
        "web_results": [],
        "local_results": [],
        "market_data": [],
        "social_signals": [],
        "product_listings": [],
    }

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.warning(f"Search {i} failed: {result}")
            continue
        if isinstance(result, list):
            if i == 0:
                consolidated["web_results"].extend(result)
            elif i in [1, 2]:
                consolidated["local_results"].extend(result)
            elif i in [3, 4]:
                consolidated["market_data"].extend(result)
            elif i == 5:
                consolidated["social_signals"].extend(result)

    # Flatten all snippets for GPT context
    all_snippets = []
    for key in ["web_results", "local_results", "market_data", "social_signals"]:
        for item in consolidated.get(key, []):
            if isinstance(item, dict) and item.get("snippet"):
                all_snippets.append(item["snippet"][:200])

    consolidated["all_snippets"] = all_snippets[:15]  # Top 15 snippets for GPT

    return consolidated
