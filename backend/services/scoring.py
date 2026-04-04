"""
Scoring engine v4.0 — High-accuracy, anti-clustering scoring using:
- Continuous math (no hard brackets) — eliminates score clustering
- Log-scale market size — realistic spread across idea types
- All 4 agent outputs used as independent signals
- 7 weighted factors with cross-validation
"""

import math
import re
from typing import List, Optional
from schemas import SearchTrend, CompetitorItem


INR_TO_USD = 83.0  # 1 USD ≈ ₹83


def parse_usd_string(s: str) -> float:
    if not s:
        return 0
    s_lower = s.lower()
    is_inr = "₹" in s or "crore" in s_lower or "lakh" in s_lower
    m = re.search(r'[\d]+(?:[\d,]*\.?\d*)?', s.replace('₹', '').replace('$', ''))
    if not m:
        return 0
    try:
        num = float(m.group().replace(',', ''))
    except ValueError:
        return 0
    if "crore" in s_lower:
        return (num * 10_000_000) / INR_TO_USD
    if "lakh" in s_lower:
        return (num * 100_000) / INR_TO_USD
    stripped = s.strip().rstrip('.').upper()
    if stripped.endswith('B'):
        return num * 1_000_000_000
    if stripped.endswith('M'):
        return num * 1_000_000
    if stripped.endswith('K'):
        return num * 1_000
    return num / INR_TO_USD if is_inr else num


def _log_scale(value: float, reference: float, max_pts: float) -> float:
    """Log scaling — gives realistic spread. value=reference → ~half max."""
    if value <= 0:
        return 0.0
    ratio = value / max(reference, 1)
    raw = math.log10(ratio + 0.1) + 1.0
    normalized = max(0.0, min(raw / 3.0, 1.0))
    return round(normalized * max_pts, 2)


def _linear(value: float, min_val: float, max_val: float, max_pts: float) -> float:
    """Linear interpolation between min and max."""
    if max_val <= min_val:
        return 0.0
    clamped = max(min_val, min(value, max_val))
    return round(((clamped - min_val) / (max_val - min_val)) * max_pts, 2)


