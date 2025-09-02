# Imker-Webapp

Offline-first Webapp zur rechtssicheren Betriebsführung für Hobby- und Berufsimker. QR-first Workflow: **Scannen → Stockkarte → Aktion** in ≤2 Klicks. Delta-Sync, TAMG-Bestandsbuch, Exporte, Backup.

## Kernnutzen

* Schnelle Datenerfassung am Stand, auch offline
* Rechtssichere Dokumentation (TAMG, TSK, HonigV)
* Saubere Exporte (CSV/JSON/PDF, ICS)
* Robuste Synchronisation und Konfliktlösung
* Token-effiziente, inkrementelle Entwicklung mit lückenloser Änderungsdoku

## Hauptfunktionen (Auszug)

* Völker/Stockkarten, Durchsichten mit Schnellformular & Audiomemo
* Bestandsbuch (TAMG) inkl. Wartezeit-Sperrlogik und optional standortweiter Kaskade
* Ernte & Lose mit N\:M-Allokation, Etikettendaten nach **HonigV-DE** Validierungsprofil
* Kalender & ICS Feeds (Workspace/Standort/Volk), **public read-only standardmäßig aus**
* Lager/Material, Wanderung, Proben/Analytik
* Varroa-Schwellenwerte je Diagnosemethode (editierbar pro Saison/Region)
* Optional: Backups, Bulk-Operationen, Reporting, Benachrichtigungen, i18n, Offline-Karten

## Architektur in Kürze

* **Frontend:** Next.js App Router, TypeScript, Tailwind, shadcn/ui, PWA (Service Worker), IndexedDB (Dexie)
* **Sync:** Delta-Sync (LWW), Merge-Dialog für kritische Felder (z. B. `sperrBis`, `loscode`)
* **Backend (self-hosted):** Fastify + Postgres + MinIO + Keycloak/Ory
  Alternativ Supabase-Adapter mit identischer REST-ABI
* **Dateien:** Direct-to-storage via signierten URLs, kein öffentlicher Bucket

## Projektstruktur

```
/src
  /components
  /routes
  /services
  /utils
  /config
/tests
/docs
  aenderungen.md
  roadmap.md
README.md
```

## Schnellstart

Voraussetzungen: Node 20+, npm/pnpm, optional Docker (Referenz-Backend).

```bash
# 1) Repository klonen
git clone <repo-url>
cd imker-webapp

# 2) Abhängigkeiten
npm ci

# 3) .env anlegen (siehe unten)

# 4) Dev-Server starten
npm run dev
```

Referenz-Backend (optional, lokal per Docker):

```bash
# Beispiel: compose-Datei bereitstellen und starten
docker compose -f ops/docker-compose.yml up -d
```

## .env Beispiel

```env
NODE_ENV=development
API_BASE_URL=http://localhost:8787
BACKEND_PROVIDER=selfhosted   # oder: supabase
SIGNED_URL_TTL_MIN=15

# Sichtbarkeit öffentlicher Daten
PUBLIC_COORDS_MODE=hidden     # hidden|rounded|full
PUBLIC_COORD_PRECISION=2

# Feature-Flags
FEATURE_BACKUP=false
FEATURE_BULK=true
FEATURE_REPORTS=false
FEATURE_COMMENTS=false
FEATURE_GUEST=false
FEATURE_OFFLINE_TILES=false
FEATURE_WEATHER_PREFETCH=false
FEATURE_NOTIFICATIONS=false
FEATURE_I18N=true
FEATURE_MANUAL_TRACHT=false
FEATURE_WARTEZEIT_CASCADE=false

# Web Push (bei Notifications)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Audio-Leitplanken
AUDIO_MAX_MINUTES=10
AUDIO_MAX_SIZE_MB=20
AUDIO_WORKSPACE_QUOTA_GB=2
AUDIO_RETENTION_DAYS=30

# Backups (bei aktiviertem Backend-Job)
BACKUP_CRON_FULL=0 2 * * 0
BACKUP_CRON_DIFF=0 2 * * *
BACKUP_RETENTION_WEEKS=4
```

## Scripts

```bash
npm run dev        # Entwicklung
npm run build      # Produktion bauen
npm run start      # Produktion starten
npm test           # Vitest
```

## Debug & Tests

* Konsistentes Logging: `log/warn/error('[Scope]', ... )` aus `/src/utils/log.ts`
* Reichlich `try/catch` an IO-Grenzen mit sprechenden Fehlermeldungen
* Tests: Vitest (Unit), optional Playwright (E2E)
* WebContainer/Bolt: Logs im Browser-Dev-Tool sichtbar

## Doku & Arbeitsweise

* **Token-Effizienz:** nur notwendige Diffs, keine Full-Rewrites
* **/docs/aenderungen.md:** jede Änderung mit **Was/Warum/Wie/Logs** dokumentieren
* **/docs/roadmap.md:** nach Phasen (Core/Extended/Polish) priorisieren

## Sicherheit & Datenschutz

* TLS, 2FA, signierte URLs mit TTL, keine öffentlichen Buckets
* Öffentliche Steckbriefe opt-in, Koordinaten standardmäßig ausgeblendet
* ICS Feeds pro Scope, Tokens widerrufbar, **public read-only off by default**

## Roadmap (Kurz)

* **Core MVP:** Dashboard, Völker, Durchsichten, TAMG, Sync, ICS
* **Extended:** Backup/Restore, Bulk-Ops, Reporting, Ernte & Lose, Proben, Lager
* **Polish:** Kommentare, Gast, Offline-Tiles/Wetter, Sperrbezirk-Layer, i18n, Benachrichtigungen

## Beitragen

PRs willkommen. Anforderungen:

1. Grüne Tests
2. Änderungsblock in `/docs/aenderungen.md`
3. Kein großflächiger Rewrite ohne Issue/Absprache

## Lizenz

MIT (sofern nicht anders angegeben).
