import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReportData } from '../../types'
import { ScoreGauge } from './ScoreGauge'
import { CompetitorTable } from './CompetitorTable'
import { MarketReality } from './MarketReality'
import { FixPlaybook } from './FixPlaybook'
import { LiveSources } from './LiveSources'
import { Button } from '../ui/Button'
import RefinedIdea from './RefinedIdea'
import DeepCompetitors from './DeepCompetitors'
import InnovationIdeas from './InnovationIdeas'
import DeepResearch from './DeepResearch'
import { useScanStore } from '../../store/useScanStore'
import { useAuthStore } from '../../store/authStore'

const API = import.meta.env.VITE_API_BASE_URL || 'https://backend-production-603e.up.railway.app'

const WHATSAPP_URL =
  'https://wa.me/9035514817?text=Hi%20I%20just%20downloaded%20my%20IdeaProbe%20report%20and%20would%20like%20a%20business%20consultation'

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

// --- WhatsApp Expert Modal ---
interface ExpertModalProps {
  visible: boolean
  onClose: () => void
}

const ExpertModal: React.FC<ExpertModalProps> = ({ visible, onClose }) => {
  const handleWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="expert-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          style={{ background: 'rgba(15,23,42,0.40)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="expert-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: '#ffffff', border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.10)' }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

              <button
                onClick={onClose}
                className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X size={14} />
              </button>

              <div className="p-6 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)' }}
                >
                  <WhatsAppIcon />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Talk to an Expert</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Your report shows important insights about your business growth opportunities.
                  Connect with our team to understand your report and get a personalized growth strategy.
                </p>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    boxShadow: '0 4px 18px rgba(34,197,94,0.38)',
                  }}
                >
                  <WhatsAppIcon />
                  Chat on WhatsApp
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// --- Post-download Conversion Popup ---
interface DownloadPopupProps {
  visible: boolean
  onClose: () => void
  onConsult: () => void
}

