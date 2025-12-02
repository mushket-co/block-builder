import { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import { LicenseService } from '../../core/services/LicenseService';
import { IBlockDto, ICreateBlockDto } from '../../core/types';
import { TRenderRef } from '../../core/types/common';
import { IBlockSpacingOptions, IFormFieldConfig } from '../../core/types/form';
import { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import {
  CSS_CLASSES,
  ERROR_RENDER_DELAY_MS,
  REPEATER_ACCORDION_ANIMATION_DELAY_MS,
  UI_STRINGS,
} from '../../utils/constants';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { afterRender } from '../../utils/domReady';
import { getFirstErrorKey, parseErrorKey, scrollToFirstError } from '../../utils/formErrorHelpers';
import { EventDelegation } from '../EventDelegation';
import { ControlInitializerFactory } from '../services/ControlInitializerFactory';
import { ControlManager } from '../services/ControlManager';
import { FormBuilder, TFieldConfig } from '../services/FormBuilder';
import { ImageUploadControlInitializer } from '../services/ImageUploadControlInitializer';
import { ModalManager } from '../services/ModalManager';
import { notificationService } from '../services/NotificationService';
import { RepeaterControlRenderer } from '../services/RepeaterControlRenderer';
import { UIRenderer } from '../services/UIRenderer';
import { FormController } from './FormController';

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
  private repeaterRenderers: Map<string, RepeaterControlRenderer> = new Map();
  private eventDelegation: EventDelegation;
  private licenseService: LicenseService;
  private originalBlockConfigs?: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  private currentFormFields: Map<string, TFieldConfig> = new Map();
  private repeaterFieldConfigs: Map<string, Map<string, TFieldConfig>> = new Map();
  private isEdit: boolean;
  private controlManager: ControlManager;
  private formController: FormController;

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
    this.controlManager = new ControlManager();
    this.formController = new FormController({
      formBuilder: this.formBuilder,
      modalManager: this.modalManager,
      controlManager: this.controlManager,
      onValidationError: (errors: Record<string, string[]>) => {
        this.handleScrollToFirstError(errors);
      },
    });

    ControlInitializerFactory.setupControlManager(this.controlManager, {
      licenseService: this.licenseService,
      apiSelectUseCase: this.apiSelectUseCase,
      customFieldRendererRegistry: this.customFieldRendererRegistry,
      getCurrentFormFields: () => this.currentFormFields,
      getRepeaterFieldConfigs: () => this.repeaterFieldConfigs,
      getRepeaterRenderers: () => this.repeaterRenderers,
      findNestedRepeaterRenderer: (fieldPath: string) => this.findNestedRepeaterRenderer(fieldPath),
      onAfterRepeaterRender: () => {
        // Убрано - используем только событие repeater-rendered
      },
    });

    this.registerEventHandlers();

    let repeaterRenderTimeout: ReturnType<typeof setTimeout> | null = null;
    document.addEventListener('repeater-rendered', (event: Event) => {
      const customEvent = event as CustomEvent<{ container: HTMLElement }>;
      const container = customEvent.detail?.container;

      if (repeaterRenderTimeout) {
        clearTimeout(repeaterRenderTimeout);
      }

      repeaterRenderTimeout = setTimeout(() => {
        if (container) {
          const isRepeaterContainer = container.classList.contains(
            CSS_CLASSES.REPEATER_CONTROL_CONTAINER
          );
          if (isRepeaterContainer) {
            const itemsContainer = container.querySelector(
              `.${CSS_CLASSES.REPEATER_CONTROL_ITEMS}`
            ) as HTMLElement;
            if (itemsContainer) {
              void this.controlManager.initializeControlsInContainer(itemsContainer);
            }
          } else {
            void this.controlManager.initializeControlsInContainer(container);
          }
        }
        repeaterRenderTimeout = null;
      }, 50);
    });
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
      <div class="${CSS_CLASSES.LICENSE_WARNING}">
        <div class="${CSS_CLASSES.LICENSE_WARNING_HEADER}">
          <span class="${CSS_CLASSES.LICENSE_WARNING_ICON}">⚠️</span>
          <strong class="${CSS_CLASSES.LICENSE_WARNING_TITLE}">Бесплатная версия <a href="https://block-builder.ru/" target="_blank" rel="noopener noreferrer" class="${CSS_CLASSES.BB_LINK_INHERIT}">Block Builder</a></strong>
        </div>
        <p class="${CSS_CLASSES.LICENSE_WARNING_TEXT}">
          Вы используете ограниченную бесплатную версию.<br>
          Доступно <strong>${currentBlockTypesCount} из ${licenseInfo.maxBlockTypes}</strong> типов блоков.
        </p>
      </div>
    `
      : '';

    const blockTypesHTML = Object.entries(this.config.blockConfigs)
      .map(([type, config]) => {
        const title = (config.title as string) || type;
        const icon = config.icon as string | undefined;
        const args =
          position !== undefined
            ? JSON.stringify([type, position])
            : JSON.stringify([type, undefined]);

        // icon теперь всегда опциональная ссылка для img
        const iconHTML = icon
          ? `<img src="${this.escapeHtml(icon)}" alt="${this.escapeHtml(title)}" class="${CSS_CLASSES.BLOCK_TYPE_CARD_ICON_IMG}" />`
          : '';

        return `
        <button
          data-action="showAddBlockFormAtPosition"
          data-args='${args}'
          class="${CSS_CLASSES.BLOCK_TYPE_CARD}"
        >
          <span class="${CSS_CLASSES.BLOCK_TYPE_CARD_ICON}">${iconHTML}</span>
          <span class="${CSS_CLASSES.BLOCK_TYPE_CARD_TITLE}">${title}</span>
        </button>
      `;
      })
      .join('');

    const bodyHTML = `
    <div class="${CSS_CLASSES.BLOCK_TYPE_SELECTION}">
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
      preventBodyScroll: true,
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

    this.prepareFormFields(fields);

    this.formController.showCreateForm(
      `${config.title} ${UI_STRINGS.addBlockTitle}`,
      fields,
      async (formData: Record<string, any>) => {
        return await this.handleCreateBlock(type, fields, position, formData);
      }
    );

    afterRender(() => {
      const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
      if (modalBody) {
        this.controlManager.clearFlagsInContainer(modalBody);
      }
      this.initializeImageUploadControls();
    });
  }

  private prepareFormFields(fields: TFieldConfig[]): void {
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
  }

  showAddBlockForm(type: string): void {
    this.showAddBlockFormAtPosition(type);
  }

  /**
   * @deprecated Используйте initializeAllControls() через ControlManager
   */

  private findNestedRepeaterRenderer(fieldPath: string): RepeaterControlRenderer | null {
    for (const [key, renderer] of this.repeaterRenderers.entries()) {
      if (fieldPath.startsWith(key + '[')) {
        const pathParts = fieldPath.split('.');
        if (pathParts.length > 1) {
          let currentRenderer: any = renderer;
          for (let i = 1; i < pathParts.length; i++) {
            const part = pathParts[i];
            const match = part.match(/^([A-Z_a-z]+)\[(\d+)]$/);

            if (match && currentRenderer) {
              const nestedFieldName = match[1];
              const nestedIndex = Number.parseInt(match[2], 10);
              const nestedValue = currentRenderer.value;
              if (nestedValue && nestedValue[nestedIndex]) {
                const nestedRenderers = currentRenderer.nestedRenderers;
                if (nestedRenderers) {
                  const nestedKey = `${nestedIndex}-${nestedFieldName}`;
                  currentRenderer = nestedRenderers.get(nestedKey);
                  if (!currentRenderer) {
                    break;
                  }
                } else {
                  break;
                }
              } else {
                break;
              }
            } else if (!match && currentRenderer && i === pathParts.length - 1) {
              const nestedFieldName = part;
              const nestedRenderers = currentRenderer.nestedRenderers;
              if (nestedRenderers) {
                const previousPart = pathParts[i - 1];
                const previousMatch = previousPart.match(/^([A-Z_a-z]+)\[(\d+)]$/);
                if (previousMatch) {
                  const previousIndex = Number.parseInt(previousMatch[2], 10);
                  const nestedKey = `${previousIndex}-${nestedFieldName}`;
                  currentRenderer = nestedRenderers.get(nestedKey);
                  if (!currentRenderer) {
                    break;
                  }
                } else {
                  break;
                }
              } else {
                break;
              }
            } else {
              break;
            }
          }
          if (currentRenderer && currentRenderer !== renderer) {
            return currentRenderer;
          }
        }
      }
    }
    return null;
  }

  private initializeImageUploadControls(): void {
    const containers = document.querySelectorAll(`.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}`);
    const initializer = new ImageUploadControlInitializer({
      getCurrentFormFields: () => this.currentFormFields,
      getRepeaterFieldConfigs: () => this.repeaterFieldConfigs,
      getRepeaterRenderers: () => this.repeaterRenderers,
      findNestedRepeaterRenderer: (fieldPath: string) => this.findNestedRepeaterRenderer(fieldPath),
    });

    containers.forEach(container => {
      initializer.initialize(container as HTMLElement);
    });
  }

  private showCustomFieldError(container: HTMLElement, message: string): void {
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

  private async handleCreateBlock(
    type: string,
    fields: TFieldConfig[],
    position: number | undefined,
    formData: Record<string, any>
  ): Promise<boolean> {
    try {
      const blockConfig = this.config.blockConfigs[type];

      const createData: ICreateBlockDto = {
        type,
        settings: {},
        props: formData,
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

      await this.refreshBlocks();
      return true;
    } catch {
      this.showError(UI_STRINGS.blockCreationError);
      return false;
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

    this.prepareFormFields(fields);

    this.formController.showEditForm(
      `${config.title} ${UI_STRINGS.editBlockTitle}`,
      fields,
      block.props,
      async (formData: Record<string, any>) => {
        return await this.handleUpdateBlock(blockId, block.type, fields, formData);
      }
    );

    afterRender(() => {
      const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
      if (modalBody) {
        this.controlManager.clearFlagsInContainer(modalBody);
      }
      this.initializeImageUploadControls();
    });
  }

  private async initializeAllControls(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
    await this.controlManager.initializeControlsInContainer(document.body);
    this.initializeImageUploadControls();
  }

  private async handleUpdateBlock(
    blockId: string,
    type: string,
    fields: TFieldConfig[],
    formData: Record<string, any>
  ): Promise<boolean> {
    try {
      await this.config.useCase.updateBlock(blockId, { props: formData });

      await this.refreshBlocks();
      return true;
    } catch {
      this.showError(UI_STRINGS.blockUpdateError);
      return false;
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
    notificationService.show(message, type);
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
        const formGroup = input.closest(`.${CSS_CLASSES.FORM_GROUP}`) as HTMLElement;

        if (formGroup) {
          formGroup.classList.add(CSS_CLASSES.ERROR);

          const imageUploadField = formGroup.querySelector(
            `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}`
          ) as HTMLElement;
          if (imageUploadField) {
            const errorSpan = imageUploadField.querySelector(
              `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}`
            ) as HTMLElement;
            if (errorSpan && fieldErrors.length > 0) {
              errorSpan.textContent = fieldErrors[0];
              errorSpan.classList.remove(CSS_CLASSES.BB_HIDDEN);
            }
          } else {
            input.classList.add(CSS_CLASSES.ERROR);

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
        }
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
    const firstErrorKey = getFirstErrorKey(errors);
    if (!firstErrorKey) {
      return;
    }

    const errorInfo = parseErrorKey(firstErrorKey);

    if (errorInfo.isRepeaterField && errorInfo.repeaterFieldName) {
      this.openRepeaterAccordion(errorInfo.repeaterFieldName, errorInfo.repeaterIndex || 0, errors);
    } else {
      setTimeout(() => {
        const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
        const modalContent = document.querySelector(`.${CSS_CLASSES.MODAL_CONTENT}`) as HTMLElement;
        if (!modalBody) {
          return;
        }
        scrollToFirstError(modalBody, errors, {
          offset: 40,
          behavior: 'smooth',
          autoFocus: true,
          scrollContainer: modalContent || undefined,
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

    const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    if (!modalBody) {
      return;
    }

    const allErrors = errors || this.getRepeaterErrors();

    const filteredErrors: Record<string, string[]> = {};
    for (const key of Object.keys(allErrors)) {
      const errorInfo = parseErrorKey(key);
      if (
        errorInfo.isRepeaterField &&
        errorInfo.repeaterFieldName === repeaterFieldName &&
        errorInfo.repeaterIndex === itemIndex
      ) {
        filteredErrors[key] = allErrors[key];
      }
    }

    const firstErrorKey = getFirstErrorKey(filteredErrors);

    const hasNestedPath =
      firstErrorKey && firstErrorKey.includes('[') && firstErrorKey.split('[').length > 2;

    const repeaterContainer = modalBody.querySelector(
      `.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}[data-field-name="${repeaterFieldName}"]`
    ) as HTMLElement;

    if (!repeaterContainer) {
      return;
    }

    if (renderer.isItemCollapsed(itemIndex)) {
      renderer.expandItem(itemIndex);

      setTimeout(() => {
        this.showValidationErrors(allErrors, true);

        if (hasNestedPath && firstErrorKey) {
          this.openNestedRepeaterAccordions(firstErrorKey, allErrors);
        } else {
          setTimeout(() => {
            const repeaterItems = repeaterContainer.querySelectorAll(
              `.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
            );
            const targetItem = repeaterItems[itemIndex] as HTMLElement;
            if (targetItem) {
              const itemFieldsContainer = targetItem.querySelector(
                `.${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}`
              ) as HTMLElement;

              if (!itemFieldsContainer) {
                return;
              }

              const modalContent = document.querySelector(
                `.${CSS_CLASSES.MODAL_CONTENT}`
              ) as HTMLElement;
              scrollToFirstError(itemFieldsContainer, filteredErrors, {
                offset: 40,
                behavior: 'smooth',
                autoFocus: true,
                scrollContainer: modalContent || undefined,
              });
            }
          }, ERROR_RENDER_DELAY_MS + 100);
        }
      }, REPEATER_ACCORDION_ANIMATION_DELAY_MS + 100);
    } else {
      if (hasNestedPath && firstErrorKey) {
        this.openNestedRepeaterAccordions(firstErrorKey, allErrors);
      } else {
        setTimeout(() => {
          const repeaterItems = repeaterContainer.querySelectorAll(
            `.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
          );
          const targetItem = repeaterItems[itemIndex] as HTMLElement;
          if (targetItem) {
            const itemFieldsContainer = targetItem.querySelector(
              `.${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}`
            ) as HTMLElement;

            if (!itemFieldsContainer) {
              return;
            }

            const modalContent = document.querySelector(
              `.${CSS_CLASSES.MODAL_CONTENT}`
            ) as HTMLElement;
            scrollToFirstError(itemFieldsContainer, filteredErrors, {
              offset: 40,
              behavior: 'smooth',
              autoFocus: true,
              scrollContainer: modalContent || undefined,
            });
          }
        }, ERROR_RENDER_DELAY_MS);
      }
    }
  }

  private openNestedRepeaterAccordions(errorKey: string, errors: Record<string, string[]>): void {
    const errorInfo = parseErrorKey(errorKey);
    if (!errorInfo.isRepeaterField || !errorInfo.nestedPath) {
      return;
    }

    const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    if (!modalBody) {
      return;
    }

    const pathParts = errorInfo.nestedPath.split('.');
    let currentContainer: HTMLElement | null = modalBody;

    const openAccordions = async (): Promise<void> => {
      for (const part of pathParts) {
        const repeaterMatch = part.match(/^([A-Z_a-z]+)\[(\d+)]$/);

        if (repeaterMatch) {
          const fieldName = repeaterMatch[1];
          const index = Number.parseInt(repeaterMatch[2], 10);

          if (!currentContainer) {
            return;
          }

          const repeaterContainer = currentContainer.querySelector(
            `.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}[data-field-name*="${fieldName}"]`
          ) as HTMLElement;

          if (!repeaterContainer) {
            return;
          }

          const repeaterItems = repeaterContainer.querySelectorAll(
            `.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
          );

          if (index >= repeaterItems.length) {
            return;
          }

          const targetItem = repeaterItems[index] as HTMLElement;
          const isCollapsed = targetItem.classList.contains(
            CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED
          );

          if (isCollapsed) {
            const collapseButton = targetItem.querySelector(
              `.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`
            ) as HTMLElement;
            if (collapseButton) {
              collapseButton.click();
              await new Promise(resolve =>
                setTimeout(resolve, REPEATER_ACCORDION_ANIMATION_DELAY_MS)
              );
            }
          }

          currentContainer = targetItem;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 400));

      this.showValidationErrors(errors, true);

      await new Promise(resolve => setTimeout(resolve, ERROR_RENDER_DELAY_MS));

      const modalContent = document.querySelector(`.${CSS_CLASSES.MODAL_CONTENT}`) as HTMLElement;
      scrollToFirstError(modalBody, errors, {
        offset: 40,
        behavior: 'smooth',
        autoFocus: true,
        scrollContainer: modalContent || undefined,
      });
    };

    void openAccordions();
  }

  private getRepeaterErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    document
      .querySelectorAll(
        `.${CSS_CLASSES.FORM_ERRORS} .${CSS_CLASSES.ERROR}, .${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}`
      )
      .forEach(errorEl => {
        let field: HTMLElement | null = null;
        let repeaterIndex: string | null = null;
        let fieldName: string | null = null;

        const isImageField = errorEl.classList.contains(CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR);

        if (isImageField) {
          const imageField = errorEl.closest(`.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}`) as HTMLElement;
          if (imageField) {
            field = imageField;
            repeaterIndex = imageField.dataset.repeaterIndex || null;
            fieldName = imageField.dataset.repeaterItemField || null;
          }
        } else {
          field = errorEl.closest(`.${CSS_CLASSES.FORM_GROUP}`) as HTMLElement;
          if (field) {
            const input = field.querySelector('input, textarea, select') as HTMLElement;
            if (input) {
              repeaterIndex = input.dataset.itemIndex || null;
              fieldName = input.dataset.fieldName || null;
            }
          }
        }

        if (repeaterIndex !== null && fieldName) {
          const repeaterControl = field?.closest(
            `.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}`
          ) as HTMLElement;
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
    const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    if (modalBody) {
      this.controlManager.destroyControlsInContainer(modalBody);
    } else {
      this.controlManager.destroyAll();
    }
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

  private escapeHtml(text: string | number | null | undefined): string {
    if (text === null || text === undefined) {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  destroy(): void {
    this.controlManager.destroyAll();
    this.modalManager.closeModal();
    this.eventDelegation.destroy();
    this.uiRenderer.destroy();
  }
}
