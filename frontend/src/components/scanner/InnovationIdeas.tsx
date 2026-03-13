import { InnovationAgentOutput } from '../../types'
import { motion } from 'framer-motion'

interface Props {
  data: InnovationAgentOutput
}

function RatingBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#1e2330] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-300 w-6 text-right">{value}</span>
    </div>
  )
}

const effortColor: Record<string, string> = {
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  High: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function InnovationIdeas({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-[#0f1117] border border-[#1e2330] rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🚀</span>
        <h2 className="text-lg font-semibold text-white">Innovation & Differentiation</h2>
        <span className="ml-auto text-xs text-gray-500 bg-[#1a1f2e] px-2 py-1 rounded-full">Innovation Agent</span>
      </div>

      {/* Differentiation Strategy */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-4">
        <p className="text-xs text-indigo-400 font-medium mb-2">Differentiation Strategy</p>
        <p className="text-sm text-gray-200 leading-relaxed">{data.differentiation_strategy}</p>
      </div>

      {/* Positioning Statement */}
      {data.positioning_statement && (
        <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
          <p className="text-xs text-gray-500 mb-1">Positioning Statement</p>
          <p className="text-sm text-gray-300 italic">"{data.positioning_statement}"</p>
        </div>
      )}

      {/* Feature Ideas */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Feature Ideas</p>
        {data.ideas.map((idea, i) => (
          <div key={i} className="bg-[#13171f] rounded-xl p-4 border border-[#1e2330] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{idea.feature}</p>
                <p className="text-xs text-gray-400 mt-0.5">{idea.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded border ${effortColor[idea.implementation_effort] || effortColor['Medium']}`}>
                  {idea.implementation_effort}
                </span>
              </div>
            </div>

            {/* Ratings */}
            <div className="space-y-1.5">
              <RatingBar label="Feasibility" value={idea.feasibility} color="bg-gradient-to-r from-blue-500 to-cyan-500" />
              <RatingBar label="Impact" value={idea.impact} color="bg-gradient-to-r from-violet-500 to-purple-500" />
            </div>

            {/* Rationale + Time */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-gray-400 flex-1">{idea.rationale}</p>
              <span className="text-xs text-gray-500 bg-[#0f1117] px-2 py-1 rounded shrink-0">⏱ {idea.time_to_build}</span>
            </div>

            {/* Source */}
            <a
              href={idea.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              📖 Source reference
            </a>
          </div>
        ))}
      </div>

      {/* Quick Wins + Moat Builders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.quick_wins && data.quick_wins.length > 0 && (
          <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
            <p className="text-xs text-emerald-400 font-medium mb-2">⚡ Quick Wins (This Week)</p>
            <ul className="space-y-1">
              {data.quick_wins.map((qw, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                  <span className="text-emerald-500 shrink-0">✓</span>{qw}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.moat_builders && data.moat_builders.length > 0 && (
          <div className="bg-[#13171f] rounded-xl p-3 border border-[#1e2330]">
            <p className="text-xs text-violet-400 font-medium mb-2">🏰 Moat Builders (Long-term)</p>
            <ul className="space-y-1">
              {data.moat_builders.map((mb, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                  <span className="text-violet-500 shrink-0">◆</span>{mb}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
