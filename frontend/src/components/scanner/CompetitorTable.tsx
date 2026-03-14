import React from 'react'
import type { CompetitorItem } from '../../types'

interface CompetitorTableProps {
  competitors: CompetitorItem[]
}

const ACCENT_COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899']

export const CompetitorTable: React.FC<CompetitorTableProps> = ({ competitors }) => {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <p className="text-slate-400 text-sm">
          No direct competitors found — this could mean a blue ocean, or a problem that doesn't exist yet.
          Consider narrowing your idea description.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Competitor</th>
            <th className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Pricing</th>
            <th className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Weakness</th>
            <th className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Your Fix</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, i) => (
            <tr
              key={i}
              className="hover:bg-slate-50 transition-colors"
              style={{
                borderBottom: i < competitors.length - 1 ? '1px solid #f1f5f9' : 'none',
                borderLeft: `3px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`,
              }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-800 font-semibold">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-700 font-medium">{c.pricing}</td>
              <td className="px-4 py-3 text-slate-400">{c.weakness}</td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">💡</span>
                  <span className="text-slate-700">{c.your_fix}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
