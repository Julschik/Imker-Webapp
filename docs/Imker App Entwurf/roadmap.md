# Roadmap

Status-Legende:

* [ ] offen
* \[\~] in Arbeit
* [x] erledigt
* \[!] blockiert
* \[?] Entscheidung nötig

Arbeitsprinzipien: kleine, klare Schritte. Max 2 Dateien pro Task, max \~30 geänderte Zeilen. Keine kosmetischen Rewrites. Jede Änderung in `/docs/aenderungen.md` dokumentieren.

## 0. Arbeitsmodus

**Definition of Done (DoD)**

* [ ] Code kompiliert
* [ ] Tests grün oder neue Tests enthalten
* [ ] Logs/Fehlertexte hinzugefügt
* [ ] `/docs/aenderungen.md` Eintrag
* [ ] Keine unnötigen Diffs

**Bolt-Aufgabenformat (Template)**

```
Ziel: <ein Satz>
Ändere nur: <pfade>
Konkrete Änderung: <funktionen/zeilen grob>
Akzeptanz: <kurze Kriterien>
Doku: /docs/aenderungen.md erweitern
```

---

## Phase 1 — Core MVP

### M0: Skeleton, Infra, Auth, Dexie

* [ ] Projekt-Skeleton mit Routen und State anlegen
  **Ändere nur:** `/src/routes/*`, `/src/utils/dexie.ts`, `/src/config/env.ts`
  **Akzeptanz:** App startet, leere Screens vorhanden, Dexie DB initialisiert
  **Nächster Schritt:** Scan-Flow

* [ ] Auth E-Mail + TOTP (UI + Platzhalter-API)
  **Ändere nur:** `/src/routes/login.tsx`, `/src/services/auth.ts`, `/src/utils/log.ts`
  **Akzeptanz:** Login-Flow mit Mock, TOTP-Eingabe UI, Logs vorhanden
  **Nächster Schritt:** Guarded Routes

* [ ] Guarded Routes + Redirects
  **Ändere nur:** `/src/routes/_layout.tsx`, `/src/services/session.ts`
  **Akzeptanz:** Unangemeldet → Login, angemeldet → Dashboard

### M1: Scan, Stockkarte, Durchsicht

* [ ] Scan-Screen mit Tabs (QR default, NFC optional, Manuell)
  **Ändere nur:** `/src/routes/scan.tsx`, `/src/utils/qr.ts`, `/src/utils/nfc.ts`
  **Akzeptanz:** QR öffnet Kamera, NFC-Tab sichtbar nur bei `navigator.nfc`, Manuell-Suche funktioniert, NFC-Fehler → Toast und Rückfall zu QR

* [ ] Deep-Link zu Volk per `qrKey`
  **Ändere nur:** `/src/routes/volk/[id].tsx`, `/src/services/volk.ts`
  **Akzeptanz:** Scan führt in Stockkarte, Fehlerpfad geloggt

* [ ] Stockkarte: Ampeln (Brut/Futter/Varroa/Platz), Historienliste
  **Ändere nur:** `/src/routes/volk/[id].tsx`, `/src/components/StatusAmpel.tsx`
  **Akzeptanz:** Ampel berechnet aus Feldern, Historie paginiert

* [ ] Durchsicht Schnellformular
  **Ändere nur:** `/src/routes/durchsicht/new.tsx`, `/src/services/durchsicht.ts`
  **Akzeptanz:** Checkboxen/Slider/Counter, Speichern offline möglich, Folgeaufgaben-Stub

* [ ] Audio-Upload Leitplanken (m4a bevorzugt, Limits aus ENV)
  **Ändere nur:** `/src/config/audio.ts`, `/src/services/files.ts`, `/src/routes/durchsicht/new.tsx`
  **Akzeptanz:** Upload > Limit wird blockiert, Info-Toast, Log

### M2: TAMG, Sperren, ICS, Sync

* [ ] TAMG-Behandlung erfassen inkl. `sperrBis`
  **Ändere nur:** `/src/routes/tamg/new.tsx`, `/src/services/tamg.ts`
  **Akzeptanz:** Pflichtfelder, Validierung, Logs

* [ ] Wartezeit-Sperre blockiert Ernte/Los (lokal erkennbar)
  **Ändere nur:** `/src/services/locks.ts`, Aufrufe in Ernte/Los-Formularen (Stubs)
  **Akzeptanz:** Sperre greift, UI-Hinweis mit Quelle

* [ ] Wartezeit-Kaskade (Feature-Flag, standard off)
  **Ändere nur:** `/src/services/locks.ts`, `/src/config/env.ts`
  **Akzeptanz:** Bei aktivem Flag sperrt Standort wenn ≥1 Volk `sperrBis>now`

* [ ] ICS Feeds (Workspace/Standort/Volk) Token erzeugen, **public off by default**
  **Ändere nur:** `/src/routes/settings/ics.tsx`, `/src/services/ics.ts`
  **Akzeptanz:** Token erzeugbar/widerrufbar, Hinweis „read-only public off“, Feed-URL angezeigt

