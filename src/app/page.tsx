'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { db, dbHelpers } from '@/lib/database'
import { syncManager } from '@/lib/sync'
import { 
  Hexagon, 
  MapPin, 
  Eye, 
  AlertTriangle, 
  Calendar,
  QrCode,
  FileText,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import type { Volk, Standort, Durchsicht, Behandlung } from '@/lib/schemas'

export default function Dashboard() {
  const { user, workspace, isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState({
    voelker: 0,
    standorte: 0,
    durchsichten: 0,
    activeBehandlungen: 0
  })
  const [recentActivity, setRecentActivity] = useState<{
    durchsichten: Durchsicht[]
    behandlungen: Behandlung[]
  }>({
    durchsichten: [],
    behandlungen: []
  })

  useEffect(() => {
    if (!isAuthenticated || !workspace) return

    loadDashboardData()
  }, [isAuthenticated, workspace])

  const loadDashboardData = async () => {
    if (!workspace) return

    try {
      // Load statistics
      const voelker = await dbHelpers.getActiveVoelker(workspace.id)
      const standorte = await dbHelpers.getActiveStandorte(workspace.id)
      const activeBehandlungen = await dbHelpers.getActiveBehandlungen()
      
      // Get recent durchsichten (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const recentDurchsichten = await db.durchsichten
        .where('datum')
        .above(weekAgo)
        .and(item => !item.deletedAt)
        .reverse()
        .sortBy('datum')

      const recentBehandlungen = await db.behandlungen
        .where('datum')
        .above(weekAgo)
        .and(item => !item.deletedAt)
        .reverse()
        .sortBy('datum')

      setStats({
        voelker: voelker.length,
        standorte: standorte.length,
        durchsichten: recentDurchsichten.length,
        activeBehandlungen: activeBehandlungen.length
      })

      setRecentActivity({
        durchsichten: recentDurchsichten.slice(0, 5),
        behandlungen: recentBehandlungen.slice(0, 5)
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const handleSync = async () => {
    try {
      await syncManager.sync()
      await loadDashboardData()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Willkommen zur Imker-Webapp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Bitte melden Sie sich an, um fortzufahren.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Anmelden</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Willkommen, {user?.name}
          </h1>
          <p className="text-gray-600">
            {workspace?.name} • {new Date().toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <Button onClick={handleSync} variant="outline">
          Synchronisieren
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild className="h-20 flex-col space-y-2">
          <Link href="/scan">
            <QrCode className="h-6 w-6" />
            <span>Scannen</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col space-y-2">
          <Link href="/durchsichten/new">
            <Eye className="h-6 w-6" />
            <span>Durchsicht</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col space-y-2">
          <Link href="/tamg/new">
            <FileText className="h-6 w-6" />
            <span>Behandlung</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col space-y-2">
          <Link href="/kalender">
            <Calendar className="h-6 w-6" />
            <span>Kalender</span>
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hexagon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.voelker}</p>
                <p className="text-sm text-gray-600">Völker</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.standorte}</p>
                <p className="text-sm text-gray-600">Standorte</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.durchsichten}</p>
                <p className="text-sm text-gray-600">Durchsichten (7T)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeBehandlungen}</p>
                <p className="text-sm text-gray-600">Aktive Sperren</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Letzte Durchsichten</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.durchsichten.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.durchsichten.map((durchsicht) => (
                  <div key={durchsicht.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Volk {durchsicht.volkId.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {durchsicht.datum.toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Stärke {durchsicht.volksstaerke}/10
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Keine Durchsichten in den letzten 7 Tagen
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Letzte Behandlungen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.behandlungen.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.behandlungen.map((behandlung) => (
                  <div key={behandlung.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{behandlung.praep}</p>
                      <p className="text-sm text-gray-600">
                        {behandlung.datum.toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Badge variant={behandlung.sperrBis > new Date() ? 'destructive' : 'outline'}>
                      {behandlung.sperrBis > new Date() ? 'Aktiv' : 'Abgelaufen'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Keine Behandlungen in den letzten 7 Tagen
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}