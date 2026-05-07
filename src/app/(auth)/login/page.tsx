'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap size={16} className="text-surface" />
          </div>
          <span className="text-xl font-bold text-tx tracking-tight">AXIS CRM</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-lg font-semibold text-tx mb-1">Iniciar sesión</h1>
          <p className="text-sm text-tx-dim mb-6">Accede a tu espacio de trabajo</p>

          {error && (
            <div className="flex items-center gap-2 bg-danger-soft border border-danger/30 rounded-lg px-3 py-2 mb-4 text-sm text-danger">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-tx-dim mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-faint" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-tx placeholder-tx-faint focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-tx-dim mb-1.5 font-medium">Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-faint" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-tx placeholder-tx-faint focus:border-accent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-surface font-semibold text-sm rounded-lg py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Accediendo...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-tx-dim mt-4">
            ¿Sin cuenta?{' '}
            <Link href="/register" className="text-accent hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
