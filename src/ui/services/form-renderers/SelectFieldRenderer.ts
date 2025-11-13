import { IFormFieldConfig } from '../../../core/types/form';
import { ISelectControlOptions, SelectControlRenderer } from '../../services/SelectControlRenderer';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class SelectFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'select';
  private selectRenderer?: SelectControlRenderer;

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const fieldName = this.getFieldName(context, field);

    return `<div class="select-placeholder" data-field-name="${fieldName}" data-field-id="${fieldId}"></div>`;
  }

  async renderControl(
    container: HTMLElement,
    field: IFormFieldConfig,
    value: any,
    context?: IRenderContext
  ): Promise<void> {
    const fieldName = this.getFieldName(context, field);
    const placeholder = container.querySelector('.select-placeholder') as HTMLElement;

    if (!placeholder) {
      return;
    }

    const options = (field.options || []).map(opt => ({
      value: opt.value,
      label: opt.label,
      disabled: opt.disabled || false,
    }));

    const rules = field.rules || [];
    const errors = context?.errors || {};

    const selectOptions: ISelectControlOptions = {
      fieldName,
      label: field.label || '',
      rules,
      errors,
      value: value ?? null,
      multiple: field.multiple || false,
      placeholder: field.placeholder || 'Выберите значение',
      options,
      onChange: (newValue: string | number | (string | number)[] | null) => {
        if (context?.onFieldChange) {
          context.onFieldChange(fieldName, newValue);
        }
      },
    };

    this.selectRenderer = new SelectControlRenderer(selectOptions);
    await this.selectRenderer.init(placeholder);
  }

  destroy(): void {
    if (this.selectRenderer) {
      this.selectRenderer.destroy();
      this.selectRenderer = undefined;
    }
  }
}
