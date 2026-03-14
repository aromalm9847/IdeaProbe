import React from 'react'

const TESTIMONIALS = [
  {
    quote: 'The pivot suggestion alone changed my entire go-to-market strategy. I identified blind spots I\'d missed after months of working on my idea.',
    name: 'Larry T.',
    role: 'Founder',
  },
  {
    quote: 'The data is on point and the recommendations are accurate. I discovered a copycat of my idea that launched weeks ago — I never would have found that otherwise.',
    name: 'Galilée',
    role: 'Founder',
  },
  {
    quote: "I've tried a lot of market validation tools. This is the best in its category. Can't believe it's free.",
    name: 'Younes B.A.',
    role: 'Independent Consultant',
  },
]

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-16 max-w-5xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">What Founders Say</h2>
        <p className="text-slate-500 text-sm">Real feedback from real founders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-0.5 mb-4">
              {[...Array(5)].map((_, j) => (
                <span key={j} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-slate-900 text-sm font-medium">{t.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-xs">{t.role}</span>
                  <span className="text-green-400 text-xs">· Verified</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
