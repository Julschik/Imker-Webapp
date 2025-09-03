type LogLevel = 'log' | 'warn' | 'error';

function formatMessage(scope: string, level: LogLevel, ...args: any[]): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${scope.toUpperCase()}]`;
  
  switch (level) {
    case 'log':
      console.log(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'error':
      console.error(prefix, ...args);
      break;
  }
}

export function log(scope: string, ...args: any[]): void {
  formatMessage(scope, 'log', ...args);
}

export function warn(scope: string, ...args: any[]): void {
  formatMessage(scope, 'warn', ...args);
}

export function error(scope: string, ...args: any[]): void {
  formatMessage(scope, 'error', ...args);
}