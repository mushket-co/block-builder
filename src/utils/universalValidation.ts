import {
  IFormData,
  IFormFieldConfig,
  IRepeaterItemFieldConfig,
  IValidationResult,
  IValidationRule,
} from '../core/types';

export type {
  IFormData,
  IFormFieldConfig,
  IValidationResult,
  IValidationRule,
  TValidationRuleType,
} from '../core/types';
export const UniversalValidator = {
  validateField<T = unknown>(value: T, rules: IValidationRule[]): string[] {
    const errors: string[] = [];
    for (const rule of rules) {
      switch (rule.type) {
        case 'required': {
          let isEmpty = false;
          if (value === null || value === undefined || value === '') {
            isEmpty = true;
          } else if (Array.isArray(value) && value.length === 0) {
            isEmpty = true;
          } else if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') {
              isEmpty = true;
            } else {
              const hasHtmlTags = /<[^>]+>/.test(trimmed);
              if (hasHtmlTags) {
                const textContent = trimmed
                  .replaceAll(/<[^>]*>/g, '')
                  .replaceAll('&nbsp;', ' ')
                  .replaceAll('&amp;', '&')
                  .replaceAll('&lt;', '<')
                  .replaceAll('&gt;', '>')
                  .replaceAll('&quot;', '"')
                  .replaceAll('&#39;', "'")
                  .trim();
                if (
                  textContent === '' ||
                  textContent === '<br>' ||
                  trimmed === '<p></p>' ||
                  trimmed === '<p><br></p>'
                ) {
                  isEmpty = true;
                }
              }
            }
          }
          if (isEmpty) {
            errors.push(rule.message || 'Поле обязательно для заполнения');
          }
          break;
        }
        case 'email':
          if (typeof value === 'string' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(rule.message || 'Некорректный email адрес');
          }
          break;
        case 'url':
          if (typeof value === 'string' && value) {
            try {
              new URL(value);
            } catch {
              errors.push(rule.message || 'Некорректный URL');
            }
          }
          break;
        case 'min':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            if (typeof value === 'number' && value < rule.value) {
              errors.push(rule.message || `Значение должно быть не менее ${rule.value}`);
            }
            if (typeof value === 'string' && Number.parseFloat(value) < rule.value) {
              errors.push(rule.message || `Значение должно быть не менее ${rule.value}`);
            }
          }
          break;
        case 'max':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            if (typeof value === 'number' && value > rule.value) {
              errors.push(rule.message || `Значение должно быть не более ${rule.value}`);
            }
            if (typeof value === 'string' && Number.parseFloat(value) > rule.value) {
              errors.push(rule.message || `Значение должно быть не более ${rule.value}`);
            }
          }
          break;
        case 'minLength':
          if (
            rule.value !== undefined &&
            typeof rule.value === 'number' &&
            (typeof value === 'string' || Array.isArray(value)) &&
            value.length < rule.value
          ) {
            errors.push(rule.message || `Длина должна быть не менее ${rule.value} символов`);
          }
          break;
        case 'maxLength':
          if (
            rule.value !== undefined &&
            typeof rule.value === 'number' &&
            (typeof value === 'string' || Array.isArray(value)) &&
            value.length > rule.value
          ) {
            errors.push(rule.message || `Длина должна быть не более ${rule.value} символов`);
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && value) {
            if (rule.value === undefined || rule.value === null) {
              break;
            }
            let pattern: RegExp;
            if (rule.value instanceof RegExp) {
              pattern = rule.value;
            } else if (typeof rule.value === 'string') {
              const patternString: string = rule.value;
              pattern = new RegExp(patternString);
            } else {
              break;
            }
            if (!pattern.test(value)) {
              errors.push(rule.message || 'Значение не соответствует формату');
            }
          }
          break;
        case 'custom':
          if (typeof rule.validator === 'function' && !rule.validator(value)) {
            errors.push(rule.message || 'Значение не прошло валидацию');
          }
          break;
      }
    }
    return errors;
  },

  validateForm(
    formData: IFormData,
    formFields: IFormFieldConfig[],
    isFieldVisible?: (
      field: IFormFieldConfig | IRepeaterItemFieldConfig,
      itemData?: Record<string, unknown>
    ) => boolean
  ): IValidationResult {
    const formErrors: Record<string, string[]> = {};
    let isValid = true;
    for (const fieldConfig of formFields) {
      if (isFieldVisible && !isFieldVisible(fieldConfig)) {
        continue;
      }

      if (fieldConfig.rules && fieldConfig.rules.length > 0) {
        const errors = this.validateField(formData[fieldConfig.field], fieldConfig.rules);
        if (errors.length > 0) {
          formErrors[fieldConfig.field] = errors;
          isValid = false;
        }
      }
      if (fieldConfig.type === 'repeater' && fieldConfig.repeaterConfig) {
        const arrayValue = formData[fieldConfig.field];
        if (Array.isArray(arrayValue)) {
          this.validateRepeaterRecursive(
            fieldConfig.field,
            arrayValue,
            fieldConfig.repeaterConfig.fields || [],
            formErrors,
            '',
            formData,
            isFieldVisible
          );
          if (Object.keys(formErrors).some(key => key.startsWith(fieldConfig.field))) {
            isValid = false;
          }
        }
      }
    }
    return {
      isValid,
      errors: formErrors,
    };
  },
  createFieldValidator(rules: IValidationRule[]) {
    return (value: unknown) => this.validateField(value, rules);
  },
  createFormValidator(formFields: IFormFieldConfig[]) {
    return (formData: IFormData) => this.validateForm(formData, formFields);
  },

  validateRepeaterRecursive(
    baseFieldPath: string,
    arrayValue: any[],
    repeaterFields: IRepeaterItemFieldConfig[],
    formErrors: Record<string, string[]>,
    parentPath: string = '',
    formData?: IFormData,
    isFieldVisible?: (field: IRepeaterItemFieldConfig | IFormFieldConfig, itemData?: any) => boolean
  ): void {
    const fullPath = parentPath ? `${parentPath}.${baseFieldPath}` : baseFieldPath;

    arrayValue.forEach((item, index) => {
      for (const repeaterField of repeaterFields) {
        if (isFieldVisible && !isFieldVisible(repeaterField, item)) {
          continue;
        }

        const fieldPath = `${fullPath}[${index}].${repeaterField.field}`;

        if (repeaterField.rules && repeaterField.rules.length > 0) {
          const fieldErrors = this.validateField(item[repeaterField.field], repeaterField.rules);
          if (fieldErrors.length > 0) {
            formErrors[fieldPath] = fieldErrors;
          }
        }

        if (repeaterField.type === 'repeater' && repeaterField.repeaterConfig) {
          const nestedArrayValue = item[repeaterField.field];
          if (Array.isArray(nestedArrayValue)) {
            this.validateRepeaterRecursive(
              repeaterField.field,
              nestedArrayValue,
              repeaterField.repeaterConfig.fields || [],
              formErrors,
              `${fullPath}[${index}]`,
              formData,
              isFieldVisible
            );
          }
        }
      }
    });
  },
};
