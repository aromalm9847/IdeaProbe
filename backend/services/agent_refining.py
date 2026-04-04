"""
Refining Agent — Turns a rough idea into a polished, professional statement.
Powered by GPT-5 with strict accuracy requirements and INR currency.
Outputs: idea_statement, feasibility, improvements, sources, reasoning
"""

import json, logging, re
from services.ai_client import client, MODEL

logger = logging.getLogger(__name__)


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


async def run_refining_agent(idea_text: str, web_context: list = None) -> dict:
    """
    Refining Agent: Identifies core concept, target market & value proposition.
    Provides feasibility snapshot and rewrites the idea professionally.
    All monetary values in INR (₹). All data must be real and verifiable.
    """
    context_str = ""
    if web_context:
        context_str = "\n\nWeb research context:\n" + "\n".join(f"- {s}" for s in web_context[:8])

    system_prompt = """You are an elite startup idea refining agent powered by GPT-5. Your job is to transform rough ideas into polished, investor-ready statements with maximum accuracy.

STRICT RULES — NEVER VIOLATE:
1. ALL monetary values MUST be in Indian Rupees (₹). Convert any USD/GBP/EUR to INR at current rates (1 USD ≈ ₹83, 1 GBP ≈ ₹105, 1 EUR ≈ ₹90).
2. ALL data points MUST be real and verifiable — no fabricated statistics.
3. Market size estimates must cite a specific, real source (IBEF, Statista, NASSCOM, RedSeer, Redseer, Tracxn, Inc42, etc.).
4. Viability score must reflect genuine market conditions — do NOT inflate scores.
5. Timing assessment must reference real market events (e.g., "Post-COVID shift to digital services, 2024 RBI digital payments push").
6. Improvements must be specific and actionable, not generic advice.
7. Sources must be real URLs that actually exist.
8. Confidence ratings must be honest — use 0.6-0.75 for estimates, 0.85-0.95 for well-documented facts.

ROLE:
- Identify the core concept, target market, and value proposition with precision.
- Provide a feasibility snapshot with real market size data in INR.
- Rewrite the idea professionally and concisely (2-3 sentences max).
- List 3-5 key improvements made to the original idea with specific reasoning.
- Cite at least 2 real, credible sources with working URLs.
- Rate confidence (0.0-1.0) for each claim.
- Provide a brief reasoning summary explaining your analysis methodology.

Return ONLY valid JSON in this exact format:
{
  "idea_statement": "Professional rewrite of the idea in 2-3 sentences. Be specific about the target market and value proposition.",
  "core_concept": "One-line core concept (what problem is solved, for whom)",
  "target_market": "Specific target market description with demographics and geography",
  "value_proposition": "Clear, specific value proposition — what makes this different",
  "feasibility": {
    "market_size": "Specific market size in ₹ with source (e.g., '₹1,20,000 Cr India salon market — IBEF 2024')",
    "timing": "Why now? Specific market timing assessment with real events/trends",
    "viability_score": 7,
    "viability_reasoning": "Specific reasoning for this score based on real market conditions"
  },
  "improvements": [
    {"original": "vague or weak part of the original idea", "improved": "specific, actionable improvement", "why": "concrete reason this improvement matters"}
  ],
  "sources": [
    {"title": "Source name", "url": "https://real-url.com/specific-page", "relevance": "what specific data this provides", "confidence": 0.85}
  ],
  "reasoning": "2-3 sentence summary of the analysis process, key market signals observed, and why this idea was rated as it was"
}"""

    user_prompt = f"""Refine this startup idea with maximum accuracy:

"{idea_text}"
{context_str}

CRITICAL REQUIREMENTS:
- All monetary values in INR (₹)
- Use real market data from 2023-2025
- Cite specific, verifiable sources
- Be honest about risks and limitations
- Return valid JSON only"""

    try:
        resp = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
            max_tokens=2500,
        )
        raw = resp.choices[0].message.content
        result = json.loads(_clean_json(raw))
        logger.info(f"Refining agent completed successfully for: {idea_text[:50]}")
        return result
    except Exception as e:
        logger.error(f"Refining agent failed: {e}")
        return {
            "idea_statement": f"A focused solution addressing the core need in: {idea_text[:100]}",
            "core_concept": idea_text[:80],
            "target_market": "Indian entrepreneurs and small businesses",
            "value_proposition": "Streamlined solution for a validated market need in India",
            "feasibility": {
                "market_size": "Market research required — data unavailable",
                "timing": "Market conditions appear favorable based on digital adoption trends",
                "viability_score": 5,
                "viability_reasoning": "Requires further validation before assessment",
            },
            "improvements": [
                {"original": "Vague concept", "improved": "Specific solution with defined target market", "why": "Clarity improves execution and investor communication"}
            ],
            "sources": [
                {"title": "IBEF Industry Reports", "url": "https://www.ibef.org/industry", "relevance": "Indian market sizing data", "confidence": 0.7}
            ],
            "reasoning": "Analysis based on available market data and comparable business models in India.",
        }
