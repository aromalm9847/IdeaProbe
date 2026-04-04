import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useScanStore } from '../../store/useScanStore'

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, openAuthModal, logout } = useAuthStore()
  const { resetScan } = useScanStore()

  const handleLogout = () => {
    resetScan()
    logout()
    setUserMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  const navStyle: React.CSSProperties = scrolled
    ? {
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(99,102,241,0.10)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }
    : {
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/favicon.svg" alt="IdeaProbe" className="w-8 h-8 transition-all duration-300 group-hover:scale-110" style={{ borderRadius: '10px' }} />
            <span className="font-display font-bold text-lg text-slate-900 tracking-tight">IdeaProbe</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
                Tools
                <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 rounded-xl py-2 z-50"
                  style={{ background: '#ffffff', border: '1px solid rgba(99,102,241,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.10)' }}>
                  <Link to="/app" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" onClick={() => setToolsOpen(false)}>
                    <span>🔍</span> Idea Scanner
                  </Link>
                  <Link to="/examples" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" onClick={() => setToolsOpen(false)}>
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
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right: Auth + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
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
                    style={{ background: '#ffffff', border: '1px solid rgba(99,102,241,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.10)' }}>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email || user.phone}</p>
                    </div>
                    <Link to="/history" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                      📋 Scan History
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => openAuthModal('login')} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                  Sign in
                </button>
                <button onClick={() => openAuthModal('register')} className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.28)' }}>
                  Sign up free
                </button>
              </>
            )}
            <Link to="/app" className="btn-premium px-4 py-2 text-sm font-semibold text-white">
              Scan idea →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all" onClick={() => setMobileOpen(!mobileOpen)}>
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
          <div className="md:hidden py-4 space-y-1 border-t border-slate-100">
            <Link to="/app" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>🔍 Idea Scanner</Link>
            <Link to="/examples" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>📋 Examples</Link>
            <Link to="/about" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/blog" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>Blog</Link>
            <div className="px-4 pt-3 space-y-2 border-t border-slate-100 mt-2">
              {user ? (
                <>
                  <Link to="/history" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl">📋 Scan History</Link>
                  <button onClick={handleLogout} className="w-full py-2.5 text-sm text-red-500 border border-red-200 rounded-xl">Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { openAuthModal('login'); setMobileOpen(false) }} className="w-full py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl">Sign in</button>
                  <button onClick={() => { openAuthModal('register'); setMobileOpen(false) }} className="w-full py-2.5 text-sm font-semibold rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Sign up free</button>
                </>
              )}
              <Link to="/app" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-semibold rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Scan idea →</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
