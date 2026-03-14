"""
Scoring engine v2.0 — smarter scoring that accounts for:
- Local vs SaaS vs marketplace business types
- Competitor quality (not just quantity)
- Market size relative to business type
- Community demand signals
"""

from typing import List
from schemas import SearchTrend, CompetitorItem


INR_TO_USD = 83.0  # 1 USD ≈ ₹83


def parse_usd_string(s: str) -> float:
    """
    Convert market size strings to USD float for comparison.
    Handles both USD ('$1.5B', '$150M', '$500K') and
    INR formats ('₹830 Crore', '₹41 Lakh', '₹8,300 Crore').
    INR values are converted to USD equivalent (÷83).
    """
    if not s:
        return 0

    is_inr = "₹" in s or "Crore" in s or "Lakh" in s or "crore" in s or "lakh" in s
    s = s.replace("$", "").replace(",", "").replace("₹", "").strip()

    # Handle Indian units (Crore = 10M, Lakh = 100K)
    if "Crore" in s or "crore" in s:
        num_part = s.lower().replace("crore", "").strip()
        # May have extra words like "8,300 Crore" — take first numeric token
        tokens = num_part.split()
        try:
            val_inr = float(tokens[0]) * 10_000_000
            return val_inr / INR_TO_USD
        except (ValueError, IndexError):
            return 0
    if "Lakh" in s or "lakh" in s:
        num_part = s.lower().replace("lakh", "").strip()
        tokens = num_part.split()
        try:
            val_inr = float(tokens[0]) * 100_000
            return val_inr / INR_TO_USD
        except (ValueError, IndexError):
            return 0

    # Handle standard USD suffixes
    if s.endswith("B"):
        try:
            return float(s[:-1]) * 1_000_000_000
        except ValueError:
            return 0
    if s.endswith("M"):
        try:
            return float(s[:-1]) * 1_000_000
        except ValueError:
            return 0
    if s.endswith("K"):
        try:
            return float(s[:-1]) * 1_000
        except ValueError:
            return 0

    # Plain number — if INR context, divide by 83
    try:
        val = float(s) if s else 0
        return val / INR_TO_USD if is_inr else val
    except ValueError:
        return 0


def calculate_score(
    trends: List[SearchTrend],
    market_data: dict,
    reddit_signals: dict,
    competitors: List[CompetitorItem],
) -> int:
    score = 0

    # Factor 1: Search trend momentum (max 20pts)
    rising_count = sum(1 for t in trends if t.is_rising)
    if rising_count >= 3:
        score += 20
    elif rising_count == 2:
        score += 14
    elif rising_count == 1:
        score += 8
    else:
        score += 3

    # Factor 2: Market size from SAM — relative scoring (max 25pts)
    sam_str = market_data.get("sam_usd", "$0")
    sam_val = parse_usd_string(sam_str)

    # For local businesses, SAM is naturally smaller — adjust thresholds
    if sam_val >= 500_000_000:      # $500M+ SAM
        score += 25
    elif sam_val >= 100_000_000:    # $100M+ SAM
        score += 20
    elif sam_val >= 10_000_000:     # $10M+ SAM (good for local/niche)
        score += 15
    elif sam_val >= 1_000_000:      # $1M+ SAM (viable local business)
        score += 12
    elif sam_val >= 100_000:        # $100K+ SAM (small local)
        score += 8
    else:
        score += 4

    # Factor 3: Competitor landscape quality (max 25pts)
    if competitors:
        num_competitors = len(competitors)
        # Having competitors = market exists (good signal)
        # Having 2-4 competitors = healthy competition
        # Having 5+ = crowded market
        if num_competitors == 0:
            score += 10  # No competitors = uncertain market
        elif num_competitors <= 2:
            score += 20  # Few competitors = opportunity
        elif num_competitors <= 4:
            score += 25  # Healthy competition = validated market
        else:
            score += 15  # Many competitors = crowded

        # Bonus: quality of differentiation
        avg_fix_len = sum(len(c.your_fix.split()) for c in competitors) / len(competitors)
        if avg_fix_len >= 10:
            score += 5  # Strong differentiation angle
    else:
        score += 8  # No competitors found — uncertain

    # Factor 4: Community demand signals (max 20pts)
    signal_count = reddit_signals.get("signal_count", 0)
    pain_points = reddit_signals.get("pain_points", [])
    if signal_count >= 20 or len(pain_points) >= 3:
        score += 20
    elif signal_count >= 10 or len(pain_points) >= 2:
        score += 15
    elif signal_count >= 5 or len(pain_points) >= 1:
        score += 10
    else:
        score += 4

    # Factor 5: SOM viability (max 10pts) — is the first-year target realistic?
    som_str = market_data.get("som_usd", "$0")
    som_val = parse_usd_string(som_str)
    if som_val >= 1_000_000:        # $1M+ year-1 SOM
        score += 10
    elif som_val >= 100_000:        # $100K+ year-1 SOM
        score += 8
    elif som_val >= 10_000:         # $10K+ year-1 SOM (viable local)
        score += 6
    else:
        score += 3

    # Clamp to 0-100
    return max(0, min(score, 100))


def get_verdict(score: int) -> str:
    if score >= 80:
        return "VALIDATED"
    if score >= 60:
        return "PROMISING"
    if score >= 40:
        return "RISKY"
    return "AVOID"
