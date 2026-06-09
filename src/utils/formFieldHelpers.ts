import type { IBreakpoint } from '../core/types/form';
import type { IFormFieldConfig } from '../core/types/form';

export function isFieldRequired(field: IFormFieldConfig): boolean {
  return field.rules?.some(rule => rule.type === 'required') ?? false;
}

export function getFieldError(
  field: IFormFieldConfig,
  formErrors: Record<string, string[]>
): string {
  const errors = formErrors[field.field];
  return errors?.[0] || '';
}

export function isFieldVisible(
  field: IFormFieldConfig,
  formData: Record<string, unknown>,
  itemData?: Record<string, unknown>
): boolean {
  if (!field.dependsOn) {
    return true;
  }

  const dataSource = itemData || formData;
  const dependentValue = dataSource[field.dependsOn.field];
  const operator = field.dependsOn.operator || 'equals';

  switch (operator) {
    case 'equals':
      return dependentValue === field.dependsOn.value;
    case 'notEquals':
      return dependentValue !== field.dependsOn.value;
    case 'in':
      return Array.isArray(field.dependsOn.value) && field.dependsOn.value.includes(dependentValue);
    case 'notIn':
      return Array.isArray(field.dependsOn.value) && !field.dependsOn.value.includes(dependentValue);
    default:
      return dependentValue === field.dependsOn.value;
  }
}

export function getSpacingBreakpoints(
  field: IFormFieldConfig,
  blockSpacingOptions?: { config?: { breakpoints?: IBreakpoint[] } }
): IBreakpoint[] | undefined {
  let breakpoints = field.spacingConfig?.breakpoints;
  if ((!breakpoints || breakpoints.length === 0) && blockSpacingOptions?.config?.breakpoints) {
    breakpoints = blockSpacingOptions.config.breakpoints;
  }
  if (!breakpoints || breakpoints.length === 0) {
    return undefined;
  }
  return breakpoints;
}
