import { CompetitorsAgentOutput } from '../../types'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface Props {
  data: CompetitorsAgentOutput
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 85 ? 'bg-emerald-500/10 text-emerald-400' : pct >= 70 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-orange-500/10 text-orange-400'
  return <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${color}`}>{pct}%</span>
}

export default function DeepCompetitors({ data }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-[#0f1117] border border-[#1e2330] rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🔍</span>
        <h2 className="text-lg font-semibold text-white">Deep Competitor Intel</h2>
        <span className="ml-auto text-xs text-gray-500 bg-[#1a1f2e] px-2 py-1 rounded-full">Competitors Agent</span>
      </div>

      {/* Competitor Cards */}
      <div className="space-y-3">
        {data.competitors.map((c, i) => (
          <div key={i} className="border border-[#1e2330] rounded-xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between p-4 bg-[#13171f] hover:bg-[#161b27] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {i + 1}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.pricing}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge value={c.confidence} />
                <span className="text-gray-500 text-xs">{expanded === i ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Expanded Details */}
            {expanded === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 space-y-4 bg-[#0f1117]"
              >
                {/* USP + Audience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#13171f] rounded-lg p-3 border border-[#1e2330]">
                    <p className="text-xs text-gray-500 mb-1">USP</p>
                    <p className="text-sm text-gray-200">{c.usp}</p>
                  </div>
                  <div className="bg-[#13171f] rounded-lg p-3 border border-[#1e2330]">
                    <p className="text-xs text-gray-500 mb-1">Target Audience</p>
                    <p className="text-sm text-gray-200">{c.target_audience}</p>
                  </div>
                </div>

                {/* Products + Market Share */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#13171f] rounded-lg p-3 border border-[#1e2330]">
                    <p className="text-xs text-gray-500 mb-1">Products / Services</p>
                    <p className="text-sm text-gray-200">{c.products}</p>
                  </div>
                  <div className="bg-[#13171f] rounded-lg p-3 border border-[#1e2330]">
                    <p className="text-xs text-gray-500 mb-1">Market Share / Traffic</p>
                    <p className="text-sm text-gray-200">{c.market_share}</p>
                  </div>
                </div>

                {/* Strengths vs Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-emerald-400 mb-2 font-medium">✓ Strengths</p>
                    <ul className="space-y-1">
                      {c.strengths.map((s, j) => (
                        <li key={j} className="text-xs text-gray-300 flex gap-2">
                          <span className="text-emerald-500 shrink-0">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 mb-2 font-medium">✗ Weaknesses</p>
                    <ul className="space-y-1">
                      {c.weaknesses.map((w, j) => (
                        <li key={j} className="text-xs text-gray-300 flex gap-2">
                          <span className="text-red-500 shrink-0">•</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Gap + Your Fix */}
                <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-xs text-emerald-400 font-medium mb-1">🎯 Gap Opportunity</p>
                  <p className="text-sm text-gray-200 mb-2">{c.gap_opportunity}</p>
                  <p className="text-xs text-teal-400 font-medium mb-1">⚡ Your Fix</p>
                  <p className="text-sm text-gray-200">{c.your_fix}</p>
                </div>

                {/* Website Link */}
                <a
                  href={c.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  🔗 {c.website}
                </a>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Market Observations */}
      {data.observations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
            <p className="text-xs text-blue-400 font-medium mb-2">📈 Market Trends</p>
            <ul className="space-y-1">
              {data.observations.market_trends.map((t, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-1.5"><span className="text-blue-500">•</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
            <p className="text-xs text-orange-400 font-medium mb-2">⚠️ Key Gaps</p>
            <ul className="space-y-1">
              {data.observations.key_gaps.map((g, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-1.5"><span className="text-orange-500">•</span>{g}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
            <p className="text-xs text-emerald-400 font-medium mb-2">💡 Opportunities</p>
            <ul className="space-y-1">
              {data.observations.opportunities.map((o, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-1.5"><span className="text-emerald-500">•</span>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sources */}
      {data.sources && data.sources.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Sources</p>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#13171f] border border-[#1e2330] rounded-lg px-2.5 py-1.5 hover:border-violet-500/40 transition-colors">
                <span className="text-xs text-gray-300">{s.title}</span>
                <span className="text-xs font-mono text-gray-500">{Math.round(s.confidence * 100)}%</span>
              </a>
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
