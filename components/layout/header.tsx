'use client'

import { Bell, Menu, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  title: string
  isMobile?: boolean
  onMenuClick?: () => void
}

export function Header({ title, isMobile, onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  return (
    <header
      className={`border-border bg-card fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b px-4 transition-all duration-300 md:px-6 ${
        isMobile ? 'left-0' : 'left-[250px]'
      }`}
    >
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {/* <div className="relative hidden sm:block">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher..."
            className="bg-secondary/50 focus:border-primary focus:bg-card w-40 border-transparent pl-9 md:w-64"
          />
        </div> */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="text-muted-foreground h-5 w-5" />
          <span className="bg-primary absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">
                  {session?.user?.name || 'Utilisateur'}
                </p>
                <p className="text-muted-foreground text-xs leading-none">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/account')}>
              <User className="mr-2 h-4 w-4" />
              Mon compte
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
