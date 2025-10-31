/**
 * Общие типы для всего приложения
 */

// Базовые типы
export type TBlockId = string;

// Vue3 Component type (без импорта Vue для совместимости)
export type TComponent = any;

// Рендер-описание (универсальное, независимое от фреймворка)
export type TRenderRef =
  | {
    kind: 'html';
    template: string | ((props: Record<string, any>) => string);
  }
  | {
    kind: 'component';
    framework: 'vue' | 'react' | string; // Позволяет добавлять новые движки без изменения DTO
    name?: string; // Имя компонента в реестре/адаптере
    component?: any; // Прямая ссылка на компонент
    props?: Record<string, any>;
  }
  | {
    kind: 'external';
    adapter: string; // Имя адаптера/рендерера, реализуемого в UI слое
    payload: Record<string, any>; // Произвольные данные для адаптера
  }
  | {
    kind: 'custom';
    mount: (container: HTMLElement, props: Record<string, any>) => void; // Императивная функция монтирования
    unmount?: (container: HTMLElement) => void; // Опциональная функция размонтирования
  };

// Общие интерфейсы для данных
export interface IFormData {
  [key: string]: any;
}
