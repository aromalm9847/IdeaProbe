import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useScanStore } from '../../store/useScanStore'

// ── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 013 20z" />
  </svg>
)
const ScanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7.5" />
    <path d="M21 21l-4.3-4.3" />
    <path d="M11 8.5v5M8.5 11h5" />
  </svg>
)
const HistoryIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
const PersonIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0116 0" />
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.5 21a2 2 0 003 0" />
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
  { path: '/',        label: 'Home',    icon: (a) => <HomeIcon    active={a} /> },
  { path: '/app',     label: 'Scan',    icon: () => <ScanIcon />,  special: true },
  { path: '/history', label: 'History', icon: (a) => <HistoryIcon active={a} /> },
  { path: '/account', label: 'Account', icon: (a) => <PersonIcon  active={a} /> },
]

const BottomNav: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 'max(12px, env(safe-area-inset-bottom))',
      left: 14, right: 14,
      zIndex: 100,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 28,
        padding: '8px 6px',
        boxShadow: '0 2px 4px rgba(15,23,42,0.04), 0 20px 50px -8px rgba(15,23,42,0.18)',
        border: '1px solid rgba(15,23,42,0.04)',
        display: 'flex', alignItems: 'center',
      }}>
        {TABS.map((tab) => {
          const isActive =
            tab.path === '/'       ? pathname === '/' :
            tab.path === '/app'    ? pathname === '/app' :
            tab.path === '/history'? pathname === '/history' :
                                     pathname === '/account'

          if (tab.special) {
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '6px 0', border: 'none', background: 'none',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
                aria-label={tab.label}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 20,
                  background: '#0A0A0A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 6px 16px rgba(10,10,10,0.28), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}>
                  <ScanIcon />
                </div>
              </button>
            )
          }

          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '10px 0', gap: 3,
                border: 'none', background: 'none', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                color: isActive ? '#0A0A0A' : '#9CA3AF',
                position: 'relative',
                transition: 'color 0.15s',
              }}
              aria-label={tab.label}
            >
              {tab.icon(isActive)}
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: -0.1 }}>
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
    '/app':      'Scan Idea',
    '/history':  'History',
    '/account':  'Account',
    '/examples': 'Examples',
    '/blog':     'Blog',
    '/about':    'About',
  }
  const title = titles[pathname] ?? ''
  const isHome = pathname === '/'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(242,243,245,0.88)',
      backdropFilter: 'saturate(180%) blur(14px)',
      WebkitBackdropFilter: 'saturate(180%) blur(14px)',
      paddingTop: 'env(safe-area-inset-top)',
      borderBottom: '1px solid rgba(15,23,42,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, paddingLeft: 16, paddingRight: 16,
      }}>
        {isHome ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(10,10,10,0.18)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7.5" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0A0A0A', letterSpacing: -0.3, lineHeight: 1.1 }}>IdeaProbe</div>
              <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 500 }}>AI Startup Validator</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 36, height: 36, borderRadius: 12,
                border: '1px solid rgba(15,23,42,0.06)',
                background: '#ffffff',
                color: '#0A0A0A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              }}
              aria-label="Back"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A', letterSpacing: -0.3, marginLeft: 8 }}>
              {title}
            </span>
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isHome && (
            <button
              style={{
                width: 36, height: 36, borderRadius: 12,
                border: '1px solid rgba(15,23,42,0.06)',
                background: '#ffffff',
                color: '#0A0A0A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                position: 'relative',
              }}
              aria-label="Notifications"
            >
              <BellIcon />
              {!user && <span style={{
                position: 'absolute', top: 8, right: 9,
                width: 7, height: 7, borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 0 2px #fff',
              }} />}
            </button>
          )}
          {user ? (
            <button onClick={() => navigate('/account')}
              style={{
                width: 36, height: 36, borderRadius: 12, border: 'none',
                background: '#0A0A0A',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                letterSpacing: -0.2,
                boxShadow: '0 4px 12px rgba(10,10,10,0.22)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {(user.full_name || user.email)[0].toUpperCase()}
            </button>
          ) : isHome ? (
            <button onClick={() => openAuthModal('login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: 'none',
                borderRadius: 999, padding: '8px 14px',
                background: '#0A0A0A', color: '#fff',
                fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(10,10,10,0.22)',
                WebkitTapHighlightColor: 'transparent',
              }}>
              Sign in
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}

// ── Account page (mobile-only) ────────────────────────────────────────────────
const MobileAccount: React.FC = () => {
  const { user, logout, openAuthModal } = useAuthStore()
  const navigate = useNavigate()

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'G'

  const cardShadow = '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -12px rgba(15,23,42,0.08)'

  const rows = [
    user
      ? { icon: '📋', label: 'Scan history', action: () => navigate('/history') }
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
    <div style={{ padding: '8px 0 24px' }}>
      {/* Profile hero */}
      <div style={{
        margin: '0 16px 18px',
        borderRadius: 26,
        background: user ? '#0B0B0F' : '#ffffff',
        border: user ? 'none' : '1px solid rgba(15,23,42,0.06)',
        boxShadow: user
          ? '0 1px 2px rgba(10,10,10,0.1), 0 24px 50px -20px rgba(10,10,10,0.4)'
          : cardShadow,
        padding: 22,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {user && (
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,243,208,0.18), transparent 65%)',
            pointerEvents: 'none',
          }} />
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: user ? 'rgba(255,255,255,0.08)' : '#F4F5F7',
            border: user ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(15,23,42,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: user ? '#fff' : '#0A0A0A',
            letterSpacing: -0.4,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: user ? '#fff' : '#0A0A0A', letterSpacing: -0.4 }}>
              {user?.full_name || user?.email || 'Guest'}
            </div>
            <div style={{ fontSize: 12.5, color: user ? 'rgba(255,255,255,0.65)' : '#6B7280', marginTop: 3 }}>
              {user?.email || 'Sign in to save your history'}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{
        margin: '0 16px',
        background: '#fff',
        borderRadius: 22,
        overflow: 'hidden',
        border: '1px solid rgba(15,23,42,0.05)',
        boxShadow: cardShadow,
      }}>
        {rows.map((row, i) => (
          <React.Fragment key={row.label}>
            {i > 0 && <div style={{ height: 1, background: '#F4F5F7', marginLeft: 60 }} />}
            <button onClick={row.action} style={{
              width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
              gap: 14, padding: '14px 18px',
              border: 'none', background: 'none', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: row.danger ? '#FEF2F2' : '#F4F5F7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}>{row.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: row.danger ? '#DC2626' : '#0A0A0A', flex: 1, letterSpacing: -0.2 }}>
                {row.label}
              </span>
              {!row.danger && (
                <svg width="14" height="14" fill="none" stroke="#D1D5DB" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#CBD5E1', marginTop: 22, paddingBottom: 8 }}>
        IdeaProbe v1.0 · AI Startup Validator
      </div>
    </div>
  )
}

// ── Main Shell Export ─────────────────────────────────────────────────────────
export const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100svh',
      background: '#F2F3F5',
    }}>
      <MobileHeader />
      <main style={{
        flex: 1,
        marginTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
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
