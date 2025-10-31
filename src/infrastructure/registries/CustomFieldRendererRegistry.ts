/**
 * CustomFieldRendererRegistry - реестр кастомных рендереров полей
 * Infrastructure слой - реализация интерфейса ICustomFieldRendererRegistry
 * Принцип единой ответственности (SRP)
 */

import { ICustomFieldRenderer, ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';

/**
 * Реализация реестра кастомных рендереров полей в памяти
 */
export class CustomFieldRendererRegistry implements ICustomFieldRendererRegistry {
  private renderers: Map<string, ICustomFieldRenderer> = new Map();

  /**
   * Регистрация рендерера
   */
  register(renderer: ICustomFieldRenderer): void {
    if (!renderer.id) {
      throw new Error('Renderer ID is required');
    }

    if (this.renderers.has(renderer.id)) {
      // Renderer already exists, it will be overwritten
    }

    this.renderers.set(renderer.id, renderer);
    // Custom field renderer registered
  }

  /**
   * Получение рендерера по ID
   */
  get(id: string): ICustomFieldRenderer | null {
    return this.renderers.get(id) || null;
  }

  /**
   * Проверка существования рендерера
   */
  has(id: string): boolean {
    return this.renderers.has(id);
  }

  /**
   * Удаление рендерера
   */
  unregister(id: string): boolean {
    const existed = this.renderers.has(id);
    this.renderers.delete(id);
    
    if (existed) {
      // Custom field renderer unregistered
    }
    
    return existed;
  }

  /**
   * Получение всех рендереров
   */
  getAll(): Map<string, ICustomFieldRenderer> {
    return new Map(this.renderers);
  }

  /**
   * Очистка всех рендереров
   */
  clear(): void {
    this.renderers.clear();
    // All custom field renderers cleared
  }

  /**
   * Получение количества зарегистрированных рендереров
   */
  count(): number {
    return this.renderers.size;
  }

  /**
   * Получение списка ID всех рендереров
   */
  getIds(): string[] {
    return Array.from(this.renderers.keys());
  }
}

