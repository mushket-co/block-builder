export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}
class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = false;
  constructor() {
    if (typeof window !== 'undefined') {
      this.isDevelopment =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__DEV__ === true ||
        (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
    } else if (typeof process !== 'undefined') {
      this.isDevelopment = process.env?.NODE_ENV === 'development';
    }
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      // eslint-disable-next-line no-console
      console.debug('[BB Debug]', ...args);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      // eslint-disable-next-line no-console
      console.info('[BB Info]', ...args);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      // eslint-disable-next-line no-console
      console.warn('[BB Warn]', ...args);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      // eslint-disable-next-line no-console
      console.error('[BB Error]', ...args);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dev(...args: any[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('[BB Dev]', ...args);
    }
  }
}
export const logger = new Logger();
