'use client'

import type React from 'react'
import { useState, createContext, useContext } from 'react'
import { Sidebar } from '../layout/sidebar'
import { Header } from '../layout/header'
import { useIsMobile } from '@/hooks/use-mobile'

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggle = () => setIsSidebarOpen((prev) => !prev)
  const close = () => setIsSidebarOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen: isSidebarOpen, toggle, close }}>
      <div className="bg-background min-h-screen">
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 transition-opacity"
            onClick={close}
            aria-hidden="true"
          />
        )}

        <Sidebar isMobile={isMobile} isOpen={isSidebarOpen} onClose={close} />
        <Header title={title} isMobile={isMobile} onMenuClick={toggle} />

        <main className={`pt-16 transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-[250px]'}`}>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
