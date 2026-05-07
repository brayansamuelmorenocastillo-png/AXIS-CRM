'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Phone, Mail, MessageSquare, Calendar, CheckSquare, ChevronLeft, Plus, Building2, Tag, Users, Euro, Clock } from 'lucide-react'
import { fmtDate } from '@/lib/utils'
import type { Contact, Deal, PipelineStage, Activity } from '@/types'
import { ActivityForm } from '@/components/timeline/ActivityForm'
import { Modal } from '@/components/ui/Modal'

function initials(name: string) {
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
}
function fmtMoney(n: number) {
  return '€' + n.toLocaleString('es-ES')
}
const stageColors: Record<string, string> = {
  Diagnostico: '#7a9a8b', Propuesta: '#5b9fd6', Validacion: '#82bce4',
  Negociacion: '#e8a13c', Cierre: '#f5b454', Ganado: '#3eb37c',
}
const actIcon: Record<string, React.ElementType> = { call: Phone, email: Mail, note: MessageSquare, meeting: Calendar, task: CheckSquare, stage: Tag }
const actCls: Record<string, { border: string; color: string }> = {
  meeting: { border: 'var(--mint)',   color: '#4ed193' },
  call:    { border: '#5b9fd6',        color: '#82bce4' },
  email:   { border: '#e8a13c',        color: '#f5b454' },
  note:    { border: 'var(--border-default)', color: 'var(--text-muted)' },
  task:    { border: 'var(--mint)',    color: '#4ed193' },
  stage:   { border: '#e8a13c',        color: '#f5b454' },
}
const statusStyle: Record<string, { bg: string; dot: string; color: string; label: string }> = {
  lead:     { bg: 'rgba(232,161,60,0.14)',  dot: '#e8a13c', color: '#f5b454', label: 'Lead' },
  prospect: { bg: 'rgba(91,159,214,0.14)',  dot: '#5b9fd6', color: '#82bce4', label: 'Prospect' },
  customer: { bg: 'rgba(62,179,124,0.14)',  dot: '#3eb37c', color: '#4ed193', label: 'Customer' },
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [contact, setContact] = useState<(Contact & { company?: { id: string; name: string } | null }) | null>(null)
  const [deals, setDeals] = useState<(Deal & { stage: PipelineStage })[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [tab, setTab] = useState<'timeline' | 'notes' | 'files'>('timeline')
  const [actModal, setActModal] = useState(false)
  const supabase = createClient()

  async function load() {
    const [{ data: c }, { data: d }, { data: a }] = await Promise.all([
      supabase.from('contacts').select('*, company:companies(id,name)').eq('id', id).single(),
      supabase.from('deals').select('*, stage:pipeline_stages(*)').eq('contact_id', id).order('created_at', { ascending: false }),
      supabase.from('activities').select('*').eq('entity_id', id).order('created_at', { ascending: false }),
    ])
    if (c) setContact(c as any)
    setDeals((d ?? []) as any)
    setActivities((a ?? []) as Activity[])
  }

  useEffect(() => {
    load()
    const ch = supabase.channel(`contact-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])

  if (!contact) return <div style={{ padding: '28px 32px', color: 'var(--text-muted)' }}>Cargando…</div>

  const ss = statusStyle[contact.status] ?? statusStyle.lead
  const comp = (contact as any).company

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1500 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontSize: 12.5, color: 'var(--text-muted)' }}>
        <button onClick={() => router.push('/contacts')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          <ChevronLeft size={14}/>Volver
        </button>
        <span>Contactos / {comp?.name} / <b style={{ color: 'var(--text-secondary)' }}>{contact.name}</b></span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* LEFT */}
        <div>
          {/* Profile card */}
          <div style={{ background: 'linear-gradient(135deg, var(--bg-base) 0%, var(--bg-elevated) 100%)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40%', left: '-10%', right: '-10%', height: 100, background: 'radial-gradient(ellipse, rgba(62,179,124,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}/>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, var(--mint), #2a8c5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-space-grotesk)', fontSize: 26, fontWeight: 700, color: 'var(--bg-deep)', margin: '0 auto 14px', border: '3px solid var(--bg-base)', boxShadow: '0 0 0 1px var(--mint), 0 8px 24px -8px rgba(62,179,124,0.4)', position: 'relative' }}>
              {initials(contact.name)}
            </div>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-space-grotesk)', fontSize: 19, fontWeight: 600 }}>{contact.name}</h2>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>{contact.title} · {comp?.name}</div>
            <div style={{ marginBottom: 18 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', background: ss.bg, color: ss.color }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: ss.dot }}/>
                {ss.label}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[Phone, Mail, MessageSquare, Calendar].map((Icon, i) => (
                <button key={i} style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <Icon size={15}/>
                </button>
              ))}
            </div>
          </div>

          {/* Info list */}
          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22, marginTop: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 14, background: 'var(--mint)', borderRadius: 3 }}/>Información
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { icon: Mail,     label: 'Email',           val: contact.email, mono: true },
                { icon: Phone,    label: 'Teléfono',        val: contact.phone, mono: true },
                { icon: Building2,label: 'Empresa',         val: comp?.name },
                { icon: Tag,      label: 'Sector',          val: contact.sector, tag: true },
                { icon: Users,    label: 'Empleados',       val: contact.employees ? contact.employees.toLocaleString('es-ES') : null, mono: true },
                { icon: Euro,     label: 'Oferta potencial',val: contact.oferta_potencial ? fmtMoney(contact.oferta_potencial) : null, mono: true, accent: true },
                { icon: Clock,    label: 'Última actividad',val: contact.last_activity ? fmtDate(contact.last_activity) : null, mono: true },
              ].filter(r => r.val).map(({ icon: Icon, label, val, mono, tag, accent }) => (
                <li key={label} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={13}/>{label}
                  </span>
                  {tag ? (
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>{val}</span>
                  ) : (
                    <span style={{ fontWeight: 600, color: accent ? '#4ed193' : 'var(--text-primary)', fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: mono ? 12.5 : undefined, textAlign: 'right' }}>{val}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Deals */}
          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22, marginTop: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 14, background: 'var(--mint)', borderRadius: 3 }}/>Deals ({deals.length})
            </h3>
            {deals.map(d => (
              <Link key={d.id} href={`/deals/${d.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: 12, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginBottom: 8, cursor: 'pointer', textDecoration: 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, background: stageColors[d.stage?.name] ?? '#3eb37c', borderRadius: '50%', marginRight: 6, verticalAlign: 'middle' }}/>
                    {d.stage?.name} · {d.probability}%
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#4ed193' }}>
                  {fmtMoney(d.value)}
                </div>
              </Link>
            ))}
            <Link href="/deals" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8, borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 500, textDecoration: 'none', marginTop: 4 }}>
              <Plus size={13}/>Añadir deal
            </Link>
          </div>
        </div>

        {/* RIGHT — timeline */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', marginBottom: 18 }}>
            {(['timeline', 'notes', 'files'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: tab === t ? '#4ed193' : 'var(--text-muted)', borderBottom: `2px solid ${tab === t ? 'var(--mint)' : 'transparent'}`, marginBottom: -1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {t === 'timeline' ? 'Actividad' : t === 'notes' ? 'Notas' : 'Archivos'}
                {t === 'timeline' && <span style={{ background: 'var(--bg-elevated)', padding: '1px 7px', borderRadius: 8, fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>{activities.length}</span>}
              </button>
            ))}
            <div style={{ flex: 1 }}/>
            <button onClick={() => setActModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', marginBottom: 6, borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, background: 'var(--mint)', color: 'var(--bg-deep)', border: 'none', cursor: 'pointer' }}>
              <Plus size={13}/>Registrar actividad
            </button>
          </div>

          {tab === 'timeline' && (
            <div style={{ position: 'relative', paddingLeft: 22 }}>
              <div style={{ position: 'absolute', left: 11, top: 6, bottom: 6, width: 1, background: 'linear-gradient(180deg, var(--mint) 0%, var(--border-subtle) 100%)' }}/>
              {activities.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>Sin actividades todavía.</p>
              ) : activities.map(a => {
                const Icon = actIcon[a.type] ?? MessageSquare
                const cls = actCls[a.type] ?? actCls.note
                return (
                  <div key={a.id} style={{ position: 'relative', paddingBottom: 22 }}>
                    <div style={{ position: 'absolute', left: -22, top: 4, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-base)', border: `2px solid ${cls.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cls.color }}>
                      <Icon size={10}/>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginLeft: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.subject}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(a.created_at)}</div>
                      </div>
                      {a.body && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{a.body}</div>}
                      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, var(--mint), #2a8c5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--bg-deep)' }}>AC</div>
                        Adrián Cobos
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {tab === 'notes' && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Las notas aparecerán aquí.</div>}
          {tab === 'files' && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Archivos compartidos con {contact.nombre ?? contact.name.split(' ')[0]}.</div>}
        </div>
      </div>

      <Modal open={actModal} onClose={() => setActModal(false)} title="Registrar actividad">
        <ActivityForm
          entityType="contact"
          entityId={id}
          onSuccess={() => { setActModal(false); load() }}
          onClose={() => setActModal(false)}
        />
      </Modal>
    </div>
  )
}
