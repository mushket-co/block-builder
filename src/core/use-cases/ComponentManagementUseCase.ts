import { TComponent } from '../ports/ComponentRegistry';
import { IComponentRegistry } from '../ports/ComponentRegistry';

export class ComponentManagementUseCase {
  constructor(private componentRegistry: IComponentRegistry) {}
  registerComponent(name: string, component: TComponent): void {
    this.validateComponentName(name);

    this.validateComponent(component);
    this.componentRegistry.register(name, component);
  }
  getComponent(name: string): TComponent | null {
    return this.componentRegistry.get(name);
  }
  hasComponent(name: string): boolean {
    return this.componentRegistry.has(name);
  }
  getAllComponents(): Record<string, TComponent> {
    return this.componentRegistry.getAll();
  }
  unregisterComponent(name: string): boolean {
    return this.componentRegistry.unregister(name);
  }
  clearComponents(): void {
    this.componentRegistry.clear();
  }
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
    if (!/^[A-Za-z][\w-]*$/.test(name)) {
      throw new Error(
        'Component name must start with a letter and contain only letters, numbers, underscores, and hyphens'
      );
    }
  }
  private validateComponent(component: TComponent): void {
    if (!component) {
      throw new Error('Component must be provided');
    }
    if (typeof component !== 'object') {
      throw new TypeError('Component must be a Vue component object');
    }
    if (!component.name && !component.setup && !component.render && !component.template) {
      throw new Error('Component must have at least one of: name, setup, render, or template');
    }
  }
}
