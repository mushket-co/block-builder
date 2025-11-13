import { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import { LicenseFeature } from '../../core/services/LicenseFeatureChecker';
import { LicenseService } from '../../core/services/LicenseService';
import { IBlockDto, ICreateBlockDto } from '../../core/types';
import { TRenderRef } from '../../core/types/common';
import {
  IApiSelectConfig,
  IApiSelectResponse,
  IBlockSpacingOptions,
  IFormFieldConfig,
  IRepeaterFieldConfig,
  IRepeaterItemFieldConfig,
  ISpacingFieldConfig,
  THttpMethod,
} from '../../core/types/form';
import { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import {
  CSS_CLASSES,
  ERROR_RENDER_DELAY_MS,
  FORM_ID_PREFIX,
  NOTIFICATION_DISPLAY_DURATION_MS,
  REPEATER_ACCORDION_ANIMATION_DELAY_MS,
  UI_STRINGS,
} from '../../utils/constants';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { afterRender } from '../../utils/domReady';
import { parseJSONFromAttribute } from '../../utils/domSafe';
import {
  findFieldElement,
  focusElement,
  parseErrorKey,
  scrollToElement,
  scrollToFirstError,
} from '../../utils/formErrorHelpers';
import { logger } from '../../utils/logger';
import { UniversalValidator } from '../../utils/universalValidation';
import { EventDelegation } from '../EventDelegation';
import { ApiSelectControlRenderer } from '../services/ApiSelectControlRenderer';
import { CustomFieldControlRenderer } from '../services/CustomFieldControlRenderer';
import { FormBuilder, TFieldConfig } from '../services/FormBuilder';
import { SelectControlRenderer, ISelectControlOptions } from '../services/SelectControlRenderer';
import { ModalManager } from '../services/ModalManager';
import { RepeaterControlRenderer } from '../services/RepeaterControlRenderer';
import { SpacingControlRenderer } from '../services/SpacingControlRenderer';
import { UIRenderer } from '../services/UIRenderer';

export interface IBlockUIControllerConfig {
  containerId: string;
  blockConfigs: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  useCase: BlockManagementUseCase;
  apiSelectUseCase: ApiSelectUseCase;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  onSave?: (blocks: IBlockDto[]) => Promise<boolean> | boolean;
  controlsContainerClass?: string;
  controlsFixedPosition?: 'top' | 'bottom';
  controlsOffset?: number;
  controlsOffsetVar?: string;
  licenseService: LicenseService;
  originalBlockConfigs?: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  isEdit?: boolean;
}

export class BlockUIController {
  private config: IBlockUIControllerConfig;
  public readonly uiRenderer: UIRenderer;
  private formBuilder: FormBuilder;
  private modalManager: ModalManager;
  private apiSelectUseCase: ApiSelectUseCase;
  private customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  private blocks: IBlockDto[] = [];
  private onSave?: (blocks: IBlockDto[]) => Promise<boolean> | boolean;
  private spacingRenderers: Map<string, SpacingControlRenderer> = new Map();
  private repeaterRenderers: Map<string, RepeaterControlRenderer> = new Map();
  private apiSelectRenderers: Map<string, ApiSelectControlRenderer> = new Map();
  private selectRenderers: Map<string, SelectControlRenderer> = new Map();
  private customFieldRenderers: Map<string, CustomFieldControlRenderer> = new Map();
  private eventDelegation: EventDelegation;
  private licenseService: LicenseService;
  private originalBlockConfigs?: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  private currentFormFields: Map<string, TFieldConfig> = new Map();
  private repeaterFieldConfigs: Map<string, Map<string, TFieldConfig>> = new Map();
  private isEdit: boolean;

  constructor(config: IBlockUIControllerConfig) {
    this.config = config;
    this.originalBlockConfigs = config.originalBlockConfigs;
    this.onSave = config.onSave;
    this.apiSelectUseCase = config.apiSelectUseCase;
    this.customFieldRendererRegistry = config.customFieldRendererRegistry;
    this.licenseService = config.licenseService;
    this.isEdit = config.isEdit !== undefined ? config.isEdit : true;

    this.eventDelegation = new EventDelegation();

    this.uiRenderer = new UIRenderer({
      containerId: config.containerId,
      blockConfigs: config.blockConfigs,
      componentRegistry: config.useCase.getComponentRegistry(),
      eventDelegation: this.eventDelegation,
      controlsContainerClass: config.controlsContainerClass,
      controlsFixedPosition: config.controlsFixedPosition,
      controlsOffset: config.controlsOffset,
      controlsOffsetVar: config.controlsOffsetVar,
      license: this.licenseService.getLicenseInfo(Object.keys(config.blockConfigs).length),
      isEdit: this.isEdit,
    });
    this.formBuilder = new FormBuilder();
    this.modalManager = new ModalManager();

    this.registerEventHandlers();
  }

  async init(): Promise<void> {
    this.uiRenderer.renderContainer();

    await this.refreshBlocks();
  }

  async refreshBlocks(): Promise<void> {
    this.blocks = await this.config.useCase.getAllBlocks();
    this.uiRenderer.renderBlocks(this.blocks);
  }

  showBlockTypeSelectionModal(position?: number): void {
    if (!this.isEdit) {
      return;
    }
    const currentBlockTypesCount = Object.keys(this.config.blockConfigs).length;
    const licenseInfo = this.licenseService.getLicenseInfo(currentBlockTypesCount);

    const licenseWarningHTML = !licenseInfo.isPro
      ? `
      <div class="block-builder-license-warning">
        <div class="block-builder-license-warning__header">
          <span class="block-builder-license-warning__icon">⚠️</span>
          <strong class="block-builder-license-warning__title">Бесплатная версия <a href="https://block-builder.ru/" target="_blank" rel="noopener noreferrer" class="bb-link-inherit">Block Builder</a></strong>
        </div>
        <p class="block-builder-license-warning__text">
          Вы используете ограниченную бесплатную версию.<br>
          Доступно <strong>${currentBlockTypesCount} из ${licenseInfo.maxBlockTypes}</strong> типов блоков.
        </p>
      </div>
    `
      : '';

    const blockTypesHTML = Object.entries(this.config.blockConfigs)
      .map(([type, config]) => {
        const title = config.title || type;
        const icon = config.icon || '📦';
        const args =
          position !== undefined
            ? JSON.stringify([type, position])
            : JSON.stringify([type, undefined]);
        return `
        <button
          data-action="showAddBlockFormAtPosition"
          data-args='${args}'
          class="block-builder-block-type-card"
        >
          <span class="block-builder-block-type-card__icon">${icon}</span>
          <span class="block-builder-block-type-card__title">${title}</span>
        </button>
      `;
      })
      .join('');

    const bodyHTML = `
    <div class="block-builder-block-type-selection">
      ${licenseWarningHTML}
      ${blockTypesHTML}
    </div>
    `;

    this.modalManager.showModal({
      title: UI_STRINGS.blockTypeSelectionTitle,
      bodyHTML,
      onSubmit: () => this.modalManager.closeModal(),
      onCancel: () => this.modalManager.closeModal(),
      submitButtonText: UI_STRINGS.cancelButtonText,
      hideSubmitButton: true,
    });
  }

  async showAddBlockFormAtPosition(type: string, position?: number): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    this.modalManager.closeModal();

    const config = this.config.blockConfigs[type];
    if (!config) {
      this.showError(UI_STRINGS.blockConfigNotFound);
      return;
    }

    const fields: TFieldConfig[] = addSpacingFieldToFields(
      (config.fields || []) as IFormFieldConfig[],
      config.spacingOptions as IBlockSpacingOptions | undefined,
      this.licenseService.getFeatureChecker()
    );

    const formHTML = `
    <form id="${FORM_ID_PREFIX}" class="block-builder-form">
      ${this.formBuilder.generateCreateFormHTML(fields)}
    </form>
    `;

    this.modalManager.showModal({
      title: `${config.title} ${UI_STRINGS.addBlockTitle}`,
      bodyHTML: formHTML,
      onSubmit: () => this.handleCreateBlock(type, fields, position),
      onCancel: () => {
        this.currentFormFields.clear();
        this.repeaterFieldConfigs.clear();
        this.modalManager.closeModal();
      },
      submitButtonText: UI_STRINGS.addButtonText,
    });

    this.currentFormFields.clear();
    this.repeaterFieldConfigs.clear();
    fields.forEach(field => {
      this.currentFormFields.set(field.field, field);
      if (field.type === 'repeater' && field.repeaterConfig?.fields) {
        const repeaterFieldsMap = new Map<string, TFieldConfig>();
        field.repeaterConfig.fields.forEach((repeaterField: TFieldConfig) => {
          repeaterFieldsMap.set(repeaterField.field, repeaterField);
        });
        this.repeaterFieldConfigs.set(field.field, repeaterFieldsMap);
      }
    });

    afterRender(async () => {
      this.initializeSpacingControls();
      this.initializeRepeaterControls();
      await this.initializeApiSelectControls();
      await this.initializeSelectControls();
      this.initializeImageUploadControls();
      await this.initializeCustomFieldControls();
    });
  }

  showAddBlockForm(type: string): void {
    this.showAddBlockFormAtPosition(type);
  }

  private initializeSpacingControls(): void {
    this.cleanupSpacingControls();

    const containers = document.querySelectorAll(`.${CSS_CLASSES.SPACING_CONTROL_CONTAINER}`);

    containers.forEach(container => {
      const htmlContainer = container as HTMLElement;
      const config = htmlContainer.dataset.spacingConfig;
      if (!config) {
        return;
      }

      try {
        const spacingConfig = parseJSONFromAttribute(config) as {
          field: string;
          label: string;
          required?: boolean;
          config?: ISpacingFieldConfig;
          value?: unknown;
        };

        const renderer = new SpacingControlRenderer({
          fieldName: spacingConfig.field,
          label: spacingConfig.label,
          required: spacingConfig.required,
          config: spacingConfig.config,
          value: (spacingConfig.value as Record<string, Record<string, number>>) || {},
          licenseFeatureChecker: this.licenseService.getFeatureChecker(),
          onChange: value => {
            htmlContainer.dataset.spacingValue = JSON.stringify(value);
          },
        });

        renderer.render(htmlContainer);

        this.spacingRenderers.set(spacingConfig.field, renderer);
      } catch {
      }
    });
  }

  private cleanupSpacingControls(): void {
    this.spacingRenderers.forEach(renderer => {
      renderer.destroy();
    });
    this.spacingRenderers.clear();
  }

  private initializeRepeaterControls(): void {
    this.cleanupRepeaterControls();

    const containers = document.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}`);

    containers.forEach(container => {
      const htmlContainer = container as HTMLElement;
      const config = htmlContainer.dataset.repeaterConfig;
      if (!config) {
        return;
      }

      try {
        const parsed = parseJSONFromAttribute(config) as {
          field: string;
          label: string;
          rules?: unknown[];
          value?: unknown[];
          fields?: IRepeaterItemFieldConfig[];
          addButtonText?: string;
          removeButtonText?: string;
          itemTitle?: string;
          min?: number;
          max?: number;
          defaultItemValue?: Record<string, unknown>;
        };

        if (!parsed.field || !parsed.label) {
          logger.warn('Repeater config missing required fields (field, label)');
          return;
        }

        const self = this;

        const repeaterFieldConfig: IRepeaterFieldConfig = {
          fields: (parsed.fields || []) as IRepeaterItemFieldConfig[],
          addButtonText: parsed.addButtonText,
          removeButtonText: parsed.removeButtonText,
          itemTitle: parsed.itemTitle,
          min: parsed.min,
          max: parsed.max,
          defaultItemValue: parsed.defaultItemValue,
        };

        const renderer = new RepeaterControlRenderer({
          fieldName: parsed.field,
          label: parsed.label,
          rules: (parsed.rules as Array<{ type: string; message?: string; value?: unknown }>) || [],
          config: repeaterFieldConfig,
          value: (parsed.value as unknown[]) || [],
          onChange: value => {
            htmlContainer.dataset.repeaterValue = JSON.stringify(value);
          },
          onAfterRender: () => {
            self.initializeImageUploadControls();
            void self.initializeApiSelectControls();
            void self.initializeCustomFieldControls();
          },
        });

        renderer.render(container as HTMLElement);

        this.repeaterRenderers.set(parsed.field, renderer);
      } catch (error) {
        logger.error('Ошибка инициализации repeater контрола:', error);
        if (error instanceof Error) {
          logger.error('Детали ошибки:', error.message, error.stack);
        }
      }
    });
  }

  private cleanupRepeaterControls(): void {
    this.repeaterRenderers.forEach(renderer => {
      renderer.destroy();
    });
    this.repeaterRenderers.clear();
  }

  private async initializeApiSelectControls(): Promise<void> {
    if (!this.licenseService.canUseApiSelect()) {
      const containers = document.querySelectorAll(`.${CSS_CLASSES.API_SELECT_CONTROL_CONTAINER}`);
      containers.forEach(container => {
        const placeholder = container.querySelector('.api-select-placeholder') as HTMLElement;
        if (placeholder) {
          placeholder.classList.remove('bb-placeholder-box');
          placeholder.innerHTML = `
            <div class="bb-warning-box">
              ⚠️ ${this.licenseService.getFeatureChecker().getFeatureRestrictionMessage(LicenseFeature.API_SELECT)}
            </div>
          `;
        }
      });
      return;
    }

    this.cleanupApiSelectControls();

    const containers = document.querySelectorAll('.api-select-control-container');

    for (const container of Array.from(containers)) {
      const htmlContainer = container as HTMLElement;
      const config = htmlContainer.dataset.apiSelectConfig;
      if (!config) {
        continue;
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

        const repeaterFieldName = htmlContainer.dataset.repeaterField;
        const repeaterIndexStr = htmlContainer.dataset.repeaterIndex;
        const repeaterItemField = htmlContainer.dataset.repeaterItemField || parsedData.field;
        const fieldPath = parsedData.fieldPath || parsedData.field;
        const isRepeaterContext = Boolean(repeaterFieldName);

        let apiSelectConfigFromRepeater: IApiSelectConfig | undefined;
        if (isRepeaterContext && repeaterFieldName && repeaterItemField) {
          const repeaterFieldsMap = this.repeaterFieldConfigs.get(repeaterFieldName);
          if (repeaterFieldsMap) {
            const itemFieldConfig = repeaterFieldsMap.get(repeaterItemField);
            if (itemFieldConfig && itemFieldConfig.type === 'api-select') {
              apiSelectConfigFromRepeater = itemFieldConfig.apiSelectConfig;
            }
          }
        }

        const apiConfig: IApiSelectConfig =
          parsedData.config ||
          apiSelectConfigFromRepeater ||
          {
            url: parsedData.url || '',
            method: parsedData.method as THttpMethod | undefined,
            headers: parsedData.headers,
            searchParam: parsedData.searchParam,
            pageParam: parsedData.pageParam,
            limitParam: parsedData.limitParam,
            limit: parsedData.limit,
            debounceMs: parsedData.debounceMs,
            responseMapper: parsedData.responseMapper as
              | ((response: unknown) => IApiSelectResponse)
              | undefined,
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

        if (isRepeaterContext && repeaterFieldName && typeof repeaterIndexStr === 'string') {
          const repeaterRenderer = this.repeaterRenderers.get(repeaterFieldName);
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
          apiSelectUseCase: this.apiSelectUseCase,
          onChange: value => {
            htmlContainer.dataset.apiSelectValue = JSON.stringify(value);

            if (isRepeaterContext && repeaterFieldName && typeof repeaterIndexStr === 'string') {
              const repeaterRenderer = this.repeaterRenderers.get(repeaterFieldName);
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

        await renderer.init(htmlContainer);

        this.apiSelectRenderers.set(fieldPath, renderer);
      } catch {
      }
    }
  }

  private cleanupApiSelectControls(): void {
    this.apiSelectRenderers.forEach(renderer => {
      renderer.destroy();
    });
    this.apiSelectRenderers.clear();
  }

  private async initializeSelectControls(): Promise<void> {
    this.cleanupSelectControls();

    const placeholders = document.querySelectorAll('.select-placeholder');

    for (const placeholder of Array.from(placeholders)) {
      const htmlPlaceholder = placeholder as HTMLElement;
      const fieldName = htmlPlaceholder.dataset.fieldName;
      const fieldId = htmlPlaceholder.dataset.fieldId;

      if (!fieldName || !fieldId) {
        continue;
      }

      try {
        const container = htmlPlaceholder.closest('.block-builder-form-group') as HTMLElement;
        if (!container) {
          continue;
        }

        const fieldConfig = this.currentFormFields.get(fieldName);
        if (!fieldConfig || fieldConfig.type !== 'select') {
          continue;
        }
        const hiddenInput = container.querySelector(`input[type="hidden"][name="${fieldName}"]`) as HTMLInputElement;
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
            if (currentValue && typeof currentValue === 'string' && !isNaN(Number(currentValue))) {
              const numValue = Number(currentValue);
              const option = fieldConfig.options?.find(opt => {
                const optValue = typeof opt.value === 'number' ? opt.value : Number(opt.value);
                return !isNaN(optValue) && optValue === numValue;
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
              if (fieldConfig.multiple && Array.isArray(newValue)) {
                hiddenInput.value = JSON.stringify(newValue);
              } else {
                hiddenInput.value = String(newValue ?? '');
              }
            }

            htmlPlaceholder.dataset.selectValue = JSON.stringify(newValue);
          },
        };

        const renderer = new SelectControlRenderer(selectOptions);
        await renderer.init(htmlPlaceholder);

        this.selectRenderers.set(fieldName, renderer);
      } catch (error) {
        logger.error('Ошибка инициализации select контрола', error);
      }
    }
  }

  private cleanupSelectControls(): void {
    this.selectRenderers.forEach(renderer => {
      renderer.destroy();
    });
    this.selectRenderers.clear();
  }

  private async initializeCustomFieldControls(): Promise<void> {
    if (!this.licenseService.canUseCustomFields()) {
      const containers = document.querySelectorAll(
        `.${CSS_CLASSES.CUSTOM_FIELD_CONTROL_CONTAINER}`
      );
      containers.forEach(container => {
        const placeholder = container.querySelector('.custom-field-placeholder') as HTMLElement;
        if (placeholder) {
          placeholder.removeAttribute('style');
          placeholder.classList.remove('bb-placeholder-box');
          placeholder.innerHTML = `
            <div class="bb-warning-box">
              ⚠️ ${this.licenseService.getFeatureChecker().getFeatureRestrictionMessage(LicenseFeature.CUSTOM_FIELDS)}
            </div>
          `;
        }
      });
      return;
    }

    if (!this.customFieldRendererRegistry) {
      return;
    }

    this.cleanupCustomFieldControls();

    const containers = document.querySelectorAll('.custom-field-control-container');

    for (const container of Array.from(containers)) {
      const htmlContainer = container as HTMLElement;
      const config = htmlContainer.dataset.customFieldConfig;
      if (!config) {
        continue;
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
          continue;
        }

        const renderer = this.customFieldRendererRegistry.get(customFieldConfig.rendererId);
        if (!renderer) {
          this.showCustomFieldError(
            htmlContainer,
            `Рендерер "${customFieldConfig.rendererId}" не зарегистрирован`
          );
          continue;
        }

        let renderContainer = htmlContainer.querySelector(
          '.custom-field-placeholder'
        ) as HTMLElement;
        if (!renderContainer) {
          renderContainer = htmlContainer;
        }

        const repeaterFieldName = htmlContainer.dataset.repeaterField;
        const repeaterIndexStr = htmlContainer.dataset.repeaterIndex;
        const repeaterItemField =
          htmlContainer.dataset.repeaterItemField || customFieldConfig.field;
        const fieldPath = customFieldConfig.fieldPath || customFieldConfig.field;
        const isRepeaterContext = Boolean(repeaterFieldName);

        let initialValue = customFieldConfig.value;

        if (isRepeaterContext && repeaterFieldName && typeof repeaterIndexStr === 'string') {
          const repeaterRenderer = this.repeaterRenderers.get(repeaterFieldName);
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
            htmlContainer.dataset.customFieldValue = JSON.stringify(value);

            if (isRepeaterContext && repeaterFieldName && typeof repeaterIndexStr === 'string') {
              const repeaterRenderer = this.repeaterRenderers.get(repeaterFieldName);
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
          onError: _error => {
          },
        });

        this.customFieldRenderers.set(fieldPath, fieldRenderer);
      } catch (error) {
        this.showCustomFieldError(htmlContainer, `Ошибка: ${error}`);
      }
    }
  }

  private initializeImageUploadControls(): void {
    const containers = document.querySelectorAll('.image-upload-field');

    containers.forEach(container => {
      const htmlContainer = container as HTMLElement;
      const fieldName = htmlContainer.dataset.fieldName;
      if (!fieldName) {
        return;
      }

      if (Object.hasOwn(htmlContainer.dataset, 'imageInitialized')) {
        return;
      }
      htmlContainer.dataset.imageInitialized = 'true';

      const fileInput = htmlContainer.querySelector('input[type="file"]') as HTMLInputElement;
      const hiddenInput = htmlContainer.querySelector(
        'input[type="hidden"][data-image-value="true"]'
      ) as HTMLInputElement;
      const preview = htmlContainer.querySelector('.image-upload-field__preview') as HTMLElement;
      const previewImg = preview?.querySelector('img') as HTMLImageElement;
      const label = htmlContainer.querySelector('label[for]') as HTMLLabelElement;
      const labelText = label?.querySelector('.image-upload-field__label-text') as HTMLElement;
      const loadingText = label?.querySelector('.image-upload-field__loading-text') as HTMLElement;
      const errorDiv = htmlContainer.querySelector('.image-upload-field__error') as HTMLElement;

      if (!fileInput || !hiddenInput) {
        return;
      }

      const configStr = fileInput.dataset.config || '{}';
      let config: any = {};
      try {
        config = JSON.parse(configStr.replaceAll('&quot;', '"'));
      } catch (error) {
        logger.error('Ошибка парсинга конфига изображения:', error);
      }

      const repeaterField = htmlContainer.dataset.repeaterField;
      const repeaterIndex = htmlContainer.dataset.repeaterIndex;
      const repeaterItemField = htmlContainer.dataset.repeaterItemField;

      let imageUploadConfig: any = undefined;
      let responseMapper: any = undefined;

      if (repeaterField && repeaterItemField) {
        const repeaterFieldsMap = this.repeaterFieldConfigs.get(repeaterField);
        if (repeaterFieldsMap) {
          const itemFieldConfig = repeaterFieldsMap.get(repeaterItemField);
          if (itemFieldConfig) {
            imageUploadConfig = itemFieldConfig.imageUploadConfig;
            responseMapper = imageUploadConfig?.responseMapper;
          }
        }
      } else {
        const fieldConfig = this.currentFormFields.get(fieldName);
        imageUploadConfig = fieldConfig?.imageUploadConfig;
        responseMapper = imageUploadConfig?.responseMapper;
      }

      const finalConfig = {
        uploadUrl: imageUploadConfig?.uploadUrl || config.uploadUrl || '',
        fileParamName: imageUploadConfig?.fileParamName || config.fileParamName || 'file',
        maxFileSize: imageUploadConfig?.maxFileSize || config.maxFileSize || 10 * 1024 * 1024,
        uploadHeaders: imageUploadConfig?.uploadHeaders || config.uploadHeaders || {},
      };

      let currentValue: any = hiddenInput.value;

      if (repeaterField && repeaterIndex && repeaterItemField) {
        const repeaterRenderer = this.repeaterRenderers.get(repeaterField);
        if (repeaterRenderer) {
          const index = Number.parseInt(repeaterIndex, 10);
          const rendererValue = (repeaterRenderer as any).value;
          if (rendererValue && rendererValue[index] !== undefined) {
            currentValue = rendererValue[index][repeaterItemField];
          }
        }
      } else {
        if (currentValue) {
          try {
            const parsed = JSON.parse(currentValue.replaceAll('&quot;', '"'));
            if (typeof parsed === 'object' && parsed !== null) {
              currentValue = parsed;
            }
          } catch {
          }
        }
      }

      if (currentValue) {
        try {
          let imageUrl = '';
          if (typeof currentValue === 'string') {
            imageUrl = currentValue;
          } else if (typeof currentValue === 'object' && currentValue !== null) {
            imageUrl = currentValue.src || currentValue.url || '';
          }

          if (imageUrl && previewImg) {
            previewImg.src = imageUrl;
            previewImg.style.display = 'block';
            if (preview) {
              preview.style.display = 'block';
              preview.style.position = 'relative';
              preview.style.marginBottom = '12px';
            }
            if (labelText) {
              labelText.textContent = 'Изменить файл';
            }
          }
        } catch (error) {
          logger.error('Ошибка инициализации preview:', error);
        }
      }

      const self = this;

      const clearBtn = container.querySelector(
        '.image-upload-field__preview-clear'
      ) as HTMLButtonElement;
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          fileInput.value = '';
          hiddenInput.value = '';
          if (preview) {
            preview.style.display = 'none';
          }
          if (labelText) {
            labelText.textContent = 'Выберите изображение';
          }

          if (repeaterField && repeaterIndex && repeaterItemField) {
            const repeaterRenderer = self.repeaterRenderers.get(repeaterField);
            if (repeaterRenderer) {
              const index = Number.parseInt(repeaterIndex, 10);
              const rendererValue = (repeaterRenderer as any).value;
              if (rendererValue && rendererValue[index] !== undefined) {
                rendererValue[index][repeaterItemField] = '';
                (repeaterRenderer as any).emitChange();
              }
            }
          }
        });
      }

      fileInput.addEventListener('change', async e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          return;
        }

        if (!file.type.startsWith('image/')) {
          if (errorDiv) {
            errorDiv.textContent = 'Пожалуйста, выберите файл изображения';
            errorDiv.style.display = 'block';
          }
          return;
        }

        if (finalConfig.maxFileSize && file.size > finalConfig.maxFileSize) {
          if (errorDiv) {
            errorDiv.textContent = `Размер файла не должен превышать ${Math.round(finalConfig.maxFileSize / 1024 / 1024)}MB`;
            errorDiv.style.display = 'block';
          }
          return;
        }

        if (errorDiv) {
          errorDiv.style.display = 'none';
          errorDiv.classList.add('bb-hidden');
          errorDiv.textContent = '';
        }
        if (labelText) {
          labelText.style.display = 'none';
          labelText.classList.add('bb-hidden');
        }
        if (loadingText) {
          loadingText.style.display = 'inline';
          loadingText.classList.remove('bb-hidden');
        }
        if (label) {
          label.style.pointerEvents = 'none';
          label.style.opacity = '0.7';
          label.style.cursor = 'not-allowed';
        }
        fileInput.disabled = true;

        try {
          let result: any;

          if (finalConfig.uploadUrl) {
            const formData = new FormData();
            formData.append(finalConfig.fileParamName, file);

            const response = await fetch(finalConfig.uploadUrl, {
              method: 'POST',
              headers: finalConfig.uploadHeaders,
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Ошибка загрузки: ' + response.statusText);
            }

            const responseData = await response.json();

            result =
              responseMapper && typeof responseMapper === 'function'
                ? responseMapper(responseData)
                : responseData;
          } else {
            result = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.addEventListener('load', e => resolve(e.target?.result as string));
              reader.addEventListener('error', reject);
              reader.readAsDataURL(file);
            });
          }

          if (repeaterField && repeaterIndex && repeaterItemField) {
            const repeaterRenderer = self.repeaterRenderers.get(repeaterField);
            if (repeaterRenderer) {
              const index = Number.parseInt(repeaterIndex, 10);
              const rendererValue = (repeaterRenderer as any).value;
              if (rendererValue && rendererValue[index] !== undefined) {
                rendererValue[index][repeaterItemField] = result;
                (repeaterRenderer as any).emitChange();
              }
            }
          }

          hiddenInput.value =
            typeof result === 'object' && result !== null ? JSON.stringify(result) : result || '';

          let imageUrl = '';
          if (typeof result === 'string') {
            imageUrl = result;
          } else if (typeof result === 'object' && result !== null) {
            imageUrl = result.src || '';
          }

          if (imageUrl && previewImg) {
            previewImg.src = imageUrl;
            previewImg.style.display = 'block';
            if (preview) {
              preview.classList.remove('bb-hidden');
              preview.style.display = 'block';
              preview.style.position = 'relative';
              preview.style.marginBottom = '12px';
            }
            if (labelText) {
              labelText.textContent = 'Изменить файл';
              labelText.style.display = 'inline';
              labelText.classList.remove('bb-hidden');
            }
          } else if (previewImg && preview) {
            preview.classList.add('bb-hidden');
            preview.style.display = 'none';
            if (labelText) {
              labelText.textContent = 'Выберите изображение';
              labelText.style.display = 'inline';
              labelText.classList.remove('bb-hidden');
            }
          }

          if (container) {
            container.classList.remove(CSS_CLASSES.ERROR);
            const fileErrorDiv = container.querySelector(
              '.image-upload-field__file .image-upload-field__error'
            ) as HTMLElement;
            if (fileErrorDiv) {
              fileErrorDiv.style.display = 'none';
              fileErrorDiv.textContent = '';
            }
          }

          const changeEvent = new Event('change', { bubbles: true });
          hiddenInput.dispatchEvent(changeEvent);
        } catch (error: any) {
          logger.error('ImageUpload error:', error);
          if (errorDiv) {
            errorDiv.textContent = error.message || 'Ошибка при загрузке файла';
            errorDiv.style.display = 'block';
            errorDiv.classList.remove('bb-hidden');
          }
          if (labelText) {
            labelText.style.display = 'inline';
            labelText.classList.remove('bb-hidden');
          }
        } finally {
          if (loadingText) {
            loadingText.style.display = 'none';
            loadingText.classList.add('bb-hidden');
          }
          if (label) {
            label.style.pointerEvents = 'auto';
            label.style.opacity = '1';
            label.style.cursor = 'pointer';
          }
          fileInput.disabled = false;
        }
      });
    });
  }

  private showCustomFieldError(container: HTMLElement, message: string): void {
    const placeholder = container.querySelector('.custom-field-placeholder') as HTMLElement;
    if (placeholder) {
      placeholder.removeAttribute('style');
      placeholder.classList.remove('bb-placeholder-box');
      placeholder.innerHTML = '';
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText =
        'padding: 10px; border: 1px solid #ff4444; border-radius: 4px; background-color: #fff5f5; color: #ff4444;';
      errorDiv.textContent = `❌ ${message}`;
      placeholder.append(errorDiv);
    }
  }

  private cleanupCustomFieldControls(): void {
    this.customFieldRenderers.forEach(renderer => {
      renderer.destroy();
    });
    this.customFieldRenderers.clear();
  }

  private getFormDataWithSpacing(formId: string): Record<string, any> {
    const props = this.modalManager.getFormData(formId);

    this.spacingRenderers.forEach((renderer, fieldName) => {
      props[fieldName] = renderer.getValue();
    });

    this.repeaterRenderers.forEach((renderer, fieldName) => {
      props[fieldName] = renderer.getValue();
    });

    this.apiSelectRenderers.forEach((renderer, fieldName) => {
      if (!fieldName.includes('[')) {
        props[fieldName] = renderer.getValue();
      }
    });

    this.customFieldRenderers.forEach((renderer, fieldName) => {
      if (!fieldName.includes('[')) {
        props[fieldName] = renderer.getValue();
      }
    });

    return props;
  }

  private async handleCreateBlock(
    type: string,
    fields: TFieldConfig[],
    position?: number
  ): Promise<void> {
    const props = this.getFormDataWithSpacing(FORM_ID_PREFIX);

    const validation = UniversalValidator.validateForm(props, fields);
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    try {
      const blockConfig = this.config.blockConfigs[type];

      const createData: ICreateBlockDto = {
        type,
        settings: {},
        props,
        visible: true,
        locked: false,
      };

      if (blockConfig?.render) {
        createData.render = blockConfig.render as TRenderRef;
      }

      const newBlock = await this.config.useCase.createBlock(createData);

      if (position !== undefined && newBlock) {
        await this.insertBlockAtPosition(newBlock.id, position);
      }

      this.modalManager.closeModal();
      await this.refreshBlocks();
    } catch {
      this.showError(UI_STRINGS.blockCreationError);
    }
  }

  private async insertBlockAtPosition(blockId: string, position: number): Promise<void> {
    const allBlocks = await this.config.useCase.getAllBlocks();
    const blockIds = allBlocks.map(b => b.id);

    const newBlockIndex = blockIds.indexOf(blockId);
    if (newBlockIndex !== -1) {
      blockIds.splice(newBlockIndex, 1);
    }

    blockIds.splice(position, 0, blockId);

    await this.config.useCase.reorderBlocks(blockIds);
  }

  async editBlock(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const block = this.blocks.find(b => b.id === blockId);
    if (!block) {
      return;
    }

    const config = this.config.blockConfigs[block.type];
    if (!config) {
      this.showError(UI_STRINGS.blockConfigNotFound);
      return;
    }

    const fields: TFieldConfig[] = addSpacingFieldToFields(
      (config.fields || []) as IFormFieldConfig[],
      config.spacingOptions as IBlockSpacingOptions | undefined,
      this.licenseService.getFeatureChecker()
    );

    const formHTML = `
    <form id="${FORM_ID_PREFIX}" class="block-builder-form">
      ${this.formBuilder.generateEditFormHTML(fields, block.props)}
    </form>
    `;

    this.modalManager.showModal({
      title: `${config.title} ${UI_STRINGS.editBlockTitle}`,
      bodyHTML: formHTML,
      onSubmit: () => this.handleUpdateBlock(blockId, block.type, fields),
      onCancel: () => {
        this.currentFormFields.clear();
        this.repeaterFieldConfigs.clear();
        this.modalManager.closeModal();
      },
      submitButtonText: UI_STRINGS.saveButtonText,
    });

    this.currentFormFields.clear();
    this.repeaterFieldConfigs.clear();
    fields.forEach(field => {
      this.currentFormFields.set(field.field, field);
      if (field.type === 'repeater' && field.repeaterConfig?.fields) {
        const repeaterFieldsMap = new Map<string, TFieldConfig>();
        field.repeaterConfig.fields.forEach((repeaterField: TFieldConfig) => {
          repeaterFieldsMap.set(repeaterField.field, repeaterField);
        });
        this.repeaterFieldConfigs.set(field.field, repeaterFieldsMap);
      }
    });

    afterRender(async () => {
      this.initializeSpacingControls();
      this.initializeRepeaterControls();
      await this.initializeApiSelectControls();
      await this.initializeSelectControls();
      this.initializeImageUploadControls();
      await this.initializeCustomFieldControls();
    });
  }

  private async handleUpdateBlock(
    blockId: string,
    type: string,
    fields: TFieldConfig[]
  ): Promise<void> {
    const props = this.getFormDataWithSpacing(FORM_ID_PREFIX);

    const validation = UniversalValidator.validateForm(props, fields);
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    try {
      await this.config.useCase.updateBlock(blockId, { props });

      this.modalManager.closeModal();
      await this.refreshBlocks();
    } catch {
      this.showError(UI_STRINGS.blockUpdateError);
    }
  }

  async toggleBlockVisibility(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const block = this.blocks.find(b => b.id === blockId);
    if (!block) {
      return;
    }

    await this.config.useCase.setBlockVisible(blockId, !block.visible);
    await this.refreshBlocks();
  }

  async deleteBlockUI(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const confirmed = await this.modalManager.confirm(
      UI_STRINGS.deleteBlockConfirmTitle,
      UI_STRINGS.deleteBlockConfirmMessage
    );
    if (!confirmed) {
      return;
    }

    this.uiRenderer.cleanupBlockWatcher(blockId);

    await this.config.useCase.deleteBlock(blockId);
    await this.refreshBlocks();
  }

  async duplicateBlockUI(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    await this.config.useCase.duplicateBlock(blockId);
    await this.refreshBlocks();
  }

  async clearAllBlocksUI(): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const confirmed = await this.modalManager.confirm(
      UI_STRINGS.clearAllBlocksConfirmTitle,
      UI_STRINGS.clearAllBlocksConfirmMessage
    );
    if (!confirmed) {
      return;
    }

    const allBlocks = await this.config.useCase.getAllBlocks();
    for (const block of allBlocks) {
      await this.config.useCase.deleteBlock(block.id);
    }
    await this.refreshBlocks();
  }

  async saveAllBlocksUI(): Promise<void> {
    if (!this.onSave) {
      this.showNotification(UI_STRINGS.saveNotEnabled, 'error');
      return;
    }

    try {
      const blocks = await this.config.useCase.getAllBlocks();
      const result = await Promise.resolve(this.onSave(blocks));

      if (result === true) {
        this.showNotification(UI_STRINGS.successSaved, 'success');
      } else {
        this.showNotification(UI_STRINGS.errorSaveFailed, 'error');
      }
    } catch {
      this.showNotification(UI_STRINGS.errorSaveFailed, 'error');
    }
  }

  async moveBlockUp(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const currentIndex = this.blocks.findIndex(block => block.id === blockId);
    if (currentIndex <= 0) {
      return;
    } // Уже наверху

    const newBlocks = [...this.blocks];
    [newBlocks[currentIndex], newBlocks[currentIndex - 1]] = [
      newBlocks[currentIndex - 1],
      newBlocks[currentIndex],
    ];

    const blockIds = newBlocks.map(block => block.id);
    await this.config.useCase.reorderBlocks(blockIds);

    await this.refreshBlocks();
  }

  async moveBlockDown(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const currentIndex = this.blocks.findIndex(block => block.id === blockId);
    if (currentIndex >= this.blocks.length - 1) {
      return;
    }

    const newBlocks = [...this.blocks];
    [newBlocks[currentIndex], newBlocks[currentIndex + 1]] = [
      newBlocks[currentIndex + 1],
      newBlocks[currentIndex],
    ];

    const blockIds = newBlocks.map(block => block.id);
    await this.config.useCase.reorderBlocks(blockIds);

    await this.refreshBlocks();
  }

  async copyBlockId(blockId: string): Promise<void> {
    const success = await copyToClipboard(blockId);
    if (success) {
      this.showNotification(`${UI_STRINGS.blockIdCopied} ${blockId}`, 'success');
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = 'block-builder-notification';
    notification.textContent = message;

    const colors = {
      success: '#4caf50',
      error: '#dc3545',
      info: '#007bff',
    };

    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s ease-in-out;
  `;
    document.body.append(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-in-out';
      setTimeout(() => notification.remove(), 300);
    }, NOTIFICATION_DISPLAY_DURATION_MS);
  }

  private showValidationErrors(
    errors: Record<string, string[]>,
    skipScroll: boolean = false
  ): void {
    this.clearValidationErrors();

    this.repeaterRenderers.forEach(renderer => {
      renderer.updateErrors(errors);
    });

    Object.entries(errors).forEach(([fieldName, fieldErrors]) => {
      if (fieldName.includes('[') && fieldName.includes(']')) {
        return;
      }

      const input = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
      if (input) {
        input.classList.add(CSS_CLASSES.ERROR);

        const formGroup = input.closest(`.${CSS_CLASSES.FORM_GROUP}`) as HTMLElement;
        if (formGroup) {
          formGroup.classList.add(CSS_CLASSES.ERROR);
        }

        const errorContainer = document.createElement('div');
        errorContainer.className = CSS_CLASSES.FORM_ERRORS;
        errorContainer.dataset.field = fieldName;

        fieldErrors.forEach(error => {
          const errorSpan = document.createElement('span');
          errorSpan.className = CSS_CLASSES.ERROR;
          errorSpan.textContent = error;
          errorContainer.append(errorSpan);
        });

        input.parentElement?.append(errorContainer);
      }
    });

    if (!skipScroll) {
      this.handleScrollToFirstError(errors);
    }
  }

  private clearValidationErrors(): void {
    document
      .querySelectorAll(`.${CSS_CLASSES.FORM_CONTROL}.${CSS_CLASSES.ERROR}`)
      .forEach(input => {
        input.classList.remove(CSS_CLASSES.ERROR);
      });

    document.querySelectorAll(`.${CSS_CLASSES.FORM_GROUP}.${CSS_CLASSES.ERROR}`).forEach(group => {
      group.classList.remove(CSS_CLASSES.ERROR);
    });

    document.querySelectorAll(`.${CSS_CLASSES.FORM_ERRORS}`).forEach(container => {
      container.remove();
    });
  }

  private handleScrollToFirstError(errors: Record<string, string[]>): void {
    const firstErrorKey = Object.keys(errors)[0];
    if (!firstErrorKey) {
      return;
    }

    const errorInfo = parseErrorKey(firstErrorKey);

    if (errorInfo.isRepeaterField && errorInfo.repeaterFieldName) {
      this.openRepeaterAccordion(errorInfo.repeaterFieldName, errorInfo.repeaterIndex || 0, errors);
    } else {
      setTimeout(() => {
        const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
        if (!modalBody) {
          return;
        }
        scrollToFirstError(modalBody, errors, {
          offset: 40,
          behavior: 'smooth',
          autoFocus: true,
        });
      }, ERROR_RENDER_DELAY_MS);
    }
  }

  private openRepeaterAccordion(
    repeaterFieldName: string,
    itemIndex: number,
    errors?: Record<string, string[]>
  ): void {
    const renderer = this.repeaterRenderers.get(repeaterFieldName);

    if (!renderer) {
      return;
    }

    const modalBody = document.querySelector('.block-builder-modal-body') as HTMLElement;
    if (!modalBody) {
      return;
    }

    const allErrors = errors || this.getRepeaterErrors();

    const firstErrorKey = Object.keys(allErrors).find(key => {
      const errorInfo = parseErrorKey(key);
      return (
        errorInfo.isRepeaterField &&
        errorInfo.repeaterFieldName === repeaterFieldName &&
        errorInfo.repeaterIndex === itemIndex
      );
    });

    if (renderer.isItemCollapsed(itemIndex)) {
      renderer.expandItem(itemIndex);

      setTimeout(() => {
        this.showValidationErrors(allErrors, true);

        setTimeout(() => {
          if (firstErrorKey) {
            const errorInfo = parseErrorKey(firstErrorKey);
            const fieldElement = findFieldElement(modalBody, errorInfo);
            if (fieldElement) {
              scrollToElement(fieldElement, {
                offset: 40,
                behavior: 'smooth',
              });
              focusElement(fieldElement);
            } else {
              scrollToFirstError(modalBody, allErrors, {
                offset: 40,
                behavior: 'smooth',
                autoFocus: true,
              });
            }
          } else {
            scrollToFirstError(modalBody, allErrors, {
              offset: 40,
              behavior: 'smooth',
              autoFocus: true,
            });
          }
        }, ERROR_RENDER_DELAY_MS);
      }, REPEATER_ACCORDION_ANIMATION_DELAY_MS);
    } else {
      setTimeout(() => {
        if (firstErrorKey) {
          const errorInfo = parseErrorKey(firstErrorKey);
          const fieldElement = findFieldElement(modalBody, errorInfo);
          if (fieldElement) {
            scrollToElement(fieldElement, {
              offset: 40,
              behavior: 'smooth',
            });
            focusElement(fieldElement);
          } else {
            scrollToFirstError(modalBody, allErrors, {
              offset: 40,
              behavior: 'smooth',
              autoFocus: true,
            });
          }
        } else {
          scrollToFirstError(modalBody, allErrors, {
            offset: 40,
            behavior: 'smooth',
            autoFocus: true,
          });
        }
      }, ERROR_RENDER_DELAY_MS);
    }
  }

  private getRepeaterErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    document
      .querySelectorAll(
        '.block-builder-form-errors .block-builder-error, .image-upload-field__error'
      )
      .forEach(errorEl => {
        let field: HTMLElement | null = null;
        let repeaterIndex: string | null = null;
        let fieldName: string | null = null;

        const isImageField = errorEl.classList.contains('image-upload-field__error');

        if (isImageField) {
          const imageField = errorEl.closest('.image-upload-field') as HTMLElement;
          if (imageField) {
            field = imageField;
            repeaterIndex = imageField.dataset.repeaterIndex || null;
            fieldName = imageField.dataset.repeaterItemField || null;
          }
        } else {
          field = errorEl.closest('.block-builder-form-group') as HTMLElement;
          if (field) {
            const input = field.querySelector('input, textarea, select') as HTMLElement;
            if (input) {
              repeaterIndex = input.dataset.itemIndex || null;
              fieldName = input.dataset.fieldName || null;
            }
          }
        }

        if (repeaterIndex !== null && fieldName) {
          const repeaterControl = field?.closest('.repeater-control') as HTMLElement;
          if (repeaterControl) {
            const repeaterFieldName = repeaterControl.dataset.fieldName;
            if (repeaterFieldName) {
              const errorKey = `${repeaterFieldName}[${repeaterIndex}].${fieldName}`;
              errors[errorKey] = [errorEl.textContent || ''];
            }
          }
        }
      });

    return errors;
  }

  private showError(message: string): void {
    this.showNotification(message, 'error');
  }

  private closeModalWithCleanup(): void {
    this.clearValidationErrors();
    this.cleanupSpacingControls();
    this.cleanupRepeaterControls();
    this.cleanupApiSelectControls();
    this.cleanupCustomFieldControls();
    this.modalManager.closeModal();
  }

  closeModal(): void {
    this.closeModalWithCleanup();
  }

  submitModal(): void {
    this.modalManager.submitModal();
  }

  private registerEventHandlers(): void {
    this.eventDelegation.register('saveAllBlocksUI', () => this.saveAllBlocksUI());
    this.eventDelegation.register('clearAllBlocksUI', () => this.clearAllBlocksUI());
    this.eventDelegation.register('showBlockTypeSelectionModal', (position?: number) =>
      this.showBlockTypeSelectionModal(position)
    );
    this.eventDelegation.register('showAddBlockFormAtPosition', (type: string, position?: number) =>
      this.showAddBlockFormAtPosition(type, position)
    );
    this.eventDelegation.register('editBlock', (blockId: string) => this.editBlock(blockId));
    this.eventDelegation.register('copyBlockId', (blockId: string) => this.copyBlockId(blockId));
    this.eventDelegation.register('moveBlockUp', (blockId: string) => this.moveBlockUp(blockId));
    this.eventDelegation.register('moveBlockDown', (blockId: string) =>
      this.moveBlockDown(blockId)
    );
    this.eventDelegation.register('toggleBlockVisibility', (blockId: string) =>
      this.toggleBlockVisibility(blockId)
    );
    this.eventDelegation.register('duplicateBlockUI', (blockId: string) =>
      this.duplicateBlockUI(blockId)
    );
    this.eventDelegation.register('deleteBlockUI', (blockId: string) =>
      this.deleteBlockUI(blockId)
    );
    this.eventDelegation.register('closeModal', () => this.closeModal());
    this.eventDelegation.register('submitModal', () => this.submitModal());
  }

  setIsEdit(isEdit: boolean): void {
    this.isEdit = isEdit;
    if (this.uiRenderer) {
      this.uiRenderer.updateEditMode(isEdit);
    }
    this.refreshBlocks();
  }

  getIsEdit(): boolean {
    return this.isEdit;
  }

  destroy(): void {
    this.cleanupSpacingControls();
    this.cleanupRepeaterControls();
    this.cleanupApiSelectControls();
    this.cleanupCustomFieldControls();
    this.modalManager.closeModal();
    this.eventDelegation.destroy();
    this.uiRenderer.destroy();
  }
}
