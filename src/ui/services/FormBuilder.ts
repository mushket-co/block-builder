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

  generateEditFormHTML(fields: TFieldConfig[], currentProps: Record<string, any>): string {
    return fields.map(field => {
      const currentValue = currentProps[field.field] || field.defaultValue || '';
      return this.generateFieldHTML(field, currentValue);
    }).join('');
  }

  private generateFieldHTML(field: TFieldConfig, value: any): string {
    const fieldId = `field-${field.field}`;
    const required = field.rules?.some(rule => rule.type === 'required') ? 'required' : '';
    const renderer = this.rendererFactory.getRenderer(field.type || 'text');
    return renderer.render(fieldId, field, value, required);
  }

  registerRenderer(fieldType: TFieldType, renderer: IFieldRenderer): void {
    this.rendererFactory.register(fieldType, renderer);
  }

  validateForm(props: Record<string, any>, fields: TFieldConfig[]): { valid: boolean; message?: string } {
  for (const field of fields) {
    const value = props[field.field];
    const rules = field.rules || [];

    for (const rule of rules) {
      if (rule.type === 'required' && (!value || value.toString().trim() === '')) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      if (rule.type === 'url' && value && !/^https?:\/\/.+/.test(value)) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      if (rule.type === 'min' && value && Number(value) < rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      if (rule.type === 'max' && value && Number(value) > rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      if (rule.type === 'minLength' && value && value.length < rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      if (rule.type === 'maxLength' && value && value.length > rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }
    }
  }

  return { valid: true };
  }
}

