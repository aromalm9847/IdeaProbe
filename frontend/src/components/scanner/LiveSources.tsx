import React from 'react'
import type { SourceSignal } from '../../types'

interface LiveSourcesProps {
  sources: SourceSignal[]
}

const PLATFORM_ICONS: Record<string, string> = {
  Reddit: '🟠',
  'Google Trends': '📈',
  'Hacker News': '🔶',
  'Indie Hackers': '🚀',
  Quora: '🔵',
}

export const LiveSources: React.FC<LiveSourcesProps> = ({ sources }) => {
  const sampleSignal = sources.find((s) => s.sample_signal && s.sample_signal.length > 20)

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {sources.map((source, i) => (
          <div key={i} className="bg-surface-2 border border-border rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{PLATFORM_ICONS[source.platform] || '🌐'}</span>
              <span className="text-white text-sm font-medium">{source.platform}</span>
            </div>
            <div className="text-slate-400 text-xs">{source.count} signals found</div>
          </div>
        ))}
      </div>
      {sampleSignal && (
        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Sample signal from {sampleSignal.platform}:</p>
          <p className="text-slate-300 text-sm italic">"{sampleSignal.sample_signal}"</p>
        </div>
      )}
    </div>
  )
}
