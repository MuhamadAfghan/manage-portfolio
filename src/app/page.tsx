import { createServerClient } from '@/utils/supabase'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Header from '@/components/Header'
import DashboardStats from '@/components/DashboardStats'
import ProjectsBoard from '@/components/ProjectsBoard'

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-7xl items-center justify-between p-3 text-sm">
          <Header />
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your portfolio projects and settings
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <DashboardStats />

        {/* Projects Board */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Projects</h2>
          </div>
          <ProjectsBoard />
        </div>
      </div>
    </div>
  )
}
