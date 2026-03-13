export interface ScanRequest {
  idea_text: string
}

export type ScanStatus = 'pending' | 'processing' | 'complete' | 'failed'

export interface CompetitorItem {
  name: string
  pricing: string
  weakness: string
  your_fix: string
}

export interface SearchTrend {
  keyword: string
  trend_direction: string
  is_rising: boolean
}

export interface SourceSignal {
  platform: string
  count: number
  sample_signal: string
}

export interface MarketSizing {
  tam_usd: string
  sam_usd: string
  som_usd: string
  tam_explanation: string
  sam_explanation: string
  som_explanation: string
}

// ─── Agent: Refining ──────────────────────────────────────────────────────────
export interface AgentSource {
  title: string
  url: string
  relevance: string
  confidence: number
  year?: number
}

export interface FeasibilityData {
  market_size: string
  timing: string
  viability_score: number
  viability_reasoning: string
}

export interface ImprovementItem {
  original: string
  improved: string
  why: string
}

export interface RefiningAgentOutput {
  idea_statement: string
  core_concept: string
  target_market: string
  value_proposition: string
  feasibility: FeasibilityData
  improvements: ImprovementItem[]
  sources: AgentSource[]
  reasoning: string
}

// ─── Agent: Competitors ───────────────────────────────────────────────────────
export interface DetailedCompetitor {
  name: string
  website: string
  products: string
  usp: string
  target_audience: string
  pricing: string
  market_share: string
  strengths: string[]
  weaknesses: string[]
  gap_opportunity: string
  your_fix: string
  confidence: number
}

export interface CompetitorObservations {
  market_trends: string[]
  key_gaps: string[]
  opportunities: string[]
}

export interface CompetitorsAgentOutput {
  competitors: DetailedCompetitor[]
  observations: CompetitorObservations
  sources: AgentSource[]
  reasoning: string
}

// ─── Agent: Innovation ────────────────────────────────────────────────────────
export interface InnovationIdea {
  feature: string
  description: string
  feasibility: number
  impact: number
  rationale: string
  implementation_effort: string
  time_to_build: string
  source_url: string
  confidence: number
}

export interface InnovationAgentOutput {
  differentiation_strategy: string
  positioning_statement: string
  ideas: InnovationIdea[]
  quick_wins: string[]
  moat_builders: string[]
  sources: AgentSource[]
  reasoning: string
}

// ─── Agent: Deep Research ─────────────────────────────────────────────────────
export interface ChartData {
  type: 'bar' | 'line' | 'pie'
  title: string
  labels: string[]
  values: number[]
  unit: string
  source: string
  source_url: string
}

export interface ResearchSection {
  heading: string
  content: string
  key_insight: string
  chart?: ChartData
  confidence: number
}

export interface RegionData {
  name: string
  market_size: string
  growth_rate: string
  key_players: string[]
  consumer_behavior: string
  opportunity_score: number
  challenges: string[]
}

export interface RegionalComparison {
  regions: RegionData[]
  comparison_chart?: ChartData
}

export interface DeepResearchAgentOutput {
  title: string
  executive_summary: string
  sections: ResearchSection[]
  regional_comparison: RegionalComparison
  summary: string
  sources: AgentSource[]
  reasoning: string
}

// ─── Full Report ──────────────────────────────────────────────────────────────
export interface ReportData {
  score: number
  verdict: string
  industry: string
  biggest_risk: string
  biggest_risk_score: number
  whats_working: string[]
  competitors: CompetitorItem[]
  market: MarketSizing
  search_trends: SearchTrend[]
  fix_playbook: string[]
  sources: SourceSignal[]
  scan_duration_seconds: number
  // New agent outputs
  refining?: RefiningAgentOutput | null
  competitors_deep?: CompetitorsAgentOutput | null
  innovation?: InnovationAgentOutput | null
  deep_research?: DeepResearchAgentOutput | null
}

export interface ScanResponse {
  scan_id: number
  status: ScanStatus
  report?: ReportData | null
  error?: string | null
}

export interface LeaderboardEntry {
  rank: number
  idea_text: string
  score: number
  verdict: string
}

export interface MRRRequest {
  idea_text: string
  business_model?: string
  target_market?: string
}

export interface MRRResponse {
  mrr_low: number
  mrr_high: number
  currency: string
  reasoning: string
  comparable_examples: string[]
}

export interface ExampleReport {
  slug: string
  title: string
  description: string
  tags: string[]
  score: number
  verdict: string
  report: ReportData
}
