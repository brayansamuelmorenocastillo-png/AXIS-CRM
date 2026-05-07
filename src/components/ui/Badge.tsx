import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  color?: string
  variant?: 'default' | 'soft'
  className?: string
}

export function Badge({ children, color, variant = 'soft', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
        !color && variant === 'soft' && 'bg-accent-soft text-accent',
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  )
}
