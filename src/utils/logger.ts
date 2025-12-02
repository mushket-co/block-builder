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
  debug(..._args: any[]): void {
    // Логирование отключено
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(..._args: any[]): void {
    // Логирование отключено
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(..._args: any[]): void {
    // Логирование отключено
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(..._args: any[]): void {
    // Логирование отключено
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dev(..._args: any[]): void {
    // Логирование отключено
  }
}
export const logger = new Logger();
