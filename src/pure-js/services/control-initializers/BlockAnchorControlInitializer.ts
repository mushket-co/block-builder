import { CSS_CLASSES } from '../../../utils/constants';
import {
  buildBlockAnchorOptions,
  type IBlockAnchorContext,
  isBlockAnchorHash,
} from '../../../utils/blockAnchorHelpers';
import { TFieldConfig } from '../FormBuilder';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';
import { ISelectControlOptions, SelectControlRenderer } from '../SelectControlRenderer';

export interface IBlockAnchorControlInitializerConfig {
  getCurrentFormFields: () => Map<string, TFieldConfig>;
  getRepeaterFieldConfigs?: () => Map<string, Map<string, TFieldConfig>>;
  getBlockAnchorContext: () => IBlockAnchorContext;
  onFieldChange?: () => void;
}

export class BlockAnchorControlInitializer implements IControlInitializer {
  constructor(private config: IBlockAnchorControlInitializerConfig) {}

  getControlType(): string {
    return 'block-anchor';
  }

  canHandle(container: HTMLElement): boolean {
    return container.classList.contains(CSS_CLASSES.BLOCK_ANCHOR_PLACEHOLDER);
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

      const fieldConfig =
        this.resolveFieldConfig(formGroup, fieldName) ||
        this.config.getCurrentFormFields().get(fieldName);

      if (!fieldConfig || fieldConfig.type !== 'block-anchor') {
        return null;
      }

      const hiddenInput = formGroup.querySelector(
        `input[type="hidden"][name="${fieldName}"]`
      ) as HTMLInputElement;
      const customInput = formGroup.querySelector(
        `[data-block-anchor-custom="${fieldName}"]`
      ) as HTMLInputElement | null;

      const anchorContext = this.config.getBlockAnchorContext();
      const knownBlockIds = new Set(anchorContext.blocks.map(block => block.id));
      const options = buildBlockAnchorOptions(anchorContext, fieldConfig.blockAnchorConfig);

      let currentValue = hiddenInput?.value || '';
      if (!currentValue && fieldConfig.defaultValue !== undefined && fieldConfig.defaultValue !== null) {
        currentValue = String(fieldConfig.defaultValue);
      }

      const selectedValue = isBlockAnchorHash(currentValue, knownBlockIds) ? currentValue : null;

      const updateHiddenValue = (nextValue: string) => {
        if (hiddenInput) {
          hiddenInput.value = nextValue;
        }
        if (customInput && isBlockAnchorHash(nextValue, knownBlockIds)) {
          customInput.value = '';
        }
        this.config.onFieldChange?.();
      };

      const selectOptions: ISelectControlOptions = {
        fieldName,
        label: fieldConfig.label || '',
        rules: fieldConfig.rules || [],
        errors: {},
        value: selectedValue,
        multiple: false,
        placeholder: fieldConfig.blockAnchorConfig?.placeholder || 'Выберите блок на странице',
        options,
        onChange: (newValue: string | number | (string | number)[] | null) => {
          if (newValue === null || newValue === '') {
            updateHiddenValue(customInput?.value || '');
            return;
          }
          updateHiddenValue(String(newValue));
        },
      };

      const renderer = new SelectControlRenderer(selectOptions);
      await renderer.init(container);

      if (customInput) {
        if (!isBlockAnchorHash(currentValue, knownBlockIds) && currentValue) {
          customInput.value = currentValue;
        }

        customInput.addEventListener('input', () => {
          updateHiddenValue(customInput.value);
        });
      }

      return {
        render: () => renderer.init(container),
        destroy: () => renderer.destroy(),
        getValue: () => hiddenInput?.value || '',
      };
    } catch {
      return null;
    }
  }

  private resolveFieldConfig(formGroup: HTMLElement, fieldName: string): TFieldConfig | undefined {
    const repeaterFieldName = formGroup.dataset.repeaterField;
    const repeaterItemField = formGroup.dataset.repeaterItemField;

    if (repeaterFieldName && repeaterItemField && this.config.getRepeaterFieldConfigs) {
      const repeaterFieldsMap = this.config.getRepeaterFieldConfigs().get(repeaterFieldName);
      return repeaterFieldsMap?.get(repeaterItemField);
    }

    return this.config.getCurrentFormFields().get(fieldName);
  }
}
