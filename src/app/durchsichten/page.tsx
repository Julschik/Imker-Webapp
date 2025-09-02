'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { db, dbHelpers } from '@/lib/database'
import { formatDate } from '@/lib/utils'
import { Plus, Eye, Hexagon, CheckCircle, XCircle, Mic } from 'lucide-react'
import Link from 'next/link'
import type { Durchsicht, Volk } from '@/lib/schemas'

interface DurchsichtWithVolk extends Durchsicht {
  volk?: Volk
}

export default function DurchsichtenPage() {
  const { workspace } = useAuthStore()
  const [durchsichten, setDurchsichten] = useState<DurchsichtWithVolk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (workspace) {
      loadDurchsichten()
    }
  }, [workspace])

  const loadDurchsichten = async () => {
    if (!workspace) return

    try {
      setLoading(true)
      
      // Get all durchsichten from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const durchsichtenData = await db.durchsichten
        .where('datum')
        .above(thirtyDaysAgo)
        .and(item => !item.deletedAt)
        .reverse()
        .sortBy('datum')
      
      const voelker = await dbHelpers.getActiveVoelker(workspace.id)
      
      // Enrich with volk data
      const enrichedDurchsichten = durchsichtenData.map(durchsicht => ({
        ...durchsicht,
        volk: voelker.find(v => v.id === durchsicht.volkId)
      }))

      setDurchsichten(enrichedDurchsichten)
    } catch (error) {
      console.error('Failed to load durchsichten:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCheckIcon = (checked: boolean) => {
    return checked ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Durchsichten</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Durchsichten</h1>
          <p className="text-gray-600">{durchsichten.length} Durchsichten (30 Tage)</p>
        </div>
        <Button asChild>
          <Link href="/durchsichten/new">
            <Plus className="h-4 w-4 mr-2" />
            Neue Durchsicht
          </Link>
        </Button>
      </div>

      {durchsichten.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Durchsichten vorhanden
            </h3>
            <p className="text-gray-600 mb-4">
              Führen Sie Ihre erste Durchsicht durch, um zu beginnen.
            </p>
            <Button asChild>
              <Link href="/durchsichten/new">
                <Plus className="h-4 w-4 mr-2" />
                Erste Durchsicht
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {durchsichten.map((durchsicht) => (
            <Card key={durchsicht.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {formatDate(durchsicht.datum)}
                      </h3>
                      <Badge variant="outline">
                        <Hexagon className="h-3 w-3 mr-1" />
                        Stock {durchsicht.volk?.stocknr || 'Unbekannt'}
                      </Badge>
                      {durchsicht.sprachmemoFile && (
                        <Badge variant="secondary" className="text-xs">
                          <Mic className="h-3 w-3 mr-1" />
                          Audio
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(durchsicht.checks.koenigin)}
                        <span className="text-sm">Königin</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(durchsicht.checks.stifte)}
                        <span className="text-sm">Stifte</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(durchsicht.checks.larven)}
                        <span className="text-sm">Larven</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(durchsicht.checks.verdeckelte)}
                        <span className="text-sm">Verdeckelte</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>Stärke: {durchsicht.volksstaerke}/10</span>
                      {durchsicht.futter && (
                        <span>Futter: {durchsicht.futter}</span>
                      )}
                      {durchsicht.verhalten && (
                        <span>Verhalten: {durchsicht.verhalten}</span>
                      )}
                    </div>
                    
                    {durchsicht.followUps.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Folgeaufgaben: </span>
                        <span className="text-sm">{durchsicht.followUps.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="text-right text-sm text-gray-500">
                      Waben: {durchsicht.wabenZaehlen.brut + durchsicht.wabenZaehlen.futter + durchsicht.wabenZaehlen.leer}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/durchsichten/${durchsicht.id}`}>
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