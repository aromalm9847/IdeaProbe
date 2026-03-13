import { DeepResearchAgentOutput, ChartData } from '../../types'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface Props {
  data: DeepResearchAgentOutput
}

const CHART_COLORS = ['#7c3aed', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444']

function MiniChart({ chart }: { chart: ChartData }) {
  const chartData = chart.labels.map((label, i) => ({
    name: label,
    value: chart.values[i] ?? 0,
  }))

  return (
    <div className="bg-[#0a0d14] rounded-xl p-4 border border-[#1e2330] mt-3">
      <p className="text-xs text-gray-400 font-medium mb-3">{chart.title}</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#13171f', border: '1px solid #1e2330', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
            </LineChart>
          ) : chart.type === 'pie' ? (
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#13171f', border: '1px solid #1e2330', borderRadius: '8px', fontSize: '11px' }} />
            </PieChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#13171f', border: '1px solid #1e2330', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-600">Unit: {chart.unit}</p>
        <a href={chart.source_url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
          📊 {chart.source}
        </a>
      </div>
    </div>
  )
}

function OpportunityScore({ score }: { score: number }) {
  const color = score >= 8 ? 'text-emerald-400' : score >= 6 ? 'text-yellow-400' : 'text-orange-400'
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < score ? 'bg-violet-500' : 'bg-[#1e2330]'}`} />
      ))}
      <span className={`text-xs font-bold ml-1 ${color}`}>{score}/10</span>
    </div>
  )
}

export default function DeepResearch({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-[#0f1117] border border-[#1e2330] rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">📊</span>
        <h2 className="text-lg font-semibold text-white">Deep Market Research</h2>
        <span className="ml-auto text-xs text-gray-500 bg-[#1a1f2e] px-2 py-1 rounded-full">Deep Research Agent</span>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs text-blue-400 font-medium mb-2">Executive Summary</p>
        <p className="text-sm text-gray-200 leading-relaxed">{data.executive_summary}</p>
      </div>

      {/* Research Sections */}
      <div className="space-y-5">
        {data.sections.map((section, i) => (
          <div key={i} className="border border-[#1e2330] rounded-xl p-4 bg-[#0a0d14]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">{section.heading}</h3>
              <span className="text-xs font-mono text-gray-500">{Math.round(section.confidence * 100)}% confidence</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{section.content}</p>
            {section.key_insight && (
              <div className="mt-3 flex items-start gap-2 bg-violet-900/10 border border-violet-500/20 rounded-lg p-2.5">
                <span className="text-violet-400 text-xs shrink-0 mt-0.5">💡</span>
                <p className="text-xs text-violet-300 font-medium">{section.key_insight}</p>
              </div>
            )}
            {section.chart && <MiniChart chart={section.chart} />}
          </div>
        ))}
      </div>

      {/* Regional Comparison */}
      {data.regional_comparison && data.regional_comparison.regions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-white mb-3">🌍 Regional Comparison</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.regional_comparison.regions.map((region, i) => (
              <div key={i} className="bg-[#13171f] rounded-xl p-4 border border-[#1e2330] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{region.name}</p>
                  <OpportunityScore score={region.opportunity_score} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Market Size: </span>
                    <span className="text-gray-200">{region.market_size}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Growth: </span>
                    <span className="text-emerald-400">{region.growth_rate}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Key Players</p>
                  <div className="flex flex-wrap gap-1">
                    {region.key_players.map((p, j) => (
                      <span key={j} className="text-xs bg-[#0f1117] border border-[#1e2330] rounded px-1.5 py-0.5 text-gray-300">{p}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Consumer Behavior</p>
                  <p className="text-xs text-gray-300">{region.consumer_behavior}</p>
                </div>
                <div>
                  <p className="text-xs text-orange-400 mb-1">Challenges</p>
                  <ul className="space-y-0.5">
                    {region.challenges.map((c, j) => (
                      <li key={j} className="text-xs text-gray-400 flex gap-1.5">
                        <span className="text-orange-500">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          {data.regional_comparison.comparison_chart && (
            <MiniChart chart={data.regional_comparison.comparison_chart} />
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-[#13171f] rounded-xl p-4 border border-[#1e2330]">
        <p className="text-xs text-gray-500 font-medium mb-2">Research Summary</p>
        <p className="text-sm text-gray-300 leading-relaxed">{data.summary}</p>
      </div>

      {/* All Sources */}
      {data.sources && data.sources.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">All Sources ({data.sources.length})</p>
          <div className="space-y-1.5">
            {data.sources.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-[#13171f] rounded-lg px-3 py-2 border border-[#1e2330]">
                <div className="flex items-center gap-2 min-w-0">
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 truncate transition-colors">
                    {s.title}
                  </a>
                  {s.year && <span className="text-xs text-gray-600 shrink-0">{s.year}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500 hidden md:block">{s.relevance}</span>
                  <span className="text-xs font-mono text-gray-400">{Math.round(s.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      {data.reasoning && (
        <div className="border-t border-[#1e2330] pt-3">
          <p className="text-xs text-gray-500 mb-1">Agent Reasoning</p>
          <p className="text-xs text-gray-400 italic">{data.reasoning}</p>
        </div>
      )}
    </motion.div>
  )
}
