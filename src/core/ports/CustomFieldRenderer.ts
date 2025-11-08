export interface ICustomFieldConfig {
  
  rendererId: string;
  
  options?: Record<string, any>;
}
export interface ICustomFieldContext {
  
  fieldName: string;
  
  label: string;
  
  value: any;
  
  required: boolean;
  
  options?: Record<string, any>;
  
  onChange: (newValue: any) => void;
  
  onError?: (error: string | null) => void;
}
export interface ICustomFieldRenderResult {
  
  element: HTMLElement | string;
  
  destroy?: () => void;
  
  getValue?: () => any;
  
  setValue?: (value: any) => void;
  
  validate?: () => string | null;
}
export interface ICustomFieldRenderer {
  
  readonly id: string;
  
  readonly name: string;
  
  render(container: HTMLElement, context: ICustomFieldContext): ICustomFieldRenderResult | Promise<ICustomFieldRenderResult>;
}
export interface ICustomFieldRendererRegistry {
    register(renderer: ICustomFieldRenderer): void;
    get(id: string): ICustomFieldRenderer | null;
    has(id: string): boolean;
    unregister(id: string): boolean;
    getAll(): Map<string, ICustomFieldRenderer>;
    clear(): void;
}