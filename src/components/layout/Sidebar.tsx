'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Kanban, Building2, Plus, Calendar, BarChart2, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/contacts',  label: 'Contactos',   icon: Users,      badge: true },
  { href: '/deals',     label: 'Pipeline',    icon: Kanban },
  { href: '/companies', label: 'Cuentas',     icon: Building2 },
]
const secondaryNav = [
  { href: '/agenda',   label: 'Agenda',   icon: Calendar },
  { href: '/informes', label: 'Informes', icon: BarChart2 },
  { href: '/ajustes',  label: 'Ajustes',  icon: Settings },
]

export function Sidebar({ contactCount = 0 }: { contactCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  return (
    <aside style={{
      width: 248,
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-deep) 100%)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '22px 14px',
      gap: 8,
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '4px 10px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 14,
      }}>
        <Image src="/logo-axis.png" alt="AXIS" width={40} height={40}
          style={{ borderRadius: '50%', border: '1.5px solid var(--mint)', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>AXIS</span>
          <span style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mint)', marginTop: 4, fontWeight: 600 }}>Salud · CRM</span>
        </div>
      </div>

      {/* TRABAJO */}
      <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', padding: '0 12px 8px', fontWeight: 600 }}>Trabajo</div>
      {mainNav.map(({ href, label, icon: Icon, badge }) => {
        const active = isActive(href)
        return (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 12px',
            borderRadius: 'var(--r-md)',
            fontSize: 13.5,
            fontWeight: 500,
            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: active ? 'var(--mint-soft)' : 'transparent',
            textDecoration: 'none',
            position: 'relative',
            transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--mint-soft)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' } }}
          onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' } }}
          >
            {active && (
              <span style={{ position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, background: 'var(--mint)', borderRadius: '0 3px 3px 0' }}/>
            )}
            <Icon size={17} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{label}</span>
            {badge && contactCount > 0 && (
              <span style={{ background: 'var(--mint)', color: 'var(--bg-deep)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                {contactCount}
              </span>
            )}
          </Link>
        )
      })}

      {/* OTROS */}
      <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', padding: '14px 12px 8px', fontWeight: 600 }}>Otros</div>
      {secondaryNav.map(({ href, label, icon: Icon }) => {
        const active = isActive(href)
        return (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 12px',
            borderRadius: 'var(--r-md)',
            fontSize: 13.5, fontWeight: 500,
            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: active ? 'var(--mint-soft)' : 'transparent',
            textDecoration: 'none',
            position: 'relative',
            transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--mint-soft)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' } }}
          onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' } }}
          >
            {active && <span style={{ position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, background: 'var(--mint)', borderRadius: '0 3px 3px 0' }}/>}
            <Icon size={17} style={{ flexShrink: 0 }} />
            {label}
          </Link>
        )
      })}

      {/* User footer */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          padding: 12,
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--mint), #2a8c5e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: 'var(--bg-deep)', flexShrink: 0,
          }}>AC</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Adrián Cobos</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Founder · AXIS</div>
          </div>
          <button onClick={logout} title="Cerrar sesión" style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4,
          }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
