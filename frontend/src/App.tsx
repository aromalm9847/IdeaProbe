import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { AuthModal } from './components/auth/AuthModal'
import { Landing } from './pages/Landing'
import { ScannerPage } from './pages/ScannerPage'
import { Examples, ExampleDetail } from './pages/Examples'
import { MRREstimator } from './pages/MRREstimator'
import { Blog, BlogPost } from './pages/Blog'
import { About } from './pages/About'
import { ScanHistory } from './pages/ScanHistory'

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center text-center px-4">
    <div>
      <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-4">Page not found</h2>
      <a href="/" className="text-accent hover:text-accent/80 transition-colors">← Go home</a>
    </div>
  </div>
)

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<ScannerPage />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/examples/:slug" element={<ExampleDetail />} />
          <Route path="/tools/mrr-revenue-estimator" element={<MRREstimator />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<ScanHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
    </>
  )
}

export default App
