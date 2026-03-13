import React from 'react'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  color?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  color = 'bg-accent',
}) => {
  return (
    <div className={`w-full bg-surface-2 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
