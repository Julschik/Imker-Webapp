'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { dbHelpers } from '@/lib/database'
import { Plus, MapPin, Hexagon, FileText, QrCode } from 'lucide-react'
import Link from 'next/link'
import type { Standort, Volk } from '@/lib/schemas'

interface StandortWithDetails extends Standort {
  voelkerCount: number
}

export default function StandortePage() {
  const { workspace } = useAuthStore()
  const [standorte, setStandorte] = useState<StandortWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (workspace) {
      loadStandorte()
    }
  }, [workspace])

  const loadStandorte = async () => {
    if (!workspace) return

    try {
      setLoading(true)
      const standorteData = await dbHelpers.getActiveStandorte(workspace.id)
      const voelker = await dbHelpers.getActiveVoelker(workspace.id)
      
      // Count völker per standort
      const enrichedStandorte = standorteData.map(standort => ({
        ...standort,
        voelkerCount: voelker.filter(v => v.standortId === standort.id).length
      }))

      setStandorte(enrichedStandorte)
    } catch (error) {
      console.error('Failed to load standorte:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Standorte</h1>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Standorte</h1>
          <p className="text-gray-600">{standorte.length} Standorte</p>
        </div>
        <Button asChild>
          <Link href="/standorte/new">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Standort
          </Link>
        </Button>
      </div>

      {standorte.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Standorte vorhanden
            </h3>
            <p className="text-gray-600 mb-4">
              Legen Sie Ihren ersten Standort an, um zu beginnen.
            </p>
            <Button asChild>
              <Link href="/standorte/new">
                <Plus className="h-4 w-4 mr-2" />
                Ersten Standort anlegen
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {standorte.map((standort) => (
            <Card key={standort.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{standort.name}</h3>
                      {standort.qrKey && (
                        <Badge variant="outline" className="text-xs">
                          <QrCode className="h-3 w-3 mr-1" />
                          QR
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {standort.address.strasse && `${standort.address.strasse}, `}
                          {standort.address.plz} {standort.address.ort}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Hexagon className="h-4 w-4" />
                        <span>{standort.voelkerCount} Völker</span>
                      </div>
                      
                      {standort.wasserquelle && (
                        <div className="text-xs text-gray-500">
                          Wasserquelle: {standort.wasserquelle}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {standort.genehmigungen.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {standort.genehmigungen.length} Dok.
                      </Badge>
                    )}
                    
                    <Button asChild size="sm">
                      <Link href={`/standorte/${standort.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {standort.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {standort.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {standort.geo && (
                  <div className="mt-3 text-xs text-gray-500">
                    GPS: {standort.geo.lat.toFixed(6)}, {standort.geo.lng.toFixed(6)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}