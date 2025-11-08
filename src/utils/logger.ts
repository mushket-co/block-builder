export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}
class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = false;
  constructor() {
    if (typeof window !== 'undefined') {
      this.isDevelopment = (window as any).__DEV__ === true ||
                          (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
    } else if (typeof process !== 'undefined') {
      this.isDevelopment = process.env?.NODE_ENV === 'development';
    }
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug('[BB Debug]', ...args);
    }
  }
  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info('[BB Info]', ...args);
    }
  }
  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn('[BB Warn]', ...args);
    }
  }
  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error('[BB Error]', ...args);
    }
  }
  
  dev(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('[BB Dev]', ...args);
    }
  }
}
export const logger = new Logger();