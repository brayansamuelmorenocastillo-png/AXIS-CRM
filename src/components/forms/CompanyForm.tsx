'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Company } from '@/types'

const INDUSTRIES = ['Tecnología', 'Finanzas', 'Salud', 'Educación', 'Retail', 'Manufactura', 'Consultoría', 'Marketing', 'Inmobiliaria', 'Otro']
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

interface Props {
  company?: Company
  onSuccess: () => void
  onClose: () => void
}

export function CompanyForm({ company, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    name: company?.name ?? '',
    domain: company?.domain ?? '',
    industry: company?.industry ?? '',
    size: company?.size ?? '',
    website: company?.website ?? '',
    notes: company?.notes ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { ...form, user_id: user.id }
    const q = company
      ? supabase.from('companies').update(payload).eq('id', company.id)
      : supabase.from('companies').insert(payload)

    const { error: err } = await q
    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  const field = 'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-tx placeholder-tx-faint focus:border-accent transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-danger bg-danger-soft px-3 py-2 rounded-lg">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Nombre *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Acme Corp" className={field} />
        </div>
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Dominio</label>
          <input value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="acme.com" className={field} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Industria</label>
          <select value={form.industry} onChange={e => set('industry', e.target.value)} className={field}>
            <option value="">Seleccionar...</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Tamaño</label>
          <select value={form.size} onChange={e => set('size', e.target.value)} className={field}>
            <option value="">Seleccionar...</option>
            {SIZES.map(s => <option key={s} value={s}>{s} empleados</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Website</label>
        <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://acme.com" className={field} />
      </div>

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Notas</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={`${field} resize-none`} />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : company ? 'Actualizar' : 'Crear empresa'}</Button>
      </div>
    </form>
  )
}
