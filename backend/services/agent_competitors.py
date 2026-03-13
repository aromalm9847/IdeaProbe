"""
Competitors Agent — Finds 5-7 real global & local competitors with deep analysis.
Powered by GPT-5 with strict accuracy requirements and INR pricing.
Outputs: competitors[], observations, sources, reasoning
"""

import json, logging, re
from services.ai_client import client, MODEL

logger = logging.getLogger(__name__)


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


async def run_competitors_agent(idea_text: str, location: str = "", business_type: str = "general", web_context: list = None) -> dict:
    """
    Competitors Agent: Finds 5-7 real competitors (global & local) with deep analysis.
    Includes products, USPs, audience, pricing in INR, strengths, weaknesses, and URLs.
    ALL data must be real and verifiable. No fabricated companies.
    """
    context_str = ""
    if web_context:
        context_str = "\n\nWeb research context:\n" + "\n".join(f"- {s}" for s in web_context[:10])

    location_str = f" in {location}" if location else " in India"
    type_hint = ""
    if "local" in business_type:
        type_hint = f"""
This is a LOCAL PHYSICAL BUSINESS{location_str}. You MUST include:
1. Real local competitors in that specific area (search your knowledge for actual businesses)
2. Major aggregator/booking platforms active in India: Urban Company, JustDial, Sulekha, BookMyShow (if applicable), Practo (if health), Swiggy/Zomato (if food), etc.
3. National chains that operate in this space
4. Any local franchise brands
5. Online alternatives that compete for the same customer spend
"""
    elif business_type == "saas":
        type_hint = """
This is a SaaS/software product. You MUST include:
1. Direct software competitors (same feature set)
2. Adjacent tools that partially solve the problem
3. Indian SaaS competitors (Zoho, Freshworks, etc. if applicable)
4. Global market leaders
5. Open-source alternatives
"""
    else:
        type_hint = """
Include both global and local competitors:
1. Global market leaders in this space
2. Indian/regional competitors
3. Indirect competitors (different approach, same problem)
4. Emerging startups in this space
"""

    system_prompt = f"""You are a world-class competitive intelligence analyst powered by GPT-5. Your job is to find REAL, EXISTING competitors for any business idea with maximum accuracy.{type_hint}

STRICT RULES — NEVER VIOLATE:
1. NEVER fabricate a company name. Only list businesses/products that ACTUALLY EXIST.
2. ALL pricing MUST be in Indian Rupees (₹). Convert any USD/GBP to INR (1 USD ≈ ₹83).
3. Pricing must be REAL and SPECIFIC — check your knowledge for actual pricing (e.g., "₹299/visit for basic haircut" not "₹100-500 range").
4. Market share estimates must be realistic and based on known data.
5. Strengths and weaknesses must be GENUINE and SPECIFIC to that company.
6. Website URLs must be real and correct.
7. Confidence ratings must be honest — use 0.6-0.75 for estimates, 0.85-0.95 for well-documented facts.
8. Find 5-7 competitors minimum. If direct competitors are limited, include indirect/substitute competitors.
9. For Indian businesses: always include Urban Company, JustDial, or relevant Indian platforms as competitors.
10. Gap opportunities must be SPECIFIC and ACTIONABLE — not generic.

Return ONLY valid JSON in this exact format:
{{
  "competitors": [
    {{
      "name": "Real Company/Product Name",
      "website": "https://real-website.com",
      "products": "Specific products/services they offer",
      "usp": "Their actual unique selling proposition",
      "target_audience": "Who they specifically serve",
      "pricing": "Real pricing in ₹ (e.g., ₹299/month, ₹500-2000/visit, Free + ₹999/mo premium)",
      "market_share": "Realistic estimate with basis (e.g., '~35% of Indian online salon bookings')",
      "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
      "weaknesses": ["Specific weakness 1", "Specific weakness 2", "Specific weakness 3"],
      "gap_opportunity": "Specific gap this competitor leaves that you can exploit",
      "your_fix": "Specific, actionable way to beat this competitor at this gap",
      "confidence": 0.85
    }}
  ],
  "observations": {{
    "market_trends": ["Specific trend 1 with data", "Specific trend 2 with data"],
    "key_gaps": ["Specific gap 1 in the market", "Specific gap 2"],
    "opportunities": ["Specific opportunity 1", "Specific opportunity 2"]
  }},
  "sources": [
    {{"title": "Source name", "url": "https://real-url.com", "relevance": "specific data provided", "confidence": 0.9}}
  ],
  "reasoning": "2-3 sentence summary of competitive landscape — what the market looks like, who dominates, and where the opportunity lies"
}}"""

    user_prompt = f"""Find 5-7 real competitors for this business idea:

"{idea_text}"
{context_str}

CRITICAL REQUIREMENTS:
- All pricing in INR (₹)
- Only real, existing companies
- Real website URLs
- Specific, accurate pricing data
- Honest confidence ratings
- Return valid JSON only"""

    try:
        resp = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            max_tokens=4000,
        )
        raw = resp.choices[0].message.content
        data = json.loads(_clean_json(raw))
        logger.info(f"Competitors agent found {len(data.get('competitors', []))} competitors for: {idea_text[:50]}")
        return data
    except Exception as e:
        logger.error(f"Competitors agent failed: {e}")
        return {
            "competitors": [],
            "observations": {
                "market_trends": [],
                "key_gaps": [],
                "opportunities": [],
            },
            "sources": [],
            "reasoning": "",
        }
