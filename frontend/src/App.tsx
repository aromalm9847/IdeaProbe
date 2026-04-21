import React, { useEffect, Component, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#fff1f0', minHeight: '100vh' }}>
          <h2 style={{ color: '#c00' }}>Runtime Error</h2>
          <pre style={{ color: '#900', whiteSpace: 'pre-wrap' }}>{err.message}</pre>
          <pre style={{ color: '#666', fontSize: 12, marginTop: 16 }}>{err.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { MobileShell } from './components/layout/MobileShell'
import { MobileHome } from './components/layout/MobileHome'
import { AuthModal } from './components/auth/AuthModal'
import { Landing } from './pages/Landing'
import { ScannerPage } from './pages/ScannerPage'
import { Examples, ExampleDetail } from './pages/Examples'
import { Blog, BlogPost } from './pages/Blog'
import { About } from './pages/About'
import { ScanHistory } from './pages/ScanHistory'
import AdminPage from './pages/AdminPage'

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center text-center px-4">
    <div>
      <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#0f172a' }}>Page not found</h2>
      <a href="/" style={{ color: '#6366f1' }}>← Go home</a>
    </div>
  </div>
)

// Detect mobile or PWA standalone mode
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    const narrow = window.innerWidth < 768
    return standalone || narrow
  })
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const pwa = window.matchMedia('(display-mode: standalone)')
    const update = () => setIsMobile(mq.matches || pwa.matches)
    mq.addEventListener('change', update)
    pwa.addEventListener('change', update)
    return () => { mq.removeEventListener('change', update); pwa.removeEventListener('change', update) }
  }, [])
  return isMobile
}

function App() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <ErrorBoundary>
        <ScrollToTop />
        <MobileShell>
          <Routes>
            <Route path="/" element={<MobileHome />} />
            <Route path="/app" element={<ScannerPage />} />
            <Route path="/history" element={<ScanHistory />} />
            <Route path="/account" element={<div />} />
            <Route path="/examples" element={<Examples />} />
            <Route path="/examples/:slug" element={<ExampleDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MobileShell>
        <AuthModal />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<ScannerPage />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/examples/:slug" element={<ExampleDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<ScanHistory />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
    </ErrorBoundary>
  )
}

export default App
