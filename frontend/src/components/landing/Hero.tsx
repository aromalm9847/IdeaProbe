import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const TICKER_ITEMS = [
  "Arjun scanned 'AI-powered legal document reviewer' · 74",
  "Priya scanned 'Premium barber shop in Koramangala' · 68",
  "Marcus scanned 'B2B SaaS churn predictor' · 81",
  "Sofia scanned 'Subscription meal kit for diabetics' · 63",
  "Rahul scanned 'Freelancer invoice automation India' · 77",
  "Emma scanned 'AI resume builder for developers' · 72",
  "Vikram scanned 'EV charging network aggregator' · 85",
  "Luca scanned 'Carbon offset marketplace' · 59",
  "Ananya scanned 'Online tutoring for IIT-JEE prep' · 79",
  "Noah scanned 'DevOps incident summarizer' · 82",
]

const PRESET_IDEAS = [
  'AI meal planner that shops from your existing pantry',
  'Slack bot that writes weekly standup reports automatically',
  'Freelancer tax automation for gig economy workers in India',
  'Competitor pricing tracker with real-time alerts',
  'AI contract reviewer for small business owners',
  'Subscription churn predictor for B2B SaaS',
  'Premium barber shop in Koramangala targeting young professionals',
  'DevOps incident summarizer for engineering teams',
  'EV charging network aggregator for Indian cities',
  'Online tutoring platform for IIT-JEE preparation',
]

