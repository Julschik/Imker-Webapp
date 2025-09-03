Hier ist der überarbeitete Bolt.new-Prompt. Kopiere 1:1.

```
TITLE: Imker-Webapp seed v0.2 — stabile, modulare Basis, client-only

PROBLEMBESCHREIBUNG
Das aktuelle Projekt ist für Bolt zu komplex. Viele Vorgaben, SSR/Client-Mischung und frühe Integrationen (Dexie, NFC, Flags) erzeugen Kettenfehler. Beim Fix entstehen neue Fehler. Deshalb Neustart: eine extrem simple, von Anfang an funktionierende Basis-App, die stabil bleibt und auf die später Module andocken. Technische Vorgaben sind keine Dogmen: Wenn etwas unlogisch ist, setze eine stabilere Lösung um und dokumentiere Abweichungen.

ZIEL
Ein minimaler, robuster Next.js-14 App-Router Seed:
- Client-only (keine SSR-Fallen, keine Browser-APIs auf dem Server).
- Stabiles Grundgerüst, das idealerweise unangetastet bleibt.
- Erweiterbar über **Module**, die unter `/app/mod/<name>` landen und sich über ein Manifest registrieren.
- Keine externen Provider, keine DB, keine Env-Pflichten.
- Funktionen kommen später als eigenständige Module.

PRINZIPIEN
- Kleine Schritte. Max 10 neue/angepasste Dateien.
- Kein Dexie, kein NFC, keine Feature-Flags.
- Alle browserabhängigen Seiten/Komponenten sind `'use client'`.
- Modularchitektur: Core bleibt unverändert; neue Module erfordern nur neue Dateien unter `/app/mod/*` und einen Eintrag im Manifest.

DEPENDENCIES
- "next": "^14", "react": "^18", "react-dom": "^18"
- "html5-qrcode": "^2"

SCRIPTS (package.json ergänzen/festigen, nichts überschreiben, was schon korrekt ist)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000"
  }
}

FILE TREE (neu/ersetzen, max. 10 Dateien)
- src/app/globals.css
- src/app/layout.tsx
- src/app/page.tsx
- src/app/mod/scan/page.tsx
- src/app/mod/volk/[id]/page.tsx
- src/components/ScanQR.tsx
- src/lib/mock.ts
- src/lib/registry.ts            # Core-Registry (stabil bleiben)
- src/utils/log.ts
- tsconfig.json                  # minimal, mit paths @/* → src/*

INHALTE (nur Kernausschnitte; außerhalb davon nichts anfassen)

1) src/app/globals.css
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; font-family: system-ui, sans-serif; }
main { max-width: 960px; margin: 0 auto; padding: 16px; }
a { color: inherit; }

2) src/app/layout.tsx
import './globals.css'
export const metadata = { title: 'Imker-Webapp', description: 'Seed v0.2 — stabile Basis, modulare Erweiterungen' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de"><body><main>{children}</main></body></html>
}

3) src/utils/log.ts
export const log   = (s: string, ...a: any[]) => console.log(`[${s}]`, ...a)
export const warn  = (s: string, ...a: any[]) => console.warn(`[${s}]`, ...a)
export const error = (s: string, ...a: any[]) => console.error(`[${s}]`, ...a)

4) src/lib/mock.ts
export type Ampel = 'grün'|'gelb'|'rot'
export type Volk = { id: string; stocknr: string; standort: string; status: { brut: Ampel; futter: Ampel; varroa: Ampel; platz: Ampel } }
export const MOCK_VOELKER: Volk[] = [
  { id: 'v-001', stocknr: '001', standort: 'Hauptstand', status: { brut:'grün', futter:'gelb', varroa:'grün', platz:'gelb' } },
  { id: 'v-002', stocknr: '002', standort: 'Waldstand',  status: { brut:'grün', futter:'grün', varroa:'gelb', platz:'grün' } },
]
export const findVolkById = (id: string) => MOCK_VOELKER.find(v => v.id === id) || null

5) src/lib/registry.ts
/** Zentrale, stabile Registry. Neue Module fügen EINEN Eintrag hinzu. Core bleibt unverändert. */
export type Feature = { key: string; title: string; href: string; description?: string }
export const FEATURES: Feature[] = [
  { key: 'scan', title: 'QR scannen', href: '/mod/scan', description: 'QR→Stockkarte' },
  { key: 'volk-demo', title: 'Beispiel Volk v-001', href: '/mod/volk/v-001', description: 'Mock-Stockkarte' },
]

