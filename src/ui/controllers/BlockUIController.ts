import { IBlockDto, ICreateBlockDto } from "../../core/types";
import { BlockManagementUseCase } from "../../core/use-cases/BlockManagementUseCase";
import { ApiSelectUseCase } from "../../core/use-cases/ApiSelectUseCase";
import { UIRenderer } from "../services/UIRenderer";
import { FormBuilder, TFieldConfig } from "../services/FormBuilder";
import { ModalManager } from "../services/ModalManager";
import { SpacingControlRenderer } from "../services/SpacingControlRenderer";
import { RepeaterControlRenderer } from "../services/RepeaterControlRenderer";
import { ApiSelectControlRenderer } from "../services/ApiSelectControlRenderer";
import { CustomFieldControlRenderer } from "../services/CustomFieldControlRenderer";
import { ICustomFieldRendererRegistry } from "../../core/ports/CustomFieldRenderer";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { UniversalValidator } from "../../utils/universalValidation";
import { addSpacingFieldToFields } from "../../utils/blockSpacingHelpers";
import { scrollToFirstError, parseErrorKey, findFieldElement, scrollToElement, focusElement } from "../../utils/formErrorHelpers";
import { afterRender } from "../../utils/domReady";
import { EventDelegation } from "../EventDelegation";
import { LicenseService, ILicenseInfo } from "../../core/services/LicenseService";
import { LicenseFeature } from "../../core/services/LicenseFeatureChecker";
import { parseJSONFromAttribute } from "../../utils/domSafe";
import { ERROR_RENDER_DELAY_MS, NOTIFICATION_DISPLAY_DURATION_MS, REPEATER_ACCORDION_ANIMATION_DELAY_MS, UI_STRINGS, CSS_CLASSES, FORM_ID_PREFIX } from "../../utils/constants";

export interface IBlockUIControllerConfig {
  containerId: string;
  blockConfigs: Record<string, any>;
  useCase: BlockManagementUseCase;
  apiSelectUseCase: ApiSelectUseCase;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  onSave?: (blocks: IBlockDto[]) => Promise<boolean> | boolean;
  controlsContainerClass?: string;
  controlsFixedPosition?: 'top' | 'bottom';
  controlsOffset?: number;
  controlsOffsetVar?: string;
  licenseService: LicenseService;
  originalBlockConfigs?: Record<string, any>;
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
  private customFieldRenderers: Map<string, CustomFieldControlRenderer> = new Map();
  private eventDelegation: EventDelegation;
  private licenseService: LicenseService;
  private originalBlockConfigs?: Record<string, any>;
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
      isEdit: this.isEdit
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

    const licenseWarningHTML = !licenseInfo.isPro ? `
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
    ` : '';

