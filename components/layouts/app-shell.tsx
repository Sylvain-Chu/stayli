import type React from 'react'
import { Sidebar } from '../layout/sidebar'
import { Header } from '../layout/header'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <Header title={title} />
      <main className="ml-[250px] pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