// Animated orb — lighter opacity for white background
const GlowOrb: React.FC<{
  size: number; x: string; y: string; color: string; delay: number; duration: number
}> = ({ size, x, y, color, delay, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size, left: x, top: y,
      background: `radial-gradient(circle, ${color}, transparent 70%)`,
      filter: 'blur(60px)', opacity: 0,
      willChange: 'transform, opacity',
    }}
    animate={{ opacity: [0, 0.12, 0.06, 0.14, 0], scale: [0.8, 1.2, 0.9, 1.1, 0.8], x: [0, 30, -20, 15, 0], y: [0, -25, 20, -10, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
)

// Floating particle — lighter for white bg
const Particle: React.FC<{ x: number; y: number; size: number; color: string; delay: number }> = ({ x, y, size, color, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, willChange: 'transform, opacity' }}
    animate={{ y: [0, -40, -20, -60, 0], x: [0, 15, -10, 20, 0], opacity: [0, 0.35, 0.18, 0.28, 0] }}
    transition={{ duration: 8 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
)

// Premium glowing lightbulb — medium-size, high-quality, realistic glass + filament
const IdeaBulb: React.FC = () => {
  const SIZE = 180 // overall visual container
  const BULB = 96  // SVG viewport
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Outer ambient glow — large, soft, warm */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: SIZE + 40, height: SIZE + 40,
          background: 'radial-gradient(circle, rgba(253,224,71,0.28) 0%, rgba(234,179,8,0.18) 25%, rgba(139,92,246,0.10) 50%, transparent 75%)',
          filter: 'blur(8px)',
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Mid warmth halo — gold */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: SIZE - 20, height: SIZE - 20,
          background: 'radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(234,179,8,0.3) 30%, transparent 65%)',
          filter: 'blur(4px)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />
      {/* Tight core glow — bright white-gold */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: SIZE - 80, height: SIZE - 80,
          background: 'radial-gradient(circle, rgba(255,251,235,0.9) 0%, rgba(253,224,71,0.6) 35%, transparent 70%)',
          filter: 'blur(2px)',
          mixBlendMode: 'screen',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting sparkle particles */}
      {[
        { angle: 25, radius: 72, size: 3, color: 'rgba(253,224,71,0.9)', delay: 0 },
        { angle: 110, radius: 80, size: 2, color: 'rgba(99,102,241,0.85)', delay: 0.6 },
        { angle: 195, radius: 68, size: 2.5, color: 'rgba(139,92,246,0.8)', delay: 1.2 },
        { angle: 300, radius: 78, size: 2, color: 'rgba(236,72,153,0.75)', delay: 0.9 },
        { angle: 60, radius: 88, size: 1.8, color: 'rgba(253,224,71,0.7)', delay: 1.5 },
      ].map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        const x = Math.cos(rad) * p.radius
        const y = Math.sin(rad) * p.radius
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size * 2, height: p.size * 2,
              background: p.color,
              left: `calc(50% + ${x}px - ${p.size}px)`,
              top:  `calc(50% + ${y}px - ${p.size}px)`,
              boxShadow: `0 0 8px ${p.color}`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        )
      })}

      {/* Premium SVG bulb */}
      <svg
        width={BULB} height={BULB} viewBox="0 0 96 96" fill="none"
        className="relative"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(234,179,8,0.35)) drop-shadow(0 0 16px rgba(253,224,71,0.45))' }}
      >
        <defs>
          {/* Glass body gradient */}
          <radialGradient id="bulbGlass" cx="0.42" cy="0.38" r="0.75">
            <stop offset="0%"  stopColor="#fffbeb" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#fde68a" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
          </radialGradient>
          {/* Inner glow */}
          <radialGradient id="bulbCore" cx="0.5" cy="0.55" r="0.5">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#fef3c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
          </radialGradient>
          {/* Base metal gradient */}
          <linearGradient id="baseMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#cbd5e1" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          {/* Glass rim */}
          <linearGradient id="glassRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
          {/* Filament */}
          <linearGradient id="filament" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          {/* Highlight sheen */}
          <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Bulb glass body — teardrop shape */}
        <motion.path
          d="M48 10 C 62 10, 74 22, 74 38 C 74 48, 68 55, 62 61 C 58 65, 56 68, 55 72 L 41 72 C 40 68, 38 65, 34 61 C 28 55, 22 48, 22 38 C 22 22, 34 10, 48 10 Z"
          fill="url(#bulbGlass)"
          stroke="url(#glassRim)"
          strokeWidth="1.2"
          animate={{ opacity: [0.92, 1, 0.92] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Inner core light */}
        <motion.ellipse
          cx="48" cy="40" rx="18" ry="22"
          fill="url(#bulbCore)"
          animate={{ opacity: [0.7, 1, 0.7], rx: [17, 19, 17] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Filament — wavy wire */}
        <motion.path
          d="M40 46 Q 44 38, 48 46 T 56 46"
          stroke="url(#filament)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.85, 1, 0.85], filter: [
            'drop-shadow(0 0 3px #fbbf24)',
            'drop-shadow(0 0 6px #fef3c7)',
            'drop-shadow(0 0 3px #fbbf24)',
          ] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Filament support wires */}
        <path d="M40 46 L 40 60" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
        <path d="M56 46 L 56 60" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

        {/* Glass highlight sheen — top-left */}
        <path
          d="M34 22 Q 38 16, 44 16 Q 40 20, 38 26 Q 36 28, 34 22 Z"
          fill="url(#sheen)"
          opacity="0.8"
        />

        {/* Metal base — screw threads */}
        <rect x="39" y="72" width="18" height="4" rx="1.5" fill="url(#baseMetal)" />
        <rect x="40" y="76" width="16" height="3" rx="1" fill="url(#baseMetal)" opacity="0.95" />
        <rect x="41" y="79" width="14" height="3" rx="1" fill="url(#baseMetal)" opacity="0.9" />
        <rect x="42" y="82" width="12" height="3" rx="1" fill="url(#baseMetal)" opacity="0.85" />
        {/* Contact tip */}
        <rect x="44" y="85" width="8" height="3" rx="1.5" fill="#475569" />
        <ellipse cx="48" cy="88" rx="3" ry="1.5" fill="#334155" />

        {/* Horizontal thread shadows */}
        <line x1="40" y1="77.5" x2="56" y2="77.5" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
        <line x1="41" y1="80.5" x2="55" y2="80.5" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
        <line x1="42" y1="83.5" x2="54" y2="83.5" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </motion.div>
  )
}

// Subtle grid for light bg
const GridBackground: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none" style={{
    backgroundImage: `linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)`,
    backgroundSize: '60px 60px',
  }} />
)