    const blockTypesHTML = Object.entries(this.config.blockConfigs)
      .map(([type, config]) => {
        const title = config.title || type;
        const icon = config.icon || "📦";
        const args = position !== undefined ? JSON.stringify([type, position]) : JSON.stringify([type, undefined]);
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
      .join("");

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

    let fields: TFieldConfig[] = addSpacingFieldToFields(
      config.fields || [],
      config.spacingOptions,
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

    containers.forEach((container) => {
      const config = container.getAttribute("data-spacing-config");
      if (!config) return;

      try {
        const spacingConfig = parseJSONFromAttribute(config);

        const renderer = new SpacingControlRenderer({
          fieldName: spacingConfig.field,
          label: spacingConfig.label,
          required: spacingConfig.required,
          config: spacingConfig,
          value: spacingConfig.value || {},
          licenseFeatureChecker: this.licenseService.getFeatureChecker(),
          onChange: (value) => {
            container.setAttribute("data-spacing-value", JSON.stringify(value));
          },
        });

        renderer.render(container as HTMLElement);

        this.spacingRenderers.set(spacingConfig.field, renderer);
      } catch (error) {
      }
    });
  }

    private cleanupSpacingControls(): void {
    this.spacingRenderers.forEach((renderer) => {
      renderer.destroy();
    });
    this.spacingRenderers.clear();
  }

    private initializeRepeaterControls(): void {
    this.cleanupRepeaterControls();

    const containers = document.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}`);

    containers.forEach((container) => {
      const config = container.getAttribute("data-repeater-config");
      if (!config) return;

      try {
        const repeaterConfig = parseJSONFromAttribute(config);

        const self = this;

        const renderer = new RepeaterControlRenderer({
          fieldName: repeaterConfig.field,
          label: repeaterConfig.label,
          rules: repeaterConfig.rules || [],
          config: repeaterConfig,
          value: repeaterConfig.value || [],
          onChange: (value) => {
            container.setAttribute("data-repeater-value", JSON.stringify(value));
          },
          onAfterRender: () => {
            self.initializeImageUploadControls();
          }
        });

        renderer.render(container as HTMLElement);

        this.repeaterRenderers.set(repeaterConfig.field, renderer);
      } catch (error) {
      }
    });
  }

    private cleanupRepeaterControls(): void {
    this.repeaterRenderers.forEach((renderer) => {
      renderer.destroy();
    });
    this.repeaterRenderers.clear();
  }

    private async initializeApiSelectControls(): Promise<void> {
    if (!this.licenseService.canUseApiSelect()) {
      const containers = document.querySelectorAll(`.${CSS_CLASSES.API_SELECT_CONTROL_CONTAINER}`);
      containers.forEach((container) => {
        const placeholder = container.querySelector(".api-select-placeholder") as HTMLElement;
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

    const containers = document.querySelectorAll(".api-select-control-container");

    for (const container of Array.from(containers)) {
      const config = container.getAttribute("data-api-select-config");
      if (!config) {
        continue;
      }

      try {
        const apiSelectConfig = parseJSONFromAttribute(config);

        const renderer = new ApiSelectControlRenderer({
          fieldName: apiSelectConfig.field,
          label: apiSelectConfig.label,
          rules: apiSelectConfig.rules || [],
          config: apiSelectConfig,
          value: apiSelectConfig.value || (apiSelectConfig.multiple ? [] : null),
          apiSelectUseCase: this.apiSelectUseCase,
          onChange: (value) => {
            container.setAttribute("data-api-select-value", JSON.stringify(value));
          },
        });

        await renderer.init(container as HTMLElement);

        this.apiSelectRenderers.set(apiSelectConfig.field, renderer);
      } catch (error) {
      }
    }
  }

    private cleanupApiSelectControls(): void {
    this.apiSelectRenderers.forEach((renderer) => {
      renderer.destroy();
    });
    this.apiSelectRenderers.clear();
  }

    private async initializeCustomFieldControls(): Promise<void> {
    if (!this.licenseService.canUseCustomFields()) {
      const containers = document.querySelectorAll(`.${CSS_CLASSES.CUSTOM_FIELD_CONTROL_CONTAINER}`);
      containers.forEach((container) => {
        const placeholder = container.querySelector(".custom-field-placeholder") as HTMLElement;
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

    const containers = document.querySelectorAll(".custom-field-control-container");

    for (const container of Array.from(containers)) {
      const config = container.getAttribute("data-custom-field-config");
      if (!config) {
        continue;
      }

      try {
        const customFieldConfig = parseJSONFromAttribute(config);

        if (!customFieldConfig.rendererId) {
          continue;
        }

        const renderer = this.customFieldRendererRegistry.get(customFieldConfig.rendererId);
        if (!renderer) {
          this.showCustomFieldError(
            container as HTMLElement,
            `Рендерер "${customFieldConfig.rendererId}" не зарегистрирован`,
          );
          continue;
        }

        let renderContainer = container.querySelector(".custom-field-placeholder") as HTMLElement;
        if (!renderContainer) {
          renderContainer = container as HTMLElement;
        }

        const fieldRenderer = new CustomFieldControlRenderer(renderContainer, renderer, {
          fieldName: customFieldConfig.field,
          label: customFieldConfig.label,
          value: customFieldConfig.value,
          required: customFieldConfig.required || false,
          rendererId: customFieldConfig.rendererId,
          options: customFieldConfig.options,
          onChange: (value) => {
            container.setAttribute("data-custom-field-value", JSON.stringify(value));
          },
          onError: (error) => {
          },
        });

        this.customFieldRenderers.set(customFieldConfig.field, fieldRenderer);
      } catch (error) {
        this.showCustomFieldError(container as HTMLElement, `Ошибка: ${error}`);
      }
    }
  }

    private initializeImageUploadControls(): void {
    const containers = document.querySelectorAll(".image-upload-field");

    containers.forEach((container) => {
      const fieldName = container.getAttribute("data-field-name");
      if (!fieldName) return;

      if (container.hasAttribute('data-image-initialized')) return;
      container.setAttribute('data-image-initialized', 'true');

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const hiddenInput = container.querySelector('input[type="hidden"][data-image-value="true"]') as HTMLInputElement;
      const preview = container.querySelector('.image-upload-field__preview') as HTMLElement;
      const previewImg = preview?.querySelector('img') as HTMLImageElement;
      const label = container.querySelector('label[for]') as HTMLLabelElement;
      const labelText = label?.querySelector('.image-upload-field__label-text') as HTMLElement;
      const loadingText = label?.querySelector('.image-upload-field__loading-text') as HTMLElement;
      const errorDiv = container.querySelector('.image-upload-field__error') as HTMLElement;

      if (!fileInput || !hiddenInput) return;

      const configStr = fileInput.getAttribute('data-config') || '{}';
      let config: any = {};
      try {
        config = JSON.parse(configStr.replace(/&quot;/g, '"'));
      } catch (e) {
        console.error('Ошибка парсинга конфига изображения:', e);
      }

      const repeaterField = container.getAttribute('data-repeater-field');
      const repeaterIndex = container.getAttribute('data-repeater-index');
      const repeaterItemField = container.getAttribute('data-repeater-item-field');

      let imageUploadConfig: any = undefined;
      let responseMapper: any = undefined;

      if (repeaterField && repeaterItemField !== null) {
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
        maxFileSize: imageUploadConfig?.maxFileSize || config.maxFileSize || (10 * 1024 * 1024),
        uploadHeaders: imageUploadConfig?.uploadHeaders || config.uploadHeaders || {},
      };

      let currentValue: any = hiddenInput.value;

      if (repeaterField && repeaterIndex !== null && repeaterItemField !== null) {
        const repeaterRenderer = this.repeaterRenderers.get(repeaterField);
        if (repeaterRenderer) {
          const index = parseInt(repeaterIndex, 10);
          const rendererValue = (repeaterRenderer as any).value;
          if (rendererValue && rendererValue[index] !== undefined) {
            currentValue = rendererValue[index][repeaterItemField];
          }
        }
      } else {
        if (currentValue) {
          try {
            const parsed = JSON.parse(currentValue.replace(/&quot;/g, '"'));
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
            if (labelText) labelText.textContent = 'Изменить файл';
          }
        } catch (e) {
          console.error('Ошибка инициализации preview:', e);
        }
      }

      const self = this;

      const clearBtn = container.querySelector('.image-upload-field__preview-clear') as HTMLButtonElement;
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          fileInput.value = '';
          hiddenInput.value = '';
          if (preview) preview.style.display = 'none';
          if (labelText) labelText.textContent = 'Выберите изображение';

          if (repeaterField && repeaterIndex !== null && repeaterItemField !== null) {
            const repeaterRenderer = self.repeaterRenderers.get(repeaterField);
            if (repeaterRenderer) {
              const index = parseInt(repeaterIndex, 10);
              const rendererValue = (repeaterRenderer as any).value;
              if (rendererValue && rendererValue[index] !== undefined) {
                rendererValue[index][repeaterItemField] = '';
                (repeaterRenderer as any).emitChange();
              }
            }
          }
        });
      }

      fileInput.addEventListener('change', async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

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
              body: formData
            });

            if (!response.ok) {
              throw new Error('Ошибка загрузки: ' + response.statusText);
            }

            const responseData = await response.json();

            if (responseMapper && typeof responseMapper === 'function') {
              result = responseMapper(responseData);
            } else {
              result = responseData;
            }
          } else {
            result = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }

          if (repeaterField && repeaterIndex !== null && repeaterItemField !== null) {
            const repeaterRenderer = self.repeaterRenderers.get(repeaterField);
            if (repeaterRenderer) {
              const index = parseInt(repeaterIndex, 10);
              const rendererValue = (repeaterRenderer as any).value;
              if (rendererValue && rendererValue[index] !== undefined) {
                rendererValue[index][repeaterItemField] = result;
                (repeaterRenderer as any).emitChange();
              }
            }
          }

          hiddenInput.value = typeof result === 'object' && result !== null ? JSON.stringify(result) : (result || '');

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
            const validationErrorDivs = container.querySelectorAll('.image-upload-field__error');
            validationErrorDivs.forEach((div: Element) => {
              const errorEl = div as HTMLElement;
              errorEl.style.display = 'none';
              errorEl.textContent = '';
            });
          }

          if (repeaterField && repeaterIndex !== null && repeaterItemField !== null) {
            const repeaterRenderer = self.repeaterRenderers.get(repeaterField);
            if (repeaterRenderer && self.currentFormFields.size > 0) {
              const formData = self.getFormDataWithSpacing(FORM_ID_PREFIX);
              const fields = Array.from(self.currentFormFields.values());
              const validation = UniversalValidator.validateForm(formData, fields);


              if (repeaterRenderer.updateErrors) {
                repeaterRenderer.updateErrors(validation.errors);
              }

              self.repeaterRenderers.forEach((renderer) => {
                if (renderer !== repeaterRenderer && renderer.updateErrors) {
                  renderer.updateErrors(validation.errors);
                }
              });

              const fieldNamePath = `${repeaterField}[${repeaterIndex}].${repeaterItemField}`;
              if (!validation.errors[fieldNamePath] || validation.errors[fieldNamePath].length === 0) {
                setTimeout(() => {
                  const errorContainer = document.querySelector(`[data-field-name="${fieldNamePath}"]`) as HTMLElement;
                  if (errorContainer) {
                    errorContainer.classList.remove(CSS_CLASSES.ERROR);
                    const errorDivs = errorContainer.querySelectorAll('.image-upload-field__error');
                    errorDivs.forEach((div: Element) => {
                      const errorEl = div as HTMLElement;
                      if (errorEl.textContent) {
                        errorEl.style.display = 'none';
                        errorEl.textContent = '';
                      }
                    });
                  }
                }, ERROR_RENDER_DELAY_MS);
              }
            }
          }

          const changeEvent = new Event('change', { bubbles: true });
          hiddenInput.dispatchEvent(changeEvent);

        } catch (error: any) {
          console.error('ImageUpload error:', error);
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
    const placeholder = container.querySelector(".custom-field-placeholder") as HTMLElement;
    if (placeholder) {
      placeholder.removeAttribute('style');
      placeholder.classList.remove('bb-placeholder-box');
      placeholder.innerHTML = '';
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 10px; border: 1px solid #ff4444; border-radius: 4px; background-color: #fff5f5; color: #ff4444;';
      errorDiv.textContent = `❌ ${message}`;
      placeholder.appendChild(errorDiv);
    }
  }

    private cleanupCustomFieldControls(): void {
    this.customFieldRenderers.forEach((renderer) => {
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
      props[fieldName] = renderer.getValue();
    });

    this.customFieldRenderers.forEach((renderer, fieldName) => {
      props[fieldName] = renderer.getValue();
    });

    return props;
  }

    private async handleCreateBlock(type: string, fields: TFieldConfig[], position?: number): Promise<void> {
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
        createData.render = blockConfig.render;
      }

      const newBlock = await this.config.useCase.createBlock(createData);

      if (position !== undefined && newBlock) {
        await this.insertBlockAtPosition(newBlock.id, position);
      }

      this.modalManager.closeModal();
      await this.refreshBlocks();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.showError(UI_STRINGS.blockCreationError);
    }
  }

    private async insertBlockAtPosition(blockId: string, position: number): Promise<void> {
    const allBlocks = await this.config.useCase.getAllBlocks();
    const blockIds = allBlocks.map((b) => b.id);

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
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const config = this.config.blockConfigs[block.type];
    if (!config) {
      this.showError(UI_STRINGS.blockConfigNotFound);
      return;
    }

    let fields: TFieldConfig[] = addSpacingFieldToFields(
      config.fields || [],
      config.spacingOptions,
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
      this.initializeImageUploadControls();
      await this.initializeCustomFieldControls();
    });
  }

    private async handleUpdateBlock(blockId: string, type: string, fields: TFieldConfig[]): Promise<void> {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.showError(UI_STRINGS.blockUpdateError);
    }
  }

    async toggleBlockVisibility(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    await this.config.useCase.setBlockVisible(blockId, !block.visible);
    await this.refreshBlocks();
  }

    async deleteBlockUI(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const confirmed = await this.modalManager.confirm(UI_STRINGS.deleteBlockConfirmTitle, UI_STRINGS.deleteBlockConfirmMessage);
    if (!confirmed) return;

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
    const confirmed = await this.modalManager.confirm(UI_STRINGS.clearAllBlocksConfirmTitle, UI_STRINGS.clearAllBlocksConfirmMessage);
    if (!confirmed) return;

    const allBlocks = await this.config.useCase.getAllBlocks();
    for (const block of allBlocks) {
      await this.config.useCase.deleteBlock(block.id);
    }
    await this.refreshBlocks();
  }

    async saveAllBlocksUI(): Promise<void> {
    if (!this.onSave) {
      this.showNotification(UI_STRINGS.saveNotEnabled, "error");
      return;
    }

    try {
      const blocks = await this.config.useCase.getAllBlocks();
      const result = await Promise.resolve(this.onSave(blocks));

      if (result === true) {
        this.showNotification(UI_STRINGS.successSaved, "success");
      } else {
        this.showNotification(UI_STRINGS.errorSaveFailed, "error");
      }
    } catch (error) {
      this.showNotification(UI_STRINGS.errorSaveFailed, "error");
    }
  }

    async moveBlockUp(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const currentIndex = this.blocks.findIndex((block) => block.id === blockId);
    if (currentIndex <= 0) return; // Уже наверху

    const newBlocks = [...this.blocks];
    [newBlocks[currentIndex], newBlocks[currentIndex - 1]] = [newBlocks[currentIndex - 1], newBlocks[currentIndex]];

    const blockIds = newBlocks.map((block) => block.id);
    await this.config.useCase.reorderBlocks(blockIds);

    await this.refreshBlocks();
  }

    async moveBlockDown(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return;
    }
    const currentIndex = this.blocks.findIndex((block) => block.id === blockId);
    if (currentIndex >= this.blocks.length - 1) return;

    const newBlocks = [...this.blocks];
    [newBlocks[currentIndex], newBlocks[currentIndex + 1]] = [newBlocks[currentIndex + 1], newBlocks[currentIndex]];

    const blockIds = newBlocks.map((block) => block.id);
    await this.config.useCase.reorderBlocks(blockIds);

    await this.refreshBlocks();
  }

    async copyBlockId(blockId: string): Promise<void> {
    const success = await copyToClipboard(blockId);
    if (success) {
      this.showNotification(`${UI_STRINGS.blockIdCopied} ${blockId}`, "success");
    }
  }

    private showNotification(message: string, type: "success" | "error" | "info" = "info"): void {
    const notification = document.createElement("div");
    notification.className = "block-builder-notification";
    notification.textContent = message;

    const colors = {
      success: "#4caf50",
      error: "#dc3545",
      info: "#007bff",
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
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease-in-out";
      setTimeout(() => notification.remove(), 300);
    }, NOTIFICATION_DISPLAY_DURATION_MS);
  }

    private showValidationErrors(errors: Record<string, string[]>, skipScroll: boolean = false): void {
    this.clearValidationErrors();

    this.repeaterRenderers.forEach((renderer) => {
      renderer.updateErrors(errors);
    });

    Object.entries(errors).forEach(([fieldName, fieldErrors]) => {
      if (fieldName.includes("[") && fieldName.includes("]")) {
        return;
      }

      const input = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
      if (input) {
        input.classList.add(CSS_CLASSES.ERROR);

        const formGroup = input.closest(`.${CSS_CLASSES.FORM_GROUP}`) as HTMLElement;
        if (formGroup) {
          formGroup.classList.add(CSS_CLASSES.ERROR);
        }

        const errorContainer = document.createElement("div");
        errorContainer.className = CSS_CLASSES.FORM_ERRORS;
        errorContainer.setAttribute("data-field", fieldName);

        fieldErrors.forEach((error) => {
          const errorSpan = document.createElement("span");
          errorSpan.className = CSS_CLASSES.ERROR;
          errorSpan.textContent = error;
          errorContainer.appendChild(errorSpan);
        });

        input.parentElement?.appendChild(errorContainer);
      }
    });

    if (!skipScroll) {
      this.handleScrollToFirstError(errors);
    }
  }

  private clearValidationErrors(): void {
    document.querySelectorAll(`.${CSS_CLASSES.FORM_CONTROL}.${CSS_CLASSES.ERROR}`).forEach((input) => {
      input.classList.remove(CSS_CLASSES.ERROR);
    });

    document.querySelectorAll(`.${CSS_CLASSES.FORM_GROUP}.${CSS_CLASSES.ERROR}`).forEach((group) => {
      group.classList.remove(CSS_CLASSES.ERROR);
    });

    document.querySelectorAll(`.${CSS_CLASSES.FORM_ERRORS}`).forEach((container) => {
      container.remove();
    });
  }

    private handleScrollToFirstError(errors: Record<string, string[]>): void {
    const firstErrorKey = Object.keys(errors)[0];
    if (!firstErrorKey) return;

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
          behavior: "smooth",
          autoFocus: true,
        });
      }, ERROR_RENDER_DELAY_MS);
    }
  }

  private openRepeaterAccordion(repeaterFieldName: string, itemIndex: number, errors?: Record<string, string[]>): void {
    const renderer = this.repeaterRenderers.get(repeaterFieldName);

    if (!renderer) {
      return;
    }

    const modalBody = document.querySelector(".block-builder-modal-body") as HTMLElement;
    if (!modalBody) return;

    const allErrors = errors || this.getRepeaterErrors();

    const firstErrorKey = Object.keys(allErrors).find(key => {
      const errorInfo = parseErrorKey(key);
      return errorInfo.isRepeaterField &&
             errorInfo.repeaterFieldName === repeaterFieldName &&
             errorInfo.repeaterIndex === itemIndex;
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
                behavior: "smooth"
              });
              focusElement(fieldElement);
            } else {
              scrollToFirstError(modalBody, allErrors, {
                offset: 40,
                behavior: "smooth",
                autoFocus: true,
              });
            }
          } else {
            scrollToFirstError(modalBody, allErrors, {
              offset: 40,
              behavior: "smooth",
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
              behavior: "smooth"
            });
            focusElement(fieldElement);
          } else {
            scrollToFirstError(modalBody, allErrors, {
              offset: 40,
              behavior: "smooth",
              autoFocus: true,
            });
          }
        } else {
          scrollToFirstError(modalBody, allErrors, {
            offset: 40,
            behavior: "smooth",
            autoFocus: true,
          });
        }
      }, ERROR_RENDER_DELAY_MS);
    }
  }

  private getRepeaterErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    document.querySelectorAll(".repeater-control__field-error, .image-upload-field__error").forEach((errorEl) => {
      let field: HTMLElement | null = null;
      let repeaterIndex: string | null = null;
      let fieldName: string | null = null;

      const isImageField = errorEl.classList.contains("image-upload-field__error");

      if (isImageField) {
        const imageField = errorEl.closest(".image-upload-field") as HTMLElement;
        if (imageField) {
          field = imageField;
          repeaterIndex = imageField.getAttribute("data-repeater-index");
          fieldName = imageField.getAttribute("data-repeater-item-field");
        }
      } else {
        field = errorEl.closest(".repeater-control__field") as HTMLElement;
        if (field) {
          const input = field.querySelector("input, textarea, select") as HTMLElement;
          if (input) {
            repeaterIndex = input.getAttribute("data-item-index");
            fieldName = input.getAttribute("data-field-name");
          }
        }
      }

      if (repeaterIndex !== null && fieldName) {
        const repeaterControl = field?.closest(".repeater-control") as HTMLElement;
        if (repeaterControl) {
          const repeaterFieldName = repeaterControl.getAttribute("data-field-name");
          if (repeaterFieldName) {
            const errorKey = `${repeaterFieldName}[${repeaterIndex}].${fieldName}`;
            errors[errorKey] = [errorEl.textContent || ""];
          }
        }
      }
    });

    return errors;
  }

    private showError(message: string): void {
    this.showNotification(message, "error");
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
    this.eventDelegation.register('showBlockTypeSelectionModal', (position?: number) => this.showBlockTypeSelectionModal(position));
    this.eventDelegation.register('showAddBlockFormAtPosition', (type: string, position?: number) => this.showAddBlockFormAtPosition(type, position));
    this.eventDelegation.register('editBlock', (blockId: string) => this.editBlock(blockId));
    this.eventDelegation.register('copyBlockId', (blockId: string) => this.copyBlockId(blockId));
    this.eventDelegation.register('moveBlockUp', (blockId: string) => this.moveBlockUp(blockId));
    this.eventDelegation.register('moveBlockDown', (blockId: string) => this.moveBlockDown(blockId));
    this.eventDelegation.register('toggleBlockVisibility', (blockId: string) => this.toggleBlockVisibility(blockId));
    this.eventDelegation.register('duplicateBlockUI', (blockId: string) => this.duplicateBlockUI(blockId));
    this.eventDelegation.register('deleteBlockUI', (blockId: string) => this.deleteBlockUI(blockId));
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
