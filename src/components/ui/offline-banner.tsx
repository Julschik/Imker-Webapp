'use client'

import { useAppStore } from '@/lib/store'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineBanner() {
  const { isOffline, syncStatus, lastSync } = useAppStore()

  if (!isOffline && syncStatus === 'idle') {
    return null
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOffline ? (
            <WifiOff className="h-4 w-4 text-yellow-600" />
          ) : (
            <Wifi className="h-4 w-4 text-yellow-600" />
          )}
          <span className="text-sm text-yellow-800">
            {isOffline ? 'Offline-Modus' : 'Synchronisierung läuft...'}
          </span>
        </div>
        {lastSync && (
          <span className="text-xs text-yellow-600">
            Letzte Sync: {lastSync.toLocaleTimeString('de-DE')}
          </span>
        )}
      </div>
    </div>
  )
}