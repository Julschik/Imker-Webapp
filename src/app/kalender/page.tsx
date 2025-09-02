'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { db } from '@/lib/database'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Plus, Calendar, Clock, MapPin, Hexagon, FileText } from 'lucide-react'
import Link from 'next/link'
import type { KalenderEvent } from '@/lib/schemas'

export default function KalenderPage() {
  const { workspace } = useAuthStore()
  const [events, setEvents] = useState<KalenderEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (workspace) {
      loadEvents()
    }
  }, [workspace])

  const loadEvents = async () => {
    if (!workspace) return

    try {
      setLoading(true)
      
      // Get events from 30 days ago to 90 days in future
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const eventsData = await db.kalenderEvents
        .where('start')
        .above(thirtyDaysAgo)
        .and(item => !item.deletedAt)
        .sortBy('start')

      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'standort':
        return <MapPin className="h-4 w-4" />
      case 'volk':
        return <Hexagon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getScopeBadgeVariant = (scope: string) => {
    switch (scope) {
      case 'standort':
        return 'secondary' as const
      case 'volk':
        return 'default' as const
      default:
        return 'outline' as const
    }
  }

  const isUpcoming = (date: Date) => {
    return date > new Date()
  }

  const isPast = (date: Date) => {
    return date < new Date()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
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

  const upcomingEvents = events.filter(e => isUpcoming(e.start))
  const todayEvents = events.filter(e => isToday(e.start))
  const pastEvents = events.filter(e => isPast(e.start) && !isToday(e.start))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
          <p className="text-gray-600">{events.length} Termine</p>
        </div>
        <Button asChild>
          <Link href="/kalender/new">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Termin
          </Link>
        </Button>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Calendar className="h-5 w-5" />
              <span>Heute</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant={getScopeBadgeVariant(event.scope)} className="flex items-center space-x-1">
                    {getScopeIcon(event.scope)}
                    <span className="capitalize">{event.scope}</span>
                  </Badge>
                  <span className="font-medium">{event.title}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{event.start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Termine vorhanden
            </h3>
            <p className="text-gray-600 mb-4">
              Planen Sie Ihren ersten Termin, um zu beginnen.
            </p>
            <Button asChild>
              <Link href="/kalender/new">
                <Plus className="h-4 w-4 mr-2" />
                Ersten Termin anlegen
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Anstehende Termine ({upcomingEvents.length})
              </h2>
              <div className="grid gap-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            <Badge variant={getScopeBadgeVariant(event.scope)} className="flex items-center space-x-1">
                              {getScopeIcon(event.scope)}
                              <span className="capitalize">{event.scope}</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.start)}</span>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>
                                {event.start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                {event.ende && ` - ${event.ende.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
                              </span>
                            </div>
                            
                            {event.description && (
                              <p className="text-gray-600 mt-2">{event.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <Button asChild size="sm">
                          <Link href={`/kalender/${event.id}`}>
                            Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vergangene Termine ({pastEvents.length})
              </h2>
              <div className="grid gap-4">
                {pastEvents.slice(0, 10).map((event) => (
                  <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="flex items-center space-x-1">
                            {getScopeIcon(event.scope)}
                            <span className="capitalize">{event.scope}</span>
                          </Badge>
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.start)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pastEvents.length > 10 && (
                  <div className="text-center text-gray-500 text-sm">
                    ... und {pastEvents.length - 10} weitere vergangene Termine
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}