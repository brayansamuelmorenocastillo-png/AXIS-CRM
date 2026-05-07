'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { DealForm } from '@/components/forms/DealForm'
import { Modal } from '@/components/ui/Modal'
import { Plus, Filter } from 'lucide-react'
import type { Contact, Company, PipelineStage, Deal } from '@/types'

export default function DealsPage() {
  const [modal, setModal] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadMeta() {
      const [{ data: c }, { data: co }, { data: s }, { data: d }] = await Promise.all([
        supabase.from('contacts').select('id,name').order('name'),
        supabase.from('companies').select('id,name').order('name'),
        supabase.from('pipeline_stages').select('*').order('order_index'),
        supabase.from('deals').select('*'),
      ])
      setContacts((c ?? []) as Contact[])
      setCompanies((co ?? []) as Company[])
      setStages((s ?? []) as PipelineStage[])
      setDeals((d ?? []) as Deal[])
    }
    loadMeta()
  }, [])

  const openDeals = deals.filter(d => {
    const stage = stages.find(s => s.id === d.stage_id)
    return stage && stage.name !== 'Closed Won' && stage.name !== 'Closed Lost'
  })
  const wonDeals = deals.filter(d => stages.find(s => s.id === d.stage_id)?.name === 'Closed Won')
  const pipelineTotal = openDeals.reduce((s, d) => s + (d.value ?? 0), 0)
  const wonTotal = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(7,33,28,0.6)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Pipeline total</div>
            <div style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, color: '#4ed193', letterSpacing: '-0.02em' }}>
              €{(pipelineTotal / 1000).toFixed(1)}K
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--border-subtle)' }}/>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Ganado</div>
            <div style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              €{(wonTotal / 1000).toFixed(1)}K
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--border-subtle)' }}/>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Deals abiertos</div>
            <div style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {openDeals.length}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer' }}>
            <Filter size={14}/>Filtrar
          </button>
          <button onClick={() => setModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, background: 'var(--mint)', color: 'var(--bg-deep)', border: 'none', cursor: 'pointer' }}>
            <Plus size={14}/>Nuevo deal
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ padding: '16px 32px 16px' }}>
          <KanbanBoard onAddDeal={() => setModal(true)} />
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo deal" size="lg">
        <DealForm
          contacts={contacts}
          companies={companies}
          stages={stages}
          onSuccess={() => setModal(false)}
          onClose={() => setModal(false)}
        />
      </Modal>
    </div>
  )
}
