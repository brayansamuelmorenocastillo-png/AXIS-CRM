import { initials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: Props) {
  const color = getAvatarColor(name)
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0',
        size === 'sm' && 'w-7 h-7 text-xs',
        size === 'md' && 'w-9 h-9 text-sm',
        size === 'lg' && 'w-12 h-12 text-base',
        className
      )}
      style={{ backgroundColor: `${color}25`, color }}
    >
      {initials(name)}
    </div>
  )
}
