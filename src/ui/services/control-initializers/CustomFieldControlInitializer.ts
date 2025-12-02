import { ICustomFieldRendererRegistry } from '../../../core/ports/CustomFieldRenderer';
import {
  LicenseFeature,
  LicenseFeatureChecker,
} from '../../../core/services/LicenseFeatureChecker';
import { CSS_CLASSES } from '../../../utils/constants';
import { parseJSONFromAttribute } from '../../../utils/domSafe';
import { CustomFieldControlRenderer } from '../CustomFieldControlRenderer';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';

export interface ICustomFieldControlInitializerConfig {
  customFieldRendererRegistry: ICustomFieldRendererRegistry;
  licenseFeatureChecker: LicenseFeatureChecker;
  getRepeaterRenderers?: () => Map<string, any>;
}

export class CustomFieldControlInitializer implements IControlInitializer {
  constructor(private config: ICustomFieldControlInitializerConfig) {}

  getControlType(): string {
    return 'custom';
  }

  canHandle(container: HTMLElement): boolean {
    return container.classList.contains(CSS_CLASSES.CUSTOM_FIELD_CONTROL_CONTAINER);
  }

  async initialize(container: HTMLElement): Promise<IControlRenderer | null> {
    if (!this.config.licenseFeatureChecker.canUseCustomFields()) {
      const placeholder = container.querySelector(
        `.${CSS_CLASSES.CUSTOM_FIELD_PLACEHOLDER}`
      ) as HTMLElement;
      if (placeholder) {
        placeholder.removeAttribute('style');
        placeholder.classList.remove(CSS_CLASSES.BB_PLACEHOLDER_BOX);
        placeholder.innerHTML = `
          <div class="${CSS_CLASSES.BB_WARNING_BOX}">
            ⚠️ ${this.config.licenseFeatureChecker.getFeatureRestrictionMessage(LicenseFeature.CUSTOM_FIELDS)}
          </div>
        `;
      }
      return null;
    }

    const config = container.dataset.customFieldConfig;
    if (!config) {
      return null;
    }

    try {
      const customFieldConfig = parseJSONFromAttribute(config) as {
        field: string;
        fieldPath?: string;
        label: string;
        value?: unknown;
        required?: boolean;
        rendererId?: string;
        options?: unknown;
      };

      if (!customFieldConfig.rendererId) {
        return null;
      }

      const renderer = this.config.customFieldRendererRegistry.get(customFieldConfig.rendererId);
      if (!renderer) {
        this.showError(container, `Рендерер "${customFieldConfig.rendererId}" не зарегистрирован`);
        return null;
      }

      let renderContainer = container.querySelector(
        `.${CSS_CLASSES.CUSTOM_FIELD_PLACEHOLDER}`
      ) as HTMLElement;
      if (!renderContainer) {
        renderContainer = container;
      }

      const repeaterFieldName = container.dataset.repeaterField;
      const repeaterIndexStr = container.dataset.repeaterIndex;
      const repeaterItemField = container.dataset.repeaterItemField || customFieldConfig.field;

      let initialValue = customFieldConfig.value;

      if (
        repeaterFieldName &&
        typeof repeaterIndexStr === 'string' &&
        this.config.getRepeaterRenderers
      ) {
        const repeaterRenderer = this.config.getRepeaterRenderers().get(repeaterFieldName);
        if (repeaterRenderer) {
          const index = Number.parseInt(repeaterIndexStr, 10);
          const rendererValue = (repeaterRenderer as any).value;
          if (
            Array.isArray(rendererValue) &&
            rendererValue[index] &&
            Object.hasOwn(rendererValue[index], repeaterItemField)
          ) {
            initialValue = rendererValue[index][repeaterItemField];
          }
        }
      }

      const fieldRenderer = new CustomFieldControlRenderer(renderContainer, renderer, {
        fieldName: customFieldConfig.field,
        label: customFieldConfig.label,
        value: initialValue,
        required: customFieldConfig.required || false,
        rendererId: customFieldConfig.rendererId,
        options: customFieldConfig.options as Record<string, unknown> | undefined,
        onChange: value => {
          container.dataset.customFieldValue = JSON.stringify(value);

          if (
            repeaterFieldName &&
            typeof repeaterIndexStr === 'string' &&
            this.config.getRepeaterRenderers
          ) {
            const repeaterRenderer = this.config.getRepeaterRenderers().get(repeaterFieldName);
            if (repeaterRenderer) {
              const index = Number.parseInt(repeaterIndexStr, 10);
              const rendererValue = (repeaterRenderer as any).value;
              if (Array.isArray(rendererValue) && rendererValue[index]) {
                rendererValue[index][repeaterItemField] = value;
                if (typeof (repeaterRenderer as any).emitChange === 'function') {
                  (repeaterRenderer as any).emitChange();
                }
              }
            }
          }
        },
        onError: _error => {},
      });

      return {
        render: () => {},
        destroy: () => fieldRenderer.destroy(),
        getValue: () => fieldRenderer.getValue(),
        updateErrors: (errors: Record<string, string[]>) => {
          fieldRenderer.updateErrors(errors);
        },
      };
    } catch (error) {
      this.showError(container, `Ошибка: ${error}`);
      return null;
    }
  }

  private showError(container: HTMLElement, message: string): void {
    const placeholder = container.querySelector(
      `.${CSS_CLASSES.CUSTOM_FIELD_PLACEHOLDER}`
    ) as HTMLElement;
    if (placeholder) {
      placeholder.removeAttribute('style');
      placeholder.classList.remove(CSS_CLASSES.BB_PLACEHOLDER_BOX);
      placeholder.innerHTML = '';
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText =
        'padding: 10px; border: 1px solid #ff4444; border-radius: 4px; background-color: #fff5f5; color: #ff4444;';
      errorDiv.textContent = `❌ ${message}`;
      placeholder.append(errorDiv);
    }
  }
}
