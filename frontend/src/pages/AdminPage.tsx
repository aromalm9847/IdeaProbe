import React, { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'

const API = import.meta.env.VITE_API_BASE_URL || ''

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total_scans: number
  guest_scans: number
  registered_scans: number
  total_users: number
  scans_today: number
  users_today: number
  scans_week: number
  users_week: number
  complete_scans: number
  failed_scans: number
  pending_scans: number
  logins_today: number
  logins_week: number
  avg_score: number
}

interface Analytics {
  days: number
  scans_over_time: { date: string; count: number }[]
  signups_over_time: { date: string; count: number }[]
  verdict_distribution: { verdict: string; count: number }[]
  top_countries: { country: string; code: string; count: number }[]
  top_industries: { industry: string; count: number }[]
  top_users: { user_id: number; email: string; full_name: string; scan_count: number }[]
  score_distribution: { bucket: number; count: number }[]
  provider_breakdown: { provider: string; count: number }[]
}

interface ScanRecord {
  scan_id: number
  idea_text: string
  industry: string
  score: number | null
  verdict: string
  status: string
  error_message: string
  created_at: string
  ip_hash: string
  country: string
  country_code: string
  region: string
  city: string
  is_guest: boolean
  user_id: number | null
  user_email: string
  user_name: string
  user_phone: string
}

interface UserRecord {
  user_id: number
  email: string
  phone: string
  full_name: string
  is_admin: boolean
  is_active: boolean
  auth_provider: string
  avatar_url: string
  created_at: string
  last_login: string | null
  scan_count: number
}

interface LoginEvent {
  id: number
  user_id: number | null
  email: string
  full_name: string
  provider: string
  ip: string
  country: string
  country_code: string
  region: string
  city: string
  user_agent: string
  created_at: string
}

type Tab = 'overview' | 'scans' | 'users' | 'logins'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function fmtShort(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function scoreColor(s: number | null) {
  if (s === null) return 'text-slate-500'
  if (s >= 70) return 'text-emerald-400'
  if (s >= 50) return 'text-amber-400'
  return 'text-rose-400'
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    complete:   'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
    failed:     'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
    pending:    'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
    processing: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20',
  }
  return `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${map[status] || 'bg-slate-500/10 text-slate-400'}`
}

function providerBadge(p: string) {
  const map: Record<string, string> = {
    google:   'bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20',
    password: 'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20',
    email:    'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20',
    otp:      'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
    phone:    'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
  }
  return `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${map[p] || 'bg-slate-500/10 text-slate-400'}`
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return ''
  const base = 127397 // offset to regional indicator
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + base))
}

