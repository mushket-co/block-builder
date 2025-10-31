import { TComponent } from '../types';

// Реэкспорт типа для обратной совместимости
export type { TComponent } from '../types';

/**
 * Port для регистрации Vue3 компонентов
 * Позволяет регистрировать пользовательские компоненты для блоков
 */
export interface IComponentRegistry {
  /**
   * Регистрация компонента
   */
  register(name: string, component: TComponent): void;

  /**
   * Получение компонента по имени
   */
  get(name: string): TComponent | null;

  /**
   * Проверка существования компонента
   */
  has(name: string): boolean;

  /**
   * Получение всех зарегистрированных компонентов
   */
  getAll(): Record<string, TComponent>;

  /**
   * Удаление компонента
   */
  unregister(name: string): boolean;

  /**
   * Очистка всех компонентов
   */
  clear(): void;
}
