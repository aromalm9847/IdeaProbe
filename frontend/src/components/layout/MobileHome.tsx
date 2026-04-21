import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useScanStore } from '../../store/useScanStore'

const PRESET_IDEAS = [
  'AI meal planner that shops from your existing pantry',
  'Freelancer tax automation for gig economy workers in India',
  'Competitor pricing tracker with real-time alerts',
  'DevOps incident summarizer for engineering teams',
  'EV charging network aggregator for Indian cities',
  'Online tutoring platform for IIT-JEE preparation',
]

const FEATURES: { key: string; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    key: 'trends', label: 'Market Trends', sub: 'Real-time signals',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" />
      </svg>
    ),
  },
  {
    key: 'compete', label: 'Competitors', sub: 'Top 10 rivals',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" />
      </svg>
    ),
  },
  {
    key: 'innov', label: 'Innovation', sub: 'Score & verdict',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 00-4 12.7V17a2 2 0 002 2h4a2 2 0 002-2v-2.3A7 7 0 0012 2z" /><path d="M10 22h4" />
      </svg>
    ),
  },
  {
    key: 'research', label: 'Deep Research', sub: '40+ sources',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
      </svg>
    ),
  },
]

export const MobileHome: React.FC = () => {
  const navigate = useNavigate()
  const { user, openAuthModal } = useAuthStore()
  const { history } = useScanStore() as any
  const [idea, setIdea] = useState('')
  const [presetIdx, setPresetIdx] = useState(0)
  const [focused, setFocused] = useState(false)

  const handleRandom = () => {
    const next = (presetIdx + 1) % PRESET_IDEAS.length
    setPresetIdx(next)
    setIdea(PRESET_IDEAS[next])
  }

  const handleScan = () => {
    const trimmed = idea.trim()
    if (trimmed.length < 10) return
    if (!user) {
      openAuthModal('login', 'Sign in to analyze your idea')
      return
    }
    navigate(`/app?idea=${encodeURIComponent(trimmed)}`)
  }

  const recentScans: any[] = history?.slice(0, 3) ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.full_name?.split(' ')[0]

  const verdictMeta: Record<string, { color: string; bg: string; border: string }> = {
    VALIDATED: { color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
    PROMISING: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    RISKY:     { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    AVOID:     { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  }

  const cardShadow = '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -12px rgba(15,23,42,0.08)'
  const heroShadow = '0 1px 2px rgba(10,10,10,0.1), 0 24px 50px -20px rgba(10,10,10,0.4)'

  return (
    <div style={{ padding: '8px 0 24px' }}>

      {/* ── Greeting ──────────────────────────────────────── */}
      <div style={{ padding: '6px 20px 18px' }}>
        <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, letterSpacing: -0.1 }}>
          {greeting}{firstName ? ',' : ''}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A', letterSpacing: -0.6, marginTop: 2 }}>
          {firstName ? `Hello, ${firstName}` : 'Welcome back'}
        </div>
      </div>

      {/* ── Hero dark card ────────────────────────────────── */}
      <div style={{
        margin: '0 16px 18px',
        borderRadius: 28,
        background: '#0B0B0F',
        padding: '22px 22px 20px',
        boxShadow: heroShadow,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Soft mint glow */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,243,208,0.18), transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: -40, bottom: -60,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,197,253,0.12), transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 999,
          padding: '5px 11px', marginBottom: 14,
          fontSize: 10.5, fontWeight: 600, color: '#A7F3D0', letterSpacing: 0.4,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE7B7', boxShadow: '0 0 8px #6EE7B7' }} />
          AI VALIDATION · 60 SECONDS
        </div>

        <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: -1 }}>
          Validate your
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: -1, marginBottom: 10 }}>
          startup idea.
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginBottom: 20, lineHeight: 1.55 }}>
          Real data, real competitors, and market sizing in rupees. From the world's best-in-class data sources.
        </div>

        <button
          onClick={() => {
            if (!user) { openAuthModal('login', 'Sign in to analyze your idea'); return }
            navigate('/app')
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#ffffff', border: 'none', borderRadius: 999,
            padding: '12px 20px',
            color: '#0A0A0A', fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 6px 20px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          Start analysis
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Quick scan card ───────────────────────────────── */}
      <div style={{ margin: '0 16px 22px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          border: focused ? '1px solid rgba(10,10,10,0.12)' : '1px solid rgba(15,23,42,0.06)',
          boxShadow: focused
            ? '0 2px 4px rgba(15,23,42,0.04), 0 16px 40px -12px rgba(15,23,42,0.12)'
            : cardShadow,
          transition: 'all 0.2s ease',
          padding: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              Quick scan
            </span>
            <button onClick={handleRandom} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11.5, color: '#0A0A0A', fontWeight: 600,
              background: '#F4F5F7', border: '1px solid #EDEEF0',
              borderRadius: 999, padding: '5px 10px',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}>
              <span style={{ fontSize: 11 }}>✨</span> Surprise me
            </button>
          </div>

          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe your startup idea in one sentence…"
            rows={3}
            maxLength={500}
            style={{
              width: '100%', resize: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: '#0A0A0A', lineHeight: 1.55,
              background: 'transparent', fontFamily: 'inherit',
              letterSpacing: -0.2,
            }}
          />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 12, paddingTop: 12, borderTop: '1px solid #F4F5F7',
          }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
              {idea.length} / 500
            </span>
            <button
              onClick={handleScan}
              disabled={idea.trim().length < 10}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: -0.1,
                background: idea.trim().length >= 10 ? '#0A0A0A' : '#E5E7EB',
                border: 'none', borderRadius: 999,
                padding: '9px 18px',
                cursor: idea.trim().length >= 10 ? 'pointer' : 'not-allowed',
                boxShadow: idea.trim().length >= 10
                  ? '0 6px 16px rgba(10,10,10,0.22), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 0.2s',
              }}
            >
              Analyze idea
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Feature grid (2x2 cards) ──────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', letterSpacing: -0.2 }}>
          What you'll get
        </div>
      </div>

      <div style={{
        margin: '0 16px 24px',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {FEATURES.map((f) => (
          <div key={f.key} style={{
            background: '#ffffff',
            borderRadius: 22,
            border: '1px solid rgba(15,23,42,0.05)',
            padding: 16,
            boxShadow: cardShadow,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: '#F4F5F7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A0A0A',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              marginBottom: 14,
            }}>
              {f.icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', letterSpacing: -0.2 }}>
              {f.label}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, fontWeight: 500 }}>
              {f.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent scans ──────────────────────────────────── */}
      {recentScans.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', letterSpacing: -0.2 }}>
              Recent scans
            </span>
            <button onClick={() => navigate('/history')} style={{
              fontSize: 12, fontWeight: 600, color: '#0A0A0A',
              background: 'none', border: 'none', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              See all
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {recentScans.length > 0 && (
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentScans.map((entry: any) => {
            const meta = verdictMeta[entry.verdict] || { color: '#374151', bg: '#F4F5F7', border: '#E5E7EB' }
            return (
              <button
                key={entry.scan_id}
                onClick={() => navigate('/history')}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
                  background: '#fff', borderRadius: 20, padding: '14px 16px',
                  border: '1px solid rgba(15,23,42,0.05)', cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: cardShadow,
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: meta.bg,
                  border: `1px solid ${meta.border}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: meta.color, lineHeight: 1, letterSpacing: -0.4 }}>
                    {entry.score ?? '—'}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: meta.color, letterSpacing: 0.4, marginTop: 2 }}>
                    {entry.verdict}
                  </span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 13, color: '#0A0A0A', lineHeight: 1.45, fontWeight: 500,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    letterSpacing: -0.1,
                  }}>
                    {entry.idea_text}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontWeight: 500 }}>
                    {new Date(entry.scanned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#D1D5DB" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {recentScans.length === 0 && (
        <div style={{
          margin: '0 16px', borderRadius: 22, background: '#fff',
          padding: '30px 22px', textAlign: 'center',
          border: '1px solid rgba(15,23,42,0.05)', boxShadow: cardShadow,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: '#F4F5F7', margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0A0A0A',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', letterSpacing: -0.2 }}>
            No scans yet
          </div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 6, lineHeight: 1.55 }}>
            Your analyses will appear here once you validate your first idea.
          </div>
        </div>
      )}

      {/* ── Sign-in nudge (only if guest) ─────────────────── */}
      {!user && (
        <div style={{ margin: '18px 16px 0' }}>
          <button onClick={() => openAuthModal('register')} style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#0B0B0F', border: 'none', borderRadius: 22,
            padding: '14px 18px',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            textAlign: 'left',
            boxShadow: '0 1px 2px rgba(10,10,10,0.1), 0 16px 40px -12px rgba(10,10,10,0.35)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: 'rgba(167,243,208,0.15)',
              border: '1px solid rgba(167,243,208,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#A7F3D0',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', letterSpacing: -0.2 }}>
                Create a free account
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                Save your analyses and track your ideas
              </div>
            </div>
            <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
