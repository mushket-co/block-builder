import { TComponent } from '../ports/ComponentRegistry';
import { IComponentRegistry } from '../ports/ComponentRegistry';

/**
 * Use Case для управления Vue3 компонентами
 * Инкапсулирует бизнес-логику регистрации и управления компонентами
 */
export class ComponentManagementUseCase {
  constructor(private componentRegistry: IComponentRegistry) {}

  /**
   * Регистрация Vue3 компонента
   */
  registerComponent(name: string, component: TComponent): void {
  // Валидация имени компонента
  this.validateComponentName(name);
  
  // Валидация компонента
  this.validateComponent(component);

  // Регистрация компонента
  this.componentRegistry.register(name, component);
  }

  /**
   * Получение компонента по имени
   */
  getComponent(name: string): TComponent | null {
  return this.componentRegistry.get(name);
  }

  /**
   * Проверка существования компонента
   */
  hasComponent(name: string): boolean {
  return this.componentRegistry.has(name);
  }

  /**
   * Получение всех компонентов
   */
  getAllComponents(): Record<string, TComponent> {
  return this.componentRegistry.getAll();
  }

  /**
   * Удаление компонента
   */
  unregisterComponent(name: string): boolean {
  return this.componentRegistry.unregister(name);
  }

  /**
   * Очистка всех компонентов
   */
  clearComponents(): void {
  this.componentRegistry.clear();
  }

  /**
   * Массовая регистрация компонентов
   */
  registerComponents(components: Record<string, TComponent>): void {
  Object.entries(components).forEach(([name, component]) => {
    this.registerComponent(name, component);
  });
  }

  private validateComponentName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new Error('Component name must be a non-empty string');
  }

  if (name.trim() !== name) {
    throw new Error('Component name cannot have leading or trailing whitespace');
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
    throw new Error('Component name must start with a letter and contain only letters, numbers, underscores, and hyphens');
  }
  }

  private validateComponent(component: TComponent): void {
  if (!component) {
    throw new Error('Component must be provided');
  }

  if (typeof component !== 'object') {
    throw new Error('Component must be a Vue component object');
  }

  // Дополнительные проверки для Vue3 компонентов
  if (!component.name && !component.setup && !component.render && !component.template) {
    throw new Error('Component must have at least one of: name, setup, render, or template');
  }
  }
}
