import os
import json
import logging
from typing import List
from schemas import CompetitorItem, SearchTrend

logger = logging.getLogger(__name__)

# Use Anthropic if key available, otherwise fall back to OpenAI-compatible
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")

FALLBACK_INSIGHTS = {
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
        "Step 2: Build a landing page and run $100 in paid ads to test demand",
        "Step 3: Build an MVP with only the single most valuable feature",
        "Step 4: Launch in one niche first before expanding to broader market",
        "Step 5: Set up a feedback loop to iterate based on real user behavior",
    ],
    "tam_usd": "$1B",
    "tam_explanation": "Estimated total addressable market based on industry benchmarks.",
    "sam_usd": "$100M",
    "sam_explanation": "Serviceable addressable market targeting your primary segment.",
    "som_usd": "$5M",
    "som_explanation": "Realistic first-year revenue target with focused go-to-market.",
}


async def generate_insights(
    idea_text: str,
    competitors: List[CompetitorItem],
    trends: List[SearchTrend],
    reddit_signals: dict,
) -> dict:
    prompt = f"""Startup idea: {idea_text}
Competitors: {json.dumps([c.model_dump() for c in competitors])}
Google Trends: {json.dumps([t.model_dump() for t in trends])}
Reddit signals: {json.dumps(reddit_signals)}

Return this exact JSON (no markdown, no explanation outside JSON):
{{
  "industry": "2-3 word industry label",
  "biggest_risk": "single biggest risk in one sentence",
  "biggest_risk_score": <float 1.0-10.0>,
  "whats_working": ["advantage 1", "advantage 2", "advantage 3"],
  "fix_playbook": [
    "Step 1: [verb] [specific action]",
    "Step 2: [verb] [specific action]",
    "Step 3: [verb] [specific action]",
    "Step 4: [verb] [specific action]",
    "Step 5: [verb] [specific action]"
  ],
  "tam_usd": "$XB",
  "tam_explanation": "one sentence",
  "sam_usd": "$XM",
  "sam_explanation": "one sentence",
  "som_usd": "$XM",
  "som_explanation": "one sentence"
}}"""

    # Try Anthropic first
    if ANTHROPIC_KEY:
        try:
            from anthropic import AsyncAnthropic
            anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_KEY)
            response = await anthropic_client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1000,
                system="You are a ruthlessly honest startup advisor. Return JSON only.",
                messages=[{"role": "user", "content": prompt}],
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"Anthropic Claude failed: {e}")

    # Fall back to OpenAI-compatible
    if OPENAI_KEY:
        try:
            from openai import AsyncOpenAI
            openai_client = AsyncOpenAI(api_key=OPENAI_KEY)
            response = await openai_client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are a ruthlessly honest startup advisor. Return JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=1000,
            )
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"OpenAI insights fallback failed: {e}")

    return FALLBACK_INSIGHTS
