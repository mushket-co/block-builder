import { TFieldType } from '../../../core/types/form';
import { IFieldRenderer } from './IFieldRenderer';
import { TextFieldRenderer } from './TextFieldRenderer';
import { TextareaFieldRenderer } from './TextareaFieldRenderer';
import { NumberFieldRenderer } from './NumberFieldRenderer';
import { ColorFieldRenderer } from './ColorFieldRenderer';
import { UrlFieldRenderer } from './UrlFieldRenderer';
import { EmailFieldRenderer } from './EmailFieldRenderer';
import { FileFieldRenderer } from './FileFieldRenderer';
import { CheckboxFieldRenderer } from './CheckboxFieldRenderer';
import { SelectFieldRenderer } from './SelectFieldRenderer';
import { RadioFieldRenderer } from './RadioFieldRenderer';
import { ImageFieldRenderer } from './ImageFieldRenderer';
import { SpacingFieldRenderer } from './SpacingFieldRenderer';
import { RepeaterFieldRenderer } from './RepeaterFieldRenderer';
import { ApiSelectFieldRenderer } from './ApiSelectFieldRenderer';
import { CustomFieldRenderer } from './CustomFieldRenderer';

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
      return this.renderers.get('text')!;
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

