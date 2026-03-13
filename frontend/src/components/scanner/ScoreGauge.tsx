import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { VerdictBadge } from '../ui/Badge'

interface ScoreGaugeProps {
  score: number
  verdict: string
}

function getColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, verdict }) => {
  const [displayScore, setDisplayScore] = useState(0)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.5, ease: 'easeOut' })
    const unsubscribe = rounded.on('change', (v) => setDisplayScore(v))
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [score])

  // SVG arc gauge (180 degrees)
  const radius = 80
  const cx = 100
  const cy = 100
  const circumference = Math.PI * radius
  const progress = (displayScore / 100) * circumference
  const color = getColor(displayScore)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="200" height="120" viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#1e1e2e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.05s ease-out, stroke 0.3s ease' }}
          />
          {/* Score text */}
          <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="Inter, sans-serif">
            {displayScore}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="Inter, sans-serif">
            /100
          </text>
        </svg>
      </div>
      <VerdictBadge verdict={verdict} className="mt-2" />
    </div>
  )
}
