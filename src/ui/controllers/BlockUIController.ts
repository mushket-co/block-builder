/**
 * BlockUIController - координирует UI операции с блоками
 * Применяем паттерн Controller из MVC
 * Принцип единой ответственности (SRP) + Dependency Inversion Principle (DIP)
 */

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
import { ERROR_RENDER_DELAY_MS, NOTIFICATION_DISPLAY_DURATION_MS, REPEATER_ACCORDION_ANIMATION_DELAY_MS, UI_STRINGS } from "../../utils/constants";

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
  isEdit?: boolean; // Режим редактирования (по умолчанию true)
}

export class BlockUIController {
  private config: IBlockUIControllerConfig;
  public readonly uiRenderer: UIRenderer;  // Публичное поле для доступа
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
  private currentFormFields: Map<string, TFieldConfig> = new Map(); // Сохраняем конфигурацию полей для доступа к responseMapper
  private repeaterFieldConfigs: Map<string, Map<string, TFieldConfig>> = new Map(); // Сохраняем оригинальные конфигурации полей repeater для доступа к responseMapper
  private isEdit: boolean; // Режим редактирования

  constructor(config: IBlockUIControllerConfig) {
    this.config = config;
    this.originalBlockConfigs = config.originalBlockConfigs;
    this.onSave = config.onSave;
    this.apiSelectUseCase = config.apiSelectUseCase;
    this.customFieldRendererRegistry = config.customFieldRendererRegistry;
    this.licenseService = config.licenseService;
    this.isEdit = config.isEdit !== undefined ? config.isEdit : true; // По умолчанию true

    // Инициализация event delegation
    this.eventDelegation = new EventDelegation();

    // Инициализация сервисов (Dependency Injection)
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

    // Регистрация обработчиков событий
    this.registerEventHandlers();
  }

  /**
   * Инициализация UI
   */
  async init(): Promise<void> {
    // Рендеринг UI
    this.uiRenderer.renderContainer();

    // Загрузка и отображение блоков
    await this.refreshBlocks();
  }

  /**
   * Обновление списка блоков
   */
  async refreshBlocks(): Promise<void> {
    this.blocks = await this.config.useCase.getAllBlocks();
    this.uiRenderer.renderBlocks(this.blocks);
  }

