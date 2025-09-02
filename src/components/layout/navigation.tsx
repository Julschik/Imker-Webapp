'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  MapPin, 
  Hexagon, 
  Eye, 
  FileText, 
  Calendar,
  QrCode,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Scannen', href: '/scan', icon: QrCode },
  { name: 'Standorte', href: '/standorte', icon: MapPin },
  { name: 'Völker', href: '/voelker', icon: Hexagon },
  { name: 'Durchsichten', href: '/durchsichten', icon: Eye },
  { name: 'TAMG', href: '/tamg', icon: FileText },
  { name: 'Kalender', href: '/kalender', icon: Calendar },
  { name: 'Einstellungen', href: '/settings', icon: Settings }
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 md:relative md:border-t-0 md:border-r md:w-64 md:h-screen">
      <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col md:flex-row items-center justify-center md:justify-start px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium transition-colors min-w-0 flex-1 md:flex-none',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-5 w-5 md:h-4 md:w-4 md:mr-3" />
              <span className="mt-1 md:mt-0 truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}