def calculate_score(
    trends: List[SearchTrend],
    market_data: dict,
    reddit_signals: dict,
    competitors: List[CompetitorItem],
    web_signals: Optional[dict] = None,
    viability_score: Optional[int] = None,
    innovation_quality: Optional[float] = None,
    refining_output=None,
    competitors_deep=None,
    innovation_output=None,
    deep_research=None,
) -> int:
    """
    Score 0-100 using 7 independent continuous factors:
    F1  Market Momentum     — 15 pts  (trends + web + reddit)
    F2  Market Size         — 20 pts  (SAM log-scale)
    F3  Competitive Edge    — 20 pts  (competitor count + gap quality)
    F4  Viability           — 20 pts  (GPT viability_score, continuous)
    F5  Innovation Strength — 12 pts  (feasibility x impact, effort-adjusted)
    F6  Deep Research Score —  8 pts  (regional opportunity + confidence)
    F7  Market Timing       —  5 pts  (trend direction + timing signal)
    """
    ws = web_signals or {}
    f = {}

    # ── F1: Market Momentum (max 15 pts) ────────────────────────────
    rising_count = sum(1 for t in trends if t.is_rising)
    total_trends = len(trends)
    all_snippets = len(ws.get("all_snippets", []))
    web_results = len(ws.get("web_results", []))
    market_snippets = len(ws.get("market_data", []))
    social_snippets = len(ws.get("social_signals", []))
    reddit_count = reddit_signals.get("signal_count", 0)

    trend_ratio = rising_count / max(total_trends, 1)
    trend_pts = _linear(trend_ratio, 0, 1, 6)
    total_snippets = all_snippets + web_results + market_snippets + social_snippets
    web_pts = _log_scale(total_snippets, 5, 6)
    reddit_pts = _log_scale(reddit_count + len(reddit_signals.get("pain_points", [])), 3, 3)
    f["momentum"] = min(trend_pts + web_pts + reddit_pts, 15)

    # ── F2: Market Size — SAM log-scale (max 20 pts) ────────────────
    sam_val = parse_usd_string(market_data.get("sam_usd", "$0"))
    tam_val = parse_usd_string(market_data.get("tam_usd", "$0"))
    sam_pts = _log_scale(sam_val, 1_000_000, 18)

    realism_bonus = 0.0
    if tam_val > 0 and sam_val > 0:
        ratio = sam_val / tam_val
        if 0.01 <= ratio <= 0.30:
            realism_bonus = 2.0
        elif ratio < 0.005 or ratio > 0.90:
            realism_bonus = -1.0

    f["market_size"] = min(max(sam_pts + realism_bonus, 0), 20)

    # ── F3: Competitive Edge (max 20 pts) ───────────────────────────
    num_competitors = len(competitors) if competitors else 0

    if num_competitors == 0:
        comp_count_pts = 5.0
    elif num_competitors <= 2:
        comp_count_pts = 11.0
    elif num_competitors <= 5:
        comp_count_pts = 13.0
    elif num_competitors <= 8:
        comp_count_pts = 9.0
    else:
        comp_count_pts = 6.0

    diff_pts = 0.0
    if competitors:
        avg_fix_words = sum(len(c.your_fix.split()) for c in competitors) / len(competitors)
        diff_pts = _linear(avg_fix_words, 3, 25, 5)

    gap_bonus = 0.0
    if competitors_deep and hasattr(competitors_deep, 'observations'):
        key_gaps = competitors_deep.observations.key_gaps or []
        opportunities = competitors_deep.observations.opportunities or []
        gap_bonus = _linear(len(key_gaps) + len(opportunities), 0, 8, 2)

    f["competitive"] = min(comp_count_pts + diff_pts + gap_bonus, 20)

    # ── F4: Viability — CONTINUOUS, no brackets (max 20 pts) ────────
    if viability_score is not None:
        v = max(1, min(10, viability_score))
        viability_pts = (v / 10.0) * 20.0

        reasoning_bonus = 0.0
        if refining_output and hasattr(refining_output, 'reasoning') and refining_output.reasoning:
            reasoning_words = len(refining_output.reasoning.split())
            reasoning_bonus = _linear(reasoning_words, 10, 100, 2)

        f["viability"] = min(viability_pts + reasoning_bonus, 20)
    else:
        pain_count = len(reddit_signals.get("pain_points", []))
        f["viability"] = _linear(pain_count + reddit_count / 5, 0, 10, 15)

    # ── F5: Innovation Strength (max 12 pts) ────────────────────────
    if innovation_output and hasattr(innovation_output, 'ideas') and innovation_output.ideas:
        ideas = innovation_output.ideas
        # Use product (feasibility × impact) — both must be high to score well
        idea_scores = [(i.feasibility * i.impact) / 10.0 for i in ideas]
        avg_product = sum(idea_scores) / len(idea_scores)

        low_effort_count = sum(
            1 for i in ideas
            if hasattr(i, 'implementation_effort') and
               str(i.implementation_effort).lower() in ("low", "easy")
        )
        effort_bonus = _linear(low_effort_count, 0, max(len(ideas), 1), 2)
        inno_pts = _linear(avg_product, 1, 9, 10) + effort_bonus
        f["innovation"] = min(inno_pts, 12)
    elif innovation_quality is not None:
        f["innovation"] = _linear(innovation_quality, 1, 10, 10)
    else:
        som_val = parse_usd_string(market_data.get("som_usd", "$0"))
        f["innovation"] = _log_scale(som_val, 50_000, 8)

    # ── F6: Deep Research Score (max 8 pts) ─────────────────────────
    if deep_research and hasattr(deep_research, 'regional_comparison'):
        rc = deep_research.regional_comparison
        if rc and rc.regions:
            opp_scores = [r.opportunity_score for r in rc.regions if hasattr(r, 'opportunity_score')]
            region_pts = _linear(sum(opp_scores) / len(opp_scores), 1, 10, 5) if opp_scores else 2.5
        else:
            region_pts = 2.5

        if hasattr(deep_research, 'sections') and deep_research.sections:
            confidences = [s.confidence for s in deep_research.sections if hasattr(s, 'confidence')]
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.7
            conf_pts = _linear(avg_conf, 0.4, 0.95, 3)
        else:
            conf_pts = 1.5

        f["deep_research"] = min(region_pts + conf_pts, 8)
    else:
        f["deep_research"] = _log_scale(market_snippets + social_snippets, 2, 6)

    # ── F7: Market Timing (max 5 pts) ───────────────────────────────
    timing_pts = _linear(rising_count / max(total_trends, 1), 0, 1, 3) if total_trends > 0 else 1.5

    timing_bonus = 0.0
    if refining_output and hasattr(refining_output, 'feasibility') and refining_output.feasibility:
        timing_text = str(refining_output.feasibility.timing).lower()
        if any(w in timing_text for w in ["now", "right time", "growing", "emerging", "opportune", "perfect", "early"]):
            timing_bonus = 2.0
        elif any(w in timing_text for w in ["too early", "saturated", "late", "overcrowded"]):
            timing_bonus = -1.0
        else:
            timing_bonus = 0.5

    f["timing"] = min(max(timing_pts + timing_bonus, 0), 5)

    raw = sum(f.values())
    return max(5, min(99, round(raw)))


def get_verdict(score: int) -> str:
    if score >= 80:
        return "VALIDATED"
    if score >= 62:
        return "PROMISING"
    if score >= 42:
        return "RISKY"
    return "AVOID"
