'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { CompanyForm } from '@/components/forms/CompanyForm'
import { Search, Plus, Pencil, Trash2, ExternalLink, Globe } from 'lucide-react'
import Link from 'next/link'
import type { Company } from '@/types'
import { fmtDate } from '@/lib/utils'

function initials(name: string) {
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Company | null>(null)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('companies').select('*').order('name')
    setCompanies((data ?? []) as Company[])
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('companies-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function deleteCompany(id: string) {
    await supabase.from('companies').delete().eq('id', id)
    load()
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase()) ||
    c.domain?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1500 }}>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Cuentas</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 3 }}>Empresas y organizaciones · {companies.length} registros</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar empresa, sector, dominio..."
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '9px 12px 9px 34px', fontSize: 13, color: 'var(--text-primary)', width: 280 }}
            />
          </div>
          <button onClick={() => { setSelected(null); setModal('create') }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px',
            borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600,
            background: 'var(--mint)', color: 'var(--bg-deep)', border: 'none', cursor: 'pointer',
          }}>
            <Plus size={14}/>Nueva empresa
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {['Empresa', 'Sector', 'Tamaño', 'Dominio', 'Creada', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                {search ? `Sin resultados para "${search}"` : 'Crea tu primera empresa'}
              </td></tr>
            ) : filtered.map(co => (
              <tr key={co.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--mint), #2a8c5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'var(--bg-deep)' }}>
                      {initials(co.name)}
                    </div>
                    <div>
                      <Link href={`/companies/${co.id}`} style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4ed193'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                      >{co.name}</Link>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {co.industry ? (
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {co.industry}
                    </span>
                  ) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12.5, color: 'var(--text-secondary)' }}>{co.size ?? '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  {co.domain ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <Globe size={12}/>{co.domain}
                    </span>
                  ) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{fmtDate(co.created_at)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Link href={`/companies/${co.id}`} style={{ padding: '4px 6px', borderRadius: 6, color: 'var(--text-muted)' }}><ExternalLink size={13}/></Link>
                    <button onClick={() => { setSelected(co); setModal('edit') }} style={{ padding: '4px 6px', borderRadius: 6, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={13}/></button>
                    <button onClick={() => deleteCompany(co.id)} style={{ padding: '4px 6px', borderRadius: 6, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
          <span>Mostrando <b style={{ color: 'var(--text-secondary)' }}>{filtered.length}</b> de {companies.length} empresas</span>
        </div>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? 'Editar empresa' : 'Nueva empresa'}>
        <CompanyForm
          company={modal === 'edit' ? selected ?? undefined : undefined}
          onSuccess={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}
