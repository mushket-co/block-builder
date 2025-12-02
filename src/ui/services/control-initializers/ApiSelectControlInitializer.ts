import {
  LicenseFeature,
  LicenseFeatureChecker,
} from '../../../core/services/LicenseFeatureChecker';
import { IApiSelectConfig, THttpMethod } from '../../../core/types/form';
import { ApiSelectUseCase } from '../../../core/use-cases/ApiSelectUseCase';
import { CSS_CLASSES } from '../../../utils/constants';
import { parseJSONFromAttribute } from '../../../utils/domSafe';
import { ApiSelectControlRenderer } from '../ApiSelectControlRenderer';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';

export interface IApiSelectControlInitializerConfig {
  apiSelectUseCase: ApiSelectUseCase;
  licenseFeatureChecker: LicenseFeatureChecker;
  getRepeaterFieldConfigs?: () => Map<string, Map<string, any>>;
  getRepeaterRenderers?: () => Map<string, any>;
}

export class ApiSelectControlInitializer implements IControlInitializer {
  constructor(private config: IApiSelectControlInitializerConfig) {}

  getControlType(): string {
    return 'api-select';
  }

  canHandle(container: HTMLElement): boolean {
    return container.classList.contains(CSS_CLASSES.API_SELECT_CONTROL_CONTAINER);
  }

  async initialize(container: HTMLElement): Promise<IControlRenderer | null> {
    if (!this.config.licenseFeatureChecker.canUseApiSelect()) {
      const placeholder = container.querySelector(
        `.${CSS_CLASSES.API_SELECT_PLACEHOLDER}`
      ) as HTMLElement;
      if (placeholder) {
        placeholder.classList.remove(CSS_CLASSES.BB_PLACEHOLDER_BOX);
        placeholder.innerHTML = `
          <div class="${CSS_CLASSES.BB_WARNING_BOX}">
            ⚠️ ${this.config.licenseFeatureChecker.getFeatureRestrictionMessage(LicenseFeature.API_SELECT)}
          </div>
        `;
      }
      return null;
    }

    const config = container.dataset.apiSelectConfig;
    if (!config) {
      return null;
    }

    try {
      const parsedData = parseJSONFromAttribute(config) as {
        field: string;
        fieldPath?: string;
        label: string;
        rules?: unknown[];
        config?: IApiSelectConfig;
        value?: unknown;
        multiple?: boolean;
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        searchParam?: string;
        pageParam?: string;
        limitParam?: string;
        limit?: number;
        debounceMs?: number;
        responseMapper?: unknown;
        dataPath?: string;
        idField?: string;
        nameField?: string;
        minSearchLength?: number;
        placeholder?: string;
        noResultsText?: string;
        loadingText?: string;
        errorText?: string;
      };

      const repeaterFieldName = container.dataset.repeaterField;
      const repeaterIndexStr = container.dataset.repeaterIndex;
      const repeaterItemField = container.dataset.repeaterItemField || parsedData.field;

      let apiSelectConfigFromRepeater: IApiSelectConfig | undefined;
      if (repeaterFieldName && repeaterItemField && this.config.getRepeaterFieldConfigs) {
        const repeaterFieldsMap = this.config.getRepeaterFieldConfigs().get(repeaterFieldName);
        if (repeaterFieldsMap) {
          const itemFieldConfig = repeaterFieldsMap.get(repeaterItemField);
          if (itemFieldConfig && itemFieldConfig.type === 'api-select') {
            apiSelectConfigFromRepeater = itemFieldConfig.apiSelectConfig;
          }
        }
      }

      const apiConfig: IApiSelectConfig = parsedData.config ||
        apiSelectConfigFromRepeater || {
          url: parsedData.url || '',
          method: parsedData.method as THttpMethod | undefined,
          headers: parsedData.headers,
          searchParam: parsedData.searchParam,
          pageParam: parsedData.pageParam,
          limitParam: parsedData.limitParam,
          limit: parsedData.limit,
          debounceMs: parsedData.debounceMs,
          responseMapper: parsedData.responseMapper as ((response: unknown) => any) | undefined,
          dataPath: parsedData.dataPath,
          idField: parsedData.idField,
          nameField: parsedData.nameField,
          minSearchLength: parsedData.minSearchLength,
          placeholder: parsedData.placeholder,
          noResultsText: parsedData.noResultsText,
          loadingText: parsedData.loadingText,
          errorText: parsedData.errorText,
          multiple: parsedData.multiple,
        };

      let initialValue: string | number | (string | number)[] | null =
        (parsedData.value as string | number | (string | number)[] | null | undefined) ||
        (apiConfig.multiple ? [] : null);

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

      const renderer = new ApiSelectControlRenderer({
        fieldName: parsedData.field,
        label: parsedData.label,
        rules:
          (parsedData.rules as Array<{ type: string; message?: string; value?: unknown }>) || [],
        config: apiConfig,
        value: initialValue,
        apiSelectUseCase: this.config.apiSelectUseCase,
        onChange: value => {
          container.dataset.apiSelectValue = JSON.stringify(value);

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
      });

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
