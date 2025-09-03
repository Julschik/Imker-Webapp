'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Hexagon, MapPin, Eye } from 'lucide-react';
import { getDB, Volk, Standort } from '@/lib/db';
import { log } from '@/utils/log';
import Link from 'next/link';

interface VolkWithStandort extends Volk {
  standortName: string;
}

export default function VoelkerPage() {
  const [voelker, setVoelker] = useState<VolkWithStandort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoelker = async () => {
      try {
        const db = getDB();
        const allVoelker = await db.voelker.toArray();
        const allStandorte = await db.standorte.toArray();
        
        const voelkerWithStandort: VolkWithStandort[] = allVoelker.map(volk => {
          const standort = allStandorte.find(s => s.id === volk.standortId);
          return {
            ...volk,
            standortName: standort?.name || 'Unbekannt'
          };
        });

        setVoelker(voelkerWithStandort);
        log('voelker', 'Völker geladen:', voelkerWithStandort.length);
      } catch (error) {
        log('voelker', 'Fehler beim Laden:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVoelker();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Völker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Völker-Übersicht
        </h2>
        <p className="text-gray-600">
          Alle Bienenvölker mit aktuellem Status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {voelker.map((volk) => (
          <Card key={volk.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Hexagon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Stock {volk.stocknr}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {volk.standortName}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <StatusBadge status={volk.status.brut} label="Brut" className="text-xs" />
                <StatusBadge status={volk.status.futter} label="Futter" className="text-xs" />
                <StatusBadge status={volk.status.varroa} label="Varroa" className="text-xs" />
                <StatusBadge status={volk.status.platz} label="Platz" className="text-xs" />
              </div>

              <div className="text-sm text-gray-600">
                <strong>Beute:</strong> {volk.beute}
              </div>

              <div className="flex gap-2">
                <Link href={`/mod/volk/${volk.stocknr}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Stockkarte
                  </Button>
                </Link>
                <Link href={`/mod/durchsicht?volkId=${volk.id}`} className="flex-1">
                  <Button size="sm" className="w-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Durchsicht
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {voelker.length === 0 && (
        <div className="text-center py-12">
          <Hexagon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Keine Völker vorhanden
          </h3>
          <p className="text-gray-600">
            Fügen Sie Ihr erstes Bienenvolk hinzu
          </p>
        </div>
      )}
    </div>
  );
}