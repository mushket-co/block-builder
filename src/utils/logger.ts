/**
 * Система логирования с поддержкой уровней и окружений
 */

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
    // Определяем окружение
    // В браузерном окружении проверяем наличие window и не production режима
    if (typeof window !== 'undefined') {
      // Проверяем через process.env если доступен (например в vite/webpack)
      this.isDevelopment = (window as any).__DEV__ === true ||
                          (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
    } else if (typeof process !== 'undefined') {
      this.isDevelopment = process.env?.NODE_ENV === 'development';
    }

    // В production показываем только WARN и ERROR
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

  /**
   * Логирует только в development режиме
   */
  dev(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('[BB Dev]', ...args);
    }
  }
}

// Создаем singleton экземпляр
export const logger = new Logger();

