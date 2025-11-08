import { ICustomFieldRenderer, ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
export class CustomFieldRendererRegistry implements ICustomFieldRendererRegistry {
  private renderers: Map<string, ICustomFieldRenderer> = new Map();
    register(renderer: ICustomFieldRenderer): void {
    if (!renderer.id) {
      throw new Error('Renderer ID is required');
    }
    if (this.renderers.has(renderer.id)) {
    }
    this.renderers.set(renderer.id, renderer);
  }
    get(id: string): ICustomFieldRenderer | null {
    return this.renderers.get(id) || null;
  }
    has(id: string): boolean {
    return this.renderers.has(id);
  }
    unregister(id: string): boolean {
    const existed = this.renderers.has(id);
    this.renderers.delete(id);
    
    if (existed) {
    }
    
    return existed;
  }
    getAll(): Map<string, ICustomFieldRenderer> {
    return new Map(this.renderers);
  }
    clear(): void {
    this.renderers.clear();
  }
    count(): number {
    return this.renderers.size;
  }
    getIds(): string[] {
    return Array.from(this.renderers.keys());
  }
}