function exportCSV(rows: object[], filename: string) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map(r =>
    keys.map(k => JSON.stringify((r as any)[k] ?? '')).join(',')
  )].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6']

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onAuth }: { onAuth: (secret: string) => void }) {
  const [secret, setSecret] = useState(() => localStorage.getItem('admin_secret') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login() {
    if (!secret) return
    setLoading(true); setError('')
    try {
      await axios.get(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${secret}` } })
      localStorage.setItem('admin_secret', secret)
      onAuth(secret)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Access denied')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Console</h1>
            <p className="text-xs text-slate-400">IdeaProbe</p>
          </div>
        </div>
        <input
          type="password"
          placeholder="Admin secret token"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white mb-3 focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
          autoFocus
        />
        {error && <p className="text-rose-400 text-sm mb-3">{error}</p>}
        <button
          onClick={login}
          disabled={loading || !secret}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
        >
          {loading ? 'Verifying…' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="relative bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5 overflow-hidden group hover:border-white/10 transition-colors">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 ${accent || 'bg-indigo-500'}`} />
      <div className="relative">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-3xl font-bold text-white mt-2">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ secret }: { secret: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const headers = { Authorization: `Bearer ${secret}` }
    setLoading(true)
    Promise.all([
      axios.get(`${API}/api/admin/stats`, { headers }),
      axios.get(`${API}/api/admin/analytics?days=${days}`, { headers }),
    ]).then(([s, a]) => {
      setStats(s.data)
      setAnalytics(a.data)
    }).finally(() => setLoading(false))
  }, [secret, days])

  if (loading || !stats || !analytics) {
    return <div className="text-center py-20 text-slate-400">Loading analytics…</div>
  }

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#e2e8f0',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Scans" value={stats.total_scans.toLocaleString()} sub={`${stats.scans_today} today · ${stats.scans_week} this week`} accent="bg-indigo-500" />
        <StatCard label="Total Users" value={stats.total_users.toLocaleString()} sub={`${stats.users_today} today · ${stats.users_week} this week`} accent="bg-emerald-500" />
        <StatCard label="Logins" value={stats.logins_week.toLocaleString()} sub={`${stats.logins_today} today · 7-day`} accent="bg-amber-500" />
        <StatCard label="Avg Score" value={stats.avg_score} sub={`${stats.complete_scans} complete · ${stats.failed_scans} failed`} accent="bg-rose-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-slate-900/40 border border-white/5 rounded-xl px-4 py-3">
          <div className="text-slate-400 text-xs">Registered Scans</div>
          <div className="text-white font-semibold text-lg">{stats.registered_scans.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl px-4 py-3">
          <div className="text-slate-400 text-xs">Guest Scans</div>
          <div className="text-white font-semibold text-lg">{stats.guest_scans.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl px-4 py-3">
          <div className="text-slate-400 text-xs">Pending</div>
          <div className="text-white font-semibold text-lg">{stats.pending_scans.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl px-4 py-3">
          <div className="text-slate-400 text-xs">Failed</div>
          <div className="text-white font-semibold text-lg">{stats.failed_scans.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Analytics</h2>
        <div className="flex gap-1 bg-slate-900/50 border border-white/5 rounded-lg p-1">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs rounded transition-colors ${days === d ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Scans Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.scans_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Signups Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.signups_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Verdict Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.verdict_distribution}
                  dataKey="count"
                  nameKey="verdict"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={(e: any) => `${e.verdict} (${e.count})`}
                  labelLine={false}
                >
                  {analytics.verdict_distribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.score_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickFormatter={v => `${v}+`} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Countries</h3>
          <div className="space-y-2">
            {analytics.top_countries.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-8">No geo data yet</div>
            )}
            {analytics.top_countries.map((c, i) => {
              const max = analytics.top_countries[0]?.count || 1
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 text-center">{countryFlag(c.code)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-200 truncate">{c.country}</span>
                      <span className="text-slate-400">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Industries</h3>
          <div className="space-y-2">
            {analytics.top_industries.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-8">No industry data yet</div>
            )}
            {analytics.top_industries.map((c, i) => {
              const max = analytics.top_industries[0]?.count || 1
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-200 truncate">{c.industry}</span>
                      <span className="text-slate-400">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Users by Scans</h3>
          <div className="space-y-2">
            {analytics.top_users.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-8">No users yet</div>
            )}
            {analytics.top_users.map(u => (
              <div key={u.user_id} className="flex items-center justify-between gap-3 bg-slate-950/30 rounded-lg px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-100 truncate">{u.full_name || u.email || `User #${u.user_id}`}</div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                </div>
                <div className="text-sm font-semibold text-indigo-300">{u.scan_count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Login Providers</h3>
          <div className="h-64">
            {analytics.provider_breakdown.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No login data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.provider_breakdown}
                    dataKey="count"
                    nameKey="provider"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={(e: any) => `${e.provider} (${e.count})`}
                    labelLine={false}
                  >
                    {analytics.provider_breakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Scans Tab ────────────────────────────────────────────────────────────────

function ScansTab({ secret }: { secret: string }) {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [guestFilter, setGuestFilter] = useState<string>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [detail, setDetail] = useState<Record<number, string>>({})
  const LIMIT = 50

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (guestFilter) params.set('guest_only', guestFilter)
      if (fromDate) params.set('from_date', fromDate)
      if (toDate) params.set('to_date', toDate)
      const res = await axios.get(`${API}/api/admin/scan-history?${params}`, {
        headers: { Authorization: `Bearer ${secret}` },
      })
      setScans(res.data.scans)
      setTotal(res.data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [secret, search, statusFilter, guestFilter, fromDate, toDate])

  useEffect(() => {
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [load])

  async function toggleExpand(id: number) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!detail[id]) {
      try {
        const res = await axios.get(`${API}/api/admin/scan-detail/${id}`, {
          headers: { Authorization: `Bearer ${secret}` },
        })
        setDetail(d => ({ ...d, [id]: res.data.report_json || '(no report)' }))
      } catch {
        setDetail(d => ({ ...d, [id]: '(failed to load)' }))
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Search idea, email, name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="md:col-span-2 bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="">All statuses</option>
            <option value="complete">Complete</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={guestFilter}
            onChange={e => setGuestFilter(e.target.value)}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="">All users</option>
            <option value="false">Registered only</option>
            <option value="true">Guests only</option>
          </select>
          <button
            onClick={() => exportCSV(scans, 'scans.csv')}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-800 transition-colors"
          >
            Export CSV
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <label className="text-xs text-slate-400">From
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400" />
          </label>
          <label className="text-xs text-slate-400">To
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400" />
          </label>
          <div className="col-span-2 text-xs text-slate-400 flex items-end">
            Showing {scans.length} of {total.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 border-b border-white/5 text-slate-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 font-medium">Idea</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium w-32">Location</th>
                <th className="text-left px-4 py-3 font-medium w-16">Score</th>
                <th className="text-left px-4 py-3 font-medium w-24">Status</th>
                <th className="text-left px-4 py-3 font-medium w-32">Date</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">Loading…</td></tr>
              ) : scans.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No scans found</td></tr>
              ) : scans.map(s => (
                <React.Fragment key={s.scan_id}>
                  <tr className="hover:bg-slate-950/40 transition-colors cursor-pointer" onClick={() => toggleExpand(s.scan_id)}>
                    <td className="px-4 py-3 text-slate-500">{s.scan_id}</td>
                    <td className="px-4 py-3 text-slate-200 max-w-md truncate" title={s.idea_text}>{s.idea_text}</td>
                    <td className="px-4 py-3">
                      {s.is_guest ? (
                        <span className="text-slate-500 italic text-xs">Guest</span>
                      ) : (
                        <div className="min-w-0">
                          <div className="text-slate-200 text-xs truncate">{s.user_name || s.user_email}</div>
                          <div className="text-slate-500 text-[10px] truncate">{s.user_email}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      {s.country ? (
                        <div className="flex items-center gap-1.5">
                          <span>{countryFlag(s.country_code)}</span>
                          <div className="min-w-0">
                            <div className="truncate">{s.city || s.region || s.country}</div>
                            <div className="text-[10px] text-slate-500 truncate">{s.country}</div>
                          </div>
                        </div>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${scoreColor(s.score)}`}>{s.score ?? '—'}</td>
                    <td className="px-4 py-3"><span className={statusBadge(s.status)}>{s.status}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtShort(s.created_at)}</td>
                    <td className="px-4 py-3 text-slate-500">{expanded === s.scan_id ? '▾' : '▸'}</td>
                  </tr>
                  {expanded === s.scan_id && (
                    <tr className="bg-slate-950/60">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-slate-400 uppercase tracking-wider mb-1">Full idea</div>
                            <div className="text-slate-200 whitespace-pre-wrap">{s.idea_text}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 uppercase tracking-wider mb-1">Metadata</div>
                            <div className="space-y-0.5 text-slate-300">
                              <div><span className="text-slate-500">Verdict:</span> {s.verdict || '—'}</div>
                              <div><span className="text-slate-500">Industry:</span> {s.industry || '—'}</div>
                              <div><span className="text-slate-500">IP hash:</span> <code className="text-[10px]">{s.ip_hash?.slice(0, 16) || '—'}</code></div>
                              <div><span className="text-slate-500">Created:</span> {fmt(s.created_at)}</div>
                              {s.error_message && <div className="text-rose-400"><span className="text-slate-500">Error:</span> {s.error_message}</div>}
                            </div>
                          </div>
                          {detail[s.scan_id] && (
                            <div className="md:col-span-2">
                              <div className="text-slate-400 uppercase tracking-wider mb-1">Report JSON</div>
                              <pre className="bg-slate-950 border border-white/5 rounded-lg p-3 text-[10px] text-slate-300 overflow-x-auto max-h-96">{(() => {
                                try { return JSON.stringify(JSON.parse(detail[s.scan_id]), null, 2) }
                                catch { return detail[s.scan_id] }
                              })()}</pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-sm">
            <div className="text-slate-400">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page <= 1}
                className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ secret }: { secret: string }) {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const LIMIT = 50

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
      if (search) params.set('search', search)
      const res = await axios.get(`${API}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${secret}` },
      })
      setUsers(res.data.users)
      setTotal(res.data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [secret, search])

  useEffect(() => {
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <input
          type="text"
          placeholder="Search email, name, phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-md bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
        />
        <div className="text-sm text-slate-400">{total.toLocaleString()} users</div>
        <button
          onClick={() => exportCSV(users, 'users.csv')}
          className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-800 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 border-b border-white/5 text-slate-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium w-32">Phone</th>
                <th className="text-left px-4 py-3 font-medium w-28">Provider</th>
                <th className="text-left px-4 py-3 font-medium w-16">Scans</th>
                <th className="text-left px-4 py-3 font-medium w-36">Last Login</th>
                <th className="text-left px-4 py-3 font-medium w-36">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.user_id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{u.user_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-slate-200 truncate">{u.full_name || '—'}</div>
                        <div className="flex gap-1">
                          {u.is_admin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">admin</span>}
                          {!u.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">inactive</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-xs" title={u.email}>{u.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3"><span className={providerBadge(u.auth_provider)}>{u.auth_provider}</span></td>
                  <td className="px-4 py-3 text-indigo-300 font-semibold">{u.scan_count}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmtShort(u.last_login)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmtShort(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-sm">
            <div className="text-slate-400">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page <= 1}
                className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Login History Tab ────────────────────────────────────────────────────────

function LoginsTab({ secret }: { secret: string }) {
  const [events, setEvents] = useState<LoginEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const LIMIT = 50

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
      if (search) params.set('search', search)
      if (provider) params.set('provider', provider)
      if (fromDate) params.set('from_date', fromDate)
      if (toDate) params.set('to_date', toDate)
      const res = await axios.get(`${API}/api/admin/login-history?${params}`, {
        headers: { Authorization: `Bearer ${secret}` },
      })
      setEvents(res.data.events)
      setTotal(res.data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [secret, search, provider, fromDate, toDate])

  useEffect(() => {
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Search email, IP, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="md:col-span-2 bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
          />
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="">All providers</option>
            <option value="password">Password</option>
            <option value="google">Google</option>
            <option value="otp">OTP</option>
          </select>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400" />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400" />
          <button
            onClick={() => exportCSV(events, 'logins.csv')}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-800 transition-colors"
          >
            Export CSV
          </button>
        </div>
        <div className="text-xs text-slate-400 mt-3">Showing {events.length} of {total.toLocaleString()}</div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 border-b border-white/5 text-slate-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium w-24">Provider</th>
                <th className="text-left px-4 py-3 font-medium w-32">IP</th>
                <th className="text-left px-4 py-3 font-medium w-48">Location</th>
                <th className="text-left px-4 py-3 font-medium w-36">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">Loading…</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">No login events yet. New logins will appear here.</td></tr>
              ) : events.map(e => (
                <tr key={e.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{e.id}</td>
                  <td className="px-4 py-3 text-slate-200 text-xs truncate max-w-xs">{e.full_name || (e.user_id ? `User #${e.user_id}` : 'Guest')}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-xs" title={e.email}>{e.email || '—'}</td>
                  <td className="px-4 py-3"><span className={providerBadge(e.provider)}>{e.provider}</span></td>
                  <td className="px-4 py-3"><code className="text-[10px] text-slate-400">{e.ip || '—'}</code></td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    {e.country ? (
                      <div className="flex items-center gap-1.5">
                        <span>{countryFlag(e.country_code)}</span>
                        <div className="min-w-0 truncate">
                          {[e.city, e.region, e.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmtShort(e.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-sm">
            <div className="text-slate-400">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page <= 1}
                className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [secret, setSecret] = useState<string | null>(() => localStorage.getItem('admin_secret'))
  const [tab, setTab] = useState<Tab>('overview')

  if (!secret) return <LoginScreen onAuth={setSecret} />

  function logout() {
    localStorage.removeItem('admin_secret')
    setSecret(null)
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'scans',    label: 'Scans',    icon: '🔍' },
    { id: 'users',    label: 'Users',    icon: '👥' },
    { id: 'logins',   label: 'Logins',   icon: '🔐' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />
      <div className="relative">
        <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Admin Console</h1>
                <p className="text-[11px] text-slate-500">IdeaProbe</p>
              </div>
            </div>
            <button onClick={logout} className="text-xs text-slate-400 hover:text-white transition-colors">
              Logout
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <nav className="flex gap-1 -mb-px">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    tab === t.id
                      ? 'border-indigo-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {tab === 'overview' && <OverviewTab secret={secret} />}
          {tab === 'scans'    && <ScansTab secret={secret} />}
          {tab === 'users'    && <UsersTab secret={secret} />}
          {tab === 'logins'   && <LoginsTab secret={secret} />}
        </main>
      </div>
    </div>
  )
}
