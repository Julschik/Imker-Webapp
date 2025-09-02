import Dexie, { Table } from 'dexie'
import type {
  User,
  Workspace,
  Membership,
  Standort,
  Queen,
  Volk,
  Durchsicht,
  Behandlung,
  KalenderEvent,
  FileRef
} from './schemas'

export class ImkerDatabase extends Dexie {
  users!: Table<User>
  workspaces!: Table<Workspace>
  memberships!: Table<Membership>
  standorte!: Table<Standort>
  queens!: Table<Queen>
  voelker!: Table<Volk>
  durchsichten!: Table<Durchsicht>
  behandlungen!: Table<Behandlung>
  kalenderEvents!: Table<KalenderEvent>
  fileRefs!: Table<FileRef>
  syncLog!: Table<{
    id: string
    entity: string
    entityId: string
    operation: 'create' | 'update' | 'delete'
    timestamp: Date
    deviceId: string
    synced: boolean
  }>

  constructor() {
    super('ImkerDatabase')
    
    this.version(1).stores({
      users: 'id, email, name, *roles',
      workspaces: 'id, name',
      memberships: 'id, userId, workspaceId, role',
      standorte: 'id, workspaceId, name, *tags, qrKey, nfcUid, deletedAt',
      queens: 'id, workspaceId, year, deletedAt',
      voelker: 'id, workspaceId, stocknr, standortId, koeniginId, *tags, qrKey, nfcUid, deletedAt',
      durchsichten: 'id, volkId, datum, deletedAt',
      behandlungen: 'id, datum, sperrBis, deletedAt',
      kalenderEvents: 'id, start, ende, scope, sourceEntity, deletedAt',
      fileRefs: 'id, storageKey, mime, createdAt',
      syncLog: 'id, entity, entityId, timestamp, synced'
    })
  }
}

export const db = new ImkerDatabase()

// Helper functions for common queries
export const dbHelpers = {
  async getActiveStandorte(workspaceId: string) {
    return await db.standorte
      .where('workspaceId')
      .equals(workspaceId)
      .and(item => !item.deletedAt)
      .toArray()
  },

  async getActiveVoelker(workspaceId: string) {
    return await db.voelker
      .where('workspaceId')
      .equals(workspaceId)
      .and(item => !item.deletedAt)
      .toArray()
  },

  async getVolkByQRKey(qrKey: string) {
    return await db.voelker
      .where('qrKey')
      .equals(qrKey)
      .and(item => !item.deletedAt)
      .first()
  },

  async getStandortByQRKey(qrKey: string) {
    return await db.standorte
      .where('qrKey')
      .equals(qrKey)
      .and(item => !item.deletedAt)
      .first()
  },

  async getDurchsichtenForVolk(volkId: string) {
    return await db.durchsichten
      .where('volkId')
      .equals(volkId)
      .and(item => !item.deletedAt)
      .reverse()
      .sortBy('datum')
  },

  async getBehandlungenForVolk(volkId: string) {
    return await db.behandlungen
      .where('scope.volkId')
      .equals(volkId)
      .and(item => !item.deletedAt)
      .reverse()
      .sortBy('datum')
  },

  async getActiveBehandlungen() {
    const now = new Date()
    return await db.behandlungen
      .where('sperrBis')
      .above(now)
      .and(item => !item.deletedAt)
      .toArray()
  },

  async addSyncLogEntry(entity: string, entityId: string, operation: 'create' | 'update' | 'delete') {
    const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID()
    if (!localStorage.getItem('deviceId')) {
      localStorage.setItem('deviceId', deviceId)
    }

    await db.syncLog.add({
      id: crypto.randomUUID(),
      entity,
      entityId,
      operation,
      timestamp: new Date(),
      deviceId,
      synced: false
    })
  }
}