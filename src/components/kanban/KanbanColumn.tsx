'use client'
import { useDroppable } from '@dnd-kit/core'
import { DealCard } from './DealCard'
import { fmt } from '@/lib/utils'
import type { Deal, PipelineStage } from '@/types'

interface Props {
  stage: PipelineStage
  deals: Deal[]
  onAddDeal?: () => void
}

export function KanbanColumn({ stage, deals, onAddDeal }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-semibold text-tx">{stage.name}</span>
          <span className="text-xs bg-border text-tx-dim px-1.5 py-0.5 rounded-full">{deals.length}</span>
        </div>
        {totalValue > 0 && (
          <span className="text-xs text-tx-dim">{fmt(totalValue)}</span>
        )}
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`kanban-col flex-1 rounded-xl border transition-colors space-y-2 p-2 ${
          isOver
            ? 'border-dashed bg-accent/5 border-accent'
            : 'border-border bg-card/50'
        }`}
      >
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}

        {deals.length === 0 && !isOver && (
          <div className="py-8 text-center">
            <p className="text-xs text-tx-faint">Arrastra un deal aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}
