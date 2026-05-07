'use client'
import { Plus } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function Header({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-tx tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-tx-dim mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-surface text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          {action.label}
        </button>
      )}
    </div>
  )
}
