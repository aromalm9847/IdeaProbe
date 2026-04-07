import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useScanStore } from '../../store/useScanStore'

// ── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    {filled
      ? <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
      : <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
    }
  </svg>
)
const ScanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <path d="M11 8v6M8 11h6" />
  </svg>
)
const HistoryIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
)
const PersonIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    {filled
      ? <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>
      : <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>
    }
  </svg>
)

// ── Bottom Tab Bar ────────────────────────────────────────────────────────────
interface Tab {
  path: string
  label: string
  icon: (active: boolean) => React.ReactNode
  special?: boolean
}

const TABS: Tab[] = [
  { path: '/', label: 'Home', icon: (a) => <HomeIcon filled={a} /> },
  { path: '/app', label: 'Scan', icon: () => <ScanIcon />, special: true },
  { path: '/history', label: 'History', icon: (a) => <HistoryIcon filled={a} /> },
  { path: '/account', label: 'Account', icon: (a) => <PersonIcon filled={a} /> },
]

const BottomNav: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 100,
      background: '#ffffff',
      borderTop: '1px solid #F1F5F9',
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -4px 20px rgba(15,23,42,0.07)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {TABS.map((tab) => {
          const isActive = tab.path === '/history'
            ? pathname === '/history'
            : tab.path === '/account'
            ? pathname === '/account'
            : tab.path === '/app'
            ? pathname === '/app'
            : pathname === '/'

          if (tab.special) {
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '6px 0 10px', border: 'none', background: 'none',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  gap: 3,
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 16, marginTop: -20,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 6px 18px rgba(99,102,241,0.45)',
                  transition: 'transform 0.15s ease',
                }}>
                  <ScanIcon />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#6366f1' : '#94A3B8', letterSpacing: 0.2 }}>
                  {tab.label}
                </span>
              </button>
            )
          }

          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-end',
                padding: '10px 0', gap: 3,
                border: 'none', background: 'none', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                color: isActive ? '#6366f1' : '#94A3B8',
                transition: 'color 0.15s',
              }}
            >
              {/* Active pill */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)',
                  width: isActive ? 40 : 0, height: 30,
                  borderRadius: 12,
                  background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                  transition: 'width 0.2s ease',
                  pointerEvents: 'none',
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {tab.icon(isActive)}
                </span>
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: 0.2 }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ── Sticky App Header ─────────────────────────────────────────────────────────
const MobileHeader: React.FC = () => {
  const { user, openAuthModal } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const titles: Record<string, string> = {
    '/': '',
    '/app': 'Scan Idea',
    '/history': 'History',
    '/account': 'Account',
    '/examples': 'Examples',
    '/blog': 'Blog',
    '/about': 'About',
  }
  const title = titles[pathname] ?? ''

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #F1F5F9',
      paddingTop: 'env(safe-area-inset-top)',
      boxShadow: '0 1px 8px rgba(15,23,42,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, paddingLeft: 16, paddingRight: 16,
      }}>
        {/* Logo / page title */}
        {title ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer', color: '#6366f1', display: 'flex', alignItems: 'center' }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', letterSpacing: -0.3 }}>{title}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.7, lineHeight: 1.2 }}>IdeaProbe</span>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>AI Startup Validator</span>
          </div>
        )}

        {/* Right: avatar or sign in */}
        {user ? (
          <button onClick={() => navigate('/account')}
            style={{
              width: 36, height: 36, borderRadius: 18, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {(user.full_name || user.email)[0].toUpperCase()}
          </button>
        ) : pathname === '/' ? (
          <button onClick={() => openAuthModal('login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 20, padding: '7px 14px',
              background: '#EEF2FF', color: '#6366f1',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>
            Sign in
          </button>
        ) : null}
      </div>
    </header>
  )
}

// ── Account page (mobile-only) ────────────────────────────────────────────────
const MobileAccount: React.FC = () => {
  const { user, logout, openAuthModal } = useAuthStore()
  const { scanHistory = [] } = useScanStore() as any
  const navigate = useNavigate()

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'G'

  const rows = [
    user
      ? { icon: '📋', label: 'Scan History', action: () => navigate('/history') }
      : { icon: '🔑', label: 'Sign in', action: () => openAuthModal('login') },
    user
      ? null
      : { icon: '✨', label: 'Create account', action: () => openAuthModal('register') },
    { icon: '📖', label: 'Examples', action: () => navigate('/examples') },
    { icon: '📝', label: 'Blog', action: () => navigate('/blog') },
    { icon: 'ℹ️', label: 'About', action: () => navigate('/about') },
    user ? { icon: '🚪', label: 'Sign out', action: logout, danger: true } : null,
  ].filter(Boolean) as Array<{ icon: string; label: string; action: () => void; danger?: boolean }>

  return (
    <div style={{ padding: '16px 0', paddingBottom: 8 }}>
      {/* Avatar card */}
      <div style={{
        margin: '0 16px 20px',
        borderRadius: 22,
        overflow: 'hidden',
        background: user
          ? 'linear-gradient(135deg, #1E3A8A, #4F46E5)'
          : '#F8FAFC',
        border: user ? 'none' : '1px solid #E2E8F0',
        boxShadow: user ? '0 8px 28px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
        padding: 20,
        position: 'relative',
      }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 26,
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: '#fff',
            }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{user.full_name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Guest</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Sign in to save your history</div>
          </div>
        )}
        {/* Highlight shimmer */}
        {user && <div style={{
          position: 'absolute', top: 10, left: 10, width: 70, height: 18,
          borderRadius: 10, background: 'rgba(255,255,255,0.12)',
          transform: 'rotate(-15deg)', pointerEvents: 'none',
        }} />}
      </div>

      {/* Menu sections */}
      <div style={{ margin: '0 16px', background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {rows.map((row, i) => (
          <React.Fragment key={row.label}>
            {i > 0 && <div style={{ height: 1, background: '#F8FAFC', marginLeft: 56 }} />}
            <button onClick={row.action} style={{
              width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
              gap: 14, padding: '14px 18px',
              border: 'none', background: 'none', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: row.danger ? '#FEF2F2' : '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>{row.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: row.danger ? '#DC2626' : '#0F172A', flex: 1 }}>
                {row.label}
              </span>
              {!row.danger && (
                <svg width="16" height="16" fill="none" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#CBD5E1', marginTop: 24, paddingBottom: 8 }}>
        IdeaProbe v1.0 · AI Startup Validator
      </div>
    </div>
  )
}

// ── Main Shell Export ─────────────────────────────────────────────────────────
export const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: '#F8FAFC' }}>
      <MobileHeader />
      <main style={{
        flex: 1,
        marginTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {pathname === '/account' ? <MobileAccount /> : children}
      </main>
      <BottomNav />
    </div>
  )
}

export { MobileAccount }
