'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { DealForm } from '@/components/forms/DealForm'
import { Timeline } from '@/components/timeline/Timeline'
import { ChevronLeft, DollarSign, Calendar, TrendingUp, User, Building2, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Deal, Contact, Company, PipelineStage } from '@/types'
import { fmt, fmtDate } from '@/lib/utils'

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [editing, setEditing] = useState(false)
  const supabase = createClient()

  async function load() {
    const [{ data: d }, { data: c }, { data: co }, { data: s }] = await Promise.all([
      supabase.from('deals').select('*, contact:contacts(id,name), company:companies(id,name), stage:pipeline_stages(*)').eq('id', id).single(),
      supabase.from('contacts').select('id,name').order('name'),
      supabase.from('companies').select('id,name').order('name'),
      supabase.from('pipeline_stages').select('*').order('order_index'),
    ])
    if (d) setDeal(d as Deal)
    setContacts((c ?? []) as Contact[])
    setCompanies((co ?? []) as Company[])
    setStages((s ?? []) as PipelineStage[])
  }

  useEffect(() => { load() }, [id])

  async function deleteDeal() {
    await supabase.from('deals').delete().eq('id', id)
    router.push('/deals')
  }

  if (!deal) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm text-tx-dim hover:text-tx mb-5 transition-colors">
        <ChevronLeft size={15} /> Pipeline
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-lg font-bold text-tx leading-tight">{deal.title}</h1>
                {deal.stage && (
                  <Badge color={deal.stage.color} className="mt-1.5">{deal.stage.name}</Badge>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-card-hover rounded text-tx-faint hover:text-tx transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={deleteDeal} className="p-1.5 hover:bg-danger-soft rounded text-tx-faint hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                <DollarSign size={15} className="text-success" />
                <div>
                  <p className="text-xs text-tx-dim">Valor</p>
                  <p className="text-lg font-bold text-tx">{fmt(deal.value)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs text-tx-dim mb-1">Probabilidad</p>
                  <p className="text-sm font-semibold text-tx">{deal.probability}%</p>
                  <div className="h-1 bg-border rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${deal.probability}%`,
                        backgroundColor: deal.probability >= 70 ? '#3fb950' : deal.probability >= 40 ? '#d29922' : '#6ea8fe',
                      }}
                    />
                  </div>
                </div>
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs text-tx-dim mb-1">Valor esperado</p>
                  <p className="text-sm font-semibold text-tx">{fmt(deal.value * deal.probability / 100)}</p>
                </div>
              </div>

              {deal.expected_close && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={13} className="text-tx-faint" />
                  <span className="text-tx-dim">Cierre: {fmtDate(deal.expected_close)}</span>
                </div>
              )}

              {deal.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <User size={13} className="text-tx-faint" />
                  <Link href={`/contacts/${deal.contact.id}`} className="text-tx-dim hover:text-accent transition-colors">
                    {deal.contact.name}
                  </Link>
                </div>
              )}

              {deal.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 size={13} className="text-tx-faint" />
                  <Link href={`/companies/${deal.company.id}`} className="text-tx-dim hover:text-accent transition-colors">
                    {deal.company.name}
                  </Link>
                </div>
              )}
            </div>

            {deal.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-tx-faint uppercase tracking-wider mb-2 font-medium">Notas</p>
                <p className="text-sm text-tx-dim">{deal.notes}</p>
              </div>
            )}

            <p className="text-xs text-tx-faint mt-4 pt-4 border-t border-border">
              Creado el {fmtDate(deal.created_at)}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Timeline entityType="deal" entityId={id} />
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar deal" size="lg">
        <DealForm
          deal={deal}
          contacts={contacts}
          companies={companies}
          stages={stages}
          onSuccess={() => { setEditing(false); load() }}
          onClose={() => setEditing(false)}
        />
      </Modal>
    </div>
  )
}
