import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useScanStore } from '../store/useScanStore'
import { IdeaInput } from '../components/scanner/IdeaInput'
import { ScanProgress } from '../components/scanner/ScanProgress'
import { ReportView } from '../components/scanner/ReportView'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

export const ScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { scanStatus, ideaText, report, error, submitScan, resetScan } = useScanStore()
  const { user } = useAuthStore()
  const initialIdea = searchParams.get('idea') || ''

  useEffect(() => {
    if (initialIdea && (scanStatus === 'complete' || scanStatus === 'failed')) {
      resetScan()
    }
  }, [initialIdea])

  return (
    <div className='min-h-screen pt-20' style={{ background: '#f8fafc' }}>
      <AnimatePresence mode='wait'>
        {scanStatus === 'idle' && (
          <motion.div key='input' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className='flex flex-col items-center justify-center min-h-[80vh] px-4'>
            <div className='text-center mb-8'>
              <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5'
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1' }}>
                4 AI Agents · 40+ Sources · 60s
              </div>
              <h1 className='text-4xl font-bold text-slate-900 mb-3'>What is your startup idea?</h1>
              <p className='text-slate-500'>Get your full validation report in 60 seconds. Free.</p>
            </div>
            <IdeaInput initialIdea={initialIdea} onSubmit={(idea) => submitScan(idea, user?.access_token)} />
          </motion.div>
        )}
        {(scanStatus === 'pending' || scanStatus === 'processing') && (
          <motion.div key='scanning' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='flex flex-col items-center justify-center min-h-[80vh] px-4'>
            <div className='w-full max-w-lg'>
              <h2 className='text-2xl font-bold text-slate-900 text-center mb-8'>Scanning your idea...</h2>
              <ScanProgress ideaText={ideaText} />
            </div>
          </motion.div>
        )}
        {scanStatus === 'complete' && report && (
          <motion.div key='report' initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='px-4 py-8'>
            <ReportView report={report} ideaText={ideaText} onReset={resetScan} />
          </motion.div>
        )}
        {scanStatus === 'failed' && (
          <motion.div key='error' initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center min-h-[80vh] px-4 text-center'>
            <div className='bg-white border border-red-100 rounded-2xl p-8 max-w-md' style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div className='text-4xl mb-4'>⚠️</div>
              <h2 className='text-slate-900 font-bold text-xl mb-3'>Scan Failed</h2>
              <p className='text-slate-500 text-sm mb-6'>{error || 'Something went wrong. Please try again.'}</p>
              <Button variant='primary' onClick={resetScan}>Try again</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
