import { CSS_CLASSES } from '../../utils/constants';
import {
  getDefaultAccept,
  getMaxUploadCountErrorMessage,
  getUploadUrl,
  normalizeUploadItems,
  partitionFilesForUpload,
  processUploadFile,
  serializeUploadValue,
} from '../../utils/uploadFieldUtils';
import { TFieldConfig } from './FormBuilder';

export interface IImageUploadControlConfig {
  getCurrentFormFields: () => Map<string, TFieldConfig>;
  getRepeaterFieldConfigs: () => Map<string, Map<string, TFieldConfig>>;
  getRepeaterRenderers: () => Map<string, any>;
  findNestedRepeaterRenderer: (fieldPath: string) => any;
}

export class ImageUploadControlInitializer {
  constructor(private config: IImageUploadControlConfig) {}

  initialize(container: HTMLElement): void {
    const fieldName = container.dataset.fieldName;
    if (!fieldName) {
      return;
    }

    if (Object.hasOwn(container.dataset, 'imageInitialized')) {
      return;
    }
    container.dataset.imageInitialized = 'true';

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const hiddenInput = container.querySelector(
      'input[type="hidden"][data-image-value="true"]'
    ) as HTMLInputElement;
    const fileLabel = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL}`
    ) as HTMLLabelElement;
    const labelText = fileLabel?.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL_TEXT}`
    ) as HTMLElement;
    const loadingText = fileLabel?.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LOADING_TEXT}`
    ) as HTMLElement;
    const errorDiv = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE} .${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}`
    ) as HTMLElement;

    if (!fileInput || !hiddenInput) {
      return;
    }

    const configStr = fileInput.dataset.config || '{}';
    let config: any = {};
    try {
      config = JSON.parse(configStr.replaceAll('&quot;', '"'));
    } catch {
      // ignore config parse errors
    }

    const repeaterField = container.dataset.repeaterField;
    const repeaterIndex = container.dataset.repeaterIndex;
    const repeaterItemField = container.dataset.repeaterItemField;
    const isMultiple = container.dataset.uploadMultiple === 'true';

    const fileUploadConfig = this.getFileUploadConfig(fieldName, repeaterField, repeaterItemField);

    const uploadConfig = {
      uploadUrl: fileUploadConfig?.uploadUrl || config.uploadUrl || '',
      fileParamName: fileUploadConfig?.fileParamName || config.fileParamName || 'file',
      maxFileSize: fileUploadConfig?.maxFileSize || config.maxFileSize || 10 * 1024 * 1024,
      uploadHeaders: fileUploadConfig?.uploadHeaders || config.uploadHeaders || {},
      accept: fileUploadConfig?.accept || config.accept || getDefaultAccept('image', fileUploadConfig || config),
      maxCount: fileUploadConfig?.maxCount ?? config.maxCount,
      responseMapper: fileUploadConfig?.responseMapper,
      onUploadError: fileUploadConfig?.onUploadError,
    };

    const currentValue = this.getCurrentValue(
      hiddenInput,
      repeaterField,
      repeaterIndex,
      repeaterItemField,
      isMultiple
    );
    const currentItems = normalizeUploadItems(currentValue, isMultiple);

    if (!isMultiple) {
      this.initializeSinglePreview(container, currentItems[0] || '', labelText);
    }

    this.setupClearHandler(
      container,
      fileInput,
      hiddenInput,
      labelText,
      repeaterField,
      repeaterIndex,
      repeaterItemField,
      isMultiple
    );

    this.setupFileInput(
      fileInput,
      hiddenInput,
      fileLabel,
      labelText,
      loadingText,
      errorDiv,
      container,
      uploadConfig,
      repeaterField,
      repeaterIndex,
      repeaterItemField,
      isMultiple
    );
  }

  private getFileUploadConfig(
    fieldName: string,
    repeaterField?: string,
    repeaterItemField?: string
  ): any {
    const pickConfig = (fieldConfig: any) => fieldConfig?.fileUploadConfig;

    if (repeaterField && repeaterItemField) {
      const repeaterFieldsMap = this.config.getRepeaterFieldConfigs().get(repeaterField);
      if (repeaterFieldsMap) {
        const itemFieldConfig = repeaterFieldsMap.get(repeaterItemField);
        if (itemFieldConfig) {
          return pickConfig(itemFieldConfig);
        }
      }

      const nestedRenderer = this.config.findNestedRepeaterRenderer(repeaterField);
      if (nestedRenderer) {
        const nestedConfig = (nestedRenderer as any).config;
        if (nestedConfig?.fields) {
          const fieldConfig = nestedConfig.fields.find((f: any) => f.field === repeaterItemField);
          if (fieldConfig) {
            return pickConfig(fieldConfig);
          }
        }
      }
    } else {
      const fieldConfig = this.config.getCurrentFormFields().get(fieldName);
      return pickConfig(fieldConfig);
    }

    return undefined;
  }

  private getCurrentValue(
    hiddenInput: HTMLInputElement,
    repeaterField?: string,
    repeaterIndex?: string,
    repeaterItemField?: string,
    isMultiple?: boolean
  ): unknown {
    let currentValue: unknown = hiddenInput.value;

    if (repeaterField && repeaterIndex && repeaterItemField) {
      const repeaterRenderer = this.config.getRepeaterRenderers().get(repeaterField);
      if (repeaterRenderer) {
        const index = Number.parseInt(repeaterIndex, 10);
        const rendererValue = (repeaterRenderer as any).value;
        if (rendererValue?.[index] !== undefined) {
          currentValue = rendererValue[index][repeaterItemField];
        }
      } else {
        const nestedRenderer = this.config.findNestedRepeaterRenderer(repeaterField);
        if (nestedRenderer) {
          const index = Number.parseInt(repeaterIndex, 10);
          const nestedValue = (nestedRenderer as any).value;
          if (nestedValue?.[index] !== undefined) {
            currentValue = nestedValue[index][repeaterItemField];
          }
        }
      }
      return currentValue;
    }

    if (!currentValue || typeof currentValue !== 'string') {
      return currentValue;
    }

    if (isMultiple) {
      try {
        return JSON.parse(currentValue.replaceAll('&quot;', '"'));
      } catch {
        return [];
      }
    }

    try {
      const parsed = JSON.parse(currentValue.replaceAll('&quot;', '"'));
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
      // keep string value
    }

    return currentValue;
  }

  private initializeSinglePreview(
    container: HTMLElement,
    imageUrl: string,
    labelText: HTMLElement | null
  ): void {
    if (!imageUrl) {
      return;
    }

    this.renderSinglePreview(container, imageUrl);
    if (labelText) {
      labelText.textContent = 'Изменить изображение';
    }
  }

  private setupClearHandler(
    container: HTMLElement,
    fileInput: HTMLInputElement,
    hiddenInput: HTMLInputElement,
    labelText: HTMLElement | null,
    repeaterField?: string,
    repeaterIndex?: string,
    repeaterItemField?: string,
    isMultiple?: boolean
  ): void {
    if (Object.hasOwn(container.dataset, 'imageClearBound')) {
      return;
    }
    container.dataset.imageClearBound = 'true';

    container.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const clearBtn = target.closest(
        `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}`
      ) as HTMLButtonElement | null;
      if (!clearBtn || !container.contains(clearBtn)) {
        return;
      }

      if (isMultiple) {
        const item = clearBtn.closest(`.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ITEM}`);
        item?.remove();
        const items = this.collectGalleryUrls(container);
        this.setHiddenValue(hiddenInput, items, true);
        this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, items);
        return;
      }

      fileInput.value = '';
      hiddenInput.value = '';
      const preview = container.querySelector(`.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW}`);
      preview?.classList.add(CSS_CLASSES.BB_HIDDEN);
      preview?.remove();
      if (labelText) {
        labelText.textContent = 'Выберите изображение';
      }
      this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, '');
    });
  }

  private setupFileInput(
    fileInput: HTMLInputElement,
    hiddenInput: HTMLInputElement,
    fileLabel: HTMLLabelElement | null,
    labelText: HTMLElement | null,
    loadingText: HTMLElement | null,
    errorDiv: HTMLElement | null,
    container: HTMLElement,
    uploadConfig: any,
    repeaterField?: string,
    repeaterIndex?: string,
    repeaterItemField?: string,
    isMultiple?: boolean
  ): void {
    fileInput.addEventListener('change', async event => {
      const selectedFiles = Array.from((event.target as HTMLInputElement).files || []);
      if (!selectedFiles.length) {
        return;
      }

      const currentItems = isMultiple
        ? this.collectGalleryUrls(container)
        : normalizeUploadItems(this.getCurrentValue(hiddenInput, repeaterField, repeaterIndex, repeaterItemField, isMultiple), false);

      const { filesToUpload, maxCountExceeded, maxCount } = partitionFilesForUpload(
        selectedFiles,
        currentItems.length,
        uploadConfig,
        Boolean(isMultiple)
      );

      if (!filesToUpload.length) {
        if (maxCountExceeded) {
          this.showValidationError(errorDiv, fileInput, getMaxUploadCountErrorMessage(maxCount));
        }
        fileInput.value = '';
        return;
      }

      this.showLoading(fileLabel, labelText, loadingText, fileInput);
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.classList.add(CSS_CLASSES.BB_HIDDEN);
        errorDiv.textContent = '';
      }

      try {
        const uploadedItems: string[] = [];

        for (const file of filesToUpload) {
          const result = await processUploadFile(file, uploadConfig, 'image');
          const url = getUploadUrl(result);
          if (url) {
            uploadedItems.push(url);
          }
        }

        if (!uploadedItems.length) {
          return;
        }

        if (isMultiple) {
          const nextItems = [...currentItems, ...uploadedItems];
          this.setHiddenValue(hiddenInput, nextItems, true);
          uploadedItems.forEach(url => this.appendGalleryItem(container, url));
          this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, nextItems);
        } else {
          const url = uploadedItems[0];
          this.setHiddenValue(hiddenInput, [url], false);
          this.renderSinglePreview(container, url);
          if (labelText) {
            labelText.textContent = 'Изменить изображение';
          }
          this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, url);
        }

        container.classList.remove(CSS_CLASSES.ERROR);

        if (maxCountExceeded) {
          this.showValidationError(errorDiv, fileInput, getMaxUploadCountErrorMessage(maxCount));
        }

        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (error: any) {
        if (uploadConfig.onUploadError && error instanceof Error) {
          uploadConfig.onUploadError(error);
        }
        this.showError(error, errorDiv, labelText);
      } finally {
        this.hideLoading(fileLabel, labelText, loadingText, fileInput);
        fileInput.value = '';
      }
    });
  }

  private collectGalleryUrls(container: HTMLElement): string[] {
    const images = container.querySelectorAll(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ITEM} img`
    ) as NodeListOf<HTMLImageElement>;
    return Array.from(images).map(img => img.getAttribute('src') || '').filter(Boolean);
  }

  private setHiddenValue(hiddenInput: HTMLInputElement, items: string[], isMultiple: boolean): void {
    const value = serializeUploadValue(items, isMultiple);
    hiddenInput.value =
      typeof value === 'string' ? value : JSON.stringify(value);
  }

  private renderSinglePreview(container: HTMLElement, imageUrl: string): void {
    let preview = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW}`
    ) as HTMLElement | null;

    if (!preview) {
      preview = document.createElement('div');
      preview.className = CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW;
      const fileSection = container.querySelector(`.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE}`);
      if (fileSection) {
        container.insertBefore(preview, fileSection);
      } else {
        container.append(preview);
      }
    }

    preview.classList.remove(CSS_CLASSES.BB_HIDDEN);
    preview.style.display = 'block';
    preview.innerHTML = `
      <img src="${imageUrl}" alt="" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG}" />
      <button type="button" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}" title="Удалить изображение">×</button>
    `;
  }

  private appendGalleryItem(container: HTMLElement, imageUrl: string): void {
    let gallery = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY}`
    ) as HTMLElement | null;

    if (!gallery) {
      gallery = document.createElement('div');
      gallery.className = CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY;
      const fileSection = container.querySelector(`.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE}`);
      if (fileSection) {
        container.insertBefore(gallery, fileSection);
      } else {
        container.append(gallery);
      }
    }

    const item = document.createElement('div');
    item.className = CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ITEM;
    item.innerHTML = `
      <img src="${imageUrl}" alt="" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG}" />
      <button type="button" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}" title="Удалить">×</button>
    `;
    gallery.append(item);
  }

  private updateRepeaterValue(
    repeaterField: string | undefined,
    repeaterIndex: string | undefined,
    repeaterItemField: string | undefined,
    value: unknown
  ): void {
    if (!repeaterField || !repeaterIndex || !repeaterItemField) {
      return;
    }

    const repeaterRenderer = this.config.getRepeaterRenderers().get(repeaterField);
    if (repeaterRenderer) {
      const index = Number.parseInt(repeaterIndex, 10);
      const rendererValue = (repeaterRenderer as any).value;
      if (rendererValue?.[index] !== undefined) {
        rendererValue[index][repeaterItemField] = value;
        if (typeof (repeaterRenderer as any).emitChange === 'function') {
          (repeaterRenderer as any).emitChange();
        }
      }
      return;
    }

    const nestedRenderer = this.config.findNestedRepeaterRenderer(repeaterField);
    if (nestedRenderer) {
      const index = Number.parseInt(repeaterIndex, 10);
      const nestedValue = (nestedRenderer as any).value;
      if (nestedValue?.[index] !== undefined) {
        nestedValue[index][repeaterItemField] = value;
        if (typeof (nestedRenderer as any).emitChange === 'function') {
          (nestedRenderer as any).emitChange();
        }
      }
    }
  }

  private showLoading(
    fileLabel: HTMLLabelElement | null,
    labelText: HTMLElement | null,
    loadingText: HTMLElement | null,
    fileInput: HTMLInputElement
  ): void {
    if (labelText) {
      labelText.style.display = 'none';
      labelText.classList.add(CSS_CLASSES.BB_HIDDEN);
    }
    if (loadingText) {
      loadingText.style.display = 'inline';
      loadingText.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
    if (fileLabel) {
      fileLabel.classList.add(CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL_LOADING);
      fileLabel.style.pointerEvents = 'none';
      fileLabel.style.cursor = 'not-allowed';
    }
    fileInput.disabled = true;
  }

  private hideLoading(
    fileLabel: HTMLLabelElement | null,
    labelText: HTMLElement | null,
    loadingText: HTMLElement | null,
    fileInput: HTMLInputElement
  ): void {
    if (loadingText) {
      loadingText.style.display = 'none';
      loadingText.classList.add(CSS_CLASSES.BB_HIDDEN);
    }
    if (labelText) {
      labelText.style.display = 'inline';
      labelText.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
    if (fileLabel) {
      fileLabel.classList.remove(CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL_LOADING);
      fileLabel.style.pointerEvents = 'auto';
      fileLabel.style.cursor = 'pointer';
    }
    fileInput.disabled = false;
  }

  private showValidationError(
    errorDiv: HTMLElement | null,
    fileInput: HTMLInputElement,
    message: string
  ): void {
    fileInput.value = '';

    if (!errorDiv) {
      return;
    }

    errorDiv.textContent = message;
    errorDiv.classList.remove(CSS_CLASSES.BB_HIDDEN);
    errorDiv.style.display = 'block';
  }

  private showError(error: any, errorDiv: HTMLElement | null, labelText: HTMLElement | null): void {
    if (errorDiv) {
      errorDiv.textContent = error?.message || 'Ошибка при загрузке файла';
      errorDiv.style.display = 'block';
      errorDiv.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
    if (labelText) {
      labelText.style.display = 'inline';
      labelText.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
  }
}