6) src/app/page.tsx
'use client'
import Link from 'next/link'
import { FEATURES } from '@/lib/registry'
export default function Home() {
  return (
    <>
      <h1>Imker-Webapp — Seed v0.2</h1>
      <p>Stabile Basis. Module hängen sich unter <code>/mod/*</code> ein. Core bleibt unverändert.</p>
      <ul>
        {FEATURES.map(f => (
          <li key={f.key}><Link href={f.href}>{f.title}</Link>{f.description ? ` — ${f.description}` : ''}</li>
        ))}
      </ul>
      <p style={{opacity:.7}}>Hinweis: Keine DB, kein Backend. Alles client-only, um SSR-Fallen zu vermeiden.</p>
    </>
  )
}

7) src/components/ScanQR.tsx
'use client'
import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { warn, error, log } from '@/utils/log'
export default function ScanQR() {
  const router = useRouter()
  const divId = 'qr-reader'
  const started = useRef(false)
  const [err, setErr] = useState<string|null>(null)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const qr = new Html5Qrcode(divId)
    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (text) => {
        log('Scan', 'Hit', text)
        try {
          const m = text.match(/volk\/([^/?#]+)/)
          const id = m ? m[1] : text
          router.push(`/mod/volk/${encodeURIComponent(id)}`)
          qr.stop().catch(()=>{})
        } catch (e:any) {
          error('Scan', 'Route push failed', e?.message)
        }
      },
      () => {}
    ).catch((e:any) => {
      warn('Scan', 'Start failed', e?.message)
      setErr('Kamera konnte nicht gestartet werden. Berechtigungen prüfen.')
    })
    return () => { qr.stop().catch(()=>{}) }
  }, [router])
  return (
    <div>
      <div id={divId} style={{ width: 320, margin: '12px 0' }} />
      {err && <p style={{color:'tomato'}}>{err}</p>}
      <p>Erwarte QR mit Inhalt „volk/&lt;id&gt;“ oder direkt die ID.</p>
    </div>
  )
}

8) src/app/mod/scan/page.tsx
'use client'
import dynamic from 'next/dynamic'
const ScanQR = dynamic(() => import('@/components/ScanQR'), { ssr: false })
export default function ScanPage() {
  return (<><h1>QR scannen</h1><ScanQR /></>)
}

9) src/app/mod/volk/[id]/page.tsx
'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { findVolkById } from '@/lib/mock'
export default function VolkPage() {
  const { id } = useParams<{id:string}>()
  const volk = findVolkById(id)
  if (!volk) return (
    <>
      <h1>Volk nicht gefunden</h1>
      <p>ID: {id}</p>
      <p><Link href="/mod/scan">Zurück zum Scan</Link></p>
    </>
  )
  const s = volk.status
  return (
    <>
      <h1>Stockkarte #{volk.stocknr}</h1>
      <p>Standort: {volk.standort}</p>
      <ul>
        <li>Brut: {s.brut}</li>
        <li>Futter: {s.futter}</li>
        <li>Varroa: {s.varroa}</li>
        <li>Platz: {s.platz}</li>
      </ul>
      <p><Link href="/mod/scan">Weiteres Volk scannen</Link></p>
    </>
  )
}

10) tsconfig.json (ersetzen oder minimal ergänzen)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}

AKZEPTANZ
- `npm run build` grün. `npm run dev` startet ohne SSR-Fehler.
- Home listet **Registry**-Einträge aus `src/lib/registry.ts`.
- `/mod/scan` öffnet die Kamera und navigiert nach QR-Treffer zu `/mod/volk/<id>`.
- `/mod/volk/v-001` zeigt Mock-Stockkarte.

ERWEITERBARKEIT (Modul-Prinzip)
- Neues Feature = neue Route unter `/app/mod/<name>/page.tsx` (client-only).
- Optional einen Link im Manifest ergänzen: `src/lib/registry.ts` → neuer `FEATURES`-Eintrag.
- Core-Dateien, die stabil bleiben sollen: `layout.tsx`, `globals.css`, `lib/registry.ts` (nur Liste pflegen), `utils/log.ts`. Kein Dexie/Backend anfassen.

HINWEIS ZUR PRAXIS
Wenn eine Vorgabe technisch schädlich wäre, implementiere die stabilere Variante und notiere kurz am Datei-Kopf: `// Abweichung: <Begründung>`. Ziel ist Robustheit des Kerns, nicht blinde Regeltreue.

NEXT STEPS (separate, kleine Tasks — NICHT jetzt ausführen)
1) `/app/mod/durchsicht/page.tsx`: simples Formular, local state only.  
2) In-Memory Store (Zustand) statt reiner Mock-Funktionen.  
3) QR-Format `imker://volk/<id>` zusätzlich unterstützen.  
4) Erst danach: Dexie als `dexie.client.ts` Modul, keine SSR-Imports.  
5) Modul „Einstellungen“ für spätere Provider-Keys, ohne den Core zu ändern.
```
