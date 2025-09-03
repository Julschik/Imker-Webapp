import { log, warn, error } from './log';

// Re-export types for convenience
export type {
  BaseEntity,
  User,
  Workspace,
  Membership,
  Standort,
  Volk,
  Durchsicht,
  Behandlung,
  SyncMeta
} from './_imker-database-client';

// Database interface for type safety
interface DatabaseInterface {
  users: any;
  workspaces: any;
  memberships: any;
  standorte: any;
  voelker: any;
  durchsichten: any;
  behandlungen: any;
  syncMeta: any;
  open(): Promise<void>;
}

// Dummy database for SSR
const createDummyDatabase = (): DatabaseInterface => ({
  users: { add: async () => {}, get: async () => null, toArray: async () => [] },
  workspaces: { add: async () => {}, get: async () => null, toArray: async () => [] },
  memberships: { add: async () => {}, get: async () => null, toArray: async () => [] },
  standorte: { add: async () => {}, get: async () => null, toArray: async () => [] },
  voelker: { add: async () => {}, get: async () => null, toArray: async () => [] },
  durchsichten: { add: async () => {}, get: async () => null, toArray: async () => [] },
  behandlungen: { add: async () => {}, get: async () => null, toArray: async () => [] },
  syncMeta: { add: async () => {}, get: async () => null, toArray: async () => [] },
  open: async () => {
    warn('Dexie', 'Database operations skipped on server-side');
  }
});

// Singleton-Instanz
let dbInstance: DatabaseInterface | null = null;

export async function getDbInstance(): Promise<DatabaseInterface> {
  // Server-side: Return dummy database
  if (typeof window === 'undefined') {
    warn('Dexie', 'Server-side detected, using dummy database');
    return createDummyDatabase();
  }

  // Client-side: Lazy load real database
  if (!dbInstance) {
    try {
      log('Dexie', 'Initializing client-side database');
      const { ImkerDatabase } = await import('./_imker-database-client');
      dbInstance = new ImkerDatabase();
      log('Dexie', 'Client-side database instance created');
    } catch (err) {
      error('Dexie', 'Failed to create database instance', err);
      // Fallback to dummy database on error
      dbInstance = createDummyDatabase();
    }
  }
  
  return dbInstance;
}

// Initialisierung mit Fehlerbehandlung und SSR-Schutz
export async function initDatabase(): Promise<void> {
  try {
    // Skip database initialization on server-side
    if (typeof window === 'undefined') {
      warn('Dexie', 'Database initialization skipped on server-side');
      return;
    }

    log('Dexie', 'Starting database initialization');
    const db = await getDbInstance();
    await db.open();
    log('Dexie', 'Database opened successfully');
    
    // Prüfe ob bereits Sync-Meta existiert (nur client-side)
    const syncMeta = await db.syncMeta.get('main');
    if (!syncMeta) {
      await db.syncMeta.add({
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