* [ ] Sync LWW + kritische Felder erzwingen Merge
  **Ändere nur:** `/src/services/sync.ts`, `/src/components/MergeDialog.tsx`
  **Kritische Felder:** `sperrBis`, `wartezeitTage`, `loscode`, `Los.etikettenfelder.*`, `Los.publicId/oeffentlich`, `Ernte.kg` mit Allokationen, `HarvestLotAlloc.kg`, `ICS.token`, `PublicToken.expiresAt/revokedAt`, Rollen
  **Akzeptanz:** Konflikt auf kritischem Feld → Dialog zwingend, kein Auto-LWW

### M3: Validierungen Kern

* [ ] Varroa-Schwellenwerte Profil (Default DE, editierbar)
  **Ändere nur:** `/src/config/thresholds.ts`, `/src/services/varroa.ts`, UI in `/src/routes/settings/thresholds.tsx`
  **Akzeptanz:** Auswahl Methode/Saison/Region, Warn/BLOCK gemäß Profil

* [ ] EtikettProfil HonigV-DE Validierung
  **Ändere nur:** `/src/services/etikett.ts`, `/src/routes/lose/edit.tsx`
  **Akzeptanz:** Pflichtfelder geprüft, bei Lücke Export verweigert mit Regelhinweis

---

## Phase 2 — Extended MVP

### Backup/Restore

* [ ] Backup Export `.tgz.age` (ohne Files)
  **Ändere nur:** `/src/routes/settings/backup.tsx`, `/src/services/backup.ts`
  **Akzeptanz:** Archiv downloadbar, Manifest korrekt

* [ ] Backup Export inkl. Files (optional) + Quoten-Hinweis
  **Ändere nur:** `/src/services/backup.ts`
  **Akzeptanz:** Auswahl „mit/ohne Dateien“, Größenhinweis

* [ ] Restore Dry-Run + Import
  **Ändere nur:** `/src/routes/settings/restore.tsx`, `/src/services/restore.ts`
  **Akzeptanz:** Dry-Run zeigt Counts/Konflikte, Import mappt Workspace neu/merge

* [ ] Passphrase-Recovery Dokumentation erzeugen (Shamir 3/5, Client-seitig)
  **Ändere nur:** `/docs/backup_recovery.md`, Link in UI
  **Akzeptanz:** Anleitung vollständig, Fingerprint-Hinweis

### Ernte & Lose, Reporting

* [ ] Ernte Formular + Liste
  **Ändere nur:** `/src/routes/ernte/*`, `/src/services/ernte.ts`
  **Akzeptanz:** Erfassung, Listenfilter

* [ ] Lose + HarvestLotAlloc N\:M
  **Ändere nur:** `/src/routes/lose/*`, `/src/services/lose.ts`
  **Akzeptanz:** Allokation kg, Summe ≤ Ernte.kg enforced

* [ ] Reporting Jahresübersicht (PDF serverseitig Stub)
  **Ändere nur:** `/src/routes/berichte/jahr.tsx`, `/src/services/report.ts`
  **Akzeptanz:** PDF Download, Kennzahlen korrekt

* [ ] Standortvergleich (PDF)
  **Ändere nur:** `/src/routes/berichte/standort.tsx`, `/src/services/report.ts`
  **Akzeptanz:** Ertrag/Volk, Wassergehalt, Behandlungsintensität

### Bulk-Operationen

* [ ] Bulk Wanderung Multi-Select
  **Ändere nur:** `/src/routes/wanderung/bulk.tsx`
  **Akzeptanz:** Auswahl mehrerer Völker, Auftrag generiert

* [ ] Bulk Fütterung Standort
  **Ändere nur:** `/src/routes/fuetterung/bulk.tsx`
  **Akzeptanz:** Menge je Volk verteilt oder fix, Summen-Check

* [ ] Bulk Behandlung Sammelbuchung
  **Ändere nur:** `/src/routes/tamg/bulk.tsx`
  **Akzeptanz:** Wartezeit-Sperren je Volk gesetzt

---

## Phase 3 — Polish

### Kollaboration, Öffentlich

* [ ] Kommentare an Durchsichten
  **Ändere nur:** `/src/components/Comments.tsx`, `/src/services/comments.ts`
  **Akzeptanz:** CRUD, Logs, Tests

* [ ] Gast-Token read-only mit Ablauf
  **Ändere nur:** `/src/routes/share.tsx`, `/src/services/share.ts`
  **Akzeptanz:** Link erzeugen/revoken, nur Lesezugriff

* [ ] Öffentliche Steckbriefe opt-in, Koordinaten default hidden
  **Ändere nur:** `/src/routes/public/[id].tsx`
  **Akzeptanz:** Minimalfelder, `PUBLIC_COORDS_MODE` berücksichtigt

### Offline-Karten, Wetter/Tracht

* [ ] Tile-Caching Standbesuch
  **Ändere nur:** `/src/services/maps.ts`, `/src/routes/standbesuch.tsx`
  **Akzeptanz:** Tiles offline verfügbar

