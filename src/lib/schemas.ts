import { z } from 'zod'

// Common schemas
export const AddressSchema = z.object({
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().min(1, 'Ort ist erforderlich'),
  land: z.string().default('DE')
})

export const GeoSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  geohash: z.string().optional()
})

export const FileRefSchema = z.object({
  id: z.string(),
  storageKey: z.string(),
  mime: z.string(),
  bytes: z.number(),
  sha256: z.string(),
  createdAt: z.date(),
  signedUrl: z.string().optional()
})

// User & Workspace schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1, 'Name ist erforderlich'),
  roles: z.array(z.enum(['admin', 'editor', 'viewer', 'helfer', 'wiki-reviewer'])),
  twofaEnabled: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string()
})

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Workspace-Name ist erforderlich'),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string()
})

export const MembershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
  role: z.enum(['admin', 'editor', 'viewer', 'helfer', 'wiki-reviewer']),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string()
})

// Standort schema
export const StandortSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string().min(1, 'Standort-Name ist erforderlich'),
  address: AddressSchema,
  geo: GeoSchema.optional(),
  wasserquelle: z.string().optional(),
  genehmigungen: z.array(z.string()), // FileRef IDs
  tags: z.array(z.string()).default([]),
  qrKey: z.string().optional(),
  nfcUid: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Queen schema
export const QueenSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  marking: z.string().optional(),
  origin: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Queen Event schema for history tracking
export const QueenEventSchema = z.object({
  id: z.string(),
  volkId: z.string(),
  queenId: z.string(),
  von: z.date(),
  bis: z.date().optional(),
  grund: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Volk schema
export const VolkSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  stocknr: z.string().min(1, 'Stock-Nr. ist erforderlich'),
  standortId: z.string(),
  beute: z.string().min(1, 'Beute ist erforderlich'),
  rahmenmass: z.string().min(1, 'Rahmenmaß ist erforderlich'),
  herkunft: z.string().optional(),
  koeniginId: z.string().optional(),
  status: z.object({
    brut: z.enum(['gut', 'mittel', 'schlecht']).default('gut'),
    futter: z.enum(['gut', 'mittel', 'schlecht']).default('gut'),
    varroa: z.enum(['gut', 'mittel', 'schlecht']).default('gut'),
    platz: z.enum(['gut', 'mittel', 'schlecht']).default('gut')
  }),
  tags: z.array(z.string()).default([]),
  qrKey: z.string().optional(),
  nfcUid: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Durchsicht schema
export const DurchsichtSchema = z.object({
  id: z.string(),
  volkId: z.string(),
  datum: z.date(),
  checks: z.object({
    koenigin: z.boolean().default(false),
    stifte: z.boolean().default(false),
    larven: z.boolean().default(false),
    verdeckelte: z.boolean().default(false)
  }),
  pollen: z.enum(['viel', 'mittel', 'wenig', 'keine']).optional(),
  futter: z.enum(['viel', 'mittel', 'wenig', 'keine']).optional(),
  verhalten: z.enum(['ruhig', 'unruhig', 'aggressiv', 'normal']).optional(),
  wabenZaehlen: z.object({
    brut: z.number().min(0).default(0),
    futter: z.number().min(0).default(0),
    leer: z.number().min(0).default(0)
  }),
  volksstaerke: z.number().min(0).max(10).default(5),
  sprachmemoFile: z.string().optional(), // FileRef ID
  transkriptFile: z.string().optional(), // FileRef ID
  followUps: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Behandlung (TAMG) schema
export const BehandlungSchema = z.object({
  id: z.string(),
  scope: z.object({
    volkId: z.string().optional(),
    standortId: z.string().optional(),
    workspace: z.boolean().optional()
  }),
  datum: z.date(),
  praep: z.string().min(1, 'Präparat ist erforderlich'),
  wirkstoff: z.string().min(1, 'Wirkstoff ist erforderlich'),
  charge: z.string().optional(),
  dosis: z.string().min(1, 'Dosis ist erforderlich'),
  methode: z.string().optional(),
  wartezeitTage: z.number().min(0),
  behandler: z.string().min(1, 'Behandler ist erforderlich'),
  quelle: z.string().optional(),
  belegRef: z.string().optional(), // FileRef ID
  sperrBis: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Fütterung schema
export const FuetterungSchema = z.object({
  id: z.string(),
  volkId: z.string().optional(),
  standortId: z.string().optional(),
  datum: z.date(),
  futtertyp: z.enum(['zuckerwasser', 'sirup', 'teig', 'fondant', 'honig']),
  menge_kg: z.number().min(0),
  methode: z.enum(['futtertasche', 'obertraeger', 'leerzarge', 'direktfuetterung']).optional(),
  anlass: z.enum(['auffuetterung', 'notfuetterung', 'reizfuetterung', 'wintervorrat']).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Kalender Event schema
export const KalenderEventSchema = z.object({
  id: z.string(),
  typ: z.string().min(1, 'Event-Typ ist erforderlich'),
  start: z.date(),
  ende: z.date().optional(),
  scope: z.enum(['workspace', 'standort', 'volk']),
  sourceEntity: z.string().optional(),
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  deletedAt: z.date().optional()
})

// Type exports
export type Address = z.infer<typeof AddressSchema>
export type Geo = z.infer<typeof GeoSchema>
export type FileRef = z.infer<typeof FileRefSchema>
export type User = z.infer<typeof UserSchema>
export type Workspace = z.infer<typeof WorkspaceSchema>
export type Membership = z.infer<typeof MembershipSchema>
export type Standort = z.infer<typeof StandortSchema>
export type Queen = z.infer<typeof QueenSchema>
export type QueenEvent = z.infer<typeof QueenEventSchema>
export type Volk = z.infer<typeof VolkSchema>
export type Durchsicht = z.infer<typeof DurchsichtSchema>
export type Behandlung = z.infer<typeof BehandlungSchema>
export type Fuetterung = z.infer<typeof FuetterungSchema>
export type KalenderEvent = z.infer<typeof KalenderEventSchema>