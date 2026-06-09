import { TFieldType } from '../../core/types/form';
import { IFieldRenderer } from './form-renderers/IFieldRenderer';

export interface IFieldControlInfo {
  type: TFieldType;
  label: string;
  description?: string;
  requiresRenderer: boolean;
  requiresComponent?: boolean;
  componentName?: string;
  defaultConfig?: Record<string, unknown>;
}

export class FieldControlRegistry {
  private static instance: FieldControlRegistry;
  private fieldInfos: Map<TFieldType, IFieldControlInfo> = new Map();
  private renderers: Map<TFieldType, IFieldRenderer> = new Map();
  private components: Map<TFieldType, any> = new Map();

  private constructor() {
    this.registerDefaultFields();
  }

  static getInstance(): FieldControlRegistry {
    if (!FieldControlRegistry.instance) {
      FieldControlRegistry.instance = new FieldControlRegistry();
    }
    return FieldControlRegistry.instance;
  }

  private registerDefaultFields(): void {
    this.registerFieldInfo({
      type: 'text',
      label: 'Текстовое поле',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'TextField',
    });

    this.registerFieldInfo({
      type: 'email',
      label: 'Email',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'TextField',
    });

    this.registerFieldInfo({
      type: 'url',
      label: 'URL',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'TextField',
    });

    this.registerFieldInfo({
      type: 'textarea',
      label: 'Многострочный текст',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'TextareaField',
    });

    this.registerFieldInfo({
      type: 'number',
      label: 'Число',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'NumberField',
    });

    this.registerFieldInfo({
      type: 'color',
      label: 'Цвет',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'ColorField',
    });

    this.registerFieldInfo({
      type: 'select',
      label: 'Выпадающий список',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'SelectField',
    });

    this.registerFieldInfo({
      type: 'checkbox',
      label: 'Чекбокс',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'CheckboxField',
    });

    this.registerFieldInfo({
      type: 'radio',
      label: 'Радио кнопки',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'RadioField',
    });

    this.registerFieldInfo({
      type: 'file',
      label: 'Файл',
      requiresRenderer: true,
      requiresComponent: false,
    });

    this.registerFieldInfo({
      type: 'image',
      label: 'Изображение',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'ImageUploadField',
    });

    this.registerFieldInfo({
      type: 'spacing',
      label: 'Отступы',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'SpacingControl',
    });

    this.registerFieldInfo({
      type: 'repeater',
      label: 'Повторитель',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'RepeaterControl',
    });

    this.registerFieldInfo({
      type: 'api-select',
      label: 'API Select',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'ApiSelectField',
    });

    this.registerFieldInfo({
      type: 'custom',
      label: 'Кастомное поле',
      requiresRenderer: true,
      requiresComponent: true,
      componentName: 'CustomField',
    });
  }

  registerFieldInfo(info: IFieldControlInfo): void {
    this.fieldInfos.set(info.type, info);
  }

  getFieldInfo(type: TFieldType): IFieldControlInfo | undefined {
    return this.fieldInfos.get(type);
  }

  hasFieldInfo(type: TFieldType): boolean {
    return this.fieldInfos.has(type);
  }

  getAllFieldTypes(): TFieldType[] {
    return Array.from(this.fieldInfos.keys());
  }

  registerRenderer(type: TFieldType, renderer: IFieldRenderer): void {
    this.renderers.set(type, renderer);
  }

  getRenderer(type: TFieldType): IFieldRenderer | undefined {
    return this.renderers.get(type);
  }

  hasRenderer(type: TFieldType): boolean {
    return this.renderers.has(type);
  }

  registerComponent(type: TFieldType, component: any): void {
    this.components.set(type, component);
  }

  getComponent(type: TFieldType): any | undefined {
    return this.components.get(type);
  }

  hasComponent(type: TFieldType): boolean {
    return this.components.has(type);
  }

  getComponentName(type: TFieldType): string | undefined {
    const info = this.getFieldInfo(type);
    return info?.componentName;
  }

  shouldUseComponent(type: TFieldType): boolean {
    const info = this.getFieldInfo(type);
    return info?.requiresComponent === true;
  }

  shouldUseRenderer(type: TFieldType): boolean {
    const info = this.getFieldInfo(type);
    return info?.requiresRenderer === true;
  }
}
