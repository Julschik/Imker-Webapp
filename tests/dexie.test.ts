import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ImkerDatabase, initDatabase } from '@/utils/dexie';

describe('Dexie Database', () => {
  let db: ImkerDatabase;

  beforeEach(async () => {
    db = new ImkerDatabase();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should initialize database successfully', async () => {
    await expect(initDatabase()).resolves.not.toThrow();
  });

  it('should create sync meta on initialization', async () => {
    await initDatabase();
    const syncMeta = await db.syncMeta.get('main');
    
    expect(syncMeta).toBeDefined();
    expect(syncMeta?.id).toBe('main');
    expect(syncMeta?.cursor).toBe('0');
  });

  it('should store and retrieve a Volk', async () => {
    const testVolk = {
      id: 'volk-1',
      workspaceId: 'workspace-1',
      stocknr: '001',
      standortId: 'standort-1',
      status: {
        brut: 'gut' as const,
        futter: 'mittel' as const,
        varroa: 'gut' as const,
        platz: 'gut' as const,
      },
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.voelker.add(testVolk);
    const retrieved = await db.voelker.get('volk-1');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.stocknr).toBe('001');
    expect(retrieved?.status.brut).toBe('gut');
  });

  it('should store and retrieve a Durchsicht', async () => {
    const testDurchsicht = {
      id: 'durchsicht-1',
      volkId: 'volk-1',
      datum: new Date(),
      checks: {
        koenigin: true,
        stifte: true,
        larven: false,
        verdeckelte: true,
      },
      volksstaerke: 7,
      followUps: ['Fütterung prüfen'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.durchsichten.add(testDurchsicht);
    const retrieved = await db.durchsichten.get('durchsicht-1');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.checks.koenigin).toBe(true);
    expect(retrieved?.volksstaerke).toBe(7);
    expect(retrieved?.followUps).toContain('Fütterung prüfen');
  });
});