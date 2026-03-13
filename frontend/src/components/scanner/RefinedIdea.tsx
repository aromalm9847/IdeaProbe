import { RefiningAgentOutput } from '../../types'
import { motion } from 'framer-motion'

interface Props {
  data: RefiningAgentOutput
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 85 ? 'text-emerald-400' : pct >= 70 ? 'text-yellow-400' : 'text-orange-400'
  return <span className={`text-xs font-mono ${color}`}>{pct}% confidence</span>
}

export default function RefinedIdea({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#0f1117] border border-[#1e2330] rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <h2 className="text-lg font-semibold text-white">Refined Idea</h2>
        <span className="ml-auto text-xs text-gray-500 bg-[#1a1f2e] px-2 py-1 rounded-full">Refining Agent</span>
      </div>

      {/* Polished Statement */}
      <div className="bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border border-violet-500/20 rounded-xl p-4">
        <p className="text-white text-sm leading-relaxed italic">"{data.idea_statement}"</p>
      </div>

      {/* Core Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Core Concept</p>
          <p className="text-sm text-gray-200">{data.core_concept}</p>
        </div>
        <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Target Market</p>
          <p className="text-sm text-gray-200">{data.target_market}</p>
        </div>
        <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Value Proposition</p>
          <p className="text-sm text-gray-200">{data.value_proposition}</p>
        </div>
      </div>

      {/* Feasibility Snapshot */}
      <div className="bg-[#13171f] rounded-xl p-4 border border-[#1e2330]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white">Feasibility Snapshot</p>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-[#1e2330] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                style={{ width: `${(data.feasibility.viability_score / 10) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-violet-400">{data.feasibility.viability_score}/10</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Market Size: </span>
            <span className="text-gray-200">{data.feasibility.market_size}</span>
          </div>
          <div>
            <span className="text-gray-500">Timing: </span>
            <span className="text-gray-200">{data.feasibility.timing}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{data.feasibility.viability_reasoning}</p>
      </div>

      {/* Improvements Made */}
      {data.improvements && data.improvements.length > 0 && (
        <div>
          <p className="text-sm font-medium text-white mb-2">Key Improvements Made</p>
          <div className="space-y-2">
            {data.improvements.map((imp, i) => (
              <div key={i} className="bg-[#13171f] rounded-lg p-3 border border-[#1e2330] text-sm">
                <div className="flex gap-2 items-start">
                  <span className="text-red-400 mt-0.5 shrink-0">→</span>
                  <div>
                    <span className="text-gray-500 line-through mr-2">{imp.original}</span>
                    <span className="text-emerald-400 font-medium">{imp.improved}</span>
                    <p className="text-gray-500 text-xs mt-1">{imp.why}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {data.sources && data.sources.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Sources</p>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#13171f] border border-[#1e2330] rounded-lg px-2.5 py-1.5 hover:border-violet-500/40 transition-colors"
              >
                <span className="text-xs text-gray-300">{s.title}</span>
                <ConfidenceBadge value={s.confidence} />
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
