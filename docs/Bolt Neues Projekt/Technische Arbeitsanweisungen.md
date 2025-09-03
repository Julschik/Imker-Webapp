# Technische Arbeitsanweisungen

## Architektur-Philosophie

**Offline-first, Client-heavy, Backend-agnostisch**

Die App funktioniert primär offline mit IndexedDB als Hauptspeicher. Der Server ist austauschbar und dient nur der Synchronisation und schweren Operationen (PDF-Export).

## Tech Stack (Empfehlung)

### Frontend (Kern)
- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** + **shadcn/ui** für konsistente Komponenten
- **Zustand** für App-State Management
- **React Hook Form + Zod** für Formulare und Validierung
- **Dexie** für IndexedDB (Offline-Speicher)

### PWA & Offline
- **Service Worker** für Caching und Background-Sync
- **Web App Manifest** für Installation
- **IndexedDB** als primärer Datenspeicher

### Backend (Referenz, austauschbar)
- **Fastify** (Node.js) für REST-API
- **PostgreSQL** für persistente Daten
- **MinIO** (S3-kompatibel) für Dateien
- **Keycloak/Ory** für Authentication

### Alternative Backend
- **Supabase** (DB + Auth + Storage + Edge Functions)
- Identische REST-API über Adapter-Pattern

## Modulare Architektur

### Ordnerstruktur
```
/src
  /app                 # Next.js App Router
    /mod               # Module (erweiterbar)
      /scan            # QR/NFC Scanner
      /volk            # Stockkarten
      /durchsicht      # Durchsichten
      /tamg            # TAMG-Bestandsbuch
      /ernte           # Ernte & Lose
      /kalender        # Termine & ICS
  /components          # Wiederverwendbare UI
  /lib                 # Business Logic
    /db                # Dexie Schema & Queries
    /sync              # Synchronisation
    /validation        # Zod Schemas
  /utils               # Hilfsfunktionen
  /config              # Konfiguration
/docs                  # Dokumentation
/tests                 # Tests
```

### Modul-Prinzip
- **Jedes Modul** ist eigenständig unter `/app/mod/<name>`
- **Registry-System** für dynamische Navigation
- **Core bleibt stabil** - neue Features als Module
- **Feature-Flags** für schrittweise Aktivierung

## Datenmodell

### Lokale Entitäten (IndexedDB)
```typescript
// Kern-Entitäten
User { id, email, name, roles[], twofaEnabled }
Workspace { id, name }
Standort { id, name, address, geo, qrKey?, nfcUid? }
Volk { id, stocknr, standortId, status{brut,futter,varroa,platz}, qrKey? }

// Aktivitäten
Durchsicht { id, volkId, datum, checks{}, volksstaerke, followUps[] }
Behandlung { id, scope, datum, praep, wirkstoff, wartezeitTage, sperrBis }
Fütterung { id, volkId, datum, futtertyp, menge_kg }
Ernte { id, standortId, datum, kg, wassergehalt }
Los { id, name, zeitraum, etikettenfelder, publicId? }

// System
FileRef { id, storageKey, mime, bytes, sha256, signedUrl? }
SyncLog { entity, operation, timestamp, deviceId }
```

### Konsistenzregeln
- **Soft-Deletes**: Keine harten Löschungen
- **Server-Timestamps**: Authoritative Zeitstempel
- **Wartezeit-Sperren**: `sperrBis` blockiert Ernte/Los
- **Allokations-Summen**: `Σ HarvestLotAlloc.kg ≤ Ernte.kg`

## Synchronisation

### Sync-Strategie
- **Delta-Sync**: Nur Änderungen übertragen
- **Cursor-basiert**: `/sync/pull?cursor=timestamp`
- **Idempotent Push**: `/sync/push` mit Batch + idempotencyKey
- **Last-Write-Wins**: Standard für unkritische Felder

### Konfliktlösung
**Kritische Felder** (nie auto-überschreiben):
- `Behandlung.sperrBis`, `Behandlung.wartezeitTage`
- `Los.loscode`, `Los.etikettenfelder.*`
- `Ernte.kg` (wenn Allokationen existieren)
- `HarvestLotAlloc.kg`
- Rollen/Berechtigungen

**Merge-Dialog**: Feldweise Auswahl "Server vs. Lokal"

## Scan & Identifikation

### QR-first Workflow
```typescript
// Scan-Screen mit Tabs
1. QR (Default): Kamera-Live-Scanner
2. NFC (nur wenn navigator.nfc): Web NFC API
3. Manuell: Suche nach Stock-Nr./QR-Key

// Deep-Link Format
qrKey: "volk-abc123" → /mod/volk/abc123
```

