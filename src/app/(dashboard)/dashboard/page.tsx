'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Euro, DollarSign, Target, TrendingDown, Phone, Mail, MessageSquare, Calendar, CheckSquare, Plus } from 'lucide-react'
import { fmtDate } from '@/lib/utils'
import type { Activity, Deal, PipelineStage } from '@/types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts'

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 240, h = 56
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 6) - 3,
  }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const area = linePath + ` L${w} ${h} L0 ${h} Z`
  const id = `sg${color.replace('#', '')}`
  return (
    <svg style={{ position: 'absolute', right: 0, bottom: 0, width: '100%', height: 56, pointerEvents: 'none', opacity: 0.55 }}
      viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`}/>
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  )
}

// ── Revenue chart ──────────────────────────────────────────────────────────
const revenueMonths = ['Nov','Dic','Ene','Feb','Mar','Abr','May']
const revenueData = revenueMonths.map((m, i) => ({
  mes: m,
  real:   [42,58,71,64,89,112,124][i],
  target: [55,60,65,70,80, 95,105][i],
}))

function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={revenueData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3eb37c" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#3eb37c" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" tick={{ fill: '#7a9a8b', fontSize: 10, fontFamily: 'var(--font-manrope)', fontWeight: 600 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill: '#7a9a8b', fontSize: 9.5, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`}/>
        <Tooltip
          contentStyle={{ background: '#144539', border: '1px solid rgba(149,200,175,0.14)', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#b8d0c2', fontWeight: 600 }}
          formatter={(v: number, name: string) => [`€${v}K`, name === 'real' ? 'Real' : 'Objetivo']}
        />
        <Area type="monotone" dataKey="real" stroke="#3eb37c" strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3.5, fill: '#0c2a23', stroke: '#3eb37c', strokeWidth: 2 }}/>
        <Line type="monotone" dataKey="target" stroke="#e8a13c" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Activity icons ─────────────────────────────────────────────────────────
const actIcons: Record<string, React.ElementType> = {
  call: Phone, email: Mail, note: MessageSquare, meeting: Calendar, task: CheckSquare,
}
const actColors: Record<string, { bg: string; color: string }> = {
  call:    { bg: 'rgba(91,159,214,0.14)',  color: '#82bce4' },
  email:   { bg: 'rgba(232,161,60,0.14)', color: '#f5b454' },
  meeting: { bg: 'rgba(62,179,124,0.14)', color: '#4ed193' },
  note:    { bg: 'rgba(149,200,175,0.08)', color: '#7a9a8b' },
  task:    { bg: 'rgba(62,179,124,0.14)', color: '#4ed193' },
}
const actWhen: Record<string, string> = {
  call:    'Hoy', email: 'Ayer', meeting: 'Mañana', note: 'Hace 2d', task: 'Próx. 48h',
}

