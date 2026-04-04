import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <img src="/favicon.svg" alt="IdeaProbe" className="w-7 h-7" style={{ borderRadius: '8px' }} />
              <span className="text-slate-900">IdeaProbe</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Find your blind spots before you build. Real data. Real fixes. 100% free.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-slate-800 font-semibold text-sm mb-4">Tools</h4>
            <ul className="space-y-2">
              <li><Link to="/app" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">Idea Scanner</Link></li>
              <li><Link to="/examples" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">Examples</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-slate-800 font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">Blog</Link></li>
              <li><a href="#" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">© 2025 IdeaProbe. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            <span>Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
