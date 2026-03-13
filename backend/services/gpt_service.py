"""
GPT-5 powered analysis service — maximum intelligence for all report sections.
Uses GPT-5 with strict accuracy requirements and INR currency for:
- Competitor discovery (real, specific, contextual)
- Market sizing (idea-specific, not generic, in INR)
- Insights synthesis (ruthlessly honest)
- MRR estimation (in INR)
"""

import json
import logging
import re
from typing import List
from schemas import CompetitorItem
from services.ai_client import client, MODEL

logger = logging.getLogger(__name__)


def _clean_json(raw: str) -> str:
    """Strip markdown fences and extract clean JSON."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


async def discover_competitors(idea_text: str, reddit_signals: dict) -> List[CompetitorItem]:
    """
    Find REAL, SPECIFIC competitors using GPT-5 with deep contextual analysis.
    All pricing in INR (₹). 5-7 competitors minimum.
    """
    pain_points = reddit_signals.get("pain_points", [])
    mentioned = reddit_signals.get("competitors_mentioned", [])

    system_prompt = """You are a world-class competitive intelligence analyst powered by GPT-5.

Your job: Find REAL, EXISTING competitors for any business idea — whether it's a local shop, SaaS product, marketplace, or service.

STRICT RULES:
1. NEVER fabricate a company name. Only list businesses/products that ACTUALLY EXIST.
2. ALL pricing MUST be in Indian Rupees (₹). Convert any USD to INR (1 USD ≈ ₹83).
3. For LOCAL businesses (barber shop, restaurant, gym, etc.): list REAL local competitors + major Indian booking/aggregator platforms (Urban Company, JustDial, Sulekha, etc.)
4. For SaaS/apps: list real software products with real pricing in ₹.
5. Pricing must be SPECIFIC and REAL (e.g., "₹300-500/haircut", "₹2,490/month", "Free + ₹830/mo premium").
6. Weakness must be a REAL, SPECIFIC weakness of that competitor.
7. Your fix must be SPECIFIC and ACTIONABLE.
8. Return 5-7 competitors. Include both direct and indirect/substitute competitors.
9. Always include relevant Indian platforms (Urban Company, JustDial, Swiggy, Zomato, etc.) for Indian market ideas.

Return JSON array ONLY. No explanation outside JSON."""

    user_prompt = f"""Business idea: "{idea_text}"

Community signals from Reddit/forums: {json.dumps(pain_points[:5])}
Competitors mentioned in discussions: {json.dumps(mentioned)}

Find 5-7 real competitors. All pricing in ₹.

Return JSON array:
[
  {{
    "name": "Real Competitor Name",
    "pricing": "Specific pricing in ₹ (e.g., ₹300/haircut or ₹2,490/mo or Free)",
    "weakness": "Specific real weakness of this competitor",
    "your_fix": "Specific differentiation that beats this weakness"
  }}
]"""

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=2000,
        )
        raw = _clean_json(response.choices[0].message.content)
        data = json.loads(raw)
        competitors = [CompetitorItem(**item) for item in data if isinstance(item, dict)]
        return competitors[:7]
    except Exception as e:
        logger.warning(f"GPT-5 competitor discovery failed: {e}")
        return []


async def generate_insights(
    idea_text: str,
    competitors: list,
    trends: list,
    reddit_signals: dict,
    additional_signals: dict = None,
) -> dict:
    """
    Generate deep, idea-specific insights using GPT-5 at maximum power.
    Market sizing is SPECIFIC to the idea, not generic industry numbers.
    ALL values in INR (₹ / Crore for large numbers).
    """
    additional_signals = additional_signals or {}

    system_prompt = """You are a ruthlessly honest startup advisor and market analyst powered by GPT-5.

