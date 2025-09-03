import { warn, log, error } from '@/utils/log';

const isBrowser = typeof window !== 'undefined';
let db: any = null;

export function getDB() {
  if (!isBrowser) {
    warn('Dexie', 'getDB() auf Server aufgerufen – return null (SSR)');
    return null;
  }
  if (db) return db;
  // Lazy require nur im Browser, verhindert SSR-Eval
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Dexie } = require('dexie') as { Dexie: typeof import('dexie').Dexie };
  db = new Dexie('imker');
  // TODO: Stores hier definieren, nicht top-level
  // @ts-ignore
  db.version(1).stores({
    // example: voelker: 'id, standortId, stocknr'
  });
  log('Dexie', 'DB initialisiert');
  return db;
}

export function createBroadcastChannel(name: string): BroadcastChannel | null {
  if (!isBrowser) {
    warn('Dexie', `BroadcastChannel(${name}) auf Server – return null`);
    return null;
  }
  try {
    // @ts-ignore
    return new BroadcastChannel(name);
  } catch (e: any) {
    error('Dexie', 'BroadcastChannel fehlgeschlagen', { message: e?.message });
    return null;
  }
}

// Initialisierung mit Fehlerbehandlung und SSR-Schutz
export async function initDatabase(): Promise<void> {
  try {
    // Skip database initialization on server-side
    if (!isBrowser) {
      warn('Dexie', 'Database initialization skipped on server-side');
      return;
    }

    log('Dexie', 'Starting database initialization');
    const db = getDB();
    if (!db) {
      warn('Dexie', 'Database not available, skipping initialization');
      return;
    }
    
    await db.open();
    log('Dexie', 'Database opened successfully');
    
    // Prüfe ob bereits Sync-Meta existiert (nur client-side)
    const syncMeta = await db.syncMeta?.get('main');
    if (!syncMeta) {
      await db.syncMeta?.add({
        id: 'main',
        cursor: '0',
        lastSync: new Date(0),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      log('Dexie', 'Initial sync meta created');
    } else {
      log('Dexie', 'Sync meta already exists');
    }
  } catch (err) {
    error('Dexie', 'Failed to initialize database', err);
    warn('Dexie', 'Database functionality will be limited');
    // Don't throw error - let app continue with limited functionality
  }
}