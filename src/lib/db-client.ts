'use client';

import Dexie, { Table } from 'dexie';
import { Volk, Durchsicht, Standort } from './types';
import { log } from '@/utils/log';

export class ImkerDB extends Dexie {
  voelker!: Table<Volk>;
  durchsichten!: Table<Durchsicht>;
  standorte!: Table<Standort>;

  constructor() {
    super('ImkerDB');
    this.version(1).stores({
      voelker: 'id, stocknr, standortId, qrKey',
      durchsichten: 'id, volkId, datum',
      standorte: 'id, name, qrKey'
    });
  }
}

// Mock-Daten für Demo
export async function initMockData(db: ImkerDB) {
  const standorteCount = await db.standorte.count();
  if (standorteCount > 0) return; // Bereits initialisiert

  log('db-client', 'Initialisiere Mock-Daten');

  const now = new Date();

  // Standorte erstellen
  const standorte: Standort[] = [
    {
      id: 'standort-1',
      name: 'Heimstand',
      adresse: 'Musterstraße 1, 12345 Musterstadt',
      geo: { lat: 49.0069, lng: 8.4037 },
      qrKey: 'standort-heimstand',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'standort-2',
      name: 'Wanderstand Raps',
      adresse: 'Feldweg 5, 12346 Nachbarort',
      geo: { lat: 49.0169, lng: 8.4137 },
      qrKey: 'standort-raps',
      createdAt: now,
      updatedAt: now
    }
  ];

  // Völker erstellen
  const voelker: Volk[] = [
    {
      id: 'volk-1',
      stocknr: '001',
      standortId: 'standort-1',
      beute: 'Dadant 12er',
      status: { brut: 'grün', futter: 'grün', varroa: 'gelb', platz: 'grün' },
      qrKey: 'volk-001',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'volk-2',
      stocknr: '002',
      standortId: 'standort-1',
      beute: 'Dadant 12er',
      status: { brut: 'grün', futter: 'gelb', varroa: 'grün', platz: 'gelb' },
      qrKey: 'volk-002',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'volk-3',
      stocknr: '003',
      standortId: 'standort-1',
      beute: 'Zander 10er',
      status: { brut: 'rot', futter: 'rot', varroa: 'rot', platz: 'rot' },
      qrKey: 'volk-003',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'volk-4',
      stocknr: '101',
      standortId: 'standort-2',
      beute: 'Dadant 12er',
      status: { brut: 'grün', futter: 'grün', varroa: 'grün', platz: 'grün' },
      qrKey: 'volk-101',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'volk-5',
      stocknr: '102',
      standortId: 'standort-2',
      beute: 'Dadant 12er',
      status: { brut: 'gelb', futter: 'grün', varroa: 'gelb', platz: 'grün' },
      qrKey: 'volk-102',
      createdAt: now,
      updatedAt: now
    }
  ];

  await db.standorte.bulkAdd(standorte);
  await db.voelker.bulkAdd(voelker);
  
  log('db-client', 'Mock-Daten erfolgreich initialisiert');
}