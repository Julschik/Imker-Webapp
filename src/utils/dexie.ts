import Dexie, { Table } from 'dexie';
import { log, error } from './log';

// Basis-Typen für alle Entitäten
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
  deletedAt?: Date;
}

// Kern-Entitäten für MVP
export interface User extends BaseEntity {
  email: string;
  name: string;
  roles: string[];
  twofaEnabled: boolean;
}

export interface Workspace extends BaseEntity {
  name: string;
}

export interface Membership extends BaseEntity {
  userId: string;
  workspaceId: string;
  role: 'admin' | 'editor' | 'viewer' | 'helfer';
}

export interface Standort extends BaseEntity {
  workspaceId: string;
  name: string;
  address: {
    strasse?: string;
    plz?: string;
    ort?: string;
    land?: string;
  };
  geo?: {
    lat: number;
    lng: number;
    geohash?: string;
  };
  wasserquelle?: string;
  tags: string[];
  qrKey?: string;
  nfcUid?: string;
}

export interface Volk extends BaseEntity {
  workspaceId: string;
  stocknr: string;
  standortId: string;
  beute?: string;
  rahmenmass?: string;
  herkunft?: string;
  koeniginId?: string;
  status: {
    brut: 'gut' | 'mittel' | 'schlecht';
    futter: 'gut' | 'mittel' | 'schlecht';
    varroa: 'gut' | 'mittel' | 'schlecht';
    platz: 'gut' | 'mittel' | 'schlecht';
  };
  tags: string[];
  qrKey?: string;
  nfcUid?: string;
}

export interface Durchsicht extends BaseEntity {
  volkId: string;
  datum: Date;
  checks: {
    koenigin: boolean;
    stifte: boolean;
    larven: boolean;
    verdeckelte: boolean;
  };
  pollen?: boolean;
  futter?: boolean;
  verhalten?: string;
  wabenZaehlen?: {
    brut: number;
    futter: number;
    leer: number;
  };
  volksstaerke?: number; // 0-10
  sprachmemoFileId?: string;
  transkriptFileId?: string;
  followUps: string[];
}

export interface Behandlung extends BaseEntity {
  scope: {
    volkId?: string;
    standortId?: string;
    workspace?: boolean;
  };
  datum: Date;
  praep: string;
  wirkstoff: string;
  charge?: string;
  dosis: string;
  methode?: string;
  wartezeitTage: number;
  behandler: string;
  quelle?: string;
  belegRefId?: string;
  sperrBis: Date;
}

// Sync-Metadaten
export interface SyncMeta extends BaseEntity {
  cursor: string;
  lastSync: Date;
}

export class ImkerDatabase extends Dexie {
  users!: Table<User>;
  workspaces!: Table<Workspace>;
  memberships!: Table<Membership>;
  standorte!: Table<Standort>;
  voelker!: Table<Volk>;
  durchsichten!: Table<Durchsicht>;
  behandlungen!: Table<Behandlung>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super('ImkerDatabase');
    
    this.version(1).stores({
      users: 'id, email, name, updatedAt',
      workspaces: 'id, name, updatedAt',
      memberships: 'id, userId, workspaceId, role, updatedAt',
      standorte: 'id, workspaceId, name, updatedAt',
      voelker: 'id, workspaceId, standortId, stocknr, updatedAt',
      durchsichten: 'id, volkId, datum, updatedAt',
      behandlungen: 'id, datum, sperrBis, updatedAt',
      syncMeta: 'id, cursor, lastSync'
    });

    log('Dexie', 'Database schema initialized');
  }
}

// Lazy singleton-Instanz
let dbInstance: ImkerDatabase | null = null;

export function getDbInstance(): ImkerDatabase {
  if (!dbInstance) {
    dbInstance = new ImkerDatabase();
  }
  return dbInstance;
}

// Initialisierung mit Fehlerbehandlung
export async function initDatabase(): Promise<void> {
  try {
    const db = getDbInstance();
    await db.open();
    log('Dexie', 'Database opened successfully');
    
    // Prüfe ob bereits Sync-Meta existiert
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
    }
  } catch (err) {
    error('Dexie', 'Failed to initialize database', err);
    throw new Error('Database initialization failed');
  }
}