  /**
   * Показать модалку выбора типа блока
   */
  showBlockTypeSelectionModal(position?: number): void {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    // Используем LicenseService для получения информации о лицензии
    const currentBlockTypesCount = Object.keys(this.config.blockConfigs).length;
    const licenseInfo = this.licenseService.getLicenseInfo(currentBlockTypesCount);

    // Если не PRO, показываем предупреждение
    const licenseWarningHTML = !licenseInfo.isPro ? `
      <div class="block-builder-license-warning">
        <div class="block-builder-license-warning__header">
          <span class="block-builder-license-warning__icon">⚠️</span>
          <strong class="block-builder-license-warning__title">Бесплатная версия <a href="https://block-builder.ru/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Block Builder</a></strong>
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

  /**
   * Показать форму добавления блока на определенной позиции
   */
  async showAddBlockFormAtPosition(type: string, position?: number): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    // Закрываем модалку выбора типа
    this.modalManager.closeModal();

    const config = this.config.blockConfigs[type];
    if (!config) {
      this.showError(UI_STRINGS.blockConfigNotFound);
      return;
    }

    // Автоматически добавляем spacing поле, если его нет
    // Передаем featureChecker для ограничения кастомных брекпоинтов в FREE версии
    let fields: TFieldConfig[] = addSpacingFieldToFields(
      config.fields || [],
      config.spacingOptions,
      this.licenseService.getFeatureChecker()
    );

    // НЕ фильтруем поля - они должны показываться с заглушкой в FREE версии
    // Заглушки отображаются через initializeApiSelectControls и initializeCustomFieldControls

    const formHTML = `
    <form id="block-builder-form" class="block-builder-form">
      ${this.formBuilder.generateCreateFormHTML(fields)}
    </form>
    `;

    this.modalManager.showModal({
      title: `${config.title} ${UI_STRINGS.addBlockTitle}`,
      bodyHTML: formHTML,
      onSubmit: () => this.handleCreateBlock(type, fields, position),
      onCancel: () => {
        this.currentFormFields.clear(); // Очищаем при закрытии
        this.repeaterFieldConfigs.clear();
        this.modalManager.closeModal();
      },
      submitButtonText: UI_STRINGS.addButtonText,
    });

    // Сохраняем конфигурацию полей для доступа к responseMapper
    this.currentFormFields.clear();
    this.repeaterFieldConfigs.clear();
    fields.forEach(field => {
      this.currentFormFields.set(field.field, field);
      // Сохраняем конфигурации полей внутри repeater для доступа к responseMapper
      if (field.type === 'repeater' && field.repeaterConfig?.fields) {
        const repeaterFieldsMap = new Map<string, TFieldConfig>();
        field.repeaterConfig.fields.forEach((repeaterField: TFieldConfig) => {
          repeaterFieldsMap.set(repeaterField.field, repeaterField);
        });
        this.repeaterFieldConfigs.set(field.field, repeaterFieldsMap);
      }
    });

    // Инициализируем spacing, repeater, api-select, image upload и custom field контролы после рендеринга модалки
    afterRender(async () => {
      this.initializeSpacingControls();
      this.initializeRepeaterControls();
      await this.initializeApiSelectControls();
      this.initializeImageUploadControls();
      await this.initializeCustomFieldControls();
    });
  }

  /**
   * Показать форму добавления блока (старый метод для обратной совместимости)
   */
  showAddBlockForm(type: string): void {
    this.showAddBlockFormAtPosition(type);
  }

  /**
   * Инициализация spacing контролов
   */
  private initializeSpacingControls(): void {
    // Очищаем старые рендереры
    this.cleanupSpacingControls();

    // Находим все контейнеры для spacing
    const containers = document.querySelectorAll(".spacing-control-container");

    containers.forEach((container) => {
      const config = container.getAttribute("data-spacing-config");
      if (!config) return;

      try {
        const spacingConfig = parseJSONFromAttribute(config);

        // Создаем рендерер с проверкой лицензии для ограничения кастомных брекпоинтов
        const renderer = new SpacingControlRenderer({
          fieldName: spacingConfig.field,
          label: spacingConfig.label,
          required: spacingConfig.required,
          config: spacingConfig,
          value: spacingConfig.value || {},
          licenseFeatureChecker: this.licenseService.getFeatureChecker(),
          onChange: (value) => {
            // Обновление значения при изменении
            // Сохраняем в data-атрибуте для последующего получения
            container.setAttribute("data-spacing-value", JSON.stringify(value));
          },
        });

        // Рендерим контрол
        renderer.render(container as HTMLElement);

        // Сохраняем рендерер
        this.spacingRenderers.set(spacingConfig.field, renderer);
      } catch (error) {
        // Ошибка инициализации spacing контрола игнорируется
      }
    });
  }

  /**
   * Очистка spacing контролов
   */
  private cleanupSpacingControls(): void {
    this.spacingRenderers.forEach((renderer) => {
      renderer.destroy();
    });
    this.spacingRenderers.clear();
  }

  /**
   * Инициализация repeater контролов
   */
  private initializeRepeaterControls(): void {
    // Очищаем старые рендереры
    this.cleanupRepeaterControls();

    // Находим все контейнеры для repeater
    const containers = document.querySelectorAll(".repeater-control-container");

    containers.forEach((container) => {
      const config = container.getAttribute("data-repeater-config");
      if (!config) return;

      try {
        const repeaterConfig = parseJSONFromAttribute(config);

        // Сохраняем ссылку на this для использования в callback
        const self = this;
        
        // Создаем рендерер
        const renderer = new RepeaterControlRenderer({
          fieldName: repeaterConfig.field,
          label: repeaterConfig.label,
          rules: repeaterConfig.rules || [],
          config: repeaterConfig,
          value: repeaterConfig.value || [],
          onChange: (value) => {
            // Обновление значения при изменении
            // Сохраняем в data-атрибуте для последующего получения
            container.setAttribute("data-repeater-value", JSON.stringify(value));
          },
          onAfterRender: () => {
            // Инициализируем image upload контролы после рендера repeater
            // (так как repeater может содержать поля изображений)
            self.initializeImageUploadControls();
          }
        });

        // Рендерим контрол
        renderer.render(container as HTMLElement);

        // Сохраняем рендерер
        this.repeaterRenderers.set(repeaterConfig.field, renderer);
      } catch (error) {
        // Ошибка инициализации repeater контрола игнорируется
      }
    });
  }

  /**
   * Очистка repeater контролов
   */
  private cleanupRepeaterControls(): void {
    this.repeaterRenderers.forEach((renderer) => {
      renderer.destroy();
    });
    this.repeaterRenderers.clear();
  }

  /**
   * Инициализация api-select контролов
   */
  private async initializeApiSelectControls(): Promise<void> {
    // Проверяем лицензию - в FREE версии api-select недоступен
    if (!this.licenseService.canUseApiSelect()) {
      // Показываем сообщение об ограничении для всех api-select полей
      const containers = document.querySelectorAll(".api-select-control-container");
      containers.forEach((container) => {
        const placeholder = container.querySelector(".api-select-placeholder") as HTMLElement;
        if (placeholder) {
          placeholder.innerHTML = `
            <div style="padding: 10px; border: 1px solid #ff9800; border-radius: 4px; background-color: #fff3cd; color: #856404;">
              ⚠️ ${this.licenseService.getFeatureChecker().getFeatureRestrictionMessage(LicenseFeature.API_SELECT)}
            </div>
          `;
        }
      });
      return;
    }

    // Очищаем старые рендереры
    this.cleanupApiSelectControls();

    // Находим все контейнеры для api-select
    const containers = document.querySelectorAll(".api-select-control-container");

    for (const container of Array.from(containers)) {
      const config = container.getAttribute("data-api-select-config");
      if (!config) {
        continue;
      }

      try {
        const apiSelectConfig = parseJSONFromAttribute(config);

        // Создаем рендерер с внедрением ApiSelectUseCase
        const renderer = new ApiSelectControlRenderer({
          fieldName: apiSelectConfig.field,
          label: apiSelectConfig.label,
          rules: apiSelectConfig.rules || [],
          config: apiSelectConfig,
          value: apiSelectConfig.value || (apiSelectConfig.multiple ? [] : null),
          apiSelectUseCase: this.apiSelectUseCase,
          onChange: (value) => {
            // Обновление значения при изменении
            // Сохраняем в data-атрибуте для последующего получения
            container.setAttribute("data-api-select-value", JSON.stringify(value));
          },
        });

        // Инициализируем и рендерим контрол (асинхронно)
        await renderer.init(container as HTMLElement);

        // Сохраняем рендерер
        this.apiSelectRenderers.set(apiSelectConfig.field, renderer);
      } catch (error) {
        // Ошибка инициализации api-select контрола игнорируется
        // Продолжаем работу, один неудачный контрол не должен ломать все приложение
      }
    }
  }

  /**
   * Очистка api-select контролов
   */
  private cleanupApiSelectControls(): void {
    // Вызываем destroy для каждого рендерера
    this.apiSelectRenderers.forEach((renderer) => {
      renderer.destroy();
    });
    this.apiSelectRenderers.clear();
  }

  /**
   * Инициализация кастомных полей
   */
  private async initializeCustomFieldControls(): Promise<void> {
    // Проверяем лицензию - в FREE версии кастомные поля недоступны
    if (!this.licenseService.canUseCustomFields()) {
      // Показываем сообщение об ограничении для всех custom полей
      const containers = document.querySelectorAll(".custom-field-control-container");
      containers.forEach((container) => {
        const placeholder = container.querySelector(".custom-field-placeholder") as HTMLElement;
        if (placeholder) {
          placeholder.innerHTML = `
            <div style="padding: 10px; border: 1px solid #ff9800; border-radius: 4px; background-color: #fff3cd; color: #856404;">
              ⚠️ ${this.licenseService.getFeatureChecker().getFeatureRestrictionMessage(LicenseFeature.CUSTOM_FIELDS)}
            </div>
          `;
        }
      });
      return;
    }

    // Проверяем наличие реестра
    if (!this.customFieldRendererRegistry) {
      return; // Кастомные поля не поддерживаются
    }

    // Очищаем старые рендереры
    this.cleanupCustomFieldControls();

    // Находим все контейнеры для кастомных полей
    const containers = document.querySelectorAll(".custom-field-control-container");

    for (const container of Array.from(containers)) {
      const config = container.getAttribute("data-custom-field-config");
      if (!config) {
        continue;
      }

      try {
        const customFieldConfig = parseJSONFromAttribute(config);

        // Проверяем наличие rendererId
        if (!customFieldConfig.rendererId) {
          continue;
        }

        // Получаем рендерер из реестра
        const renderer = this.customFieldRendererRegistry.get(customFieldConfig.rendererId);
        if (!renderer) {
          this.showCustomFieldError(
            container as HTMLElement,
            `Рендерер "${customFieldConfig.rendererId}" не зарегистрирован`,
          );
          continue;
        }

        // Находим или создаем контейнер для рендеринга
        let renderContainer = container.querySelector(".custom-field-placeholder") as HTMLElement;
        if (!renderContainer) {
          renderContainer = container as HTMLElement;
        }

        // Создаем контроллер кастомного поля
        const fieldRenderer = new CustomFieldControlRenderer(renderContainer, renderer, {
          fieldName: customFieldConfig.field,
          label: customFieldConfig.label,
          value: customFieldConfig.value,
          required: customFieldConfig.required || false,
          rendererId: customFieldConfig.rendererId,
          options: customFieldConfig.options,
          onChange: (value) => {
            // Обновление значения при изменении
            // Сохраняем в data-атрибуте для последующего получения
            container.setAttribute("data-custom-field-value", JSON.stringify(value));
          },
          onError: (error) => {
            // Ошибка кастомного поля
          },
        });

        // Сохраняем рендерер
        this.customFieldRenderers.set(customFieldConfig.field, fieldRenderer);
      } catch (error) {
        this.showCustomFieldError(container as HTMLElement, `Ошибка: ${error}`);
      }
    }
  }

  /**
   * Инициализация image upload контролов
   */
  private initializeImageUploadControls(): void {
    const containers = document.querySelectorAll(".image-upload-field");

    containers.forEach((container) => {
      const fieldName = container.getAttribute("data-field-name");
      if (!fieldName) return;
      
      // Проверяем, не инициализирован ли уже этот контрол
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

      // Получаем конфигурацию из data-атрибута
      const configStr = fileInput.getAttribute('data-config') || '{}';
      let config: any = {};
      try {
        config = JSON.parse(configStr.replace(/&quot;/g, '"'));
      } catch (e) {
        console.error('Ошибка парсинга конфига изображения:', e);
      }

      // Получаем полную конфигурацию поля для доступа к responseMapper
      // Проверяем, является ли это полем внутри repeater'а
      const repeaterField = container.getAttribute('data-repeater-field');
      const repeaterIndex = container.getAttribute('data-repeater-index');
      const repeaterItemField = container.getAttribute('data-repeater-item-field');
      
      let imageUploadConfig: any = undefined;
      let responseMapper: any = undefined;
      
      if (repeaterField && repeaterItemField !== null) {
        // Это поле внутри repeater'а - получаем оригинальную конфигурацию из сохраненных полей
        // (функции responseMapper не сохраняются в JSON, поэтому используем оригинальную конфигурацию)
        const repeaterFieldsMap = this.repeaterFieldConfigs.get(repeaterField);
        if (repeaterFieldsMap) {
          const itemFieldConfig = repeaterFieldsMap.get(repeaterItemField);
          if (itemFieldConfig) {
            imageUploadConfig = itemFieldConfig.imageUploadConfig;
            responseMapper = imageUploadConfig?.responseMapper;
          }
        }
      } else {
        // Обычное поле
        const fieldConfig = this.currentFormFields.get(fieldName);
        imageUploadConfig = fieldConfig?.imageUploadConfig;
        responseMapper = imageUploadConfig?.responseMapper;
      }

      const uploadHeaders = config.uploadHeaders || {};

      // Инициализация preview при загрузке (если есть значение)
      // Сначала пробуем получить значение из данных repeater, если это поле внутри repeater
      let currentValue: any = hiddenInput.value;
      
      if (repeaterField && repeaterIndex !== null && repeaterItemField !== null) {
        // Если это поле внутри repeater, получаем значение из данных repeater
        const repeaterRenderer = this.repeaterRenderers.get(repeaterField);
        if (repeaterRenderer) {
          const index = parseInt(repeaterIndex, 10);
          const rendererValue = (repeaterRenderer as any).value;
          if (rendererValue && rendererValue[index] !== undefined) {
            currentValue = rendererValue[index][repeaterItemField];
          }
        }
      } else {
        // Для обычных полей используем значение из hidden input
        if (currentValue) {
          try {
            // Пробуем распарсить JSON
            const parsed = JSON.parse(currentValue.replace(/&quot;/g, '"'));
            if (typeof parsed === 'object' && parsed !== null) {
              currentValue = parsed;
            }
          } catch {
            // Если не JSON, оставляем как строку (base64)
          }
        }
      }
      
      // Извлекаем URL для preview
      // Поддерживаем и src (правильное поле) и url (для обратной совместимости)
      if (currentValue) {
        try {
          let imageUrl = '';
          if (typeof currentValue === 'string') {
            imageUrl = currentValue;
          } else if (typeof currentValue === 'object' && currentValue !== null) {
            // Приоритет src, затем url для обратной совместимости
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
            // Обновляем label если есть изображение
            if (labelText) labelText.textContent = 'Изменить файл';
          }
        } catch (e) {
          console.error('Ошибка инициализации preview:', e);
        }
      }

      // Сохраняем ссылку на класс для использования в обработчиках
      const self = this;

      // Обработчик кнопки очистки
      const clearBtn = container.querySelector('.image-upload-field__preview-clear') as HTMLButtonElement;
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          fileInput.value = '';
          hiddenInput.value = '';
          if (preview) preview.style.display = 'none';
          if (labelText) labelText.textContent = 'Выберите изображение';
          
          // Если это поле внутри repeater'а - обновляем данные repeater'а
          if (repeaterField && repeaterIndex !== null && repeaterItemField !== null) {
            const repeaterRenderer = self.repeaterRenderers.get(repeaterField);
            if (repeaterRenderer) {
              const index = parseInt(repeaterIndex, 10);
              const rendererValue = (repeaterRenderer as any).value;
              if (rendererValue && rendererValue[index] !== undefined) {
                rendererValue[index][repeaterItemField] = '';
                (repeaterRenderer as any).emitChange();
                // UI уже обновлен через очистку preview выше
              }
            }
          }
        });
      }
      
      // Обработчик изменения файла
      fileInput.addEventListener('change', async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Проверка типа
        if (!file.type.startsWith('image/')) {
          if (errorDiv) {
            errorDiv.textContent = 'Пожалуйста, выберите файл изображения';
            errorDiv.style.display = 'block';
          }
          return;
        }

        // Проверка размера
        if (config.maxFileSize && file.size > config.maxFileSize) {
          if (errorDiv) {
            errorDiv.textContent = `Размер файла не должен превышать ${Math.round(config.maxFileSize / 1024 / 1024)}MB`;
            errorDiv.style.display = 'block';
          }
          return;
        }

        // Скрываем ошибку и показываем загрузку
        if (errorDiv) errorDiv.style.display = 'none';
        if (labelText) labelText.style.display = 'none';
        if (loadingText) loadingText.style.display = 'inline';
        if (label) {
          label.style.pointerEvents = 'none';
          label.style.opacity = '0.7';
          label.style.cursor = 'not-allowed';
        }
        fileInput.disabled = true;

        try {
          let result: any;

          if (config.uploadUrl) {
            // Загрузка на сервер
            const formData = new FormData();
            formData.append(config.fileParamName || 'file', file);

            const response = await fetch(config.uploadUrl, {
              method: 'POST',
              headers: uploadHeaders,
              body: formData
            });

            if (!response.ok) {
              throw new Error('Ошибка загрузки: ' + response.statusText);
            }

            const responseData = await response.json();
            
            // Применяем responseMapper, если он есть
            if (responseMapper && typeof responseMapper === 'function') {
              result = responseMapper(responseData);
            } else {
              // По умолчанию: возвращаем ответ как есть
              result = responseData;
            }
          } else {
            // Base64
            result = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }

          // Если это поле внутри repeater'а - сначала обновляем данные repeater'а
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
          
          // Затем обновляем hidden input для синхронизации с формой
          hiddenInput.value = typeof result === 'object' && result !== null ? JSON.stringify(result) : (result || '');

          // Обновляем preview - извлекаем URL как во Vue компоненте
          // base64 - всегда строка
          // серверное загрузка - объект с обязательным src
          // Поддерживаем и src (правильное поле) и url (для обратной совместимости)
          let imageUrl = '';
          if (typeof result === 'string') {
            imageUrl = result;
          } else if (typeof result === 'object' && result !== null) {
            // Приоритет src, затем url для обратной совместимости
            imageUrl = result.src || result.url || '';
          }
          
          if (imageUrl) {
            if (previewImg) {
              previewImg.src = imageUrl;
              previewImg.style.display = 'block';
            }
            if (preview) {
              preview.style.display = 'block';
              preview.style.position = 'relative';
              preview.style.marginBottom = '12px';
            }
            // Обновляем label
            if (labelText) labelText.textContent = 'Изменить файл';
          }

          // Удаляем класс ошибки и скрываем сообщение об ошибке валидации
          if (container) {
            container.classList.remove('error');
            // Скрываем все сообщения об ошибках валидации
            const validationErrorDivs = container.querySelectorAll('.image-upload-field__error');
            validationErrorDivs.forEach((div: Element) => {
              const errorEl = div as HTMLElement;
              // Скрываем все ошибки валидации после успешной загрузки
              errorEl.style.display = 'none';
              errorEl.textContent = '';
            });
          }

          // Если это поле внутри repeater'а - обновляем ошибки валидации в renderer'е
          // Это нужно, чтобы после загрузки изображения ошибка валидации исчезла
          if (repeaterField && repeaterIndex !== null && repeaterItemField !== null) {
            const repeaterRenderer = self.repeaterRenderers.get(repeaterField);
            if (repeaterRenderer && self.currentFormFields.size > 0) {
              // Получаем текущие данные формы
              const formData = self.getFormDataWithSpacing('block-builder-form');
              // Находим конфигурацию полей для текущего блока
              const fields = Array.from(self.currentFormFields.values());
              // Валидируем форму заново с обновленными данными (изображение теперь загружено)
              const validation = UniversalValidator.validateForm(formData, fields);
              
              // Сохраняем новые ошибки для использования при следующем сохранении
              // Это важно, чтобы ошибки не показывались повторно при следующей попытке сохранения
              
              // Обновляем ошибки в repeater renderer'е - это перерендерит контрол
              // и для загруженного изображения ошибка исчезнет
              if (repeaterRenderer.updateErrors) {
                repeaterRenderer.updateErrors(validation.errors);
              }
              
              // Также обновляем ошибки в остальных repeater renderer'ах, чтобы они были синхронизированы
              self.repeaterRenderers.forEach((renderer) => {
                if (renderer !== repeaterRenderer && renderer.updateErrors) {
                  renderer.updateErrors(validation.errors);
                }
              });
              
              // Очищаем старые ошибки валидации для этого поля, чтобы класс error убрался
              const fieldNamePath = `${repeaterField}[${repeaterIndex}].${repeaterItemField}`;
              if (!validation.errors[fieldNamePath] || validation.errors[fieldNamePath].length === 0) {
                // Если ошибки для этого поля нет - убираем класс error с контейнера
                setTimeout(() => {
                  const errorContainer = document.querySelector(`[data-field-name="${fieldNamePath}"]`) as HTMLElement;
                  if (errorContainer) {
                    errorContainer.classList.remove('error');
                    // Также убираем ошибки из DOM
                    const errorDivs = errorContainer.querySelectorAll('.image-upload-field__error');
                    errorDivs.forEach((div: Element) => {
                      const errorEl = div as HTMLElement;
                      if (errorEl.textContent) {
                        errorEl.style.display = 'none';
                        errorEl.textContent = '';
                      }
                    });
                  }
                }, 100);
              }
            }
          }

          // Триггерим событие изменения для формы
          const changeEvent = new Event('change', { bubbles: true });
          hiddenInput.dispatchEvent(changeEvent);

        } catch (error: any) {
          if (errorDiv) {
            errorDiv.textContent = error.message || 'Ошибка при загрузке файла';
            errorDiv.style.display = 'block';
          }
        } finally {
          // Скрываем загрузку
          if (labelText) labelText.style.display = 'inline';
          if (loadingText) loadingText.style.display = 'none';
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

  /**
   * Показ ошибки в контейнере кастомного поля
   */
  private showCustomFieldError(container: HTMLElement, message: string): void {
    const placeholder = container.querySelector(".custom-field-placeholder") as HTMLElement;
    if (placeholder) {
      // Безопасно создаем элементы через DOM API вместо innerHTML
      placeholder.innerHTML = '';
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 10px; border: 1px solid #ff4444; border-radius: 4px; background-color: #fff5f5; color: #ff4444;';
      errorDiv.textContent = `❌ ${message}`;
      placeholder.appendChild(errorDiv);
    }
  }

  /**
   * Очистка кастомных полей
   */
  private cleanupCustomFieldControls(): void {
    // Вызываем destroy для каждого рендерера
    this.customFieldRenderers.forEach((renderer) => {
      renderer.destroy();
    });
    this.customFieldRenderers.clear();
  }

  /**
   * Получение данных формы с учетом spacing, repeater, api-select и custom контролов
   */
  private getFormDataWithSpacing(formId: string): Record<string, any> {
    const props = this.modalManager.getFormData(formId);

    // Добавляем данные из spacing контролов
    this.spacingRenderers.forEach((renderer, fieldName) => {
      props[fieldName] = renderer.getValue();
    });

    // Добавляем данные из repeater контролов
    this.repeaterRenderers.forEach((renderer, fieldName) => {
      props[fieldName] = renderer.getValue();
    });

    // Добавляем данные из api-select контролов
    this.apiSelectRenderers.forEach((renderer, fieldName) => {
      props[fieldName] = renderer.getValue();
    });

    // Добавляем данные из кастомных полей
    this.customFieldRenderers.forEach((renderer, fieldName) => {
      props[fieldName] = renderer.getValue();
    });

    return props;
  }

  /**
   * Обработка создания блока
   */
  private async handleCreateBlock(type: string, fields: TFieldConfig[], position?: number): Promise<void> {
    const props = this.getFormDataWithSpacing("block-builder-form");

    // Валидация с помощью UniversalValidator
    const validation = UniversalValidator.validateForm(props, fields);
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    try {
      // Получаем конфигурацию блока
      const blockConfig = this.config.blockConfigs[type];

      // Создаем данные блока
      const createData: ICreateBlockDto = {
        type,
        settings: {},
        props,
        visible: true,
        locked: false,
      };

      // Добавляем render из конфигурации, если он есть
      if (blockConfig?.render) {
        createData.render = blockConfig.render;
      }

      // Создаем блок через use case
      const newBlock = await this.config.useCase.createBlock(createData);

      // Если указана позиция, перемещаем блок на нужное место
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

  /**
   * Вставка блока на определенную позицию
   */
  private async insertBlockAtPosition(blockId: string, position: number): Promise<void> {
    const allBlocks = await this.config.useCase.getAllBlocks();
    const blockIds = allBlocks.map((b) => b.id);

    // Удаляем новый блок из конца
    const newBlockIndex = blockIds.indexOf(blockId);
    if (newBlockIndex !== -1) {
      blockIds.splice(newBlockIndex, 1);
    }

    // Вставляем на нужную позицию
    blockIds.splice(position, 0, blockId);

    // Обновляем порядок
    await this.config.useCase.reorderBlocks(blockIds);
  }

  /**
   * Редактирование блока
   */
  async editBlock(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const config = this.config.blockConfigs[block.type];
    if (!config) {
      this.showError(UI_STRINGS.blockConfigNotFound);
      return;
    }

    // Автоматически добавляем spacing поле, если его нет
    // Передаем featureChecker для ограничения кастомных брекпоинтов в FREE версии
    let fields: TFieldConfig[] = addSpacingFieldToFields(
      config.fields || [],
      config.spacingOptions,
      this.licenseService.getFeatureChecker()
    );

    // НЕ фильтруем поля - они должны показываться с заглушкой в FREE версии
    // Заглушки отображаются через initializeApiSelectControls и initializeCustomFieldControls

    const formHTML = `
    <form id="block-builder-form" class="block-builder-form">
      ${this.formBuilder.generateEditFormHTML(fields, block.props)}
    </form>
    `;

    this.modalManager.showModal({
      title: `${config.title} ${UI_STRINGS.editBlockTitle}`,
      bodyHTML: formHTML,
      onSubmit: () => this.handleUpdateBlock(blockId, block.type, fields),
      onCancel: () => {
        this.currentFormFields.clear(); // Очищаем при закрытии
        this.repeaterFieldConfigs.clear();
        this.modalManager.closeModal();
      },
      submitButtonText: UI_STRINGS.saveButtonText,
    });

    // Сохраняем конфигурацию полей для доступа к responseMapper
    this.currentFormFields.clear();
    this.repeaterFieldConfigs.clear();
    fields.forEach(field => {
      this.currentFormFields.set(field.field, field);
      // Сохраняем конфигурации полей внутри repeater для доступа к responseMapper
      if (field.type === 'repeater' && field.repeaterConfig?.fields) {
        const repeaterFieldsMap = new Map<string, TFieldConfig>();
        field.repeaterConfig.fields.forEach((repeaterField: TFieldConfig) => {
          repeaterFieldsMap.set(repeaterField.field, repeaterField);
        });
        this.repeaterFieldConfigs.set(field.field, repeaterFieldsMap);
      }
    });

    // Инициализируем spacing, repeater, api-select, image upload и custom контролы после рендеринга модалки
    afterRender(async () => {
      this.initializeSpacingControls();
      this.initializeRepeaterControls();
      await this.initializeApiSelectControls();
      this.initializeImageUploadControls();
      await this.initializeCustomFieldControls();
    });
  }

  /**
   * Обработка обновления блока
   */
  private async handleUpdateBlock(blockId: string, type: string, fields: TFieldConfig[]): Promise<void> {
    const props = this.getFormDataWithSpacing("block-builder-form");

    // Валидация с помощью UniversalValidator
    const validation = UniversalValidator.validateForm(props, fields);
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    try {
      // Обновляем блок через use case
      await this.config.useCase.updateBlock(blockId, { props });

      this.modalManager.closeModal();
      await this.refreshBlocks();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.showError(UI_STRINGS.blockUpdateError);
    }
  }

  /**
   * Переключение блокировки блока
   */
  async toggleBlockLock(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    await this.config.useCase.setBlockLocked(blockId, !block.locked);
    await this.refreshBlocks();
  }

  /**
   * Переключение видимости блока
   */
  async toggleBlockVisibility(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    await this.config.useCase.setBlockVisible(blockId, !block.visible);
    await this.refreshBlocks();
  }

  /**
   * Удаление блока
   */
  async deleteBlockUI(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    const confirmed = await this.modalManager.confirm(UI_STRINGS.deleteBlockConfirmTitle, UI_STRINGS.deleteBlockConfirmMessage);
    if (!confirmed) return;

    // Очищаем watcher для spacing перед удалением
    this.uiRenderer.cleanupBlockWatcher(blockId);

    await this.config.useCase.deleteBlock(blockId);
    await this.refreshBlocks();
  }

  /**
   * Дублирование блока
   */
  async duplicateBlockUI(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    await this.config.useCase.duplicateBlock(blockId);
    await this.refreshBlocks();
  }

  /**
   * Очистка всех блоков
   */
  async clearAllBlocksUI(): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    const confirmed = await this.modalManager.confirm(UI_STRINGS.clearAllBlocksConfirmTitle, UI_STRINGS.clearAllBlocksConfirmMessage);
    if (!confirmed) return;

    const allBlocks = await this.config.useCase.getAllBlocks();
    for (const block of allBlocks) {
      await this.config.useCase.deleteBlock(block.id);
    }
    await this.refreshBlocks();
  }

  /**
   * Сохранение всех блоков
   */
  async saveAllBlocksUI(): Promise<void> {
    // Если колбэк сохранения не указан, показываем предупреждение
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

  /**
   * Перемещение блока вверх
   */
  async moveBlockUp(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    const currentIndex = this.blocks.findIndex((block) => block.id === blockId);
    if (currentIndex <= 0) return; // Уже наверху

    // Меняем местами с предыдущим блоком
    const newBlocks = [...this.blocks];
    [newBlocks[currentIndex], newBlocks[currentIndex - 1]] = [newBlocks[currentIndex - 1], newBlocks[currentIndex]];

    // Обновляем порядок
    const blockIds = newBlocks.map((block) => block.id);
    await this.config.useCase.reorderBlocks(blockIds);

    await this.refreshBlocks();
  }

  /**
   * Перемещение блока вниз
   */
  async moveBlockDown(blockId: string): Promise<void> {
    if (!this.isEdit) {
      return; // Блокируем если режим редактирования выключен
    }
    const currentIndex = this.blocks.findIndex((block) => block.id === blockId);
    if (currentIndex >= this.blocks.length - 1) return; // Уже внизу

    // Меняем местами со следующим блоком
    const newBlocks = [...this.blocks];
    [newBlocks[currentIndex], newBlocks[currentIndex + 1]] = [newBlocks[currentIndex + 1], newBlocks[currentIndex]];

    // Обновляем порядок
    const blockIds = newBlocks.map((block) => block.id);
    await this.config.useCase.reorderBlocks(blockIds);

    await this.refreshBlocks();
  }

  /**
   * Копирование ID блока в буфер обмена
   */
  async copyBlockId(blockId: string): Promise<void> {
    const success = await copyToClipboard(blockId);
    if (success) {
      this.showNotification(`${UI_STRINGS.blockIdCopied} ${blockId}`, "success");
    }
  }

  /**
   * Показать уведомление (универсальный метод)
   */
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

    // Удаляем уведомление через 12 секунд
    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease-in-out";
      setTimeout(() => notification.remove(), 300);
    }, 12000);
  }

  /**
   * Показать ошибки валидации в форме
   */
  private showValidationErrors(errors: Record<string, string[]>): void {
    // Сначала очищаем все старые ошибки
    this.clearValidationErrors();

    // Обновляем ошибки в repeater контролах
    this.repeaterRenderers.forEach((renderer) => {
      renderer.updateErrors(errors);
    });

    // Добавляем новые ошибки для обычных полей
    Object.entries(errors).forEach(([fieldName, fieldErrors]) => {
      // Пропускаем ошибки repeater полей (формат: "cards[0].title")
      if (fieldName.includes("[") && fieldName.includes("]")) {
        return; // Эти ошибки обрабатываются в repeater контроле
      }

      const input = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
      if (input) {
        // Добавляем класс ошибки к полю
        input.classList.add("error");

        // Добавляем класс ошибки к группе поля
        const formGroup = input.closest(".block-builder-form-group") as HTMLElement;
        if (formGroup) {
          formGroup.classList.add("error");
        }

        // Создаем контейнер для ошибок
        const errorContainer = document.createElement("div");
        errorContainer.className = "block-builder-form-errors";
        errorContainer.setAttribute("data-field", fieldName);

        fieldErrors.forEach((error) => {
          const errorSpan = document.createElement("span");
          errorSpan.className = "error";
          errorSpan.textContent = error;
          errorContainer.appendChild(errorSpan);
        });

        // Вставляем контейнер с ошибками после поля
        input.parentElement?.appendChild(errorContainer);
      }
    });

    // Скроллим к первой ошибке и открываем аккордеоны
    this.handleScrollToFirstError(errors);
  }

  /**
   * Очистить все ошибки валидации
   */
  private clearValidationErrors(): void {
    // Убираем класс error у всех полей
    document.querySelectorAll(".block-builder-form-control.error").forEach((input) => {
      input.classList.remove("error");
    });

    // Убираем класс error у всех групп полей
    document.querySelectorAll(".block-builder-form-group.error").forEach((group) => {
      group.classList.remove("error");
    });

    // Удаляем все контейнеры с ошибками
    document.querySelectorAll(".block-builder-form-errors").forEach((container) => {
      container.remove();
    });
  }

  /**
   * Обработка скролла к первой ошибке
   */
  private handleScrollToFirstError(errors: Record<string, string[]>): void {
    // Небольшая задержка, чтобы ошибки успели отрисоваться в DOM
    setTimeout(() => {
      const modalBody = document.querySelector(".block-builder-modal-body") as HTMLElement;

      if (!modalBody) {
        return;
      }

      // Находим первую ошибку
      const firstErrorKey = Object.keys(errors)[0];
      if (!firstErrorKey) return;

      const errorInfo = parseErrorKey(firstErrorKey);

      // Если ошибка в repeater - СНАЧАЛА открываем аккордеон, ПОТОМ скроллим
      if (errorInfo.isRepeaterField && errorInfo.repeaterFieldName) {
        this.openRepeaterAccordion(errorInfo.repeaterFieldName, errorInfo.repeaterIndex || 0);
        // Скролл произойдет автоматически внутри openRepeaterAccordion после раскрытия
      } else {
        // Для обычных полей скроллим сразу
        scrollToFirstError(modalBody, errors, {
          offset: 40,
          behavior: "smooth",
          autoFocus: true,
        });
      }
    }, 100); // Увеличена задержка для стабильной отрисовки ошибок
  }

  /**
   * Открытие аккордеона в repeater для конкретного элемента
   */
  private openRepeaterAccordion(repeaterFieldName: string, itemIndex: number): void {
    // Получаем renderer для этого repeater
    const renderer = this.repeaterRenderers.get(repeaterFieldName);

    if (!renderer) {
      return;
    }

    const modalBody = document.querySelector(".block-builder-modal-body") as HTMLElement;
    if (!modalBody) return;

    // Получаем все ошибки для точного поиска поля
    const allErrors = this.getRepeaterErrors();
    
    // Находим первую ошибку для этого repeater и элемента
    const firstErrorKey = Object.keys(allErrors).find(key => {
      const errorInfo = parseErrorKey(key);
      return errorInfo.isRepeaterField && 
             errorInfo.repeaterFieldName === repeaterFieldName && 
             errorInfo.repeaterIndex === itemIndex;
    });

    // Проверяем, свернут ли элемент
    if (renderer.isItemCollapsed(itemIndex)) {
      // Раскрываем элемент
      renderer.expandItem(itemIndex);

      // После раскрытия скроллим к конкретному полю
      // Увеличенная задержка для завершения анимации раскрытия
      setTimeout(() => {
        // Если нашли конкретную ошибку - используем точный поиск
        if (firstErrorKey) {
          const errorInfo = parseErrorKey(firstErrorKey);
          const fieldElement = findFieldElement(modalBody, errorInfo);
          if (fieldElement) {
            // Скроллим к конкретному элементу
            scrollToElement(fieldElement, {
              offset: 40,
              behavior: "smooth"
            });
            // Фокусируемся на элементе
            focusElement(fieldElement);
          } else {
            // Fallback к обычному скроллу
            scrollToFirstError(modalBody, allErrors, {
              offset: 40,
              behavior: "smooth",
              autoFocus: true,
            });
          }
        } else {
          // Fallback к обычному скроллу
          scrollToFirstError(modalBody, allErrors, {
            offset: 40,
            behavior: "smooth",
            autoFocus: true,
          });
        }
      }, 350); // Увеличена задержка для завершения анимации раскрытия
    } else {
      // Элемент уже развернут - скроллим к полю сразу
      if (firstErrorKey) {
        const errorInfo = parseErrorKey(firstErrorKey);
        const fieldElement = findFieldElement(modalBody, errorInfo);
        if (fieldElement) {
          // Скроллим к конкретному элементу
          scrollToElement(fieldElement, {
            offset: 40,
            behavior: "smooth"
          });
          // Фокусируемся на элементе
          focusElement(fieldElement);
        } else {
          // Fallback к обычному скроллу
          scrollToFirstError(modalBody, allErrors, {
            offset: 40,
            behavior: "smooth",
            autoFocus: true,
          });
        }
      } else {
        // Fallback к обычному скроллу
        scrollToFirstError(modalBody, allErrors, {
          offset: 40,
          behavior: "smooth",
          autoFocus: true,
        });
      }
    }
  }

  /**
   * Получить все ошибки из repeater для скролла
   */
  private getRepeaterErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    // Ищем все сообщения об ошибках в DOM (включая image поля)
    // Для обычных полей - .repeater-control__field-error
    // Для image полей - .image-upload-field__error внутри repeater
    document.querySelectorAll(".repeater-control__field-error, .image-upload-field__error").forEach((errorEl) => {
      let field: HTMLElement | null = null;
      let repeaterIndex: string | null = null;
      let fieldName: string | null = null;
      
      // Проверяем, является ли это ошибкой image поля
      const isImageField = errorEl.classList.contains("image-upload-field__error");
      
      if (isImageField) {
        // Для image полей ищем родительский контейнер image-upload-field
        const imageField = errorEl.closest(".image-upload-field") as HTMLElement;
        if (imageField) {
          field = imageField;
          repeaterIndex = imageField.getAttribute("data-repeater-index");
          fieldName = imageField.getAttribute("data-repeater-item-field");
        }
      } else {
        // Для обычных полей используем старую логику
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
        // Находим имя repeater по структуре DOM
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

  /**
   * Показать ошибку
   */
  private showError(message: string): void {
    this.showNotification(message, "error");
  }

  /**
   * Закрытие модального окна с очисткой ошибок
   */
  private closeModalWithCleanup(): void {
    this.clearValidationErrors();
    this.cleanupSpacingControls();
    this.cleanupRepeaterControls();
    this.cleanupApiSelectControls();
    this.cleanupCustomFieldControls();
    this.modalManager.closeModal();
  }

  /**
   * Закрытие модального окна (публичный метод)
   */
  closeModal(): void {
    this.closeModalWithCleanup();
  }

  /**
   * Submit модального окна (публичный метод)
   */
  submitModal(): void {
    this.modalManager.submitModal();
  }

  /**
   * Регистрация обработчиков событий
   */
  private registerEventHandlers(): void {
    this.eventDelegation.register('saveAllBlocksUI', () => this.saveAllBlocksUI());
    this.eventDelegation.register('clearAllBlocksUI', () => this.clearAllBlocksUI());
    this.eventDelegation.register('showBlockTypeSelectionModal', (position?: number) => this.showBlockTypeSelectionModal(position));
    this.eventDelegation.register('showAddBlockFormAtPosition', (type: string, position?: number) => this.showAddBlockFormAtPosition(type, position));
    this.eventDelegation.register('editBlock', (blockId: string) => this.editBlock(blockId));
    this.eventDelegation.register('copyBlockId', (blockId: string) => this.copyBlockId(blockId));
    this.eventDelegation.register('moveBlockUp', (blockId: string) => this.moveBlockUp(blockId));
    this.eventDelegation.register('moveBlockDown', (blockId: string) => this.moveBlockDown(blockId));
    this.eventDelegation.register('toggleBlockLock', (blockId: string) => this.toggleBlockLock(blockId));
    this.eventDelegation.register('toggleBlockVisibility', (blockId: string) => this.toggleBlockVisibility(blockId));
    this.eventDelegation.register('duplicateBlockUI', (blockId: string) => this.duplicateBlockUI(blockId));
    this.eventDelegation.register('deleteBlockUI', (blockId: string) => this.deleteBlockUI(blockId));
    this.eventDelegation.register('closeModal', () => this.closeModal());
    this.eventDelegation.register('submitModal', () => this.submitModal());
  }

  /**
   * Установка режима редактирования
   */
  setIsEdit(isEdit: boolean): void {
    this.isEdit = isEdit;
    // Обновляем режим редактирования в UIRenderer
    if (this.uiRenderer) {
      this.uiRenderer.updateEditMode(isEdit);
    }
    // Перерендериваем блоки для отображения/скрытия контролов
    this.refreshBlocks();
  }

  /**
   * Получение текущего режима редактирования
   */
  getIsEdit(): boolean {
    return this.isEdit;
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    this.cleanupSpacingControls();
    this.cleanupRepeaterControls();
    this.cleanupApiSelectControls();
    this.cleanupCustomFieldControls();
    this.modalManager.closeModal();
    this.eventDelegation.destroy();
    // Очистка UIRenderer (удаление класса с body)
    this.uiRenderer.destroy();
  }
}
