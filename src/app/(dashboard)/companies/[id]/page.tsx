'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { CompanyForm } from '@/components/forms/CompanyForm'
import { Timeline } from '@/components/timeline/Timeline'
import { ChevronLeft, Globe, Pencil, Trash2, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Company, Contact, Deal } from '@/types'
import { fmtDate, fmt } from '@/lib/utils'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [editing, setEditing] = useState(false)
  const supabase = createClient()

  async function load() {
    const [{ data: co }, { data: c }, { data: d }] = await Promise.all([
      supabase.from('companies').select('*').eq('id', id).single(),
      supabase.from('contacts').select('*').eq('company_id', id).order('name'),
      supabase.from('deals').select('*, stage:pipeline_stages(*)').eq('company_id', id).order('created_at', { ascending: false }),
    ])
    if (co) setCompany(co as Company)
    setContacts((c ?? []) as Contact[])
    setDeals((d ?? []) as Deal[])
  }

  useEffect(() => { load() }, [id])

  async function deleteCompany() {
    await supabase.from('companies').delete().eq('id', id)
    router.push('/companies')
  }

  if (!company) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-tx-dim hover:text-tx mb-5 transition-colors">
        <ChevronLeft size={15} /> Empresas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Info */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <Avatar name={company.name} size="lg" />
              <div className="flex gap-1">
                <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-card-hover rounded text-tx-faint hover:text-tx transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={deleteCompany} className="p-1.5 hover:bg-danger-soft rounded text-tx-faint hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h1 className="text-lg font-bold text-tx">{company.name}</h1>

            <div className="mt-3 space-y-2">
              {company.domain && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={13} className="text-tx-faint" />
                  <span className="text-tx-dim">{company.domain}</span>
                </div>
              )}
              {company.industry && <Badge>{company.industry}</Badge>}
              {company.size && <p className="text-xs text-tx-dim">{company.size} empleados</p>}
            </div>

            {company.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-tx-dim">{company.notes}</p>
              </div>
            )}

            <p className="text-xs text-tx-faint mt-4 pt-4 border-t border-border">
              Creada el {fmtDate(company.created_at)}
            </p>
          </div>

          {/* Contacts */}
          {contacts.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} className="text-tx-faint" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-tx-faint">{contacts.length} Contactos</h2>
              </div>
              <div className="space-y-2">
                {contacts.map(c => (
                  <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-card-hover transition-colors group">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <p className="text-sm text-tx group-hover:text-accent transition-colors">{c.name}</p>
                      {c.title && <p className="text-xs text-tx-dim">{c.title}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Deals */}
          {deals.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-tx-faint" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-tx-faint">{deals.length} Deals</h2>
              </div>
              <div className="space-y-2">
                {deals.map(d => (
                  <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-card-hover transition-colors group">
                    <div>
                      <p className="text-sm text-tx group-hover:text-accent transition-colors">{d.title}</p>
                      {d.stage && <Badge color={d.stage.color} className="mt-0.5">{d.stage.name}</Badge>}
                    </div>
                    <span className="text-sm font-medium text-tx">{fmt(d.value)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Timeline entityType="company" entityId={id} />
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar empresa">
        <CompanyForm
          company={company}
          onSuccess={() => { setEditing(false); load() }}
          onClose={() => setEditing(false)}
        />
      </Modal>
    </div>
  )
}
