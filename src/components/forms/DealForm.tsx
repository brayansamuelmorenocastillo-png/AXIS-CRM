'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Deal, Contact, Company, PipelineStage } from '@/types'

interface Props {
  deal?: Deal
  contacts: Contact[]
  companies: Company[]
  stages: PipelineStage[]
  onSuccess: () => void
  onClose: () => void
}

export function DealForm({ deal, contacts, companies, stages, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    title: deal?.title ?? '',
    value: deal?.value?.toString() ?? '0',
    stage_id: deal?.stage_id ?? (stages[0]?.id ?? ''),
    contact_id: deal?.contact_id ?? '',
    company_id: deal?.company_id ?? '',
    probability: deal?.probability?.toString() ?? '20',
    expected_close: deal?.expected_close ?? '',
    notes: deal?.notes ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      title: form.title,
      value: parseFloat(form.value) || 0,
      stage_id: form.stage_id || null,
      contact_id: form.contact_id || null,
      company_id: form.company_id || null,
      probability: parseInt(form.probability) || 0,
      expected_close: form.expected_close || null,
      notes: form.notes || null,
      user_id: user.id,
    }

    const q = deal
      ? supabase.from('deals').update(payload).eq('id', deal.id)
      : supabase.from('deals').insert(payload)

    const { error: err } = await q
    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  const field = 'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-tx placeholder-tx-faint focus:border-accent transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-danger bg-danger-soft px-3 py-2 rounded-lg">{error}</p>}

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Título del deal *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Implementación ERP — Acme Corp" className={field} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Valor (€)</label>
          <input type="number" min="0" step="0.01" value={form.value} onChange={e => set('value', e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Probabilidad (%)</label>
          <input type="number" min="0" max="100" value={form.probability} onChange={e => set('probability', e.target.value)} className={field} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Etapa</label>
        <select value={form.stage_id} onChange={e => set('stage_id', e.target.value)} className={field}>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Contacto</label>
          <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className={field}>
            <option value="">Sin contacto</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-tx-dim mb-1 font-medium">Empresa</label>
          <select value={form.company_id} onChange={e => set('company_id', e.target.value)} className={field}>
            <option value="">Sin empresa</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Cierre esperado</label>
        <input type="date" value={form.expected_close} onChange={e => set('expected_close', e.target.value)} className={field} />
      </div>

      <div>
        <label className="block text-xs text-tx-dim mb-1 font-medium">Notas</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={`${field} resize-none`} />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : deal ? 'Actualizar' : 'Crear deal'}</Button>
      </div>
    </form>
  )
}