* [ ] Wetter Prefetch + Fallback
  **Ändere nur:** `/src/services/wetter.ts`
  **Akzeptanz:** Anzeige „keine Prognose“ bei Ausfall, Logs

* [ ] Manuelle Trachtfenster (Feature-Flag)
  **Ändere nur:** `/src/routes/tracht/manual.tsx`, `/src/services/tracht.ts`
  **Akzeptanz:** Fenster beeinflussen Planung

### Notifs, i18n, Rollen

* [ ] Web Push Opt-in, Subscriptions speichern
  **Ändere nur:** `/src/services/push.ts`, `/src/routes/settings/notifs.tsx`
  **Akzeptanz:** Test-Push funktioniert, Permission-Gating

* [ ] Reminder-Quellen (Kalender, Sperren, Zeugnisse, TSK)
  **Ändere nur:** `/src/services/reminders.ts`
  **Akzeptanz:** Ereignisse generieren Push/In-App

* [ ] i18n DE/EN Bundles, Locale-Switch
  **Ändere nur:** `/src/config/i18n.ts`, `/src/locales/*`, UI-Switch
  **Akzeptanz:** Texte/Datum/Zahlen lokalisiert

* [ ] Rolle „Helfer“ (RW nur Durchsichten) + Wiki-Reviewer
  **Ändere nur:** `/src/services/acl.ts`, UI-Gates
  **Akzeptanz:** Helfer gesperrt für Exporte/TAMG, Reviewer kann publishen

---

## Querschnitt

### Logs, Fehler, Tests

* [ ] Logging-Utility `/src/utils/log.ts` (log/warn/error + optional `debug`)
  **Akzeptanz:** Alle Services nutzen Präfixe

* [ ] Fehler-Typ Standard `{ code, message, cause? }`
  **Akzeptanz:** catch-Blöcke mappen auf Standard

* [ ] Beispieltests pro Service (Happy/Fehlerpfad)
  **Akzeptanz:** `npm test` grün

### Doku

* [ ] `/docs/aenderungen.md` initial + Checkliste aufnehmen
* [ ] `/docs/roadmap.md` aktuell halten (dieses Dokument)
* [ ] `/docs/backup_recovery.md` (siehe Phase 2)

### CI/CD

* [ ] Github Actions minimal (`ci.yml`: install, build, test, cache)
  **Akzeptanz:** PR checkt automatisch

---

## Entscheidungen offen

* \[?] Auth-Provider final (Keycloak/Ory/Supabase Auth) — bis Ende M0
* \[?] PDF-Engine serverseitig (PDFKit vs. Playwright) — vor Reporting
* \[?] Map-Provider Lizenz (OSM/Tile-Server) — vor Tile-Caching

---

## Risiken und Maßnahmen

* Mapping-Kosten Tiles → **Maßnahme:** eigenes Tile-Quota, Caching streng
* Audio-Speicher → **Maßnahme:** Quoten + Auto-Löschung, Kompression
* Sync-Konflikte UX → **Maßnahme:** Feldweiser Merge-Dialog, klare Texte, Tests

---

## „Next Up“ Liste (operative Reihenfolge)

1. [ ] M0 Skeleton + Dexie + Auth UI
2. [ ] Scan-Screen mit QR/NFC/Manuell
3. [ ] Stockkarte + Durchsicht Formular
4. [ ] TAMG + Wartezeit-Sperre (lokal)
5. [ ] ICS Tokens (public off)
6. [ ] Sync LWW + kritische Merge-Felder
7. [ ] Varroa-Profil + HonigV-Profil
8. [ ] Ernte/Lose + Allokation
9. [ ] Reporting Jahr/Standort
10. [ ] Bulk Wanderung/Fütterung/Behandlung
11. [ ] Backup/Restore + Recovery-Doku
12. [ ] Kommentare + Gast
13. [ ] Offline Tiles + Wetter/Tracht
14. [ ] Notifs + i18n
15. [ ] Rollen Helfer/Reviewer

---

## Epilog: Bolt-Prompt-Beispiele

**Bugfix klein**

```
Ziel: Fix: QR-Scan crasht bei leeren Frames
Ändere nur: /src/routes/scan.tsx
Konkrete Änderung: Guard vor decode, bei null → Toast und return
Akzeptanz: Crash reproduzierbar behoben, Log '[Scan] Empty frame'
Doku: /docs/aenderungen.md
```

**Feature klein**

```
Ziel: NFC-Tab nur anzeigen, wenn navigator.nfc existiert
Ändere nur: /src/routes/scan.tsx
Konkrete Änderung: Conditional Render, Fallback Toast bei Fehler
Akzeptanz: Kein NFC → Tab fehlt; mit NFC → sichtbar; Fehler → Toast
Doku: /docs/aenderungen.md
```

**Validierung**

```
Ziel: BLOCK bei HonigV fehlendem Ursprungsland
Ändere nur: /src/services/etikett.ts
Konkrete Änderung: Regel prüfen, Fehlercode HONEYV_MISSING_ORIGIN
Akzeptanz: Export verweigert, UI-Hinweis
Doku: /docs/aenderungen.md
```