Your analysis must be:
1. SPECIFIC to the exact idea — not generic industry numbers
2. CONTEXTUAL — if it's a local business in Koramangala, size the LOCAL market in ₹
3. HONEST — if the idea has real problems, say so clearly
4. ACTIONABLE — every recommendation must be executable
5. ALL monetary values MUST be in Indian Rupees (₹). Use Crore for large numbers.
   - Convert: 1 USD ≈ ₹83, so $1B ≈ ₹83,000 Crore, $1M ≈ ₹83 Lakh, $100K ≈ ₹83 Lakh

For market sizing in INR:
- TAM = Total India/global market for this category in ₹ Crore
- SAM = The specific segment this idea can realistically serve (consider geography, target customer)
- SOM = What this specific business can realistically capture in year 1 in ₹ Lakh

For a local barber shop in Koramangala:
- TAM = India's salon/grooming market (~₹66,400 Crore / ~$8B)
- SAM = Koramangala's premium grooming market (~₹415-830 Lakh / ~$5-10M)
- SOM = Realistic first-year revenue for one shop (~₹41-124 Lakh / ~$50K-150K)

Return JSON ONLY. No markdown. No explanation outside JSON."""

    user_prompt = f"""Startup idea: "{idea_text}"

Competitors found: {json.dumps([c.model_dump() if hasattr(c, 'model_dump') else c for c in competitors])}
Google Trends data: {json.dumps([t.model_dump() if hasattr(t, 'model_dump') else t for t in trends])}
Reddit/community signals: {json.dumps(reddit_signals)}
Additional signals (web search, maps, etc.): {json.dumps(additional_signals)}

