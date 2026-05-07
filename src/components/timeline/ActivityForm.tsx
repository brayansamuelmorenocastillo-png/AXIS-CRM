'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Phone, Mail, MessageSquare, Calendar, CheckSquare } from 'lucide-react'
import type { EntityType, ActivityType } from '@/types'

const TYPES: { value: ActivityType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'note',    label: 'Nota',     icon: MessageSquare, color: '#8b96a5' },
  { value: 'call',    label: 'Llamada',  icon: Phone,         color: '#6ea8fe' },
  { value: 'email',   label: 'Email',    icon: Mail,          color: '#a371f7' },
  { value: 'meeting', label: 'Reunión',  icon: Calendar,      color: '#3fb950' },
  { value: 'task',    label: 'Tarea',    icon: CheckSquare,   color: '#d29922' },
]

interface Props {
  entityType: EntityType
  entityId: string
  onSuccess: () => void
  onClose?: () => void
}

export function ActivityForm({ entityType, entityId, onSuccess }: Props) {
  const [type, setType] = useState<ActivityType>('note')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) return
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from('activities').insert({
      user_id: user.id,
      type,
      subject,
      body: body || null,
      entity_type: entityType,
      entity_id: entityId,
    })

    if (err) { setError(err.message); setLoading(false); return }
    setSubject('')
    setBody('')
    setType('note')
    onSuccess()
  }

  const field = 'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-tx placeholder-tx-faint focus:border-accent transition-colors'

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-tx-faint mb-3">Añadir actividad</p>

      {/* Type selector */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {TYPES.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                type === t.value
                  ? 'border-transparent font-medium'
                  : 'border-border text-tx-dim hover:border-border-strong hover:text-tx'
              }`}
              style={type === t.value ? { backgroundColor: `${t.color}20`, color: t.color, borderColor: `${t.color}40` } : {}}
            >
              <Icon size={11} />
              {t.label}
            </button>
          )
        })}
      </div>

      {error && <p className="text-xs text-danger bg-danger-soft px-3 py-2 rounded-lg mb-2">{error}</p>}

      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        required
        placeholder="Asunto de la actividad..."
        className={`${field} mb-2`}
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={2}
        placeholder="Descripción (opcional)..."
        className={`${field} resize-none mb-3`}
      />

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading || !subject.trim()}>
          {loading ? 'Guardando...' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}
