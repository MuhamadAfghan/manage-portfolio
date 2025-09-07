import { createServerClient } from '@/utils/supabase'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import ProjectForm from '@/components/ProjectForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function NewProjectPage() {
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
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-foreground">
              Portfolio Manager
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create New Project
            </h1>
            <p className="text-muted-foreground">
              Add a new project to your portfolio
            </p>
          </div>
        </div>

        <ProjectForm />
      </div>
    </div>
  )
}
