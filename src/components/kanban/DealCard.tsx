'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { fmtDate } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import type { Deal } from '@/types'

interface Props {
  deal: Deal
  overlay?: boolean
}

function initials(s: string) {
  return s.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function DealCard({ deal, overlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !overlay ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--r-md)',
    padding: 12,
    userSelect: 'none',
    transition: 'border 0.12s, transform 0.12s, box-shadow 0.12s',
    ...(overlay ? { boxShadow: '0 8px 24px rgba(0,0,0,0.6)', transform: 'rotate(1deg)' } : {}),
  }

  const prob = deal.probability ?? 0
  const probColor = prob >= 70 ? '#3eb37c' : prob >= 40 ? '#e8a13c' : '#5b9fd6'

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onMouseEnter={e => { if (!isDragging) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 16px -8px rgba(0,0,0,0.5)' } }}
      onMouseLeave={e => { if (!isDragging) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' } }}
    >
      <Link href={`/deals/${deal.id}`} onClick={e => isDragging && e.preventDefault()}
        style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: 4, color: 'var(--text-primary)', textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4ed193'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
      >
        {deal.title}
      </Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#4ed193', letterSpacing: '-0.01em', marginBottom: 10 }}>
        €{(deal.value ?? 0).toLocaleString('es-ES')}
      </div>

      {deal.probability != null && (
        <div style={{ height: 3, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', borderRadius: 2, background: probColor, width: `${prob}%` }}/>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
        {deal.expected_close ? (
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11}/>{fmtDate(deal.expected_close)}
          </span>
        ) : <span/>}
        {deal.contact?.name && (
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--mint), #2a8c5e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: 'var(--bg-deep)',
            border: '1.5px solid var(--bg-elevated)',
          }} title={deal.contact.name}>
            {initials(deal.contact.name)}
          </div>
        )}
      </div>
    </div>
  )
}
