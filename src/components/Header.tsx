import Link from 'next/link'
import AuthButton from './AuthButton'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-foreground">
          Portfolio Manager
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/" className="text-sm hover:text-foreground/80">
            Dashboard
          </Link>
          <Link href="/projects" className="text-sm hover:text-foreground/80">
            Projects
          </Link>
          <Link href="/skills" className="text-sm hover:text-foreground/80">
            Skills
          </Link>
          <Link href="/api-keys" className="text-sm hover:text-foreground/80">
            API Keys
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <AuthButton />
      </div>
    </div>
  )
}
