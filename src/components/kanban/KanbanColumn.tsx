'use client'
import { useDroppable } from '@dnd-kit/core'
import { DealCard } from './DealCard'
import type { Deal, PipelineStage } from '@/types'

interface Props {
  stage: PipelineStage
  deals: Deal[]
  onAddDeal?: (stageId?: string) => void
}

export function KanbanColumn({ stage, deals }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const total = deals.reduce((s, d) => s + (d.value ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 240, flex: '0 0 240px' }}>
      {/* Column header */}
      <div style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        transition: 'background 0.15s, border-color 0.15s',
        ...(isOver ? { background: 'var(--mint-soft)', borderColor: 'var(--mint)' } : {}),
      }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color ?? '#3eb37c', flexShrink: 0 }}/>
          <span style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.02em', flex: 1 }}>{stage.name}</span>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 7px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {deals.length}
          </span>
        </div>
        <div style={{ padding: '6px 14px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          <b style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>€{(total / 1000).toFixed(1)}K</b>
        </div>

        {/* Drop zone */}
        <div ref={setNodeRef} style={{ padding: '4px 10px 10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 120 }}>
          {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
          {deals.length === 0 && (
            <div style={{
              padding: 24, textAlign: 'center', fontSize: 11,
              color: 'var(--text-faint)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--r-md)', marginTop: 4,
            }}>
              Arrastra un deal aquí
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