// ── Stage colors ───────────────────────────────────────────────────────────
const stageColors: Record<string, string> = {
  'Lead':        '#e8a13c',
  'Qualified':   '#5b9fd6',
  'Proposal':    '#3eb37c',
  'Negotiation': '#a371f7',
  'Closed Won':  '#4ed193',
  'Closed Lost': '#d65b6e',
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<(Deal & { stage: PipelineStage })[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [counts, setCounts] = useState({ contacts: 0, companies: 0 })
  const supabase = createClient()

  async function load() {
    const [
      { count: contacts },
      { count: companies },
      { data: dealsData },
      { data: actData },
    ] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('deals').select('*, stage:pipeline_stages(*)').order('value', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(5),
    ])
    setDeals((dealsData ?? []) as (Deal & { stage: PipelineStage })[])
    setActivities((actData ?? []) as Activity[])
    setCounts({ contacts: contacts ?? 0, companies: companies ?? 0 })
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('dash-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const wonDeals = deals.filter(d => d.stage?.name === 'Closed Won')
  const openDeals = deals.filter(d => d.stage?.name !== 'Closed Won' && d.stage?.name !== 'Closed Lost')
  const revenue = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0)
  const winRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : '0.0'
  const avgTicket = wonDeals.length > 0 ? revenue / wonDeals.length : 0

  // Funnel stats
  const stageMap = new Map<string, { name: string; count: number; total: number; color: string }>()
  deals.forEach(d => {
    if (!d.stage) return
    const key = d.stage.id
    if (!stageMap.has(key)) stageMap.set(key, { name: d.stage.name, count: 0, total: 0, color: stageColors[d.stage.name] ?? '#3eb37c' })
    const s = stageMap.get(key)!
    s.count++
    s.total += d.value ?? 0
  })
  const stageStats = Array.from(stageMap.values())
  const maxFunnel = Math.max(...stageStats.map(s => s.total), 1)

  const kpis = [
    { label: 'Revenue total',  value: `€${(revenue / 1000).toFixed(1)}K`, delta: '+18.4%', up: true,  color: '#3eb37c', spark: [22,28,26,34,40,52,48,62,70,78,92,revenue/1000||10], icon: <Euro size={15}/>, iconBg: 'rgba(62,179,124,0.14)', iconColor: '#4ed193' },
    { label: 'Deals activos',  value: String(openDeals.length),            delta: '+6 nuevos', up: true,  color: '#5b9fd6', spark: [18,20,19,22,24,28,30,29,31,33,32,openDeals.length||5], icon: <DollarSign size={15}/>, iconBg: 'rgba(91,159,214,0.14)', iconColor: '#82bce4' },
    { label: 'Tasa de cierre', value: `${winRate}%`,                       delta: '+4.1pp', up: true,  color: '#e8a13c', spark: [28,30,29,32,34,36,33,35,37,36,38,parseFloat(winRate)||5], icon: <Target size={15}/>, iconBg: 'rgba(232,161,60,0.14)', iconColor: '#f5b454' },
    { label: 'Ticket medio',   value: `€${(avgTicket / 1000).toFixed(1)}K`, delta: '-2.1%', up: false, color: '#d65b6e', spark: [22,24,25,23,22,21,22,21,22,21,20,avgTicket/1000||5], icon: <TrendingDown size={15}/>, iconBg: 'rgba(214,91,110,0.14)', iconColor: '#e8889a' },
  ]

  const fmt = (n: number) => `€${n.toLocaleString('es-ES')}`

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1500 }}>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{
            position: 'relative',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            padding: 22,
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: k.iconBg, color: k.iconColor }}>
                {k.icon}
              </span>
              {k.label}
            </div>
            <div style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', margin: '14px 0 4px', color: 'var(--text-primary)' }}>
              {k.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ color: k.up ? '#4ed193' : '#e8889a', fontWeight: 600 }}>{k.up ? '↑' : '↓'} {k.delta}</span>
              <span>vs mes pasado</span>
            </div>
            <Sparkline data={k.spark} color={k.color}/>
          </div>
        ))}
      </div>

      {/* Chart + Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue chart */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 14, background: 'var(--mint)', borderRadius: 3, display: 'inline-block' }}/>
              Revenue mensual
            </h3>
            <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3eb37c', display: 'inline-block' }}/>Real (€K)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 2, background: '#e8a13c', borderRadius: 1, display: 'inline-block' }}/>Objetivo
              </span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Cerrado 2026 vs objetivo trimestral · <b style={{ color: '#4ed193' }}>+18% YoY</b>
          </div>
          <RevenueChart/>
        </div>

        {/* Funnel */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: 'var(--mint)', borderRadius: 3, display: 'inline-block' }}/>
            Embudo por etapa
          </h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#4ed193' }}>{deals.length}</span> deals · <span style={{ fontFamily: 'var(--font-mono)' }}>€{(deals.reduce((s,d)=>s+(d.value??0),0)/1000).toFixed(0)}K</span> total
          </div>
          {stageStats.map(s => (
            <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, background: s.color, borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }}/>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.count}</span>
                </div>
                <div style={{ background: 'var(--bg-elevated)', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
                  <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)`, width: `${(s.total / maxFunnel) * 100}%` }}/>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                €{(s.total / 1000).toFixed(1)}K
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: 'var(--mint)', borderRadius: 3, display: 'inline-block' }}/>
            Actividad reciente
          </h3>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          {activities.filter(a => !a.completed_at).length} pendientes · últimas 48 horas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activities.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>Sin actividades</p>
          ) : activities.map(a => {
            const Icon = actIcons[a.type] ?? MessageSquare
            const c = actColors[a.type] ?? actColors.note
            const when = actWhen[a.type] ?? fmtDate(a.created_at)
            return (
              <div key={a.id} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr auto',
                gap: 12, padding: 12,
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                alignItems: 'center',
                cursor: 'pointer',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, color: c.color }}>
                  <Icon size={16}/>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.subject}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{a.body?.slice(0, 60)}{(a.body?.length ?? 0) > 60 ? '…' : ''}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#4ed193', fontWeight: 600, display: 'block' }}>{when}</span>
                  {fmtDate(a.created_at)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
