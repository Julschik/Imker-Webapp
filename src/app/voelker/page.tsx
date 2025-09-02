'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { useAuthStore } from '@/lib/store'
import { dbHelpers } from '@/lib/database'
import { Plus, Hexagon, MapPin, Crown, QrCode } from 'lucide-react'
import Link from 'next/link'
import type { Volk, Standort, Queen } from '@/lib/schemas'

interface VolkWithDetails extends Volk {
  standort?: Standort
  queen?: Queen
}

export default function VoelkerPage() {
  const { workspace } = useAuthStore()
  const [voelker, setVoelker] = useState<VolkWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (workspace) {
      loadVoelker()
    }
  }, [workspace])

  const loadVoelker = async () => {
    if (!workspace) return

    try {
      setLoading(true)
      const voelkerData = await dbHelpers.getActiveVoelker(workspace.id)
      const standorte = await dbHelpers.getActiveStandorte(workspace.id)
      
      // Enrich with standort and queen data
      const enrichedVoelker = await Promise.all(
        voelkerData.map(async (volk) => {
          const standort = standorte.find(s => s.id === volk.standortId)
          let queen = undefined
          
          if (volk.koeniginId) {
            queen = await dbHelpers.getCurrentQueen(volk.id)
          }
          
          return {
            ...volk,
            standort,
            queen
          }
        })
      )

      setVoelker(enrichedVoelker)
    } catch (error) {
      console.error('Failed to load völker:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Völker</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Völker</h1>
          <p className="text-gray-600">{voelker.length} Völker</p>
        </div>
        <Button asChild>
          <Link href="/voelker/new">
            <Plus className="h-4 w-4 mr-2" />
            Neues Volk
          </Link>
        </Button>
      </div>

      {voelker.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Hexagon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Völker vorhanden
            </h3>
            <p className="text-gray-600 mb-4">
              Legen Sie Ihr erstes Volk an, um zu beginnen.
            </p>
            <Button asChild>
              <Link href="/voelker/new">
                <Plus className="h-4 w-4 mr-2" />
                Erstes Volk anlegen
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {voelker.map((volk) => (
            <Card key={volk.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Stock-Nr. {volk.stocknr}
                      </h3>
                      {volk.qrKey && (
                        <Badge variant="outline" className="text-xs">
                          <QrCode className="h-3 w-3 mr-1" />
                          QR
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{volk.standort?.name || 'Unbekannter Standort'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span>Beute: {volk.beute}</span>
                        <span>Rahmen: {volk.rahmenmass}</span>
                      </div>
                      
                      {volk.queen && (
                        <div className="flex items-center space-x-2">
                          <Crown className="h-4 w-4" />
                          <span>Königin {volk.queen.year}</span>
                          {volk.queen.marking && (
                            <Badge variant="outline" className="text-xs">
                              {volk.queen.marking}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Brut</div>
                        <StatusBadge status={volk.status.brut} />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Futter</div>
                        <StatusBadge status={volk.status.futter} />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Varroa</div>
                        <StatusBadge status={volk.status.varroa} />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Platz</div>
                        <StatusBadge status={volk.status.platz} />
                      </div>
                    </div>
                    
                    <Button asChild size="sm" className="mt-2">
                      <Link href={`/voelker/${volk.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {volk.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {volk.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
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