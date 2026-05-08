'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, Mail, MessageSquare, Calendar, CheckSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtDate } from '@/lib/utils'
import type { Activity } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { ActivityForm } from '@/components/timeline/ActivityForm'

const actIcon: Record<string, React.ElementType> = { call: Phone, email: Mail, note: MessageSquare, meeting: Calendar, task: CheckSquare }
const actStyle: Record<string, { bg: string; color: string; label: string }> = {
  meeting: { bg: 'rgba(62,179,124,0.14)',  color: '#4ed193', label: 'Reunión' },
  call:    { bg: 'rgba(91,159,214,0.14)',  color: '#82bce4', label: 'Llamada' },
  email:   { bg: 'rgba(232,161,60,0.14)', color: '#f5b454', label: 'Email' },
  note:    { bg: 'rgba(149,200,175,0.08)', color: '#7a9a8b', label: 'Nota' },
  task:    { bg: 'rgba(62,179,124,0.14)',  color: '#4ed193', label: 'Tarea' },
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function startOfWeek(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(d)
  start.setDate(d.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export default function AgendaPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [modal, setModal] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
    setActivities((data ?? []) as Activity[])
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('agenda-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const pending = activities.filter(a => !a.completed_at)
  const done = activities.filter(a => a.completed_at)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n })
  const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n })
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1500 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Agenda</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 3 }}>
            {pending.length} actividades pendientes
          </div>
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, background: 'var(--mint)', color: 'var(--bg-deep)', border: 'none', cursor: 'pointer' }}>
          <Plus size={14}/>Nueva actividad
        </button>
      </div>

      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={prevWeek} style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <ChevronLeft size={16}/>
        </button>
        <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
          {weekStart.getDate()} {MONTHS[weekStart.getMonth()]} — {weekEnd.getDate()} {MONTHS[weekEnd.getMonth()]} {weekEnd.getFullYear()}
        </span>
        <button onClick={nextWeek} style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <ChevronRight size={16}/>
        </button>
        <button onClick={() => setWeekStart(startOfWeek(new Date()))} style={{ padding: '6px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          Hoy
        </button>
      </div>

      {/* Week grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 32 }}>
        {weekDays.map((day, i) => {
          const isToday = day.getTime() === today.getTime()
          const dayActs = activities.filter(a => {
            const d = new Date(a.created_at); d.setHours(0, 0, 0, 0)
            return d.getTime() === day.getTime()
          })
          return (
            <div key={i} style={{ background: isToday ? 'rgba(62,179,124,0.06)' : 'var(--bg-base)', border: `1px solid ${isToday ? 'var(--mint)' : 'var(--border-subtle)'}`, borderRadius: 'var(--r-md)', padding: 12, minHeight: 120 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{DAYS[i]}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: isToday ? '#4ed193' : 'var(--text-primary)' }}>{day.getDate()}</span>
              </div>
              {dayActs.map(a => {
                const Icon = actIcon[a.type] ?? Calendar
                const s = actStyle[a.type] ?? actStyle.note
                return (
                  <div key={a.id} style={{ background: s.bg, borderRadius: 6, padding: '5px 8px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={10} style={{ color: s.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.subject}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Activity lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pending */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#e8a13c', borderRadius: 3 }}/>
            Pendientes <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 7px', borderRadius: 8 }}>{pending.length}</span>
          </h3>
          {pending.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sin actividades pendientes</p>
          ) : pending.map(a => {
            const Icon = actIcon[a.type] ?? Calendar
            const s = actStyle[a.type] ?? actStyle.note
            return (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 12, padding: 12, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginBottom: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg, color: s.color }}>
                  <Icon size={16}/>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.subject}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#4ed193', fontWeight: 600, display: 'block' }}>Pendiente</span>
                  {fmtDate(a.created_at)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Completed */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#3eb37c', borderRadius: 3 }}/>
            Completadas <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 7px', borderRadius: 8 }}>{done.length}</span>
          </h3>
          {done.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sin actividades completadas</p>
          ) : done.map(a => {
            const Icon = actIcon[a.type] ?? Calendar
            const s = actStyle[a.type] ?? actStyle.note
            return (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 12, padding: 12, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginBottom: 10, alignItems: 'center', opacity: 0.7 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg, color: s.color }}>
                  <Icon size={16}/>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>{a.subject}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {fmtDate(a.completed_at!)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nueva actividad">
        <ActivityForm
          entityType="contact"
          entityId=""
          onSuccess={() => { setModal(false); load() }}
          onClose={() => setModal(false)}
        />
      </Modal>
    </div>
  )
}
