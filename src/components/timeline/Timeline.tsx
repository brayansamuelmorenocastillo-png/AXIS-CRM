'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ActivityForm } from './ActivityForm'
import { Phone, Mail, MessageSquare, Calendar, CheckSquare, Trash2, Check } from 'lucide-react'
import { fmtDate } from '@/lib/utils'
import type { Activity, EntityType } from '@/types'

const config: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  call:    { icon: Phone,         color: '#6ea8fe', label: 'Llamada' },
  email:   { icon: Mail,          color: '#a371f7', label: 'Email' },
  note:    { icon: MessageSquare, color: '#8b96a5', label: 'Nota' },
  meeting: { icon: Calendar,      color: '#3fb950', label: 'Reunión' },
  task:    { icon: CheckSquare,   color: '#d29922', label: 'Tarea' },
}

interface Props {
  entityType: EntityType
  entityId: string
}

export function Timeline({ entityType, entityId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
    setActivities((data ?? []) as Activity[])
  }

  useEffect(() => {
    load()
    const ch = supabase.channel(`timeline-${entityId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `entity_id=eq.${entityId}`,
      }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [entityId])

  async function deleteActivity(id: string) {
    await supabase.from('activities').delete().eq('id', id)
  }

  async function toggleComplete(activity: Activity) {
    const completed_at = activity.completed_at ? null : new Date().toISOString()
    await supabase.from('activities').update({ completed_at }).eq('id', activity.id)
  }

  return (
    <div className="space-y-4">
      <ActivityForm entityType={entityType} entityId={entityId} onSuccess={load} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-tx-faint mb-3 px-1">
          Historial · {activities.length} actividades
        </p>

        {activities.length === 0 ? (
          <div className="bg-card border border-border rounded-xl py-12 text-center">
            <p className="text-sm text-tx-dim">Sin actividades todavía</p>
            <p className="text-xs text-tx-faint mt-1">Registra una llamada, nota o reunión</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-1">
              {activities.map(activity => {
                const c = config[activity.type] ?? config.note
                const Icon = c.icon
                return (
                  <div key={activity.id} className="relative flex gap-4 group">
                    {/* Icon dot */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all"
                      style={{
                        backgroundColor: `${c.color}20`,
                        borderColor: activity.completed_at ? c.color : `${c.color}40`,
                      }}
                    >
                      <Icon size={13} style={{ color: c.color }} />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 bg-card border rounded-xl p-3.5 mb-2 transition-colors ${
                      activity.completed_at ? 'border-border opacity-60' : 'border-border hover:border-border-strong'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs font-medium px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${c.color}15`, color: c.color }}
                            >
                              {c.label}
                            </span>
                            <p className={`text-sm font-medium ${activity.completed_at ? 'line-through text-tx-dim' : 'text-tx'}`}>
                              {activity.subject}
                            </p>
                          </div>
                          {activity.body && (
                            <p className="text-xs text-tx-dim mt-1.5">{activity.body}</p>
                          )}
                          <p className="text-xs text-tx-faint mt-2">{fmtDate(activity.created_at)}</p>
                        </div>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {activity.type === 'task' && (
                            <button
                              onClick={() => toggleComplete(activity)}
                              className={`p-1.5 rounded transition-colors ${
                                activity.completed_at
                                  ? 'text-success hover:bg-success-soft'
                                  : 'text-tx-faint hover:text-success hover:bg-success-soft'
                              }`}
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="p-1.5 rounded text-tx-faint hover:text-danger hover:bg-danger-soft transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
