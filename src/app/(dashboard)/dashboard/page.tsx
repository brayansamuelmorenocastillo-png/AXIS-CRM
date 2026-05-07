'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KpiCard } from '@/components/ui/KpiCard'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Users, Building2, TrendingUp, DollarSign, Phone, Mail, MessageSquare, Calendar, CheckSquare } from 'lucide-react'
import { fmt, fmtDate } from '@/lib/utils'
import type { Activity, Deal, PipelineStage } from '@/types'

const activityIcons: Record<string, React.ElementType> = {
  call: Phone, email: Mail, note: MessageSquare, meeting: Calendar, task: CheckSquare,
}
const activityColors: Record<string, string> = {
  call: '#6ea8fe', email: '#a371f7', note: '#8b96a5', meeting: '#3fb950', task: '#d29922',
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ contacts: 0, companies: 0, dealsOpen: 0, revenue: 0, wonDeals: 0, totalDeals: 0 })
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [topDeals, setTopDeals] = useState<(Deal & { stage: PipelineStage })[]>([])
  const supabase = createClient()

  async function load() {
    const [
      { count: contacts },
      { count: companies },
      { data: deals },
      { data: activities },
    ] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('deals').select('*, stage:pipeline_stages(*)').order('value', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(8),
    ])

    const allDeals = (deals ?? []) as (Deal & { stage: PipelineStage })[]
    const openDeals = allDeals.filter(d => d.stage?.name !== 'Closed Won' && d.stage?.name !== 'Closed Lost')
    const wonDeals = allDeals.filter(d => d.stage?.name === 'Closed Won')
    const revenue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)

    setStats({
      contacts: contacts ?? 0,
      companies: companies ?? 0,
      dealsOpen: openDeals.length,
      revenue,
      wonDeals: wonDeals.length,
      totalDeals: allDeals.length,
    })
    setRecentActivities((activities ?? []) as Activity[])
    setTopDeals(openDeals.slice(0, 5))
  }

  useEffect(() => {
    load()
    const channel = supabase.channel('dashboard-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const winRate = stats.totalDeals > 0 ? Math.round((stats.wonDeals / stats.totalDeals) * 100) : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-tx tracking-tight">Dashboard</h1>
        <p className="text-sm text-tx-dim mt-0.5">Vista general de tu pipeline</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Contactos" value={stats.contacts} icon={Users} color="accent" />
        <KpiCard label="Empresas" value={stats.companies} icon={Building2} color="violet" />
        <KpiCard label="Deals abiertos" value={stats.dealsOpen} sub={`Tasa de cierre: ${winRate}%`} icon={TrendingUp} color="warn" />
        <KpiCard label="Revenue cerrado" value={fmt(stats.revenue)} icon={DollarSign} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Deals */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tx-faint mb-4">Top Deals Abiertos</h2>
          {topDeals.length === 0 ? (
            <p className="text-sm text-tx-dim text-center py-6">Sin deals todavía</p>
          ) : (
            <div className="space-y-3">
              {topDeals.map(deal => (
                <div key={deal.id} className="flex items-center gap-3">
                  <Avatar name={deal.title} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-tx font-medium truncate">{deal.title}</p>
                    {deal.stage && (
                      <Badge color={deal.stage.color} className="mt-0.5">{deal.stage.name}</Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-tx shrink-0">{fmt(deal.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tx-faint mb-4">Actividad Reciente</h2>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-tx-dim text-center py-6">Sin actividades todavía</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map(activity => {
                const Icon = activityIcons[activity.type] ?? MessageSquare
                const color = activityColors[activity.type] ?? '#8b96a5'
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-tx truncate">{activity.subject}</p>
                      <p className="text-xs text-tx-faint mt-0.5">{fmtDate(activity.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
