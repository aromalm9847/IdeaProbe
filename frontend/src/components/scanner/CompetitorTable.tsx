import React from 'react'
import type { CompetitorItem } from '../../types'

interface CompetitorTableProps {
  competitors: CompetitorItem[]
}

const BORDER_COLORS = [
  'border-l-accent',
  'border-l-cyan-400',
  'border-l-green-400',
  'border-l-amber-400',
  'border-l-pink-400',
]

export const CompetitorTable: React.FC<CompetitorTableProps> = ({ competitors }) => {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="bg-surface-2 border border-border rounded-xl p-6 text-center">
        <p className="text-slate-400 text-sm">
          No direct competitors found — this could mean a blue ocean, or a problem that doesn't exist yet.
          Consider narrowing your idea description.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2 border-b border-border">
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Competitor</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Pricing</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Weakness</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Your Fix</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, i) => (
            <tr
              key={i}
              className={`border-b border-border last:border-b-0 bg-surface hover:bg-surface-2 transition-colors border-l-4 ${BORDER_COLORS[i % BORDER_COLORS.length]}`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-300">{c.pricing}</td>
              <td className="px-4 py-3 text-slate-400">{c.weakness}</td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">💡</span>
                  <span className="text-slate-300">{c.your_fix}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
