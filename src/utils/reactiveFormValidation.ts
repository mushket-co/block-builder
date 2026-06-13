import type { IFormData } from '../core/types/common';
import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../core/types/form';
import { UniversalValidator } from './universalValidation';

export class ReactiveFormValidationTracker {
  private touched = false;

  reset(): void {
    this.touched = false;
  }

  touch(): void {
    this.touched = true;
  }

  get isTouched(): boolean {
    return this.touched;
  }

  revalidateIfTouched(
    formData: IFormData,
    formFields: IFormFieldConfig[],
    isFieldVisible?: (
      field: IFormFieldConfig | IRepeaterItemFieldConfig,
      itemData?: Record<string, unknown>
    ) => boolean
  ): Record<string, string[]> | null {
    if (!this.touched) {
      return null;
    }

    return UniversalValidator.validateForm(formData, formFields, isFieldVisible).errors;
  }
}

export function applyFormErrors(
  target: Record<string, string[]>,
  errors: Record<string, string[]>
): void {
  Object.keys(target).forEach(key => delete target[key]);
  Object.assign(target, errors);
}
