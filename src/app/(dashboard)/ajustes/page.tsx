'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Bell, Shield, Building2, Save } from 'lucide-react'

function Section({ title, icon: Icon, color, children }: { title: string; icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, type = 'text', disabled = false, onChange }: { label: string; value: string; type?: string; disabled?: boolean; onChange?: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: disabled ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-md)',
          padding: '9px 12px',
          fontSize: 13,
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
        }}
      />
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0, width: 40, height: 22, borderRadius: 11,
          background: checked ? 'var(--mint)' : 'var(--bg-elevated)',
          border: `1px solid ${checked ? 'var(--mint)' : 'var(--border-default)'}`,
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: checked ? 'var(--bg-deep)' : 'var(--text-muted)',
          transition: 'left 0.2s',
        }}/>
      </button>
    </div>
  )
}

export default function AjustesPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('Adrián Cobos')
  const [role, setRole] = useState('Founder · AXIS')
  const [saved, setSaved] = useState(false)
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifActivity, setNotifActivity] = useState(true)
  const [notifDeals, setNotifDeals] = useState(false)
  const [notifWeekly, setNotifWeekly] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [])

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800 }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 24, paddingBottom: 18 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Ajustes</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 3 }}>Configura tu perfil y preferencias</div>
      </div>

      {/* Profile */}
      <Section title="Perfil" icon={User} color="#3eb37c">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--mint), #2a8c5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--bg-deep)', flexShrink: 0 }}>AC</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{role}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ paddingRight: 16 }}>
            <Field label="Nombre completo" value={name} onChange={setName} />
          </div>
          <div style={{ paddingLeft: 16 }}>
            <Field label="Cargo" value={role} onChange={setRole} />
          </div>
        </div>
        <Field label="Email" value={email} type="email" disabled />
      </Section>

      {/* Notifications */}
      <Section title="Notificaciones" icon={Bell} color="#e8a13c">
        <Toggle label="Notificaciones por email" description="Recibe alertas de actividad en tu correo" checked={notifEmail} onChange={setNotifEmail} />
        <Toggle label="Nuevas actividades" description="Cuando se registre una llamada, reunión o tarea" checked={notifActivity} onChange={setNotifActivity} />
        <Toggle label="Cambios en deals" description="Cuando un deal cambie de etapa" checked={notifDeals} onChange={setNotifDeals} />
        <Toggle label="Resumen semanal" description="Informe de rendimiento cada lunes" checked={notifWeekly} onChange={setNotifWeekly} />
      </Section>

      {/* Account */}
      <Section title="Empresa" icon={Building2} color="#82bce4">
        <Field label="Nombre de empresa" value="AXIS Salud Corporativa" disabled />
        <Field label="Plan" value="Professional" disabled />
        <Field label="Región de datos" value="Europa (Frankfurt)" disabled />
      </Section>

      {/* Security */}
      <Section title="Seguridad" icon={Shield} color="#527063">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Contraseña</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Última actualización hace 30 días</div>
          </div>
          <button style={{ padding: '7px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Cambiar
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Sesiones activas</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>1 dispositivo activo</div>
          </div>
          <button style={{ padding: '7px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Ver sesiones
          </button>
        </div>
      </Section>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
        <button onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, background: saved ? 'rgba(62,179,124,0.2)' : 'var(--mint)', color: saved ? '#4ed193' : 'var(--bg-deep)', border: saved ? '1px solid var(--mint)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Save size={14}/>
          {saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
