import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color?: 'accent' | 'success' | 'danger' | 'warn' | 'violet'
}

const colorMap = {
  accent:  { bg: 'bg-accent-soft',  text: 'text-accent',   icon: 'text-accent' },
  success: { bg: 'bg-success-soft', text: 'text-success',  icon: 'text-success' },
  danger:  { bg: 'bg-danger-soft',  text: 'text-danger',   icon: 'text-danger' },
  warn:    { bg: 'bg-warn-soft',    text: 'text-warn',     icon: 'text-warn' },
  violet:  { bg: 'bg-violet-soft',  text: 'text-violet',   icon: 'text-violet' },
}

export function KpiCard({ label, value, sub, icon: Icon, color = 'accent' }: Props) {
  const c = colorMap[color]
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:bg-card-hover hover:border-border-strong transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-tx-dim uppercase tracking-wider font-medium">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.bg)}>
          <Icon size={15} className={c.icon} />
        </div>
      </div>
      <p className="text-2xl font-bold text-tx tracking-tight">{value}</p>
      {sub && <p className="text-xs text-tx-dim mt-1">{sub}</p>}
    </div>
  )
}
