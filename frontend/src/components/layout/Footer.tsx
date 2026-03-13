import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <span>⚡</span>
              <span>IdeaProbe</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Find your blind spots before you build. Real data. Real fixes. 100% free.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Tools</h4>
            <ul className="space-y-2">
              <li><Link to="/app" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Idea Scanner</Link></li>
              <li><Link to="/tools/mrr-revenue-estimator" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">MRR Estimator</Link></li>
              <li><Link to="/examples" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Examples</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Blog</Link></li>
              <li><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">© 2025 IdeaProbe. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            <span>Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
