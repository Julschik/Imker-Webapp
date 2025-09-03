TITLE: Guardrails für Token-Effizienz, Doku, Debug & Struktur

GOAL
Arbeite inkrementell und token-effizient. Ändere nur absolut nötige Codezeilen. Führe jede Änderung nachvollziehbar in /docs/aenderungen.md. Baue umfangreiche Logs, einfache Tests und eine saubere, erweiterbare Struktur.

MANDATE
- Kein Full-Rewrite von Dateien.
- Nur minimal notwendige Diffs.
- Jede Änderung wird protokolliert (siehe DOKU).
- Try/catch + sprechende Fehler. Viele Logs mit klaren Präfixen.
- Tests anlegen/erweitern, wenn Logik geändert wird.

PROJECT LAYOUT (anlegen/absichern)
/
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
  package.json
  README.md

TOKEN-EFFIZIENZ REGELN
- Modifiziere nur betroffene Blöcke. Lasse übrigen Code unberührt.
- Wenn Du Dateien ausgibst: Nur die betroffenen Ausschnitte inkl. 3–5 Kontextzeilen.
- Keine kosmetischen Umformatierungen. Keine Umbenennungen ohne zwingenden Grund.
- Große Rewrites nur nach expliziter Anweisung.

DOKU (/docs)
- /docs/aenderungen.md: Jede Änderung am Ende ANFÜGEN mit folgendem Template:

### {YYYY-MM-DD HH:MM} – {Kurzbeschreibung}
**Datei/Komponente:** {pfad/Datei.ts}
**Änderung:** {was genau}
**Grund:** {warum}
**Umsetzung:** {Libs/Patterns/Techniken}
**Debug/Logs:** {neue Logs/Fehlerbilder}

- /docs/roadmap.md: Liste „Später“ Features und technische Schulden. Kurz und priorisiert.

DEBUG-FREUNDLICHKEIT
- Logging-Konventionen:
  - `console.log('[AuthService]', 'Benutzer eingeloggt', user.id)`
  - `console.warn('[API]', 'Langsame Antwort', { ms })`
  - `console.error('[API]', 'Fehler bei GET /users', err.message)`
- Utility anlegen: /src/utils/log.ts
  - Exportiere `log(scope: string, ...args)`, `warn(scope, ...)`, `error(scope, ...)`.
  - Intern: ruft console.* mit Präfix `[Scope]`.
  - Optional: Integration `debug`-Paket (`import createDebug from 'debug'`) → Namespace `app:{scope}`.
- Fehlerbehandlung:
  - Immer try/catch an IO-Grenzen (API, Storage, FS).
  - Einheitlicher Error-Typ `{ code, message, cause? }`.
  - Beim catch: `error('Service', 'Operation fehlgeschlagen', { code, message })`; rethrow mit Kontext.
- Tests:
  - /tests anlegen, Vitest konfigurieren.
  - Mindestens 2 Beispieltests (Happy Path, Fehlerpfad) pro neu/änderter Service-Funktion.
  - package.json Scripts: `"test":