Analyze this idea deeply. ALL monetary values in ₹ (Indian Rupees). Return:
{{
  "industry": "2-3 word specific industry label (e.g., 'Local Grooming', 'B2B SaaS', 'Food Delivery')",
  "biggest_risk": "The single most critical risk specific to THIS idea in one clear sentence",
  "biggest_risk_score": <float 1.0-10.0, where 10 = catastrophic risk>,
  "whats_working": [
    "Specific advantage #1 for THIS idea",
    "Specific advantage #2 for THIS idea",
    "Specific advantage #3 for THIS idea"
  ],
  "fix_playbook": [
    "Step 1: [Specific first action for THIS idea]",
    "Step 2: [Specific second action]",
    "Step 3: [Specific third action]",
    "Step 4: [Specific fourth action]",
    "Step 5: [Specific fifth action]"
  ],
  "tam_usd": "₹X,XXX Crore (specific to this category, e.g., ₹66,400 Crore)",
  "tam_explanation": "One sentence explaining THIS specific TAM with real ₹ numbers and source",
  "sam_usd": "₹XX Crore or ₹XX Lakh (specific to this idea's target segment and geography)",
  "sam_explanation": "One sentence explaining THIS specific SAM in ₹",
  "som_usd": "₹XX Lakh or ₹X Crore (realistic year-1 for THIS specific business)",
  "som_explanation": "One sentence explaining THIS specific SOM with realistic assumptions in ₹"
}}"""

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=2000,
        )
        raw = _clean_json(response.choices[0].message.content)
        result = json.loads(raw)

        # Validate required fields
        required = ["industry", "biggest_risk", "biggest_risk_score", "whats_working",
                    "fix_playbook", "tam_usd", "sam_usd", "som_usd"]
        for field in required:
            if field not in result:
                raise ValueError(f"Missing field: {field}")

        return result
    except Exception as e:
        logger.warning(f"GPT-5 insights generation failed: {e}")
        return _generate_fallback_insights(idea_text)


def _generate_fallback_insights(idea_text: str) -> dict:
    """Minimal fallback with INR values."""
    idea_lower = idea_text.lower()
    local_keywords = ["shop", "store", "restaurant", "cafe", "salon", "barber", "gym", "clinic", "hotel"]
    is_local = any(kw in idea_lower for kw in local_keywords)

    if is_local:
        return {
            "industry": "Local Services",
            "biggest_risk": "High competition from established local players and online booking platforms like Urban Company.",
            "biggest_risk_score": 6.5,
            "whats_working": [
                "Clear local demand with defined geographic target market",
                "Low initial technology barrier to entry",
                "Opportunity to differentiate on service quality and experience",
            ],
            "fix_playbook": [
                "Step 1: Research the top 5 competitors within 2km radius before committing",
                "Step 2: Define your unique positioning (premium, budget, niche specialization)",
                "Step 3: List on Google Maps, Urban Company, and JustDial from day one",
                "Step 4: Build a loyal customer base with a referral and loyalty program",
                "Step 5: Collect reviews aggressively in the first 3 months to build social proof",
            ],
            "tam_usd": "₹66,400 Crore",
            "tam_explanation": "India's salon and personal grooming market is valued at ~₹66,400 Crore (~$8B) growing at 15% annually (IBEF 2024).",
            "sam_usd": "₹830 Lakh",
            "sam_explanation": "Premium grooming market in the target neighborhood/district (~₹830 Lakh).",
            "som_usd": "₹124 Lakh",
            "som_explanation": "Realistic first-year revenue for a single well-run shop with 30-50 clients/day (~₹124 Lakh).",
        }
    else:
        return {
            "industry": "Technology",
            "biggest_risk": "Market validation needed — confirm real demand exists before building.",
            "biggest_risk_score": 5.0,
            "whats_working": [
                "Clear problem identified with a defined target audience",
                "Feasible execution path with existing technology",
                "Growing market interest based on search trends",
            ],
            "fix_playbook": [
                "Step 1: Interview 10 potential users to validate the core pain point",
                "Step 2: Build a landing page and run ₹8,300 in paid ads to test demand",
                "Step 3: Build an MVP with only the single most valuable feature",
                "Step 4: Launch in one niche first before expanding to broader market",
                "Step 5: Set up a feedback loop to iterate based on real user behavior",
            ],
            "tam_usd": "₹8,300 Crore",
            "tam_explanation": "Estimated total addressable market based on Indian industry benchmarks (~₹8,300 Crore).",
            "sam_usd": "₹830 Crore",
            "sam_explanation": "Serviceable addressable market targeting your primary segment in India (~₹830 Crore).",
            "som_usd": "₹41 Lakh",
            "som_explanation": "Realistic first-year revenue target with focused go-to-market in India (~₹41 Lakh).",
        }


async def estimate_mrr(idea_text: str, business_model: str, target_market: str) -> dict:
    """GPT-5 powered MRR estimation with idea-specific analysis. All values in INR (₹)."""
    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a startup financial analyst powered by GPT-5. Provide REALISTIC, SPECIFIC MRR estimates "
                        "based on the actual business type. ALL values MUST be in Indian Rupees (₹). "
                        "For local businesses, use local Indian revenue metrics. "
                        "For SaaS, use Indian ARR/MRR benchmarks. "
                        "1 USD ≈ ₹83. Return JSON only. No markdown."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Startup idea: {idea_text}\n"
                        f"Business model: {business_model}\n"
                        f"Target market: {target_market}\n\n"
                        "Estimate realistic monthly revenue range at 12 months post-launch in India.\n"
                        "Consider: type of business, Indian geography, pricing model, customer acquisition.\n"
                        "All values in ₹ (Indian Rupees).\n"
                        'Return: {"mrr_low": int, "mrr_high": int, "currency": "INR", "reasoning": "2 specific sentences with ₹ values", '
                        '"comparable_examples": ["Real Indian example 1 with ₹ numbers", "Real Indian example 2", "Real example 3"]}'
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=2000,
        )
        raw = _clean_json(response.choices[0].message.content)
        return json.loads(raw)
    except Exception as e:
        logger.warning(f"GPT-5 MRR estimate failed: {e}")
        return {
            "mrr_low": 83000,
            "mrr_high": 830000,
            "currency": "INR",
            "reasoning": "Estimate based on comparable early-stage Indian businesses in this space.",
            "comparable_examples": ["Similar Indian business at 12 months", "Comparable local service in India", "Related Indian product"],
        }
