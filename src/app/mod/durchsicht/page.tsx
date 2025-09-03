'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Eye, Save, ArrowLeft } from 'lucide-react';
import { getDB } from '@/lib/db';
import { Volk, Durchsicht } from '@/lib/types';
import { log } from '@/utils/log';

export default function DurchsichtPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const volkId = searchParams.get('volkId');

  const [volk, setVolk] = useState<Volk | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formular-State
  const [checks, setChecks] = useState({
    königin: false,
    stifte: false,
    larven: false,
    verdeckelte: false
  });
  const [volksstaerke, setVolksstaerke] = useState([5]);
  const [notizen, setNotizen] = useState('');

  useEffect(() => {
    const loadVolk = async () => {
      if (!volkId) {
        log('durchsicht', 'Keine Volk-ID angegeben');
        setLoading(false);
        return;
      }

      try {
        const db = getDB();
        const foundVolk = await db.voelker.get(volkId);
        if (foundVolk) {
          setVolk(foundVolk);
          log('durchsicht', 'Volk für Durchsicht geladen:', foundVolk.stocknr);
        } else {
          log('durchsicht', 'Volk nicht gefunden:', volkId);
        }
      } catch (error) {
        log('durchsicht', 'Fehler beim Laden:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVolk();
  }, [volkId]);

  const handleCheckChange = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!volk) return;

    setSaving(true);
    try {
      const db = getDB();
      const durchsicht: Durchsicht = {
        id: `durchsicht-${Date.now()}`,
        volkId: volk.id,
        datum: new Date(),
        checks,
        volksstaerke: volksstaerke[0],
        notizen,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.durchsichten.add(durchsicht);
      log('durchsicht', 'Durchsicht gespeichert:', durchsicht);

      // Zurück zur Stockkarte
      router.push(`/mod/volk/${volk.stocknr}`);
    } catch (error) {
      log('durchsicht', 'Fehler beim Speichern:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Durchsicht...</p>
        </div>
      </div>
    );
  }

  if (!volk) {
    return (
      <div className="text-center py-12">
        <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Volk nicht gefunden
        </h2>
        <p className="text-gray-600 mb-6">
          Bitte wählen Sie ein gültiges Volk für die Durchsicht
        </p>
        <Link href="/mod/scan">
          <Button>
            Zum Scanner
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
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Durchsicht - Stock {volk.stocknr}
          </CardTitle>
          <CardDescription>
            Schnelle Erfassung der Volkskontrolle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Brutkontrolle</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(checks).map(([key, checked]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckChange(key as keyof typeof checks)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="capitalize font-medium">
                    {key === 'königin' ? 'Königin gesehen' :
                     key === 'stifte' ? 'Stifte vorhanden' :
                     key === 'larven' ? 'Larven vorhanden' :
                     'Verdeckelte Brut'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              Volksstärke: {volksstaerke[0]}/10
            </h3>
            <Slider
              value={volksstaerke}
              onValueChange={setVolksstaerke}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Schwach</span>
              <span>Stark</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Notizen</h3>
            <Textarea
              placeholder="Besonderheiten, Auffälligkeiten..."
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichere...' : 'Durchsicht speichern'}
          </Button>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">
          Offline-Speicherung
        </h3>
        <p className="text-sm text-green-700">
          Die Durchsicht wird lokal gespeichert und später synchronisiert, 
          wenn eine Internetverbindung verfügbar ist.
        </p>
      </div>
    </div>
  );
}