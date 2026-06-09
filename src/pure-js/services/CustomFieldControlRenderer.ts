import {
  ICustomFieldContext,
  ICustomFieldRenderer,
  ICustomFieldRenderResult,
} from '../../core/ports/CustomFieldRenderer';
import { CSS_CLASSES } from '../../utils/constants';

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
  private fieldName: string;

  constructor(
    container: HTMLElement,
    renderer: ICustomFieldRenderer,
    options: ICustomFieldControlOptions
  ) {
    this.container = container;
    this.renderer = renderer;
    this.currentValue = options.value;
    this.onChange = options.onChange;
    this.fieldName = options.fieldName;

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

      if (this.container.classList.contains(CSS_CLASSES.CUSTOM_FIELD_PLACEHOLDER)) {
        this.container.removeAttribute('style');
        this.container.classList.remove(CSS_CLASSES.BB_PLACEHOLDER_BOX);
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

  updateErrors(errors: Record<string, string[]>): void {
    const fieldErrors = errors[this.fieldName];
    const hasError = fieldErrors && fieldErrors.length > 0;
    const errorMessage = hasError ? fieldErrors[0] : null;

    const formGroup = this.container.closest(`.${CSS_CLASSES.FORM_GROUP}`) as HTMLElement;
    if (formGroup) {
      if (hasError) {
        formGroup.classList.add(CSS_CLASSES.ERROR);
      } else {
        formGroup.classList.remove(CSS_CLASSES.ERROR);
      }
    }

    let errorContainer = formGroup?.querySelector(`.${CSS_CLASSES.FORM_ERRORS}`) as HTMLElement;

    if (hasError && errorMessage) {
      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = CSS_CLASSES.FORM_ERRORS;
        formGroup?.append(errorContainer);
      }
      errorContainer.innerHTML = `<span class="${CSS_CLASSES.ERROR}">${this.escapeHtml(errorMessage)}</span>`;
      errorContainer.style.display = '';
    } else if (errorContainer) {
      errorContainer.style.display = 'none';
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy(): void {
    if (this.renderResult?.destroy) {
      this.renderResult.destroy();
    }
    this.container.innerHTML = '';
  }

  private showError(message: string): void {
    if (this.container.classList.contains(CSS_CLASSES.CUSTOM_FIELD_PLACEHOLDER)) {
      this.container.removeAttribute('style');
      this.container.classList.remove(CSS_CLASSES.BB_PLACEHOLDER_BOX);
    }
    this.container.innerHTML = `
      <div class="${CSS_CLASSES.BB_ERROR_BOX}">
        ❌ ${message}
      </div>
    `;
  }
}
