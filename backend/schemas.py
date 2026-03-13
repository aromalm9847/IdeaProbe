from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, field_validator


class ScanRequest(BaseModel):
    idea_text: str

    @field_validator("idea_text")
    @classmethod
    def validate_idea_text(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("Please describe your idea (minimum 10 characters)")
        if len(v) > 500:
            raise ValueError("Idea description too long — please keep it under 500 characters")
        return v


class ScanStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    complete = "complete"
    failed = "failed"


# ─── Legacy compact competitor (used in score gauge section) ─────────────────
class CompetitorItem(BaseModel):
    name: str
    pricing: str
    weakness: str
    your_fix: str


class SearchTrend(BaseModel):
    keyword: str
    trend_direction: str
    is_rising: bool


class SourceSignal(BaseModel):
    platform: str
    count: int
    sample_signal: str


class MarketSizing(BaseModel):
    tam_usd: str
    sam_usd: str
    som_usd: str
    tam_explanation: str
    sam_explanation: str
    som_explanation: str


# ─── Agent: Refining ─────────────────────────────────────────────────────────
class FeasibilityData(BaseModel):
    market_size: str
    timing: str
    viability_score: int
    viability_reasoning: str


class ImprovementItem(BaseModel):
    original: str
    improved: str
    why: str


class AgentSource(BaseModel):
    title: str
    url: str
    relevance: str
    confidence: float
    year: Optional[int] = None


class RefiningAgentOutput(BaseModel):
    idea_statement: str
    core_concept: str
    target_market: str
    value_proposition: str
    feasibility: FeasibilityData
    improvements: List[ImprovementItem]
    sources: List[AgentSource]
    reasoning: str


# ─── Agent: Competitors ───────────────────────────────────────────────────────
class DetailedCompetitor(BaseModel):
    name: str
    website: str
    products: str
    usp: str
    target_audience: str
    pricing: str
    market_share: str
    strengths: List[str]
    weaknesses: List[str]
    gap_opportunity: str
    your_fix: str
    confidence: float


class CompetitorObservations(BaseModel):
    market_trends: List[str]
    key_gaps: List[str]
    opportunities: List[str]


class CompetitorsAgentOutput(BaseModel):
    competitors: List[DetailedCompetitor]
    observations: CompetitorObservations
    sources: List[AgentSource]
    reasoning: str


# ─── Agent: Innovation ────────────────────────────────────────────────────────
class InnovationIdea(BaseModel):
    feature: str
    description: str
    feasibility: int
    impact: int
    rationale: str
    implementation_effort: str
    time_to_build: str
    source_url: str
    confidence: float


class InnovationAgentOutput(BaseModel):
    differentiation_strategy: str
    positioning_statement: str
    ideas: List[InnovationIdea]
    quick_wins: List[str]
    moat_builders: List[str]
    sources: List[AgentSource]
    reasoning: str


# ─── Agent: Deep Research ─────────────────────────────────────────────────────
class ChartData(BaseModel):
    type: str  # bar | line | pie
    title: str
    labels: List[str]
    values: List[float]
    unit: str
    source: str
    source_url: str


class ResearchSection(BaseModel):
    heading: str
    content: str
    key_insight: str
    chart: Optional[ChartData] = None
    confidence: float


class RegionData(BaseModel):
    name: str
    market_size: str
    growth_rate: str
    key_players: List[str]
    consumer_behavior: str
    opportunity_score: int
    challenges: List[str]


class RegionalComparison(BaseModel):
    regions: List[RegionData]
    comparison_chart: Optional[ChartData] = None


class DeepResearchAgentOutput(BaseModel):
    title: str
    executive_summary: str
    sections: List[ResearchSection]
    regional_comparison: RegionalComparison
    summary: str
    sources: List[AgentSource]
    reasoning: str


# ─── Full Report ──────────────────────────────────────────────────────────────
class ReportData(BaseModel):
    score: int
    verdict: str
    industry: str
    biggest_risk: str
    biggest_risk_score: float
    whats_working: List[str]
    # Legacy compact competitors (for score gauge)
    competitors: List[CompetitorItem]
    market: MarketSizing
    search_trends: List[SearchTrend]
    fix_playbook: List[str]
    sources: List[SourceSignal]
    scan_duration_seconds: float
    # ── New agent outputs ──
    refining: Optional[RefiningAgentOutput] = None
    competitors_deep: Optional[CompetitorsAgentOutput] = None
    innovation: Optional[InnovationAgentOutput] = None
    deep_research: Optional[DeepResearchAgentOutput] = None


class ScanResponse(BaseModel):
    scan_id: int
    status: ScanStatus
    report: Optional[ReportData] = None
    error: Optional[str] = None


class LeaderboardEntry(BaseModel):
    rank: int
    idea_text: str
    score: int
    verdict: str


class MRRRequest(BaseModel):
    idea_text: str
    business_model: Optional[str] = "subscription"
    target_market: Optional[str] = "B2B"


class MRRResponse(BaseModel):
    mrr_low: int
    mrr_high: int
    currency: str = "USD"
    reasoning: str
    comparable_examples: List[str]
