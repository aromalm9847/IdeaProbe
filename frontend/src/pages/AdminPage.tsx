import React, { useState, useCallback } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL || ''

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total_scans: number
  guest_scans: number
  registered_scans: number
  total_users: number
  scans_today: number
  users_today: number
  complete_scans: number
  failed_scans: number
  avg_score: number
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
  created_at: string
  last_login: string | null
  scan_count: number
}

type Tab = 'overview' | 'scans' | 'users'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function scoreColor(s: number | null) {
  if (s === null) return 'text-gray-300'
  if (s >= 70) return 'text-green-600'
  if (s >= 50) return 'text-yellow-600'
  return 'text-red-500'
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    complete: 'bg-green-50 text-green-700',
    failed:   'bg-red-50 text-red-600',
    pending:  'bg-yellow-50 text-yellow-700',
    processing: 'bg-blue-50 text-blue-700',
  }
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-500'}`
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-400">IdeaProbe Dashboard</p>
          </div>
        </div>
        <input
          type="password"
          placeholder="Admin secret token"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-indigo-400"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={login}
          disabled={loading || !secret}
          className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Verifying...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className={`text-3xl font-bold ${color || 'text-indigo-600'}`}>{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── Scans Tab ────────────────────────────────────────────────────────────────

function ScansTab({ secret }: { secret: string }) {
  const headers = { Authorization: `Bearer ${secret}` }
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [detail, setDetail] = useState<Record<number, string>>({})
  const LIMIT = 50

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/admin/scan-history?page=${p}&limit=${LIMIT}`, { headers })
      setScans(res.data.scans)
      setTotal(res.data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load(1) }, [load])

  async function toggleExpand(id: number) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!detail[id]) {
      try {
        const res = await axios.get(`${API}/api/admin/scan-detail/${id}`, { headers })
        setDetail(d => ({ ...d, [id]: res.data.report_json || '(no report)' }))
      } catch {
        setDetail(d => ({ ...d, [id]: '(failed to load)' }))
      }
    }
  }

  const filtered = search
    ? scans.filter(s =>
        s.idea_text.toLowerCase().includes(search.toLowerCase()) ||
        s.user_email.toLowerCase().includes(search.toLowerCase()) ||
        s.user_name.toLowerCase().includes(search.toLowerCase()) ||
        s.user_phone.includes(search)
      )
    : scans

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search idea, email, name, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-80 focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={() => exportCSV(filtered, 'scans.csv')}
          className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Idea</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-16">Score</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-24">Industry</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-24">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-36">Date</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No scans found</td></tr>
              ) : filtered.map(s => (
                <React.Fragment key={s.scan_id}>
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.scan_id}</td>
                    <td className="px-4 py-3" style={{ maxWidth: 360, minWidth: 180 }}>
                      <div className="text-gray-800 line-clamp-2 text-sm leading-snug">{s.idea_text}</div>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      {s.is_guest ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Guest</span>
                      ) : (
                        <div>
                          <div className="text-gray-800 font-medium text-sm">{s.user_name || '—'}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{s.user_email}</div>
                          {s.user_phone && <div className="text-gray-400 text-xs">{s.user_phone}</div>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.score !== null
                        ? <span className={`font-bold text-base ${scoreColor(s.score)}`}>{s.score}</span>
                        : <span className="text-gray-300">—</span>}
                      {s.verdict && <div className="text-xs text-gray-400 mt-0.5">{s.verdict}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.industry || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(s.status)}>{s.status}</span>
                      {s.error_message && (
                        <div className="text-xs text-red-400 mt-1 max-w-[120px] truncate" title={s.error_message}>{s.error_message}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleExpand(s.scan_id)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View full report"
                      >
                        <svg className={`w-4 h-4 transition-transform ${expanded === s.scan_id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expanded === s.scan_id && (
                    <tr>
                      <td colSpan={8} className="px-4 pb-4 pt-0 bg-indigo-50/40">
                        <div className="text-xs font-semibold text-gray-500 mb-2 mt-2">Full Idea Text</div>
                        <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100 mb-3 whitespace-pre-wrap">{s.idea_text}</div>
                        <div className="text-xs font-semibold text-gray-500 mb-2">Report JSON</div>
                        <pre className="text-xs text-gray-600 bg-white rounded-lg p-3 border border-gray-100 overflow-x-auto max-h-72 whitespace-pre-wrap break-words">
                          {detail[s.scan_id] === undefined
                            ? 'Loading...'
                            : (() => { try { return JSON.stringify(JSON.parse(detail[s.scan_id]), null, 2) } catch { return detail[s.scan_id] } })()
                          }
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} scans
            </span>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 1 || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">Page {page}/{totalPages}</span>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ secret }: { secret: string }) {
  const headers = { Authorization: `Bearer ${secret}` }
  const [users, setUsers] = useState<UserRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const LIMIT = 50

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/admin/users?page=${p}&limit=${LIMIT}`, { headers })
      setUsers(res.data.users)
      setTotal(res.data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load(1) }, [load])

  const filtered = search
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)
      )
    : users

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-80 focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={() => exportCSV(filtered, 'users.csv')}
          className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-16">Scans</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-20">Role</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-32">Joined</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-32">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.user_id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.user_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                        {(u.full_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-indigo-600">{u.scan_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_admin
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">Admin</span>
                      : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">User</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(u.created_at)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{u.last_login ? fmt(u.last_login) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} users
            </span>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 1 || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">Page {page}/{totalPages}</span>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminPage: React.FC = () => {
  const [secret, setSecret] = useState(() => localStorage.getItem('admin_secret') || '')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [tab, setTab] = useState<Tab>('overview')

  async function onAuth(s: string) {
    setSecret(s)
    const res = await axios.get(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${s}` } })
    setStats(res.data)
    setAuthed(true)
  }

  function signOut() {
    setAuthed(false)
    localStorage.removeItem('admin_secret')
    setStats(null)
  }

  if (!authed) return <LoginScreen onAuth={onAuth} />

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'scans', label: 'Scans' },
    { id: 'users', label: 'Users' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-gray-900">IdeaProbe Admin</span>
              <span className="text-gray-400 text-sm ml-2">Dashboard</span>
            </div>
          </div>
          <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-4 py-1.5 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Scans" value={stats.total_scans} />
              <StatCard label="Scans Today" value={stats.scans_today} color="text-green-600" />
              <StatCard label="Registered Users" value={stats.total_users} color="text-purple-600" />
              <StatCard label="New Users Today" value={stats.users_today} color="text-blue-600" />
              <StatCard label="Guest Scans" value={stats.guest_scans} sub="anonymous" color="text-gray-500" />
              <StatCard label="Logged-in Scans" value={stats.registered_scans} color="text-indigo-600" />
              <StatCard label="Completed Scans" value={stats.complete_scans} color="text-green-600" />
              <StatCard label="Failed Scans" value={stats.failed_scans} color="text-red-500" />
              <StatCard label="Avg Score" value={stats.avg_score} sub="across all scans" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => setTab('scans')} className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-sm text-gray-700">
                    → View all scans
                  </button>
                  <button onClick={() => setTab('users')} className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-sm text-gray-700">
                    → View all users
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Completion Rate</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {stats.total_scans > 0 ? Math.round((stats.complete_scans / stats.total_scans) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-400">{stats.complete_scans} completed out of {stats.total_scans} total</p>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${stats.total_scans > 0 ? (stats.complete_scans / stats.total_scans) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scans */}
        {tab === 'scans' && <ScansTab secret={secret} />}

        {/* Users */}
        {tab === 'users' && <UsersTab secret={secret} />}
      </div>
    </div>
  )
}
