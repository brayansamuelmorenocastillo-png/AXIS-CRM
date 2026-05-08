'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { TrendingUp, Target, Award, Clock } from 'lucide-react'

interface StageData { name: string; count: number; value: number; color: string }
interface MonthData { month: string; revenue: number; deals: number }

const STAGE_COLORS: Record<string, string> = {
  'Prospección':    '#527063',
  'Cualificación':  '#3eb37c',
  'Propuesta':      '#e8a13c',
  'Negociación':    '#82bce4',
  'Cerrado Ganado': '#4ed193',
  'Cerrado Perdido':'#e05c5c',
}

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub: string; icon: React.ElementType; color: string }) {
  return (
    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  )
}

export default function InformesPage() {
  const [stages, setStages] = useState<StageData[]>([])
  const [monthData, setMonthData] = useState<MonthData[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [wonRevenue, setWonRevenue] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [avgDeal, setAvgDeal] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: deals }, { data: stagesData }] = await Promise.all([
        supabase.from('deals').select('*'),
        supabase.from('pipeline_stages').select('*').order('order_index'),
      ])

      const allDeals = deals ?? []
      const allStages = stagesData ?? []

      const stageMap: Record<string, StageData> = {}
      for (const s of allStages) {
        stageMap[s.id] = { name: s.name, count: 0, value: 0, color: STAGE_COLORS[s.name] ?? '#3eb37c' }
      }
      for (const d of allDeals) {
        if (stageMap[d.stage_id]) {
          stageMap[d.stage_id].count++
          stageMap[d.stage_id].value += d.value ?? 0
        }
      }
      setStages(Object.values(stageMap).filter(s => s.count > 0 || true).slice(0, 6))

      const total = allDeals.reduce((s, d) => s + (d.value ?? 0), 0)
      const won = allDeals.filter(d => {
        const stage = allStages.find(s => s.id === d.stage_id)
        return stage?.name === 'Cerrado Ganado'
      })
      const wonVal = won.reduce((s, d) => s + (d.value ?? 0), 0)
      const closed = allDeals.filter(d => {
        const stage = allStages.find(s => s.id === d.stage_id)
        return stage?.name === 'Cerrado Ganado' || stage?.name === 'Cerrado Perdido'
      })

      setTotalRevenue(total)
      setWonRevenue(wonVal)
      setWinRate(closed.length > 0 ? Math.round((won.length / closed.length) * 100) : 0)
      setAvgDeal(allDeals.length > 0 ? Math.round(total / allDeals.length) : 0)

      const byMonth: Record<number, MonthData> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i)
        const key = d.getMonth()
        byMonth[key] = { month: MONTH_NAMES[key], revenue: 0, deals: 0 }
      }
      for (const d of allDeals) {
        const m = new Date(d.created_at).getMonth()
        if (byMonth[m]) { byMonth[m].revenue += d.value ?? 0; byMonth[m].deals++ }
      }
      setMonthData(Object.values(byMonth))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ padding: '28px 32px', color: 'var(--text-muted)', fontSize: 13 }}>Cargando informes...</div>
  )

  const maxStageVal = Math.max(...stages.map(s => s.value), 1)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1500 }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 24, paddingBottom: 18 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Informes</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 3 }}>Métricas del pipeline y rendimiento comercial</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Pipeline Total" value={`€${(totalRevenue / 1000).toFixed(1)}K`} sub="Valor acumulado" icon={TrendingUp} color="#3eb37c" />
        <KpiCard label="Ingresos Ganados" value={`€${(wonRevenue / 1000).toFixed(1)}K`} sub="Deals cerrados ganados" icon={Award} color="#4ed193" />
        <KpiCard label="Tasa de Cierre" value={`${winRate}%`} sub="Won / (Won + Lost)" icon={Target} color="#e8a13c" />
        <KpiCard label="Ticket Medio" value={`€${(avgDeal / 1000).toFixed(1)}K`} sub="Por deal activo" icon={Clock} color="#82bce4" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue chart */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
          <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#3eb37c', borderRadius: 3 }}/>
            Pipeline por mes (últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3eb37c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3eb37c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#527063', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#527063', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#103a30', border: '1px solid rgba(149,200,175,0.14)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#b8d0c2' }}
                formatter={(v: number) => [`€${(v/1000).toFixed(1)}K`, 'Pipeline']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3eb37c" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: '#3eb37c', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Deals by month */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
          <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#e8a13c', borderRadius: 3 }}/>
            Deals creados por mes
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#527063', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#527063', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#103a30', border: '1px solid rgba(149,200,175,0.14)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#b8d0c2' }}
                formatter={(v: number) => [v, 'Deals']}
              />
              <Bar dataKey="deals" fill="#e8a13c" radius={[4, 4, 0, 0]}>
                {monthData.map((_, i) => <Cell key={i} fill={i === monthData.length - 1 ? '#f5b454' : '#e8a13c'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel by stage */}
      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 22 }}>
        <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 14, background: '#82bce4', borderRadius: 3 }}/>
          Distribución por etapa
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stages.map(s => (
            <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px 90px', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }}/>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)' }}>{s.name}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(s.value / maxStageVal) * 100}%`, background: s.color, borderRadius: 4, transition: 'width 0.4s ease' }}/>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'right' }}>{s.count} deal{s.count !== 1 ? 's' : ''}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>€{(s.value / 1000).toFixed(1)}K</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
