import React from 'react'

const FEATURES = [
  {
    icon: '⏱',
    title: '60 seconds',
    description: 'Not 60 minutes. Your blind spots surface before your coffee cools.',
  },
  {
    icon: '🚫',
    title: 'No friction',
    description: 'Enter your idea, see what\'s wrong. No account, no email, no card.',
  },
  {
    icon: '📊',
    title: 'Full report',
    description: 'Competitors, market size, fix playbook. The complete picture.',
  },
  {
    icon: '🎁',
    title: '100% Free',
    description: 'Every feature, every section, every time. Forever.',
  },
]

export const FeatureGrid: React.FC = () => {
  return (
    <section className="py-16 max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {FEATURES.map((f, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-colors">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">How It Works</h2>
        <p className="text-slate-500 text-sm">Three steps. 60 seconds. No setup.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          {
            step: '01',
            icon: '✏️',
            title: 'Describe your idea',
            desc: 'One sentence. Be specific for the best results.',
          },
          {
            step: '02',
            icon: '🔍',
            title: 'We scan 40+ sources',
            desc: 'Reddit, Google Trends, and AI models run in parallel.',
          },
          {
            step: '03',
            icon: '📋',
            title: 'Get your full report',
            desc: 'Viability score, competitors, market size, and your fix playbook.',
          },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-5xl font-black text-accent/20 mb-2">{s.step}</div>
            <div className="text-2xl mb-2">{s.icon}</div>
            <h4 className="text-white font-semibold mb-2">{s.title}</h4>
            <p className="text-slate-500 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Founder card */}
      <div className="bg-surface-2 border border-border rounded-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg flex-shrink-0">
          A
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Alex — Founder of IdeaProbe</p>
          <p className="text-slate-400 text-sm mt-1">
            Built this after wasting 6 months on a product nobody wanted. IdeaProbe is the tool I wish I had before I started.
            Every feature is free because validation should be accessible to every founder.
          </p>
        </div>
      </div>
    </section>
  )
}
