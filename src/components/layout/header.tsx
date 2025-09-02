'use client'

import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { OfflineBanner } from '@/components/ui/offline-banner'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, workspace, logout } = useAuthStore()

  return (
    <div>
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Imker-Webapp
            </h1>
            {workspace && (
              <p className="text-sm text-gray-500">{workspace.name}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <OfflineBanner />
    </div>
  )
}