### Fallback-Strategie
- NFC-Fehler → Toast → Auto-Rückfall zu QR
- QR-Fehler → Manueller Eingabe-Modus
- Offline → Lokale Suche in IndexedDB

## Validierung & Business Rules

### Varroa-Schwellenwerte
```typescript
VarroaThresholdProfile {
  region: string,
  saison: 'frühjahr'|'sommer'|'spätjahr',
  methode: 'alkohol'|'puder'|'co2'|'natfall',
  schwellwert: number,
  einheit: '%'|'milben/tag',
  aktion: 'WARN'|'BLOCK'
}
```

### HonigV-Etikett (Deutschland)
```typescript
EtikettProfil {
  verkehrsbez: "Honig",
  fuellmenge_g: number,
  mhd: Date,
  loscode: string,
  ursprungsland: string[],
  inverkehrbringer: { name, adresse }
}
```

## Offline-Strategien

### Service Worker
- **Cache-First**: Statische Assets
- **Network-First**: API-Calls mit Fallback
- **Background-Sync**: Queue für failed requests

### IndexedDB Schema
```typescript
// Dexie Schema
db.version(1).stores({
  users: 'id, email',
  voelker: 'id, stocknr, standortId, qrKey',
  durchsichten: 'id, volkId, datum',
  behandlungen: 'id, volkId, datum, sperrBis',
  syncLog: '++id, entity, timestamp'
});
```

## Dateien & Upload

### Upload-Flow
1. **Direct-to-Storage**: Pre-signed PUT URLs
2. **Checksummen**: SHA256 für Integrität
3. **Signed Downloads**: Keine öffentlichen Buckets
4. **Quota-Management**: Per Workspace/User

### Audio-Handling
- **Formate**: m4a (bevorzugt), mp3, ogg, wav
- **Limits**: 10 Min, 20 MB, 2 GB/Workspace
- **Auto-Cleanup**: Nach Transkription (optional)

## Security & Privacy

### Authentication
- **E-Mail + Passwort** (Standard)
- **TOTP 2FA** (Pflicht für Admin)
- **Session-Management** mit Refresh-Tokens

### Datenschutz
- **EU-Hosting** möglich
- **At-Rest-Verschlüsselung** für Storage
- **Koordinaten-Rundung** für öffentliche Steckbriefe
- **Opt-in** für alle öffentlichen Features

## Backup & Recovery

### Backup-Format
```
backup-{timestamp}.tgz.age
├── meta.json           # Metadaten
├── entities/           # JSONL pro Entitätstyp
│   ├── voelker.jsonl
│   ├── durchsichten.jsonl
│   └── ...
└── files/              # Optional: Medien-Dateien
    └── manifest.json
```

### Verschlüsselung
- **Symmetrisch**: age/libsodium mit Passphrase
- **Client-seitig**: Server kennt keine Passphrase
- **Recovery**: 3-von-5 Shamir-Shares (empfohlen)

## Performance-Budgets

### Bundle-Größen
- **Core Route**: ≤ 200 kB gzipped
- **Scan Route**: ≤ 160 kB gzipped
- **Heavy Features**: Lazy Loading (PDF, Charts, Maps)

### Runtime-Performance
- **TTI**: ≤ 2s auf Mid-Range Phone
- **Interaktionen**: ≤ 100ms Response
- **Offline-First**: Keine Netzwerk-Abhängigkeiten für Kernfunktionen

## Testing-Strategie

### Unit Tests (Vitest)
- **Services**: Business Logic
- **Validierung**: Zod Schemas
- **Sync**: Konfliktlösung

### E2E Tests (Playwright)
- **QR → Stockkarte → Durchsicht**
- **TAMG → Wartezeit-Sperre**
- **Offline → Online Sync**

## Deployment

### Frontend
- **Static Export**: Next.js static build
- **CDN**: Vercel, Netlify, oder eigener Server
- **PWA**: Automatische Updates über Service Worker

### Backend
- **Docker**: Containerized deployment
- **Environment**: Staging + Production
- **Monitoring**: Health-Checks, Structured Logs

## Migration & Erweiterung

### Neue Module hinzufügen
1. Ordner `/app/mod/<name>` erstellen
2. Route `/app/mod/<name>/page.tsx` implementieren
3. Registry-Eintrag in `/lib/registry.ts`
4. Optional: Feature-Flag in `/config/features.ts`

### Datenbank-Migrationen
- **Versionierte Schemas**: Dexie Migrations
- **Backward-Compatibility**: Alte Clients unterstützen
- **Rollback-Fähigkeit**: Bei kritischen Fehlern

Diese Architektur gewährleistet **Skalierbarkeit**, **Wartbarkeit** und **Offline-Robustheit** bei gleichzeitiger **Erweiterbarkeit** durch das Modul-System.