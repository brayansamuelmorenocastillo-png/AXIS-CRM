'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { CompanyForm } from '@/components/forms/CompanyForm'
import { Header } from '@/components/layout/Header'
import { Search, Pencil, Trash2, ExternalLink, Globe } from 'lucide-react'
import Link from 'next/link'
import type { Company } from '@/types'
import { fmtDate } from '@/lib/utils'

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
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase()) ||
    c.domain?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <Header
        title="Empresas"
        subtitle={`${companies.length} empresas`}
        action={{ label: 'Nueva empresa', onClick: () => { setSelected(null); setModal('create') } }}
      />

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-faint" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, industria o dominio..."
          className="w-full max-w-sm bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-tx placeholder-tx-faint focus:border-accent transition-colors"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-tx-dim text-sm">{search ? 'Sin resultados' : 'Crea tu primera empresa'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3">Empresa</th>
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell">Industria</th>
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Tamaño</th>
                <th className="text-left text-xs text-tx-faint font-medium uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Creada</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(company => (
                <tr key={company.id} className="hover:bg-card-hover transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={company.name} size="sm" />
                      <div>
                        <Link href={`/companies/${company.id}`} className="text-sm font-medium text-tx hover:text-accent transition-colors">
                          {company.name}
                        </Link>
                        {company.domain && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Globe size={10} className="text-tx-faint" />
                            <span className="text-xs text-tx-faint">{company.domain}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {company.industry ? (
                      <Badge variant="soft">{company.industry}</Badge>
                    ) : <span className="text-tx-faint text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-tx-dim">{company.size ? `${company.size} empleados` : '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-tx-faint">{fmtDate(company.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/companies/${company.id}`} className="p-1.5 hover:bg-border rounded text-tx-faint hover:text-tx transition-colors">
                        <ExternalLink size={13} />
                      </Link>
                      <button onClick={() => { setSelected(company); setModal('edit') }} className="p-1.5 hover:bg-border rounded text-tx-faint hover:text-tx transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteCompany(company.id)} className="p-1.5 hover:bg-danger-soft rounded text-tx-faint hover:text-danger transition-colors">
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
