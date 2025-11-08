import { IFormFieldConfig, TFieldType } from '../../core/types/form';
import { FieldRendererFactory, IFieldRenderer } from './form-renderers';

export type TFieldConfig = IFormFieldConfig;

export class FormBuilder {
  private rendererFactory: FieldRendererFactory;

  constructor(rendererFactory?: FieldRendererFactory) {
    this.rendererFactory = rendererFactory || FieldRendererFactory.getInstance();
  }

  generateCreateFormHTML(fields: TFieldConfig[]): string {
    return fields.map(field => this.generateFieldHTML(field, field.defaultValue)).join('');
  }

  generateEditFormHTML(fields: TFieldConfig[], currentProps: Record<string, unknown>): string {
    return fields
      .map(field => {
        const currentValue = currentProps[field.field] || field.defaultValue || '';
        return this.generateFieldHTML(field, currentValue);
      })
      .join('');
  }

  private generateFieldHTML(field: TFieldConfig, value: unknown): string {
    const fieldId = `field-${field.field}`;
    const required = field.rules?.some(rule => rule.type === 'required') ? 'required' : '';
    const renderer = this.rendererFactory.getRenderer(field.type || 'text');
    return renderer.render(fieldId, field, value, required);
  }

  registerRenderer(fieldType: TFieldType, renderer: IFieldRenderer): void {
    this.rendererFactory.register(fieldType, renderer);
  }

  validateForm(
    props: Record<string, unknown>,
    fields: TFieldConfig[]
  ): { valid: boolean; message?: string } {
    for (const field of fields) {
      const value = props[field.field];
      const rules = field.rules || [];

      for (const rule of rules) {
        if (rule.type === 'required') {
          const isEmpty =
            value === null ||
            value === undefined ||
            value === '' ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0);
          if (isEmpty) {
            return {
              valid: false,
              message: `${field.label}: ${rule.message || 'Поле обязательно для заполнения'}`,
            };
          }
        }

        if (
          rule.type === 'email' &&
          value &&
          typeof value === 'string' &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          return {
            valid: false,
            message: `${field.label}: ${rule.message || 'Некорректный email адрес'}`,
          };
        }

        if (
          rule.type === 'url' &&
          value &&
          typeof value === 'string' &&
          !/^https?:\/\/.+/.test(value)
        ) {
          return {
            valid: false,
            message: `${field.label}: ${rule.message || 'Некорректный URL'}`,
          };
        }

        if (
          rule.type === 'min' &&
          value &&
          rule.value !== undefined &&
          typeof rule.value === 'number'
        ) {
          const numValue = typeof value === 'number' ? value : Number(value);
          if (!Number.isNaN(numValue) && numValue < rule.value) {
            return {
              valid: false,
              message: `${field.label}: ${rule.message || `Значение должно быть не менее ${rule.value}`}`,
            };
          }
        }

        if (
          rule.type === 'max' &&
          value &&
          rule.value !== undefined &&
          typeof rule.value === 'number'
        ) {
          const numValue = typeof value === 'number' ? value : Number(value);
          if (!Number.isNaN(numValue) && numValue > rule.value) {
            return {
              valid: false,
              message: `${field.label}: ${rule.message || `Значение должно быть не более ${rule.value}`}`,
            };
          }
        }

        if (
          rule.type === 'minLength' &&
          value &&
          rule.value !== undefined &&
          typeof rule.value === 'number' &&
          (typeof value === 'string' || Array.isArray(value)) &&
          value.length < rule.value
        ) {
          return {
            valid: false,
            message: `${field.label}: ${rule.message || `Длина должна быть не менее ${rule.value} символов`}`,
          };
        }

        if (
          rule.type === 'maxLength' &&
          value &&
          rule.value !== undefined &&
          typeof rule.value === 'number' &&
          (typeof value === 'string' || Array.isArray(value)) &&
          value.length > rule.value
        ) {
          return {
            valid: false,
            message: `${field.label}: ${rule.message || `Длина должна быть не более ${rule.value} символов`}`,
          };
        }
      }
    }

    return { valid: true };
  }
}
