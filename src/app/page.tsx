'use client';

import { useEffect } from 'react';
import { ModuleCard } from '@/components/ui/module-card';
import { getEnabledModules } from '@/lib/registry';
import { initMockData } from '@/lib/db';
import { log } from '@/utils/log';

export default function Dashboard() {
  const modules = getEnabledModules();

  useEffect(() => {
    const initApp = async () => {
      try {
        await initMockData();
        log('dashboard', 'Mock-Daten initialisiert');
      } catch (error) {
        log('dashboard', 'Fehler beim Initialisieren:', error);
      }
    };

    initApp();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard
        </h2>
        <p className="text-gray-600">
          Wählen Sie ein Modul für die Bienenstockverwaltung
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          Offline-first Funktionalität
        </h3>
        <p className="text-sm text-blue-700">
          Alle Daten werden lokal in IndexedDB gespeichert. Die App funktioniert 
          vollständig offline und synchronisiert später bei Internetverbindung.
        </p>
      </div>
    </div>
  );
}