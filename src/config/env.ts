export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8787',
  BACKEND_PROVIDER: process.env.BACKEND_PROVIDER || 'selfhosted',
  SIGNED_URL_TTL_MIN: parseInt(process.env.SIGNED_URL_TTL_MIN || '15'),
  
  // Sichtbarkeit öffentlicher Daten
  PUBLIC_COORDS_MODE: process.env.PUBLIC_COORDS_MODE || 'hidden',
  PUBLIC_COORD_PRECISION: parseInt(process.env.PUBLIC_COORD_PRECISION || '2'),
  
  // Feature-Flags
  FEATURE_BACKUP: process.env.FEATURE_BACKUP === 'true',
  FEATURE_BULK: process.env.FEATURE_BULK === 'true',
  FEATURE_REPORTS: process.env.FEATURE_REPORTS === 'true',
  FEATURE_COMMENTS: process.env.FEATURE_COMMENTS === 'true',
  FEATURE_GUEST: process.env.FEATURE_GUEST === 'true',
  FEATURE_OFFLINE_TILES: process.env.FEATURE_OFFLINE_TILES === 'true',
  FEATURE_WEATHER_PREFETCH: process.env.FEATURE_WEATHER_PREFETCH === 'true',
  FEATURE_NOTIFICATIONS: process.env.FEATURE_NOTIFICATIONS === 'true',
  FEATURE_I18N: process.env.FEATURE_I18N === 'true',
  FEATURE_MANUAL_TRACHT: process.env.FEATURE_MANUAL_TRACHT === 'true',
  FEATURE_WARTEZEIT_CASCADE: process.env.FEATURE_WARTEZEIT_CASCADE === 'true',
  
  // Audio-Leitplanken
  AUDIO_MAX_MINUTES: parseInt(process.env.AUDIO_MAX_MINUTES || '10'),
  AUDIO_MAX_SIZE_MB: parseInt(process.env.AUDIO_MAX_SIZE_MB || '20'),
  AUDIO_WORKSPACE_QUOTA_GB: parseInt(process.env.AUDIO_WORKSPACE_QUOTA_GB || '2'),
  AUDIO_RETENTION_DAYS: parseInt(process.env.AUDIO_RETENTION_DAYS || '30'),
} as const;