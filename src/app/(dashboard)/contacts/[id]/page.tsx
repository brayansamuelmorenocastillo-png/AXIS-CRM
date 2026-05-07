'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ContactForm } from '@/components/forms/ContactForm'
import { Timeline } from '@/components/timeline/Timeline'
import { ChevronLeft, Mail, Phone, Building2, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Contact, Company, Deal } from '@/types'
import { fmtDate, fmt } from '@/lib/utils'

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [editing, setEditing] = useState(false)
  const supabase = createClient()

  async function load() {
    const [{ data: c }, { data: co }, { data: d }] = await Promise.all([
      supabase.from('contacts').select('*, company:companies(id,name)').eq('id', id).single(),
      supabase.from('companies').select('id,name').order('name'),
      supabase.from('deals').select('*, stage:pipeline_stages(*)').eq('contact_id', id).order('created_at', { ascending: false }),
    ])
    if (c) setContact(c as Contact)
    setCompanies((co ?? []) as Company[])
    setDeals((d ?? []) as Deal[])
  }

  useEffect(() => { load() }, [id])

  async function deleteContact() {
    await supabase.from('contacts').delete().eq('id', id)
    router.push('/contacts')
  }

  if (!contact) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-tx-dim hover:text-tx mb-5 transition-colors">
        <ChevronLeft size={15} /> Contactos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <Avatar name={contact.name} size="lg" />
              <div className="flex gap-1">
                <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-card-hover rounded text-tx-faint hover:text-tx transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={deleteContact} className="p-1.5 hover:bg-danger-soft rounded text-tx-faint hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h1 className="text-lg font-bold text-tx">{contact.name}</h1>
            {contact.title && <p className="text-sm text-tx-dim mt-0.5">{contact.title}</p>}

            <div className="mt-4 space-y-2.5">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={13} className="text-tx-faint shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-tx-dim hover:text-accent transition-colors truncate">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={13} className="text-tx-faint shrink-0" />
                  <a href={`tel:${contact.phone}`} className="text-tx-dim hover:text-accent transition-colors">{contact.phone}</a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 size={13} className="text-tx-faint shrink-0" />
                  <Link href={`/companies/${contact.company.id}`} className="text-tx-dim hover:text-accent transition-colors">
                    {contact.company.name}
                  </Link>
                </div>
              )}
            </div>

            {contact.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-tx-faint uppercase tracking-wider mb-2 font-medium">Notas</p>
                <p className="text-sm text-tx-dim">{contact.notes}</p>
              </div>
            )}

            <p className="text-xs text-tx-faint mt-4 pt-4 border-t border-border">
              Creado el {fmtDate(contact.created_at)}
            </p>
          </div>

          {/* Deals */}
          {deals.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-tx-faint mb-3">Deals asociados</h2>
              <div className="space-y-2">
                {deals.map(deal => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-card-hover transition-colors group">
                    <div>
                      <p className="text-sm text-tx group-hover:text-accent transition-colors">{deal.title}</p>
                      {deal.stage && <Badge color={deal.stage.color} className="mt-0.5">{deal.stage.name}</Badge>}
                    </div>
                    <span className="text-sm font-medium text-tx">{fmt(deal.value)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <Timeline entityType="contact" entityId={id} />
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar contacto">
        <ContactForm
          contact={contact}
          companies={companies}
          onSuccess={() => { setEditing(false); load() }}
          onClose={() => setEditing(false)}
        />
      </Modal>
    </div>
  )
}
