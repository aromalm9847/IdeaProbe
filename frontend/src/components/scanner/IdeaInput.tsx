import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'

const PRESET_IDEAS = [
  'AI meal planner that shops from your existing pantry',
  'Slack bot that writes weekly standup reports automatically',
  'Freelancer tax automation for gig economy workers',
  'Competitor pricing tracker with real-time alerts',
  'AI contract reviewer for small business owners',
  'Subscription churn predictor for B2B SaaS',
  'Resume gap explainer that turns gaps into stories',
  'DevOps incident summarizer for engineering teams',
  'AI pet health tracker with vet recommendation engine',
  'Carbon offset marketplace for small businesses',
]

interface IdeaInputProps {
  initialIdea?: string
  onSubmit: (idea: string) => void
  isLoading?: boolean
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ initialIdea = '', onSubmit, isLoading = false }) => {
  const [idea, setIdea] = useState(initialIdea)
  const [presetIndex, setPresetIndex] = useState(0)

  useEffect(() => {
    if (initialIdea) setIdea(initialIdea)
  }, [initialIdea])

  const handleRandom = () => {
    const next = (presetIndex + 1) % PRESET_IDEAS.length
    setPresetIndex(next)
    setIdea(PRESET_IDEAS[next])
  }

  const charCount = idea.length
  const charColor = charCount >= 490 ? 'text-red-400' : charCount >= 400 ? 'text-amber-400' : 'text-slate-500'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea in one sentence... e.g. 'An AI tool that turns Notion pages into client portals'"
          rows={4}
          maxLength={500}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
          autoFocus={!!initialIdea}
        />
        <div className={`text-right text-xs mt-1 ${charColor}`}>
          {charCount} / 500
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={handleRandom}
          type="button"
          className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-surface-2 border border-transparent hover:border-border"
        >
          ✨ Surprise me
        </button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => onSubmit(idea)}
          disabled={idea.length < 10 || isLoading}
          className="flex-1 sm:flex-none"
        >
          {isLoading ? 'Starting...' : 'Scan my idea →'}
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4 justify-center">
        {['40+ sources', '60 seconds', '100% free'].map((item) => (
          <span key={item} className="text-slate-600 text-xs">• {item}</span>
        ))}
      </div>
    </div>
  )
}
