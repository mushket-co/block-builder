import { CSS_CLASSES } from '../../../utils/constants';
import { TFieldConfig } from '../FormBuilder';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';
import { ISelectControlOptions, SelectControlRenderer } from '../SelectControlRenderer';

export interface ISelectControlInitializerConfig {
  getCurrentFormFields: () => Map<string, TFieldConfig>;
}

export class SelectControlInitializer implements IControlInitializer {
  constructor(private config: ISelectControlInitializerConfig) {}

  getControlType(): string {
    return 'select';
  }

  canHandle(container: HTMLElement): boolean {
    return container.classList.contains(CSS_CLASSES.SELECT_PLACEHOLDER);
  }

  async initialize(container: HTMLElement): Promise<IControlRenderer | null> {
    const fieldName = container.dataset.fieldName;
    const fieldId = container.dataset.fieldId;

    if (!fieldName || !fieldId) {
      return null;
    }

    try {
      const formGroup = container.closest(`.${CSS_CLASSES.FORM_GROUP}`) as HTMLElement;
      if (!formGroup) {
        return null;
      }

      const fieldConfig = this.config.getCurrentFormFields().get(fieldName);
      if (!fieldConfig || fieldConfig.type !== 'select') {
        return null;
      }

      const hiddenInput = formGroup.querySelector(
        `input[type="hidden"][name="${fieldName}"]`
      ) as HTMLInputElement;
      let currentValue: string | number | (string | number)[] | null = null;

      if (hiddenInput) {
        const inputValue = hiddenInput.value;
        if (fieldConfig.multiple) {
          try {
            currentValue = JSON.parse(inputValue || '[]');
          } catch {
            currentValue = [];
          }
        } else {
          currentValue = inputValue || null;
          if (
            currentValue &&
            typeof currentValue === 'string' &&
            !Number.isNaN(Number(currentValue))
          ) {
            const numValue = Number(currentValue);
            const option = fieldConfig.options?.find(opt => {
              const optValue = typeof opt.value === 'number' ? opt.value : Number(opt.value);
              return !Number.isNaN(optValue) && optValue === numValue;
            });
            if (option) {
              currentValue = typeof option.value === 'number' ? option.value : numValue;
            }
          }
        }
      } else {
        const defaultValue = fieldConfig.defaultValue;
        if (fieldConfig.multiple) {
          currentValue = Array.isArray(defaultValue) ? defaultValue : [];
        } else {
          if (defaultValue === null || defaultValue === undefined || defaultValue === '') {
            currentValue = null;
          } else if (typeof defaultValue === 'string' || typeof defaultValue === 'number') {
            currentValue = defaultValue;
          } else {
            currentValue = null;
          }
        }
      }

      const options = (fieldConfig.options || []).map(opt => ({
        value: opt.value,
        label: opt.label,
        disabled: opt.disabled || false,
      }));

      const selectOptions: ISelectControlOptions = {
        fieldName,
        label: fieldConfig.label || '',
        rules: fieldConfig.rules || [],
        errors: {},
        value: currentValue,
        multiple: fieldConfig.multiple || false,
        placeholder: fieldConfig.placeholder || 'Выберите значение',
        options,
        onChange: (newValue: string | number | (string | number)[] | null) => {
          if (hiddenInput) {
            hiddenInput.value =
              fieldConfig.multiple && Array.isArray(newValue)
                ? JSON.stringify(newValue)
                : String(newValue ?? '');
          }

          container.dataset.selectValue = JSON.stringify(newValue);
        },
      };

      const renderer = new SelectControlRenderer(selectOptions);
      await renderer.init(container);

      return {
        render: () => renderer.init(container),
        destroy: () => renderer.destroy(),
        getValue: () => renderer.getValue(),
      };
    } catch {
      return null;
    }
  }
}
