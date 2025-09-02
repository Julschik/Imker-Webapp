'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { db, dbHelpers } from '@/lib/database'
import { formatDate } from '@/lib/utils'
import { Plus, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Behandlung, Volk, Standort } from '@/lib/schemas'

interface BehandlungWithDetails extends Behandlung {
  volk?: Volk
  standort?: Standort
  isActive: boolean
}

export default function TAMGPage() {
  const { workspace } = useAuthStore()
  const [behandlungen, setBehandlungen] = useState<BehandlungWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (workspace) {
      loadBehandlungen()
    }
  }, [workspace])

  const loadBehandlungen = async () => {
    if (!workspace) return

    try {
      setLoading(true)
      
      // Get all behandlungen from last 365 days
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      const behandlungenData = await db.behandlungen
        .where('datum')
        .above(oneYearAgo)
        .and(item => !item.deletedAt)
        .reverse()
        .sortBy('datum')
      
      const voelker = await dbHelpers.getActiveVoelker(workspace.id)
      const standorte = await dbHelpers.getActiveStandorte(workspace.id)
      const now = new Date()
      
      // Enrich with volk/standort data and active status
      const enrichedBehandlungen = behandlungenData.map(behandlung => ({
        ...behandlung,
        volk: behandlung.scope.volkId ? voelker.find(v => v.id === behandlung.scope.volkId) : undefined,
        standort: behandlung.scope.standortId ? standorte.find(s => s.id === behandlung.scope.standortId) : undefined,
        isActive: behandlung.sperrBis > now
      }))

      setBehandlungen(enrichedBehandlungen)
    } catch (error) {
      console.error('Failed to load behandlungen:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (behandlung: BehandlungWithDetails) => {
    if (behandlung.isActive) {
      return (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Aktive Sperre</span>
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Abgelaufen</span>
        </Badge>
      )
    }
  }

  const getScopeLabel = (behandlung: BehandlungWithDetails) => {
    if (behandlung.scope.volkId && behandlung.volk) {
      return `Stock ${behandlung.volk.stocknr}`
    } else if (behandlung.scope.standortId && behandlung.standort) {
      return `Standort ${behandlung.standort.name}`
    } else if (behandlung.scope.workspace) {
      return 'Gesamtbetrieb'
    }
    return 'Unbekannt'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">TAMG Bestandsbuch</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const activeBehandlungen = behandlungen.filter(b => b.isActive)
  const expiredBehandlungen = behandlungen.filter(b => !b.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TAMG Bestandsbuch</h1>
          <p className="text-gray-600">
            {activeBehandlungen.length} aktive Sperren • {behandlungen.length} Behandlungen gesamt
          </p>
        </div>
        <Button asChild>
          <Link href="/tamg/new">
            <Plus className="h-4 w-4 mr-2" />
            Neue Behandlung
          </Link>
        </Button>
      </div>

      {/* Active Treatments Warning */}
      {activeBehandlungen.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Aktive Wartezeiten</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              {activeBehandlungen.length} Behandlung(en) mit aktiver Wartezeit. 
              Honiggewinnung ist bis zum Ablauf der Sperrfrist nicht erlaubt.
            </p>
            <div className="space-y-2">
              {activeBehandlungen.slice(0, 3).map((behandlung) => (
                <div key={behandlung.id} className="flex items-center justify-between text-sm">
                  <span>{getScopeLabel(behandlung)} - {behandlung.praep}</span>
                  <span className="font-medium">
                    bis {formatDate(behandlung.sperrBis)}
                  </span>
                </div>
              ))}
              {activeBehandlungen.length > 3 && (
                <div className="text-sm text-orange-600">
                  ... und {activeBehandlungen.length - 3} weitere
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {behandlungen.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Behandlungen vorhanden
            </h3>
            <p className="text-gray-600 mb-4">
              Dokumentieren Sie Ihre erste Behandlung gemäß TAMG.
            </p>
            <Button asChild>
              <Link href="/tamg/new">
                <Plus className="h-4 w-4 mr-2" />
                Erste Behandlung
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {behandlungen.map((behandlung) => (
            <Card key={behandlung.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {behandlung.praep}
                      </h3>
                      {getStatusBadge(behandlung)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Datum: {formatDate(behandlung.datum)}</span>
                        <span>Wirkstoff: {behandlung.wirkstoff}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span>Bereich: {getScopeLabel(behandlung)}</span>
                        <span>Dosis: {behandlung.dosis}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span>Behandler: {behandlung.behandler}</span>
                        <span>Wartezeit: {behandlung.wartezeitTage} Tage</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Sperre bis: {formatDate(behandlung.sperrBis)}</span>
                      </div>
                      
                      {behandlung.charge && (
                        <div className="text-xs text-gray-500">
                          Charge: {behandlung.charge}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button asChild size="sm">
                      <Link href={`/tamg/${behandlung.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}