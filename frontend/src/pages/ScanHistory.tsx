import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL || 'https://backend-production-603e.up.railway.app'

interface HistoryItem {
  scan_id: number
  idea_text: string
  score: number | null
  verdict: string | null
  status: string
  created_at: string
}

const verdictColors: Record<string, string> = {
  VALIDATED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  PROMISING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  RISKY: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  AVOID: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const verdictEmoji: Record<string, string> = {
  VALIDATED: '✅',
  PROMISING: '🚀',
  RISKY: '⚠️',
  AVOID: '❌',
}

const scoreColor = (score: number | null) => {
  if (!score) return '#64748b'
  if (score >= 75) return '#10b981'
  if (score >= 55) return '#3b82f6'
  if (score >= 35) return '#f59e0b'
  return '#ef4444'
}

export const ScanHistory: React.FC = () => {
  const { user, openAuthModal } = useAuthStore()
  const navigate = useNavigate()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      openAuthModal('login')
      return
    }
    fetchHistory()
  }, [user])

  const fetchHistory = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${API}/api/auth/history`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      })
      setHistory(res.data.history || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load scan history.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  const truncate = (text: string, max = 80) =>
    text.length > max ? text.slice(0, max) + '…' : text

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Please sign in to view your scan history.</p>
          <button onClick={() => openAuthModal('login')} className="btn-premium px-6 py-3 text-sm font-semibold">
            Sign In →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)' }}>
              📋
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Scan History</h1>
              <p className="text-slate-400 text-sm">
                {user.full_name ? `${user.full_name}'s` : 'Your'} idea validation history
              </p>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-slate-400 text-sm">Loading your scan history...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchHistory} className="btn-premium px-6 py-2.5 text-sm font-semibold">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              💡
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No scans yet</h3>
            <p className="text-slate-400 mb-6">You haven't validated any ideas yet. Start your first scan!</p>
            <button onClick={() => navigate('/scanner')} className="btn-premium px-8 py-3 text-sm font-semibold">
              Scan Your First Idea →
            </button>
          </motion.div>
        )}

        {/* History list */}
        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            <p className="text-slate-500 text-sm mb-6">{history.length} scan{history.length !== 1 ? 's' : ''} found</p>

            {history.map((item, i) => (
              <motion.div
                key={item.scan_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/scanner?scan_id=${item.scan_id}`)}
                className="cursor-pointer group rounded-2xl p-5 transition-all hover:scale-[1.01]"
                style={{
                  background: 'rgba(15, 15, 30, 0.8)',
                  border: '1px solid rgba(99,102,241,0.12)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(99,102,241,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(99,102,241,0.12)')}
              >
                <div className="flex items-start gap-4">
                  {/* Score circle */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: `${scoreColor(item.score)}18`, border: `1px solid ${scoreColor(item.score)}40` }}>
                    <span className="text-lg font-bold" style={{ color: scoreColor(item.score) }}>
                      {item.score ?? '—'}
                    </span>
                    <span className="text-xs text-slate-600">score</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-white font-medium text-sm leading-snug group-hover:text-indigo-300 transition-colors">
                        {truncate(item.idea_text)}
                      </p>
                      {item.verdict && (
                        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${verdictColors[item.verdict] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                          {verdictEmoji[item.verdict]} {item.verdict}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>🕐 {formatDate(item.created_at)}</span>
                      {item.status === 'complete' && (
                        <span className="text-emerald-500">● Complete</span>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-amber-500">● Processing...</span>
                      )}
                      {item.status === 'failed' && (
                        <span className="text-red-500">● Failed</span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-slate-600 group-hover:text-indigo-400 transition-colors text-lg">
                    →
                  </div>
                </div>
              </motion.div>
            ))}

            {/* New scan CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-6"
            >
              <button onClick={() => navigate('/scanner')} className="btn-premium px-8 py-3 text-sm font-semibold">
                + Validate a New Idea
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScanHistory
