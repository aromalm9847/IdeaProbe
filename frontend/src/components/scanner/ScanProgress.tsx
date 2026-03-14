import React, { useState, useEffect } from 'react'
import { ProgressBar } from '../ui/ProgressBar'

const STAGES = [
  { label: 'Detecting industry & refining idea...', time: 3 },
  { label: 'Scanning Reddit & web for pain points...', time: 10 },
  { label: 'Pulling Google Trends & market data...', time: 15 },
  { label: 'Discovering real competitors with GPT-4.1...', time: 28 },
  { label: 'Running Innovation & Deep Research agents...', time: 42 },
  { label: 'Calculating your viability score...', time: 52 },
]

const MOTIVATIONAL = [
  'Searching Reddit & web communities...',
  'Analyzing real competitor pricing & market share...',
  'Running 4 specialized AI agents...',
  'Building your innovation roadmap...',
  'Calculating market sizing...',
  'Almost done — finalizing your report...',
]

interface ScanProgressProps {
  ideaText: string
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ ideaText }) => {
  const [elapsed, setElapsed] = useState(0)
  const [motivIndex, setMotivIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 0.5), 500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setMotivIndex((i) => (i + 1) % MOTIVATIONAL.length), 8000)
    return () => clearInterval(timer)
  }, [])

  // Smooth progress: ease-out curve over 55s
  const rawProgress = Math.min((elapsed / 55) * 100, 98)
  const progress = rawProgress < 50 ? rawProgress * 1.2 : rawProgress

  const currentStages = STAGES.map((s) => ({
    ...s,
    done: elapsed >= s.time,
    active: elapsed >= s.time - 2 && elapsed < s.time,
  }))

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <p className="text-slate-400 text-sm italic mb-6">"{ideaText}"</p>

      <ProgressBar value={Math.min(progress, 98)} className="mb-6 h-3" />

      <p className="text-slate-400 text-sm mb-6 animate-pulse">{MOTIVATIONAL[motivIndex]}</p>

      <div className="space-y-2 text-left">
        {currentStages.map((stage, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-5 flex-shrink-0">
              {stage.done ? (
                <span className="text-green-400">✅</span>
              ) : stage.active ? (
                <span className="text-amber-400 animate-pulse">⏳</span>
              ) : (
                <span className="text-slate-700">○</span>
              )}
            </span>
            <span className={stage.done ? 'text-slate-400 line-through' : stage.active ? 'text-slate-900 font-medium' : 'text-slate-500'}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