const DownloadPopup: React.FC<DownloadPopupProps> = ({ visible, onClose, onConsult }) => {
  const handleConsult = () => { onClose(); onConsult() }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dl-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(16px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="dl-card"
            initial={{ opacity: 0, scale: 0.88, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient border glow */}
            <div className="absolute -inset-[1.5px] rounded-[22px] pointer-events-none" style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
              backgroundSize: '300% 300%',
              animation: 'gradientShift 4s ease infinite',
              filter: 'blur(0px)',
            }} />

            <div className="relative rounded-[20px] overflow-hidden" style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 24px 80px rgba(99,102,241,0.18), 0 8px 32px rgba(0,0,0,0.10)',
            }}>
              {/* Top progress bar animation */}
              <div className="h-1 w-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <motion.div
                  className="h-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                />
              </div>

              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all z-10">
                <X size={15} />
              </button>

              <div className="p-7">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.15 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))', border: '1.5px solid rgba(99,102,241,0.20)' }}
                  >
                    🚀
                  </motion.div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1.5 text-center">
                  Your Report is Downloading
                </h3>
                <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
                  Your full report is on the way.<br />
                  Most successful businesses don't just read the report — they turn insights into action.
                  <br /><br />
                  Get expert guidance on how to use your report to grow faster.
                </p>

                <ul className="space-y-3 mb-7">
                  {[
                    { icon: '🎯', text: 'Understand your audience deeply' },
                    { icon: '🔍', text: 'Identify hidden growth gaps' },
                    { icon: '📈', text: 'Get a clear strategy to scale' },
                  ].map((item, i) => (
                    <motion.li
                      key={item.text}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex items-center gap-3 text-sm text-slate-700"
                    >
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  onClick={handleConsult}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm text-white mb-3 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 30px rgba(99,102,241,0.45)' }}
                >
                  <span className="relative z-10">Talk to Experts →</span>
                </motion.button>

                <button onClick={onClose} className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all font-medium">
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// --- Main Report View ---

interface ReportViewProps {
  report: ReportData
  ideaText: string
  onReset?: () => void
}

type Tab = 'overview' | 'competitors' | 'innovation' | 'research'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'competitors', label: 'Competitor Intel', icon: '🔍' },
  { id: 'innovation', label: 'Innovation', icon: '🚀' },
  { id: 'research', label: 'Deep Research', icon: '📊' },
]

export const ReportView: React.FC<ReportViewProps> = ({ report, ideaText, onReset }) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showExpertModal, setShowExpertModal] = useState(false)
  const [showDownloadPopup, setShowDownloadPopup] = useState(false)
  const { scanId } = useScanStore()
  const { user, openAuthModal } = useAuthStore()

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownloadPDF = async () => {
    if (!user) {
      openAuthModal('login')
      return
    }
    if (!scanId) return
    setPdfLoading(true)
    try {
      const response = await fetch(`${API}/api/pdf/${scanId}`, {
        headers: user ? { 'Authorization': `Bearer ${user.access_token}` } : {},
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || 'PDF generation failed')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ideaprobe-report-${scanId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      // Show conversion popup after download starts
      setShowDownloadPopup(true)
    } catch (err: any) {
      console.error('PDF download failed:', err)
      alert(`PDF download failed: ${err.message || 'Please try again.'}`)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center py-6 relative">
        <ScoreGauge score={report.score} verdict={report.verdict} />
        <p className="text-slate-500 text-sm italic mt-4">"{ideaText}"</p>
        <p className="text-slate-400 text-xs mt-2">
          {report.industry} · Scanned in {report.scan_duration_seconds}s
        </p>

        {/* Action buttons */}
        {scanId && (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 w-full max-w-xs mx-auto">
            {/* Download PDF */}
            <motion.button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
              }}
            >
              {pdfLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating PDF...
                </>
              ) : user ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Full Report PDF
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sign in to Download PDF
                </>
              )}
            </motion.button>

            {/* Get Free Business Consultation */}
            <motion.button
              onClick={() => setShowExpertModal(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
              }}
            >
              <WhatsAppIcon />
              Get Business Consultation
            </motion.button>
          </div>
        )}
        {scanId && (
          <p className="text-xs text-slate-600 mt-2">
            {user ? 'Premium PDF with all 4 agent analyses' : '🔒 Free account required to download PDF'}
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl p-1 overflow-x-auto"
        style={{ background: '#f8fafc', border: '1px solid rgba(99,102,241,0.12)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            style={activeTab === tab.id ? {
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
            } : {}}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {report.refining && <RefinedIdea data={report.refining} />}

          <div className="rounded-xl p-5"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)' }}>
            <p className="text-amber-700 font-semibold text-base">
              ⚠️ Biggest Risk: {report.biggest_risk} ({report.biggest_risk_score}/10)
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 font-semibold text-base mb-3">💡 What's Working</h3>
            <div className="rounded-xl p-5"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <ul className="space-y-2">
                {report.whats_working.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✅</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 font-semibold text-base mb-3">🏆 Competitor Summary</h3>
            <CompetitorTable competitors={report.competitors} />
            {report.competitors_deep && (
              <button
                onClick={() => setActiveTab('competitors')}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                → View full competitor deep-dive ↗
              </button>
            )}
          </div>

          <div>
            <h3 className="text-slate-900 font-semibold text-base mb-3">📊 Market Reality</h3>
            <MarketReality market={report.market} trends={report.search_trends} />
          </div>

          <div>
            <h3 className="text-slate-900 font-semibold text-base mb-3">🛠 Fix Playbook</h3>
            <FixPlaybook steps={report.fix_playbook} />
          </div>

          <div>
            <h3 className="text-slate-900 font-semibold text-base mb-3">🔍 Data Sources</h3>
            <LiveSources sources={report.sources} />
          </div>
        </motion.div>
      )}

      {activeTab === 'competitors' && (
        <motion.div key="competitors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {report.competitors_deep ? (
            <DeepCompetitors data={report.competitors_deep} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">🔍</p>
              <p>Deep competitor analysis not available for this scan.</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'innovation' && (
        <motion.div key="innovation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {report.innovation ? (
            <InnovationIdeas data={report.innovation} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">🚀</p>
              <p>Innovation analysis not available for this scan.</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'research' && (
        <motion.div key="research" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {report.deep_research ? (
            <DeepResearch data={report.deep_research} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">📊</p>
              <p>Deep research not available for this scan.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-8">
        {onReset && (
          <Button variant="secondary" size="md" onClick={onReset} className="flex-1">
            ↩ Scan another idea
          </Button>
        )}
        <Button variant="secondary" size="md" onClick={handleShare} className="flex-1">
          {copied ? '✓ Copied!' : '🔗 Share this report'}
        </Button>
        {scanId && (
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.20)', color: '#6366f1' }}
          >
            {pdfLoading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Generating...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Download PDF</>
            )}
          </button>
        )}
      </div>

      {/* Modals */}
      <ExpertModal visible={showExpertModal} onClose={() => setShowExpertModal(false)} />
      <DownloadPopup
        visible={showDownloadPopup}
        onClose={() => setShowDownloadPopup(false)}
        onConsult={() => setShowExpertModal(true)}
      />
    </motion.div>
  )
}
