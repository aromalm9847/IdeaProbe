import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getExamples } from '../api/client'
import type { ExampleReport } from '../types'
import { VerdictBadge, Badge } from '../components/ui/Badge'
import { ReportView } from '../components/scanner/ReportView'
import { Spinner } from '../components/ui/Spinner'

export const Examples: React.FC = () => {
  const [examples, setExamples] = useState<ExampleReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExamples()
      .then((res) => setExamples(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pt-24 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">See Real Validation Reports</h1>
          <p className="text-slate-400">Three complete reports. No paywall. No blur. This is exactly what you get.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {examples.map((ex) => (
            <div key={ex.slug} className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <VerdictBadge verdict={ex.verdict} />
                <span className="text-2xl font-bold text-white">{ex.score}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{ex.title}</h3>
              <p className="text-slate-400 text-sm mb-4 flex-1">{ex.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {ex.tags.map((tag) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
              <Link to={`/examples/${ex.slug}`} className="text-accent text-sm font-medium hover:text-accent/80 transition-colors">
                View full report →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const ExampleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [examples, setExamples] = useState<ExampleReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExamples()
      .then((res) => setExamples(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pt-24 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const example = examples.find((e) => e.slug === slug)

  if (!example) {
    return (
      <div className="min-h-screen bg-bg pt-24 flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Report not found</h2>
          <Link to="/examples" className="text-accent hover:text-accent/80">← Back to examples</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/examples" className="text-slate-500 hover:text-slate-300 text-sm mb-6 inline-block">← Back to examples</Link>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">{example.title}</h1>
          <p className="text-slate-400">{example.description}</p>
        </div>
        <ReportView report={example.report} ideaText={example.description} />
      </div>
    </div>
  )
}
