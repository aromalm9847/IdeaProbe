import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'What happens to my idea after I submit?',
    a: 'Private by default. Only you see your results. We never publish or sell your data.',
  },
  {
    q: 'Is this really free? No catch?',
    a: 'Yes. 100% free. No credit card, no account, no hidden tier. Scan as many ideas as you like.',
  },
  {
    q: 'What if my score is low?',
    a: "That's the point. A low score with clear fixes is more valuable than false confidence. Fix the issues, re-scan, and improve.",
  },
  {
    q: 'Can I re-scan after tweaking my idea?',
    a: 'Yes. Tweak your positioning, re-run the scan, and watch your score change. Many founders iterate 2–3 times.',
  },
  {
    q: 'How does the AI actually work?',
    a: "It's an agentic pipeline — not a ChatGPT prompt. AI agents search Reddit and Google Trends in parallel. GPT finds real competitors. Claude synthesizes insights. Deterministic code calculates the score. Real data in, real insights out.",
  },
  {
    q: 'How do I get the best results?',
    a: "Be specific. Instead of 'food app', try 'AI meal planner for busy parents that uses your existing pantry'. More detail = better report.",
  },
]

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="text-slate-900 font-medium text-sm">{faq.q}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-500 flex-shrink-0"
              >
                ▼
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-3">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
