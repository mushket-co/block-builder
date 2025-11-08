import { IComponentRegistry } from '../../core/ports/ComponentRegistry';
import { TComponent } from '../../core/types';

export class MemoryComponentRegistry implements IComponentRegistry {
  private components: Map<string, TComponent> = new Map();
  register(name: string, component: TComponent): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Component name must be a non-empty string');
    }
    if (!component) {
      throw new Error('Component must be provided');
    }
    this.components.set(name, component);
  }
  get(name: string): TComponent | null {
    return this.components.get(name) || null;
  }
  has(name: string): boolean {
    return this.components.has(name);
  }
  getAll(): Record<string, TComponent> {
    const result: Record<string, TComponent> = {};
    this.components.forEach((component, name) => {
      result[name] = component;
    });
    return result;
  }
  unregister(name: string): boolean {
    return this.components.delete(name);
  }
  clear(): void {
    this.components.clear();
  }
}
