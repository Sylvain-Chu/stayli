'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Home,
  FileText,
  Settings,
  User,
  BookOpen,
} from 'lucide-react'

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Réservations', icon: BookOpen, exact: true },
  { href: '/bookings/calendar', label: 'Calendrier', icon: CalendarDays },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/properties', label: 'Propriétés', icon: Home },
  { href: '/invoices', label: 'Factures', icon: FileText },
]

const bottomNavItems = [
  { href: '/settings', label: 'Paramètres', icon: Settings },
  { href: '/account', label: 'Compte', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-sidebar text-sidebar-foreground fixed top-0 left-0 z-40 h-screen w-[250px]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-sidebar-border flex h-16 items-center gap-3 border-b px-6">
          <div className="bg-sidebar-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <Home className="text-sidebar-primary-foreground h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Stayli</span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          <p className="text-sidebar-muted mb-3 px-3 text-xs font-medium tracking-wider uppercase">
            Menu
          </p>
          {mainNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href ||
                (pathname.startsWith(item.href + '/') &&
                  !pathname.startsWith(item.href + '/calendar'))
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-sidebar-border space-y-1 border-t px-3 py-4">
          <p className="text-sidebar-muted mb-3 px-3 text-xs font-medium tracking-wider uppercase">
            Configuration
          </p>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* User info */}
        <div className="border-sidebar-border border-t p-4">
          <div className="bg-sidebar-accent/50 flex items-center gap-3 rounded-xl p-3">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-9 w-9 items-center justify-center rounded-full font-medium">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Jean Dupont</p>
              <p className="text-sidebar-muted truncate text-xs">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
