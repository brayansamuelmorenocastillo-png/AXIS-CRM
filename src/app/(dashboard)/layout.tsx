import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { count } = await supabase.from('contacts').select('*', { count: 'exact', head: true })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '248px 1fr',
      height: '100vh',
      background: `
        radial-gradient(ellipse 80% 60% at 100% 0%, rgba(62,179,124,0.05) 0%, transparent 50%),
        radial-gradient(ellipse 60% 80% at 0% 100%, rgba(232,161,60,0.025) 0%, transparent 50%),
        #07211c
      `,
    }}>
      <Sidebar contactCount={count ?? 0} />
      <main style={{ overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        {children}
      </main>
    </div>
  )
}
