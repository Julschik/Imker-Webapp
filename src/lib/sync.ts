import { db, dbHelpers } from './database'
import { useAppStore } from './store'

interface SyncResponse {
  changes: Array<{
    entity: string
    id: string
    operation: 'create' | 'update' | 'delete'
    data?: any
    timestamp: string
  }>
  cursor: string
}

interface PushData {
  changes: Array<{
    entity: string
    id: string
    operation: 'create' | 'update' | 'delete'
    data?: any
    timestamp: string
  }>
  idempotencyKey: string
}

class SyncManager {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  private lastCursor: string | null = null

  async pull(): Promise<void> {
    try {
      const cursor = this.lastCursor || localStorage.getItem('syncCursor') || '0'
      const response = await fetch(`${this.baseUrl}/sync/pull?cursor=${cursor}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.statusText}`)
      }

      const data: SyncResponse = await response.json()
      
      // Apply changes to local database
      for (const change of data.changes) {
        await this.applyChange(change)
      }

      // Update cursor
      this.lastCursor = data.cursor
      localStorage.setItem('syncCursor', data.cursor)
      
    } catch (error) {
      console.error('Sync pull failed:', error)
      throw error
    }
  }

  async push(): Promise<void> {
    try {
      // Get unsynced changes
      const unsyncedChanges = await db.syncLog
        .where('synced')
        .equals(false)
        .toArray()

      if (unsyncedChanges.length === 0) {
        return
      }

      const changes = await Promise.all(
        unsyncedChanges.map(async (logEntry) => {
          let data = undefined
          
          if (logEntry.operation !== 'delete') {
            // Get current data from appropriate table
            const table = this.getTableForEntity(logEntry.entity)
            data = await table.get(logEntry.entityId)
          }

          return {
            entity: logEntry.entity,
            id: logEntry.entityId,
            operation: logEntry.operation,
            data,
            timestamp: logEntry.timestamp.toISOString()
          }
        })
      )

      const pushData: PushData = {
        changes,
        idempotencyKey: crypto.randomUUID()
      }

      const response = await fetch(`${this.baseUrl}/sync/push`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pushData)
      })

      if (!response.ok) {
        throw new Error(`Push failed: ${response.statusText}`)
      }

      // Mark changes as synced
      await db.syncLog.bulkUpdate(
        unsyncedChanges.map(change => change.id),
        { synced: true }
      )

    } catch (error) {
      console.error('Sync push failed:', error)
      throw error
    }
  }

  async sync(): Promise<void> {
    const { setSyncStatus, setLastSync } = useAppStore.getState()
    
    try {
      setSyncStatus('syncing')
      
      // First push local changes, then pull remote changes
      await this.push()
      await this.pull()
      
      setLastSync(new Date())
      setSyncStatus('idle')
    } catch (error) {
      setSyncStatus('error')
      throw error
    }
  }

  private async applyChange(change: any): Promise<void> {
    const table = this.getTableForEntity(change.entity)
    
    switch (change.operation) {
      case 'create':
      case 'update':
        if (change.data) {
          // Convert date strings back to Date objects
          const processedData = this.processDateFields(change.data)
          await table.put(processedData)
        }
        break
      case 'delete':
        await table.delete(change.id)
        break
    }
  }

  private getTableForEntity(entity: string): any {
    switch (entity) {
      case 'user': return db.users
      case 'workspace': return db.workspaces
      case 'membership': return db.memberships
      case 'standort': return db.standorte
      case 'queen': return db.queens
      case 'volk': return db.voelker
      case 'durchsicht': return db.durchsichten
      case 'behandlung': return db.behandlungen
      case 'kalenderEvent': return db.kalenderEvents
      case 'fileRef': return db.fileRefs
      default:
        throw new Error(`Unknown entity type: ${entity}`)
    }
  }

  private processDateFields(data: any): any {
    const dateFields = ['createdAt', 'updatedAt', 'deletedAt', 'datum', 'start', 'ende', 'sperrBis']
    const processed = { ...data }
    
    for (const field of dateFields) {
      if (processed[field] && typeof processed[field] === 'string') {
        processed[field] = new Date(processed[field])
      }
    }
    
    return processed
  }
}

export const syncManager = new SyncManager()

// Auto-sync when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOfflineStatus(false)
    syncManager.sync().catch(console.error)
  })

  window.addEventListener('offline', () => {
    useAppStore.getState().setOfflineStatus(true)
  })
}