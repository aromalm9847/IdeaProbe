import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-6 ${glow ? 'shadow-glow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
