import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard } from '../../api/client'
import type { LeaderboardEntry } from '../../types'
import { Button } from '../ui/Button'

const MEDALS = ['🥇', '🥈', '🥉']

const ScoreBadge: React.FC<{ score: number; verdict: string }> = ({ score, verdict }) => {
  const color =
    verdict === 'VALIDATED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    verdict === 'PROMISING' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
    verdict === 'RISKY' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
    'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {score}
    </span>
  )
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard()
      .then((res) => setEntries(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">This Week's Top Scoring Ideas</h2>
        <p className="text-slate-500 text-sm">Updated in real-time as founders scan their ideas.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 last:border-b-0 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-50" />
                <div className="flex-1 h-4 bg-slate-50 rounded" />
                <div className="w-10 h-6 bg-slate-50 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {entries.map((entry, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                <span className="text-2xl w-8 text-center">{MEDALS[i] || `#${i + 1}`}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-sm font-medium truncate">
                    {entry.idea_text === '---' ? 'Waiting for submissions...' : entry.idea_text}
                  </p>
                </div>
                {entry.score > 0 && (
                  <ScoreBadge score={entry.score} verdict={entry.verdict} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <p className="text-slate-500 text-sm mb-3">Want yours here? Scan your idea →</p>
        <Link to="/app">
          <Button variant="secondary" size="sm">Scan my idea free</Button>
        </Link>
      </div>
    </section>
  )
}
