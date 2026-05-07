import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'text-xs px-3 py-1.5',
        size === 'md' && 'text-sm px-4 py-2',
        variant === 'primary' && 'bg-accent hover:bg-accent/90 text-surface',
        variant === 'secondary' && 'bg-card hover:bg-card-hover text-tx border border-border',
        variant === 'ghost' && 'hover:bg-card text-tx-dim hover:text-tx',
        variant === 'danger' && 'bg-danger-soft hover:bg-danger/20 text-danger border border-danger/30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
