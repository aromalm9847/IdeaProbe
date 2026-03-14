import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { VerdictBadge } from '../ui/Badge'

const DEMO_COMPETITORS = [
  { name: 'Notion', pricing: '$8/user/mo', weakness: 'No client-facing portal mode — everything is internal', your_fix: 'Build a one-click "share as portal" feature with custom branding' },
  { name: 'Coda', pricing: '$10/user/mo', weakness: 'Steep learning curve; clients struggle with navigation', your_fix: 'Auto-generate simplified client view with only relevant sections' },
  { name: 'Softr', pricing: '$49/mo', weakness: 'Requires Airtable as backend — adds cost and complexity', your_fix: 'Native Notion integration with zero additional tools required' },
]

export const DemoReport: React.FC = () => {
  return (
    <section className="py-16 max-w-4xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything holding you back. And how to fix it.</h2>
        <p className="text-slate-400">Every section below is included in your free report.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Score */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-400">84</div>
            <div className="text-slate-500 text-sm">/100</div>
          </div>
          <div>
            <VerdictBadge verdict="VALIDATED" className="mb-2" />
            <p className="text-slate-400 text-sm italic">"Notion-to-client-portal converter for agencies"</p>
          </div>
        </div>

        {/* Biggest risk */}
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
          <p className="text-amber-700 font-semibold text-sm">⚠️ Biggest Risk: Easy to copy once validated (6.4/10)</p>
        </div>

        {/* What's working */}
        <div className="border border-green-100 bg-green-50 rounded-xl p-4">
          <h4 className="text-slate-900 font-semibold text-sm mb-3">💡 What's Working</h4>
          <ul className="space-y-2">
            {['Strong demand from agencies managing 5+ clients in Notion', 'No direct competitor with native Notion integration', 'Clear B2B pricing model with high retention potential'].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-green-400 flex-shrink-0">✅</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Competitor table */}
        <div>
          <h4 className="text-slate-900 font-semibold text-sm mb-3">🏆 Competitor Intel</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Competitor</th>
                  <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Pricing</th>
                  <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Weakness</th>
                  <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Your Fix</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_COMPETITORS.map((c, i) => (
                  <tr key={i} className="border-b border-slate-200 last:border-b-0 bg-white">
                    <td className="px-3 py-2.5 text-slate-900 font-medium">{c.name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{c.pricing}</td>
                    <td className="px-3 py-2.5 text-slate-400">{c.weakness}</td>
                    <td className="px-3 py-2.5 text-slate-600">💡 {c.your_fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market sizing */}
        <div>
          <h4 className="text-slate-900 font-semibold text-sm mb-3">📊 Market Reality</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { label: 'TAM', value: '$1.5B', color: 'border-accent' },
              { label: 'SAM', value: '$150M', color: 'border-cyan-400' },
              { label: 'SOM', value: '$5M', color: 'border-green-400' },
            ].map((m, i) => (
              <div key={i} className={`flex-1 bg-slate-50 border border-slate-200 border-t-2 ${m.color} rounded-xl p-3 text-center`}>
                <div className="text-slate-500 text-xs mb-1">{m.label}</div>
                <div className="text-slate-900 font-bold text-xl">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fix playbook */}
        <div>
          <h4 className="text-slate-900 font-semibold text-sm mb-3">🛠 Fix Playbook</h4>
          <div className="space-y-2">
            {[
              'Step 1: Build a Notion integration that auto-detects page structure',
              'Step 2: Create a one-click "Publish as portal" button in Notion sidebar',
              'Step 3: Add custom domain support to justify $49/mo agency pricing',
              'Step 4: Launch in Notion creator communities on Reddit and Twitter',
              'Step 5: Build a template gallery to drive organic SEO traffic',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-slate-900 font-bold text-xs flex-shrink-0">{i + 1}</div>
                <p className="text-slate-600 text-xs pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live sources */}
        <div>
          <h4 className="text-slate-900 font-semibold text-sm mb-3">🔍 Data Sources</h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { icon: '🟠', name: 'Reddit', count: 18 },
              { icon: '📈', name: 'Google Trends', count: 3 },
              { icon: '🔶', name: 'Hacker News', count: 9 },
              { icon: '🚀', name: 'Indie Hackers', count: 5 },
              { icon: '🔵', name: 'Quora', count: 4 },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="text-slate-900 text-xs font-medium mt-1">{s.name}</div>
                <div className="text-slate-500 text-xs">{s.count} signals</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/app">
          <Button variant="primary" size="lg" className="shadow-glow">
            Get this exact report for your idea →
          </Button>
        </Link>
      </div>
    </section>
  )
}
