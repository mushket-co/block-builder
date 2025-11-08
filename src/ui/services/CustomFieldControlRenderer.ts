import {
  ICustomFieldContext,
  ICustomFieldRenderer,
  ICustomFieldRenderResult,
} from '../../core/ports/CustomFieldRenderer';

export interface ICustomFieldControlOptions {
  fieldName: string;
  label: string;
  value: any;
  required: boolean;
  rendererId: string;
  options?: Record<string, any>;
  onChange: (value: any) => void;
  onError?: (error: string | null) => void;
}

export class CustomFieldControlRenderer {
  private container: HTMLElement;
  private renderer: ICustomFieldRenderer;
  private renderResult: ICustomFieldRenderResult | null = null;
  private currentValue: any;
  private onChange: (value: any) => void;

  constructor(
    container: HTMLElement,
    renderer: ICustomFieldRenderer,
    options: ICustomFieldControlOptions
  ) {
    this.container = container;
    this.renderer = renderer;
    this.currentValue = options.value;
    this.onChange = options.onChange;

    const context: ICustomFieldContext = {
      fieldName: options.fieldName,
      label: options.label,
      value: options.value,
      required: options.required,
      options: options.options,
      onChange: (newValue: any) => {
        this.currentValue = newValue;
        this.onChange(newValue);
      },
      onError: options.onError,
    };

    this.initRenderer(context);
  }

  private async initRenderer(context: ICustomFieldContext): Promise<void> {
    try {
      const result = await this.renderer.render(this.container, context);
      this.renderResult = result;

      if (typeof result.element === 'string') {
        this.container.innerHTML = result.element;
      } else if (result.element instanceof HTMLElement) {
        this.container.innerHTML = '';
        this.container.append(result.element);
      }

      if (this.container.classList.contains('custom-field-placeholder')) {
        this.container.removeAttribute('style');
        this.container.classList.remove('bb-placeholder-box');
      }
    } catch (error) {
      this.showError(`Ошибка инициализации поля: ${error}`);
    }
  }

  getValue(): any {
    if (this.renderResult?.getValue) {
      return this.renderResult.getValue();
    }
    return this.currentValue;
  }

  setValue(value: any): void {
    this.currentValue = value;
    if (this.renderResult?.setValue) {
      this.renderResult.setValue(value);
    }
  }

  validate(): string | null {
    if (this.renderResult?.validate) {
      return this.renderResult.validate();
    }
    return null;
  }

  destroy(): void {
    if (this.renderResult?.destroy) {
      this.renderResult.destroy();
    }
    this.container.innerHTML = '';
  }

  private showError(message: string): void {
    if (this.container.classList.contains('custom-field-placeholder')) {
      this.container.removeAttribute('style');
      this.container.classList.remove('bb-placeholder-box');
    }
    this.container.innerHTML = `
      <div class="bb-error-box">
        ❌ ${message}
      </div>
    `;
  }
}
