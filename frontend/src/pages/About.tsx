import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Testimonials } from '../components/landing/Testimonials'

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">About IdeaProbe</h1>
          <p className="text-slate-400 text-lg">Built by a founder, for founders who want the truth before they build.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: '2,500+', label: 'Ideas scanned' },
            { value: '40+', label: 'Live sources' },
            { value: '13', label: 'Industries covered' },
            { value: '60s', label: 'Average scan time' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-accent mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Why we built this */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Why We Built This</h2>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              Building the wrong thing is expensive. Not just in money — in time, opportunity cost, and the psychological toll of working on something for months only to discover nobody wants it. According to CB Insights, 35% of startups fail because of no market need. That's not a technology problem or a team problem. It's a validation problem.
            </p>
            <p>
              IdeaProbe was built to automate the early validation work that every founder should do but rarely does thoroughly. Instead of spending weeks on surveys and customer interviews before you even know if the problem is real, you can get a data-backed signal in 60 seconds. Real Reddit discussions. Real search trend data. Real competitor analysis. Real market sizing.
            </p>
            <p>
              We made it 100% free because validation should be accessible to every founder, not just those who can afford expensive market research tools. The best ideas shouldn't die because their founders couldn't afford to validate them.
            </p>
          </div>
        </div>

        {/* How the AI works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">How the AI Actually Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Parallel Web Search',
                desc: 'Reddit and Google Trends are queried simultaneously via asyncio.gather — real community discussions and real search momentum data, retrieved in parallel.',
              },
              {
                step: '02',
                title: 'Filter & Verify',
                desc: 'GPT identifies only real, existing competitors — never fabricated ones. Data is cross-referenced to remove noise and surface only actionable signals.',
              },
              {
                step: '03',
                title: 'Score & Synthesize',
                desc: 'Claude generates insights and fix playbook. A deterministic formula produces the 0–100 score based on four weighted factors — not AI guesswork.',
              },
            ].map((s, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-6">
                <div className="text-4xl font-black text-accent/20 mb-3">{s.step}</div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Not a ChatGPT wrapper callout */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mb-16">
          <h3 className="text-accent font-bold text-lg mb-3">This is not a ChatGPT wrapper</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            AI in IdeaProbe is used only to synthesize data that has already been retrieved from real sources. It never invents competitors, fabricates market sizes, or generates fake Reddit discussions. Every competitor in your report is a real product that exists. Every search trend is real data from Google. Every Reddit signal is a real post. The AI's job is to analyze and explain — not to make things up.
          </p>
        </div>

        <Testimonials />

        <div className="text-center mt-8">
          <Link to="/app">
            <Button variant="primary" size="lg" className="shadow-glow">Scan My Idea Free →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
