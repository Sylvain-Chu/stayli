import type React from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stayli - Gestion Locative',
  description: 'Application SaaS de gestion locative immobilière',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        <SessionProvider>
          <SWRProvider>
            {children}
            <Toaster />
          </SWRProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
