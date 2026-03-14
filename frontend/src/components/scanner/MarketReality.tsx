import React from 'react'
import type { MarketSizing, SearchTrend } from '../../types'

interface MarketRealityProps {
  market: MarketSizing
  trends: SearchTrend[]
}

export const MarketReality: React.FC<MarketRealityProps> = ({ market, trends }) => {
  const cards = [
    { label: 'TAM', value: market.tam_usd, explanation: market.tam_explanation, color: 'border-accent' },
    { label: 'SAM', value: market.sam_usd, explanation: market.sam_explanation, color: 'border-cyan-400' },
    { label: 'SOM', value: market.som_usd, explanation: market.som_explanation, color: 'border-green-400' },
  ]

  return (
    <div>
      {/* Market sizing cards */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
        {cards.map((card, i) => (
          <React.Fragment key={card.label}>
            <div className={`flex-1 bg-white rounded-xl p-4 border-t-2 ${card.color}`}>
              <div className="text-xs text-slate-500 font-medium mb-1">{card.label}</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{card.value}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{card.explanation}</div>
            </div>
            {i < cards.length - 1 && (
              <div className="hidden sm:flex items-center text-slate-300 text-xl font-light">→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Trend pills */}
      {trends && trends.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trends.map((trend, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                trend.is_rising
                  ? 'text-green-700 border-green-200 bg-green-50'
                  : 'text-red-700 border-red-200 bg-red-50'
              }`}
            >
              <span>{trend.is_rising ? '↑' : '↓'}</span>
              <span className="font-semibold">{trend.keyword}</span>
              <span>{trend.trend_direction}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
