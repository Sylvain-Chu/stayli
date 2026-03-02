import type React from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: 'Stayli - Logiciel de Gestion de Locations Saisonnières',
    description:
      'Gérez vos propriétés, réservations, clients et factures en un seul endroit. Stayli simplifie la gestion locative saisonnière pour les propriétaires et agences.',
  }
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
