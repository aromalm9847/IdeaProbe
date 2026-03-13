import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { getMRREstimate } from '../api/client'
import type { MRRResponse } from '../types'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'

type BusinessModel = 'subscription' | 'one-time' | 'freemium'
type TargetMarket = 'B2B' | 'B2C'

export const MRREstimator: React.FC = () => {
  const [idea, setIdea] = useState('')
  const [businessModel, setBusinessModel] = useState<BusinessModel>('subscription')
  const [targetMarket, setTargetMarket] = useState<TargetMarket>('B2B')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MRRResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (idea.length < 10) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await getMRREstimate({ idea_text: idea, business_model: businessModel, target_market: targetMarket })
      setResult(res.data)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string }
      setError(err?.response?.data?.detail || err?.message || 'Estimation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatMRR = (n: number) => `$${n.toLocaleString()}`

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">MRR Estimator: What's Your Idea Worth?</h1>
          <p className="text-slate-400">Get a realistic MRR estimate in 10 seconds. Free. Based on 200+ startup analyses.</p>
        </div>

        {!result && (
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div>
              <label className="text-white text-sm font-medium block mb-2">Describe your idea</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your startup idea..."
                rows={4}
                maxLength={300}
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
              />
              <div className="text-right text-xs text-slate-600 mt-1">{idea.length} / 300</div>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">Business model</label>
              <div className="flex gap-2">
                {(['subscription', 'one-time', 'freemium'] as BusinessModel[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setBusinessModel(m)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                      businessModel === m
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface-2 text-slate-400 border-border hover:border-accent/50'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">Target market</label>
              <div className="flex gap-2">
                {(['B2C', 'B2B'] as TargetMarket[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTargetMarket(m)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                      targetMarket === m
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface-2 text-slate-400 border-border hover:border-accent/50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={idea.length < 10 || loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Calculating your MRR range with GPT...
                </span>
              ) : (
                'Get Estimate →'
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center mt-4">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Button variant="danger" size="sm" onClick={() => setError(null)}>Try again</Button>
          </div>
        )}

        {result && (
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Estimated MRR</p>
              <p className="text-4xl font-bold text-white">
                {formatMRR(result.mrr_low)} – {formatMRR(result.mrr_high)}
                <span className="text-slate-500 text-xl font-normal"> / month</span>
              </p>
            </div>

            <div className="bg-surface-2 border border-border rounded-xl p-4">
              <p className="text-slate-300 text-sm leading-relaxed">{result.reasoning}</p>
            </div>

            {result.comparable_examples.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs mb-2">Comparable ideas:</p>
                <div className="flex flex-wrap gap-2">
                  {result.comparable_examples.map((ex, i) => (
                    <Badge key={i} variant="purple">{ex}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4 text-center">
              <p className="text-slate-500 text-sm mb-3">Want the full validation picture?</p>
              <Link to="/app">
                <Button variant="primary" size="md">Scan your idea free →</Button>
              </Link>
            </div>

            <button
              onClick={() => { setResult(null); setIdea(''); }}
              className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              ← Estimate another idea
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
