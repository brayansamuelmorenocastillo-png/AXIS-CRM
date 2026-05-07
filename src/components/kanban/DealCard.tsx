'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { fmt, fmtDate } from '@/lib/utils'
import { Calendar, User } from 'lucide-react'
import type { Deal } from '@/types'

interface Props {
  deal: Deal
  overlay?: boolean
}

export function DealCard({ deal, overlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !overlay ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-surface border border-border rounded-lg p-3 select-none transition-shadow hover:border-border-strong hover:shadow-lg ${overlay ? 'shadow-2xl rotate-1' : ''}`}
    >
      <Link
        href={`/deals/${deal.id}`}
        onClick={e => { if (isDragging) e.preventDefault() }}
        className="block text-sm font-medium text-tx hover:text-accent transition-colors mb-2 leading-snug"
      >
        {deal.title}
      </Link>

      <p className="text-base font-bold text-tx mb-2">{fmt(deal.value)}</p>

      <div className="space-y-1.5">
        {deal.contact && (
          <div className="flex items-center gap-1.5 text-xs text-tx-dim">
            <User size={10} className="text-tx-faint" />
            {deal.contact.name}
          </div>
        )}
        {deal.expected_close && (
          <div className="flex items-center gap-1.5 text-xs text-tx-dim">
            <Calendar size={10} className="text-tx-faint" />
            {fmtDate(deal.expected_close)}
          </div>
        )}
      </div>

      {deal.probability != null && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-tx-faint">Probabilidad</span>
            <span className="text-xs text-tx-dim font-medium">{deal.probability}%</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${deal.probability}%`,
                backgroundColor: deal.probability >= 70 ? '#3fb950' : deal.probability >= 40 ? '#d29922' : '#6ea8fe',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
