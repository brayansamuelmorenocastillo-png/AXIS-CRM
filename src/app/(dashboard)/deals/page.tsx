'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { DealForm } from '@/components/forms/DealForm'
import { Modal } from '@/components/ui/Modal'
import { Header } from '@/components/layout/Header'
import type { Contact, Company, PipelineStage } from '@/types'

export default function DealsPage() {
  const [modal, setModal] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadMeta() {
      const [{ data: c }, { data: co }, { data: s }] = await Promise.all([
        supabase.from('contacts').select('id,name').order('name'),
        supabase.from('companies').select('id,name').order('name'),
        supabase.from('pipeline_stages').select('*').order('order_index'),
      ])
      setContacts((c ?? []) as Contact[])
      setCompanies((co ?? []) as Company[])
      setStages((s ?? []) as PipelineStage[])
    }
    loadMeta()
  }, [])

  return (
    <div>
      <Header
        title="Pipeline"
        subtitle="Arrastra los deals para cambiar de etapa"
        action={{ label: 'Nuevo deal', onClick: () => setModal(true) }}
      />

      <KanbanBoard onAddDeal={() => setModal(true)} />

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
