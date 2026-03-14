import React from 'react'
import { motion } from 'framer-motion'

interface FixPlaybookProps {
  steps: string[]
}

export const FixPlaybook: React.FC<FixPlaybookProps> = ({ steps }) => {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex items-start gap-4 bg-white rounded-xl p-4"
        >
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
            {i + 1}
          </div>
          <p className="text-slate-700 text-sm leading-relaxed pt-1">{step}</p>
        </motion.div>
      ))}
    </div>
  )
}
