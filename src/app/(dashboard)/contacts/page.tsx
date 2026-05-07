'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ContactForm } from '@/components/forms/ContactForm'
import { Header } from '@/components/layout/Header'
import { Search, Pencil, Trash2, ExternalLink, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import type { Contact, Company } from '@/types'
import { fmtDate } from '@/lib/utils'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  async function load() {
    const [{ data: c }, { data: co }] = await Promise.all([
      supabase.from('contacts').select('*, company:companies(id,name)').order('name'),
      supabase.from('companies').select('id,name').order('name'),
    ])
    setContacts((c ?? []) as Contact[])
    setCompanies((co ?? []) as Company[])
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('contacts-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function deleteContact(id: string) {
    setDeleting(id)
    await supabase.from('contacts').delete().eq('id', id)
    setDeleting(null)
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <Header
        title="Contactos"
        subtitle={`${contacts.length} contactos`}
        action={{ label: 'Nuevo contacto', onClick: () => { setSelected(null); setModal('create') } }}
      />

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-faint" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o empresa..."
          className="w-full max-w-sm bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-tx placeholder-tx-faint focus:border-accent transition-colors"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-tx-dim text-sm">{search ? 'Sin resultados' : 'Crea tu primer contacto'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3">Contacto</th>
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell">Empresa</th>
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Contacto</th>
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Creado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(contact => (
                <tr key={contact.id} className="hover:bg-card-hover transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={contact.name} size="sm" />
                      <div>
                        <Link href={`/contacts/${contact.id}`} className="text-sm font-medium text-tx hover:text-accent transition-colors">
                          {contact.name}
                        </Link>
                        {contact.title && <p className="text-xs text-tx-dim">{contact.title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {contact.company ? (
                      <Badge>{contact.company.name}</Badge>
                    ) : <span className="text-tx-faint text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-3">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-tx-dim hover:text-accent transition-colors">
                          <Mail size={12} />{contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-xs text-tx-dim hover:text-accent transition-colors">
                          <Phone size={12} />{contact.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-tx-faint">{fmtDate(contact.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/contacts/${contact.id}`} className="p-1.5 hover:bg-border rounded text-tx-faint hover:text-tx transition-colors">
                        <ExternalLink size={13} />
                      </Link>
                      <button onClick={() => { setSelected(contact); setModal('edit') }} className="p-1.5 hover:bg-border rounded text-tx-faint hover:text-tx transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteContact(contact.id)} disabled={deleting === contact.id} className="p-1.5 hover:bg-danger-soft rounded text-tx-faint hover:text-danger transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? 'Editar contacto' : 'Nuevo contacto'}>
        <ContactForm
          contact={modal === 'edit' ? selected ?? undefined : undefined}
          companies={companies}
          onSuccess={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}
