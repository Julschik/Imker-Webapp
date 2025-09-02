/**
 * Logging-Utility mit konsistenten Präfixen
 * Verwendung: log('AuthService', 'Benutzer eingeloggt', user.id)
 */

export function log(scope: string, ...args: any[]): void {
  console.log(`[${scope}]`, ...args);
}

export function warn(scope: string, ...args: any[]): void {
  console.warn(`[${scope}]`, ...args);
}

export function error(scope: string, ...args: any[]): void {
  console.error(`[${scope}]`, ...args);
}

// Optional: Debug-Integration für erweiterte Entwicklung
export function debug(scope: string) {
  return (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${scope}:debug]`, ...args);
    }
  };
}