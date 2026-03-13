import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    purple: 'bg-accent/20 text-accent border-accent/30',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export const VerdictBadge: React.FC<{ verdict: string; className?: string }> = ({ verdict, className = '' }) => {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    VALIDATED: { variant: 'success', label: '✓ VALIDATED' },
    PROMISING: { variant: 'info', label: '◆ PROMISING' },
    RISKY: { variant: 'warning', label: '⚠ RISKY' },
    AVOID: { variant: 'danger', label: '✕ AVOID' },
  }
  const config = map[verdict] || { variant: 'default', label: verdict }
  return <Badge variant={config.variant} className={`text-sm px-3 py-1 ${className}`}>{config.label}</Badge>
}