export const Hero: React.FC = () => {
  const [idea, setIdea] = useState('')
  const [presetIndex, setPresetIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const navigate = useNavigate()
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Memoized so they don't regenerate on every keystroke re-render
  const particles = useMemo(() => Array.from({ length: isMobile ? 0 : 12 }, (_, i) => ({
    id: i,
    x: (i * 37 + 11) % 100,
    y: (i * 53 + 7) % 100,
    size: (i % 3) + 1.5,
    color: i % 3 === 0 ? 'rgba(99,102,241,0.5)' : i % 3 === 1 ? 'rgba(139,92,246,0.5)' : 'rgba(236,72,153,0.4)',
    delay: (i * 0.6) % 5,
  })), [])

  const handleRandom = () => {
    const next = (presetIndex + 1) % PRESET_IDEAS.length
    setPresetIndex(next)
    setIdea(PRESET_IDEAS[next])
  }

  const handleScan = () => {
    if (idea.length >= 10) navigate(`/app?idea=${encodeURIComponent(idea)}`)
  }

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f8f7ff 40%, #fdf4ff 70%, #f0f9ff 100%)' }}>
      <GridBackground />

      {/* Soft glow orbs — desktop only */}
      {!isMobile && <>
        <GlowOrb size={700} x="5%" y="0%" color="rgba(99,102,241,0.6)" delay={0} duration={12} />
        <GlowOrb size={500} x="60%" y="10%" color="rgba(139,92,246,0.5)" delay={2} duration={15} />
        <GlowOrb size={400} x="25%" y="55%" color="rgba(236,72,153,0.4)" delay={4} duration={10} />
        <GlowOrb size={350} x="75%" y="50%" color="rgba(99,102,241,0.5)" delay={1} duration={14} />
      </>}

      {/* Floating particles — desktop only */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} size={p.size} color={p.color} delay={p.delay} />
      ))}

      {/* Ticker */}
      <div className="relative z-10 overflow-hidden py-2.5 border-b" style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.12)' }}>
        <div className="flex animate-ticker whitespace-nowrap gap-10">
          {doubled.map((item, i) => (
            <span key={i} className="text-xs flex-shrink-0 px-4 flex items-center gap-2" style={{ color: 'rgba(99,102,241,0.7)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-48px)] px-6 max-w-6xl mx-auto py-16">

        {/* Idea Bulb */}
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, type: 'spring', stiffness: 200 }} className="mb-6">
          <IdeaBulb />
        </motion.div>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-2 mb-8">
          <span className="tag-premium">✦ GPT-4.1 Powered</span>
          <span className="tag-premium">4 AI Agents</span>
          <span className="tag-premium">₹ INR Data</span>
        </motion.div>

        {/* Headline with animated gradient glow */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-center text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
        >
          <span className="animate-gradient-text" style={{ filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.35)) drop-shadow(0 0 40px rgba(139,92,246,0.20))' }}>
            Validate your
          </span>
          <br />
          <span className="animate-gradient-text">startup idea</span>
          <br />
          <span className="text-slate-800">in 60 seconds.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-slate-600 mb-2 text-center">
          Real data. Real competitors. Real market sizing in ₹.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-slate-500 mb-10 text-center text-sm">
          4 AI agents analyze your idea across 40+ live sources — Reddit, Google Trends, competitor databases, and more.
        </motion.p>

        {/* Input card — light glass */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="w-full max-w-2xl">
          <div className="rounded-2xl p-5 transition-all duration-300" style={{
            background: isFocused ? '#ffffff' : 'rgba(255,255,255,0.95)',
            border: `1.5px solid ${isFocused ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.18)'}`,
            boxShadow: isFocused ? '0 0 0 4px rgba(99,102,241,0.08), 0 8px 40px rgba(99,102,241,0.12)' : '0 4px 24px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.05)',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
          }}>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Describe your startup idea in one sentence..."
              rows={3}
              maxLength={500}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm resize-none focus:outline-none leading-relaxed"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleScan() } }}
            />
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.10)' }}>
              <span className="text-xs text-slate-400">{idea.length}/500</span>
              <div className="flex gap-2">
                <button onClick={handleRandom} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                  ✨ Random idea
                </button>
                <button onClick={handleScan} disabled={idea.length < 10}
                  className="px-6 py-2 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: idea.length >= 10 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.3)',
                    boxShadow: idea.length >= 10 ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
                  }}>
                  Scan idea →
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-6 mt-8">
          {[
            { icon: '🔍', label: '2,500+ ideas scanned' },
            { icon: '📊', label: '40+ live sources' },
            { icon: '₹', label: 'INR market data' },
            { icon: '⚡', label: 'Results in ~60s' },
            { icon: '🤖', label: 'GPT-4.1 powered' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Floating score cards — light glassmorphism */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-wrap justify-center gap-4 mt-12">
          {[
            { score: 82, label: 'EV Charging App', color: '#10b981', verdict: 'Promising' },
            { score: 47, label: 'Generic Food Delivery', color: '#f59e0b', verdict: 'Risky' },
            { score: 71, label: 'B2B Invoice SaaS', color: '#6366f1', verdict: 'Viable' },
          ].map((card) => (
            <div key={card.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{
              background: '#ffffff',
              border: '1px solid rgba(99,102,241,0.12)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.08)',
            }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: `${card.color}18`, border: `1px solid ${card.color}40`, color: card.color }}>
                {card.score}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{card.label}</p>
                <p className="text-xs font-medium" style={{ color: card.color }}>{card.verdict}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />
    </section>
  )
}
