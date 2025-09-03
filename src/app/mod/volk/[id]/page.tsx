'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Hexagon, MapPin, Calendar, Plus, ArrowLeft } from 'lucide-react';
import { db, Volk, Standort } from '@/lib/db';
import { log } from '@/utils/log';
import Link from 'next/link';

export default function VolkPage() {
  const params = useParams();
  const router = useRouter();
  const [volk, setVolk] = useState<Volk | null>(null);
  const [standort, setStandort] = useState<Standort | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVolk = async () => {
      try {
        const stocknr = params.id as string;
        log('volk', 'Lade Volk mit Stock-Nr:', stocknr);

        // Suche nach Stock-Nr oder QR-Key
        let foundVolk = await db.voelker
          .where('stocknr')
          .equals(stocknr)
          .first();

        if (!foundVolk) {
          foundVolk = await db.voelker
            .where('qrKey')
            .equals(`volk-${stocknr}`)
            .first();
        }

        if (foundVolk) {
          setVolk(foundVolk);
          
          // Standort laden
          const foundStandort = await db.standorte.get(foundVolk.standortId);
          setStandort(foundStandort || null);
          
          log('volk', 'Volk geladen:', foundVolk);
        } else {
          log('volk', 'Volk nicht gefunden:', stocknr);
        }
      } catch (error) {
        log('volk', 'Fehler beim Laden:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVolk();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Stockkarte...</p>
        </div>
      </div>
    );
  }

  if (!volk) {
    return (
      <div className="text-center py-12">
        <Hexagon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Volk nicht gefunden
        </h2>
        <p className="text-gray-600 mb-6">
          Stock-Nr. {params.id} existiert nicht in der Datenbank
        </p>
        <Link href="/mod/scan">
          <Button>
            Zurück zum Scanner
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Hexagon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Stock {volk.stocknr}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {standort?.name || 'Unbekannter Standort'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Status-Übersicht</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatusBadge status={volk.status.brut} label="Brut" />
              <StatusBadge status={volk.status.futter} label="Futter" />
              <StatusBadge status={volk.status.varroa} label="Varroa" />
              <StatusBadge status={volk.status.platz} label="Platz" />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Beute</h3>
            <p className="text-gray-600">{volk.beute}</p>
          </div>

          <div className="flex gap-3">
            <Link href={`/mod/durchsicht?volkId=${volk.id}`} className="flex-1">
              <Button className="w-full flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neue Durchsicht
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Historie
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">
          QR-Code: {volk.qrKey}
        </h3>
        <p className="text-sm text-gray-600">
          Letzte Aktualisierung: {volk.updatedAt.toLocaleDateString('de-DE')}
        </p>
      </div>
    </div>
  );
}