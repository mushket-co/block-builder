import { TFieldType } from '../../../core/types/form';
import { ApiSelectFieldRenderer } from './ApiSelectFieldRenderer';
import { CheckboxFieldRenderer } from './CheckboxFieldRenderer';
import { ColorFieldRenderer } from './ColorFieldRenderer';
import { CustomFieldRenderer } from './CustomFieldRenderer';
import { EmailFieldRenderer } from './EmailFieldRenderer';
import { FileFieldRenderer } from './FileFieldRenderer';
import { IFieldRenderer } from './IFieldRenderer';
import { ImageFieldRenderer } from './ImageFieldRenderer';
import { NumberFieldRenderer } from './NumberFieldRenderer';
import { RadioFieldRenderer } from './RadioFieldRenderer';
import { RepeaterFieldRenderer } from './RepeaterFieldRenderer';
import { SelectFieldRenderer } from './SelectFieldRenderer';
import { SpacingFieldRenderer } from './SpacingFieldRenderer';
import { TextareaFieldRenderer } from './TextareaFieldRenderer';
import { TextFieldRenderer } from './TextFieldRenderer';
import { UrlFieldRenderer } from './UrlFieldRenderer';

export class FieldRendererFactory {
  private static instance: FieldRendererFactory;
  private renderers: Map<TFieldType, IFieldRenderer> = new Map();

  private constructor() {
    this.registerDefaultRenderers();
  }

  static getInstance(): FieldRendererFactory {
    if (!FieldRendererFactory.instance) {
      FieldRendererFactory.instance = new FieldRendererFactory();
    }
    return FieldRendererFactory.instance;
  }

  private registerDefaultRenderers(): void {
    this.register('text', new TextFieldRenderer());
    this.register('textarea', new TextareaFieldRenderer());
    this.register('number', new NumberFieldRenderer());
    this.register('color', new ColorFieldRenderer());
    this.register('url', new UrlFieldRenderer());
    this.register('email', new EmailFieldRenderer());
    this.register('file', new FileFieldRenderer());
    this.register('select', new SelectFieldRenderer());
    this.register('checkbox', new CheckboxFieldRenderer());
    this.register('radio', new RadioFieldRenderer());
    this.register('image', new ImageFieldRenderer());
    this.register('spacing', new SpacingFieldRenderer());
    this.register('repeater', new RepeaterFieldRenderer());
    this.register('api-select', new ApiSelectFieldRenderer());
    this.register('custom', new CustomFieldRenderer());
  }

  register(fieldType: TFieldType, renderer: IFieldRenderer): void {
    this.renderers.set(fieldType, renderer);
  }

  getRenderer(fieldType: TFieldType): IFieldRenderer {
    const renderer = this.renderers.get(fieldType);
    if (!renderer) {
      const textRenderer = this.renderers.get('text');
      if (!textRenderer) {
        throw new Error('Text renderer не найден. Это внутренняя ошибка конфигурации.');
      }
      return textRenderer;
    }
    return renderer;
  }

  hasRenderer(fieldType: TFieldType): boolean {
    return this.renderers.has(fieldType);
  }

  getRegisteredTypes(): TFieldType[] {
    return Array.from(this.renderers.keys()) as TFieldType[];
  }
}
