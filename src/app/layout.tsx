import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Navigation } from '@/components/layout/navigation'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Imker-Webapp',
  description: 'Offline-first Betriebsführung für Imker',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex">
            <Navigation />
            <main className="flex-1 p-4 pb-20 md:pb-4">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}