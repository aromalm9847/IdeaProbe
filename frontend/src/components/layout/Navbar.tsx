import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, openAuthModal, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  const navStyle: React.CSSProperties = scrolled
    ? {
        background: 'rgba(5, 5, 10, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
      }
    : {
        background: 'rgba(5, 5, 10, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <span className="text-sm">⚡</span>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">IdeaProbe</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Tools Dropdown */}
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                Tools
                <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 rounded-xl py-2 z-50"
                  style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(99,102,241,0.2)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                  <Link to="/app" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setToolsOpen(false)}>
                    <span>🔍</span> Idea Scanner
                  </Link>
                  <Link to="/tools/mrr-revenue-estimator" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setToolsOpen(false)}>
                    <span>💰</span> MRR Estimator
                  </Link>
                  <Link to="/examples" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setToolsOpen(false)}>
                    <span>📋</span> Examples
                  </Link>
                </div>
              )}
            </div>

            {[
              { to: '/about', label: 'About' },
              { to: '/blog', label: 'Blog' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'text-white bg-white/8'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right: Auth + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* Logged in user menu */
              <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all border border-white/10">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                  <span className="max-w-24 truncate">{user.full_name || user.email.split('@')[0]}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 rounded-xl py-2 z-50"
                    style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(99,102,241,0.2)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm font-medium text-white truncate">{user.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email || user.phone}</p>
                    </div>
                    <Link
                      to="/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      📋 Scan History
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in */
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
                >
                  Sign up free
                </button>
              </>
            )}
            <Link to="/app"
              className="btn-premium px-4 py-2 text-sm font-semibold">
              Scan idea →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-white/5">
            <Link to="/app" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>🔍 Idea Scanner</Link>
            <Link to="/tools/mrr-revenue-estimator" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>💰 MRR Estimator</Link>
            <Link to="/examples" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>📋 Examples</Link>
            <Link to="/about" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/blog" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>Blog</Link>
            <div className="px-4 pt-3 space-y-2 border-t border-white/5 mt-2">
              {user ? (
                <>
                  <Link to="/history" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm text-slate-300 border border-white/10 rounded-xl">📋 Scan History</Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="w-full py-2.5 text-sm text-red-400 border border-red-500/20 rounded-xl">Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { openAuthModal('login'); setMobileOpen(false) }} className="w-full py-2.5 text-sm text-slate-300 border border-white/10 rounded-xl">Sign in</button>
                  <button onClick={() => { openAuthModal('register'); setMobileOpen(false) }} className="w-full py-2.5 text-sm font-semibold rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Sign up free</button>
                </>
              )}
              <Link to="/app" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-semibold rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Scan idea →</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
