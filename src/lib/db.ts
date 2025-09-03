'use client';

import { log } from '@/utils/log';

// Client-only DB instance
let dbInstance: any = null;

export async function getDB() {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be accessed on the client side');
  }
  
  if (!dbInstance) {
    try {
      const { ImkerDB, initMockData } = await import('./db-client');
      dbInstance = new ImkerDB();
      await initMockData(dbInstance);
      log('db', 'Datenbank initialisiert');
    } catch (error) {
      log('db', 'Fehler beim Initialisieren der Datenbank:', error);
      throw error;
    }
  }
  
  return dbInstance;
}