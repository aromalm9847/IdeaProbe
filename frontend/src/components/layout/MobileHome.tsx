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

const FEATURES = [
  { emoji: '📈', label: 'Market Trends',    color: '#2563EB', bg: '#EFF6FF' },
  { emoji: '🏆', label: 'Competitors',      color: '#7C3AED', bg: '#F5F3FF' },
  { emoji: '💡', label: 'Innovation Score', color: '#D97706', bg: '#FFFBEB' },
  { emoji: '🌍', label: 'Deep Research',    color: '#16A34A', bg: '#F0FDF4' },
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
    if (idea.trim().length >= 10) navigate(`/app?idea=${encodeURIComponent(idea.trim())}`)
  }

  const recentScans: any[] = history?.slice(0, 3) ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.full_name?.split(' ')[0]

  const verdictColor: Record<string, string> = {
    VALIDATED: '#16A34A', PROMISING: '#2563EB', RISKY: '#D97706', AVOID: '#DC2626',
  }
  const verdictBg: Record<string, string> = {
    VALIDATED: '#F0FDF4', PROMISING: '#EFF6FF', RISKY: '#FFFBEB', AVOID: '#FEF2F2',
  }

  return (
    <div style={{ padding: '16px 0' }}>

      {/* Greeting */}
      {firstName && (
        <div style={{ paddingLeft: 18, marginBottom: 14, fontSize: 14, color: '#475569', fontWeight: 500 }}>
          {greeting}, {firstName} 👋
        </div>
      )}

      {/* Hero card */}
      <div style={{
        margin: '0 16px 20px',
        borderRadius: 22,
        background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 60%, #F5F3FF 100%)',
        border: '1px solid rgba(99,102,241,0.12)',
        padding: '20px 20px 22px',
        boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orb */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.75)', borderRadius: 20,
          padding: '5px 12px', marginBottom: 12,
          border: '1px solid rgba(99,102,241,0.15)',
          fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: 0.4,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: '#6366f1' }} />
          4 AI AGENTS · 60 SECONDS · FREE
        </div>

        <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 6 }}>
          Validate Your
        </div>
        <div style={{
          fontSize: 26, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Startup Idea
        </div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 18, lineHeight: 1.6 }}>
          Real data · Real competitors · Market sizing in ₹
        </div>

        <button onClick={() => navigate('/app')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', borderRadius: 14,
          padding: '12px 20px',
          color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 4px 16px rgba(99,102,241,0.38)',
        }}>
          Start Analysis
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick scanner */}
      <div style={{ margin: '0 16px 20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 18,
          border: `1.5px solid ${focused ? 'rgba(99,102,241,0.5)' : '#E2E8F0'}`,
          boxShadow: focused
            ? '0 0 0 4px rgba(99,102,241,0.08), 0 4px 20px rgba(99,102,241,0.1)'
            : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          padding: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 10, letterSpacing: 0.3 }}>
            QUICK SCAN
          </div>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe your startup idea..."
            rows={3}
            maxLength={500}
            style={{
              width: '100%', resize: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: '#0F172A', lineHeight: 1.6,
              background: 'transparent', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{idea.length}/500</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleRandom} style={{
                fontSize: 12, color: '#6366f1', background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10,
                padding: '6px 12px', cursor: 'pointer', fontWeight: 600,
                WebkitTapHighlightColor: 'transparent',
              }}>
                ✨ Random
              </button>
              <button onClick={handleScan} disabled={idea.trim().length < 10} style={{
                fontSize: 13, fontWeight: 700, color: '#fff',
                background: idea.trim().length >= 10 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#E2E8F0',
                border: 'none', borderRadius: 10,
                padding: '6px 16px', cursor: idea.trim().length >= 10 ? 'pointer' : 'not-allowed',
                boxShadow: idea.trim().length >= 10 ? '0 3px 10px rgba(99,102,241,0.35)' : 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 0.2s',
              }}>
                Scan →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature chips (horizontal scroll) */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingLeft: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, paddingRight: 16 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
              background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
              padding: '8px 12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>{f.emoji}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Recent Scans</span>
            <button onClick={() => navigate('/history')} style={{
              fontSize: 13, fontWeight: 600, color: '#6366f1',
              background: 'none', border: 'none', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>
              View all →
            </button>
          </div>
          {recentScans.map((entry: any) => {
            const vc = verdictColor[entry.verdict] || '#94A3B8'
            const vb = verdictBg[entry.verdict] || '#F8FAFC'
            return (
              <button
                key={entry.scan_id}
                onClick={() => navigate('/history')}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                  background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 10,
                  border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  borderRadius: 12, padding: '6px 10px', background: vb,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: vc, lineHeight: 1 }}>{entry.score}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: vc, letterSpacing: 0.4, marginTop: 2 }}>{entry.verdict}</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {entry.idea_text}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    {new Date(entry.scanned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <svg width="16" height="16" fill="none" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {recentScans.length === 0 && (
        <div style={{
          margin: '0 16px', borderRadius: 18, background: '#fff',
          padding: '28px 20px', textAlign: 'center',
          border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🚀</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>No analyses yet</div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
            Run your first startup idea validation and see your results here.
          </div>
        </div>
      )}

      {/* Auth nudge */}
      {!user && (
        <div style={{ margin: '16px 16px 0' }}>
          <button onClick={() => openAuthModal('register')} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16,
            padding: '14px 20px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Create free account to save history</span>
          </button>
        </div>
      )}
    </div>
  )
}
