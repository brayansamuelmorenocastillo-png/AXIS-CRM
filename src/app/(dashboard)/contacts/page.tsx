'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { ContactForm } from '@/components/forms/ContactForm'
import { Search, Plus, Pencil, Trash2, ExternalLink, Phone, Mail, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Contact, Company } from '@/types'
import { fmtDate } from '@/lib/utils'

type SortKey = 'name' | 'email' | 'title' | 'created_at'

function statusOf(c: Contact): 'lead' | 'prospect' | 'customer' {
  if (c.tags?.includes('vip')) return 'customer'
  if (c.tags?.includes('decision-maker')) return 'prospect'
  return 'lead'
}
const statusLabel: Record<string, string> = { lead: 'Lead', prospect: 'Prospect', customer: 'Customer' }
const statusStyle: Record<string, { bg: string; dot: string; color: string }> = {
  lead:     { bg: 'rgba(232,161,60,0.14)',  dot: '#e8a13c', color: '#f5b454' },
  prospect: { bg: 'rgba(91,159,214,0.14)',  dot: '#5b9fd6', color: '#82bce4' },
  customer: { bg: 'rgba(62,179,124,0.14)',  dot: '#3eb37c', color: '#4ed193' },
}

function initials(name: string) {
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<(Contact & { company?: { id: string; name: string } | null })[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'lead' | 'prospect' | 'customer'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  async function load() {
    const [{ data: c }, { data: co }] = await Promise.all([
      supabase.from('contacts').select('*, company:companies(id,name)').order('name'),
      supabase.from('companies').select('id,name').order('name'),
    ])
    setContacts((c ?? []) as any)
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

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const counts = {
    all: contacts.length,
    lead: contacts.filter(c => statusOf(c) === 'lead').length,
    prospect: contacts.filter(c => statusOf(c) === 'prospect').length,
    customer: contacts.filter(c => statusOf(c) === 'customer').length,
  }

  const filtered = contacts
    .filter(c => filter === 'all' || statusOf(c) === filter)
    .filter(c => {
      const q = search.toLowerCase()
      return !q || c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || (c as any).company?.name?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const va = a[sortKey] ?? '', vb = b[sortKey] ?? ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null
    return sortDir === 'asc' ? <ChevronUp size={11} style={{ color: '#3eb37c' }}/> : <ChevronDown size={11} style={{ color: '#3eb37c' }}/>
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1500 }}>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Contactos</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 3 }}>Visión general · {contacts.length} registros</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, empresa..."
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '9px 12px 9px 34px', fontSize: 13, color: 'var(--text-primary)', width: 280 }}
            />
          </div>
          <button onClick={() => { setSelected(null); setModal('create') }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600,
            background: 'var(--mint)', color: 'var(--bg-deep)', border: 'none', cursor: 'pointer',
          }}>
            <Plus size={14}/>Nuevo contacto
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'lead', 'prospect', 'customer'] as const).map(f => {
          const active = filter === f
          const label = f === 'all' ? 'Todos' : statusLabel[f]
          const c = f !== 'all' ? statusStyle[f] : null
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px',
              borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              background: active ? (c?.bg ?? 'var(--mint-soft)') : 'var(--bg-elevated)',
              border: `1px solid ${active ? (c?.dot ?? 'var(--mint)') : 'var(--border-default)'}`,
              color: active ? (c?.color ?? '#4ed193') : 'var(--text-secondary)',
            }}>
              {label}
              <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.2)', padding: '1px 7px', borderRadius: 8, fontFamily: 'var(--font-mono)' }}>
                {counts[f]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {[
                { k: 'name' as SortKey, label: 'Contacto' },
                { k: null, label: 'Empresa' },
                { k: 'title' as SortKey, label: 'Cargo' },
                { k: null, label: 'Estado' },
                { k: null, label: 'Contacto' },
                { k: 'created_at' as SortKey, label: 'Fecha' },
                { k: null, label: '' },
              ].map(({ k, label }, i) => (
                <th key={i} onClick={() => k && toggleSort(k)} style={{
                  textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-muted)', fontWeight: 600, padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)', cursor: k ? 'pointer' : 'default',
                  userSelect: 'none',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {label}{k && <SortIcon k={k}/>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                {search ? `Sin resultados para "${search}"` : 'Crea tu primer contacto'}
              </td></tr>
            ) : filtered.map(c => {
              const st = statusOf(c)
              const ss = statusStyle[st]
              const comp = (c as any).company
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--mint), #2a8c5e)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12, color: 'var(--bg-deep)',
                      }}>{initials(c.name)}</div>
                      <div>
                        <Link href={`/contacts/${c.id}`} style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4ed193'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                        >{c.name}</Link>
                        {c.email && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{c.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13 }}>
                    {comp ? (
                      <Link href={`/companies/${comp.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4ed193'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                      >{comp.name}</Link>
                    ) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.title ?? '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 999,
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: ss.bg, color: ss.color,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ss.dot }}/>
                      {statusLabel[st]}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {c.phone && <span style={{ fontFamily: 'var(--font-mono)' }}>{c.phone}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {fmtDate(c.created_at)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <Link href={`/contacts/${c.id}`} title="Ver" style={{ padding: '4px 6px', borderRadius: 6, color: 'var(--text-muted)', background: 'transparent' }}>
                        <ExternalLink size={13}/>
                      </Link>
                      <button title="Editar" onClick={() => { setSelected(c); setModal('edit') }} style={{ padding: '4px 6px', borderRadius: 6, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Pencil size={13}/>
                      </button>
                      <button title="Eliminar" onClick={() => deleteContact(c.id)} disabled={deleting === c.id} style={{ padding: '4px 6px', borderRadius: 6, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
          <span>Mostrando <b style={{ color: 'var(--text-secondary)' }}>{filtered.length}</b> de {contacts.length} contactos</span>
        </div>
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
