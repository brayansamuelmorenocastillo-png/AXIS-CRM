'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Contact, Company } from '@/types'

interface Props {
  contact?: Contact
  companies: Company[]
  onSuccess: () => void
  onClose: () => void
}

export function ContactForm({ contact, companies, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    name: contact?.name ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
    title: contact?.title ?? '',
    company_id: contact?.company_id ?? '',
    notes: contact?.notes ?? '',
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

    const payload = {
      ...form,
      user_id: user.id,
      company_id: form.company_id || null,
    }

    const q = contact
      ? supabase.from('contacts').update(payload).eq('id', contact.id)
      : supabase.from('contacts').insert(payload)

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
          <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Juan García" className={field} />
        </div>
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Cargo</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Director de Marketing" className={field} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="juan@empresa.com" className={field} />
        </div>
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Teléfono</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 600 000 000" className={field} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Empresa</label>
        <select value={form.company_id} onChange={e => set('company_id', e.target.value)} className={field}>
          <option value="">Sin empresa</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Notas</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Notas adicionales..." className={`${field} resize-none`} />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : contact ? 'Actualizar' : 'Crear contacto'}</Button>
      </div>
    </form>
  )
}
