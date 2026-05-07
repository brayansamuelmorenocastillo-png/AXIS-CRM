'use client'
import { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { KanbanColumn } from './KanbanColumn'
import { DealCard } from './DealCard'
import type { Deal, PipelineStage } from '@/types'

interface Props {
  onAddDeal?: (stageId?: string) => void
}

export function KanbanBoard({ onAddDeal }: Props) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  async function load() {
    const [{ data: d }, { data: s }] = await Promise.all([
      supabase
        .from('deals')
        .select('*, contact:contacts(id,name), company:companies(id,name), stage:pipeline_stages(*)')
        .order('created_at', { ascending: false }),
      supabase.from('pipeline_stages').select('*').order('order_index'),
    ])
    setDeals((d ?? []) as Deal[])
    setStages((s ?? []) as PipelineStage[])
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('kanban-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  function handleDragStart({ active }: DragStartEvent) {
    const deal = deals.find(d => d.id === active.id)
    setActiveDeal(deal ?? null)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDeal(null)
    if (!over) return

    const dealId = active.id as string
    const deal = deals.find(d => d.id === dealId)
    if (!deal) return

    // over.id is always a stage.id (columns are the droppable targets)
    let newStageId = over.id as string

    // If dropped on another deal (not a column), find that deal's stage
    const overIsDeal = deals.some(d => d.id === newStageId)
    if (overIsDeal) {
      const overDeal = deals.find(d => d.id === newStageId)
      if (!overDeal?.stage_id) return
      newStageId = overDeal.stage_id
    }

    if (deal.stage_id === newStageId) return

    // Optimistic update
    setDeals(prev => prev.map(d =>
      d.id === dealId
        ? { ...d, stage_id: newStageId, stage: stages.find(s => s.id === newStageId) }
        : d
    ))

    const { error } = await supabase.from('deals').update({ stage_id: newStageId }).eq('id', dealId)
    if (error) {
      // Revert on error
      setDeals(prev => prev.map(d =>
        d.id === dealId ? { ...d, stage_id: deal.stage_id, stage: deal.stage } : d
      ))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[70vh]">
        {stages.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={deals.filter(d => d.stage_id === stage.id)}
            onAddDeal={() => onAddDeal?.(stage.id)}
          />
        ))}
        {stages.length === 0 && (
          <div className="flex items-center justify-center w-full text-tx-dim text-sm">
            Cargando pipeline...
          </div>
        )}
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} overlay />}
      </DragOverlay>
    </DndContext>
  )
}
