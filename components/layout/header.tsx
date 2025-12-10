import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="border-border bg-card fixed top-0 right-0 left-[250px] z-30 flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-foreground text-xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher..."
            className="bg-secondary/50 focus:border-primary focus:bg-card w-64 border-transparent pl-9"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="text-muted-foreground h-5 w-5" />
          <span className="bg-primary absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" />
        </Button>
      </div>
    </header>
  )
}
