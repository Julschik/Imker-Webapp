# Generelle Arbeitsanweisungen

Diese Prinzipien gelten für jedes Bolt.new Projekt und sind technologie-unabhängig.

## Token-Effizienz (Kritisch)

**Grundregel**: Ändern Sie nur absolut notwendige Codezeilen.

- **Kein Full-Rewrite** von Dateien ohne explizite Anweisung
- **Minimale Diffs**: Nur betroffene Blöcke mit 3-5 Kontextzeilen
- **Keine kosmetischen Änderungen**: Keine Umformatierungen oder Umbenennungen ohne zwingenden Grund
- **Inkrementell arbeiten**: Maximal 2 Dateien pro Änderung, ~30 Zeilen

## Dokumentationspflicht

**Jede Änderung wird protokolliert** in `/docs/aenderungen.md`:

```markdown
### {YYYY-MM-DD HH:MM} – {Kurzbeschreibung}
**Datei/Komponente:** {pfad/Datei.ts}
**Änderung:** {was genau}
**Grund:** {warum}
**Umsetzung:** {Libs/Patterns/Techniken}
**Debug/Logs:** {neue Logs/Fehlerbilder}
```

## Fehlerkultur & Logging

**Debug-freundlich entwickeln**:

- **Logging-Konventionen**: `console.log('[Scope]', 'Message', data)`
- **Utility anlegen**: `/src/utils/log.ts` mit `log(scope, ...args)`, `warn()`, `error()`
- **Try/Catch an IO-Grenzen**: API, Storage, Dateisystem
- **Einheitlicher Error-Typ**: `{code, message, cause?}`
- **Sprechende Fehlermeldungen**: Kurz und handlungsleitend

## Testkultur

**Mindeststandard**:

- **Pro Service**: Mindestens 2 Tests (Happy Path, Fehlerpfad)
- **Bei Logikänderung**: Tests erweitern/anpassen
- **Vitest konfigurieren**: `"test": "vitest"` in package.json
- **E2E optional**: Playwright für kritische User-Flows

## Projektstruktur

**Saubere Trennung**:

```
/src
  /components    # Wiederverwendbare UI-Komponenten
  /routes        # Seiten/Routen
  /services      # Business Logic
  /utils         # Hilfsfunktionen
  /config        # Konfiguration
/tests           # Tests
/docs            # Dokumentation
  aenderungen.md # Änderungsprotokoll
  roadmap.md     # Geplante Features
```

## Arbeitsweise

**Kleine Schritte**:

1. **Ein Problem** pro Commit/Änderung
2. **Funktionsfähig bleiben**: Jeder Zwischenschritt muss kompilieren
3. **Logs hinzufügen** bei jeder neuen Funktion
4. **Dokumentieren** vor dem nächsten Schritt

## Qualitätskriterien

**Definition of Done**:

- [ ] Code kompiliert ohne Warnungen
- [ ] Tests grün (oder neue Tests hinzugefügt)
- [ ] Logs/Fehlertexte vorhanden
- [ ] `/docs/aenderungen.md` aktualisiert
- [ ] Keine unnötigen Diffs

## Anti-Patterns vermeiden

- **Keine globalen Variablen** für State-Sharing
- **Keine versteckten Dependencies** zwischen Modulen
- **Keine Magic Numbers** ohne Konstanten
- **Keine Freitext-Felder** wo strukturierte Eingaben möglich sind
- **Keine Rewrites** ohne dokumentierten Grund

Diese Prinzipien gewährleisten wartbaren, erweiterbaren Code und effiziente Zusammenarbeit mit Bolt.new.