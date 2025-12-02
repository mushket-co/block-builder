import { CSS_CLASSES } from '../../utils/constants';
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
    const preview = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW}`
    ) as HTMLElement;
    const previewImg = preview?.querySelector('img') as HTMLImageElement;
    const label = container.querySelector('label[for]') as HTMLLabelElement;
    const labelText = label?.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL_TEXT}`
    ) as HTMLElement;
    const loadingText = label?.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LOADING_TEXT}`
    ) as HTMLElement;
    const errorDiv = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}`
    ) as HTMLElement;

    if (!fileInput || !hiddenInput) {
      return;
    }

    const configStr = fileInput.dataset.config || '{}';
    let config: any = {};
    try {
      config = JSON.parse(configStr.replaceAll('&quot;', '"'));
    } catch {
      // Игнорируем ошибки парсинга конфига изображения
    }

    const repeaterField = container.dataset.repeaterField;
    const repeaterIndex = container.dataset.repeaterIndex;
    const repeaterItemField = container.dataset.repeaterItemField;

    const imageUploadConfig = this.getImageUploadConfig(
      fieldName,
      repeaterField,
      repeaterItemField
    );

    const finalConfig = {
      uploadUrl: imageUploadConfig?.uploadUrl || config.uploadUrl || '',
      fileParamName: imageUploadConfig?.fileParamName || config.fileParamName || 'file',
      maxFileSize: imageUploadConfig?.maxFileSize || config.maxFileSize || 10 * 1024 * 1024,
      uploadHeaders: imageUploadConfig?.uploadHeaders || config.uploadHeaders || {},
      responseMapper: imageUploadConfig?.responseMapper,
    };

    const currentValue: any = this.getCurrentValue(
      hiddenInput,
      repeaterField,
      repeaterIndex,
      repeaterItemField
    );

    this.initializePreview(currentValue, preview, previewImg, labelText);

    this.setupClearButton(
      container,
      fileInput,
      hiddenInput,
      preview,
      labelText,
      repeaterField,
      repeaterIndex,
      repeaterItemField
    );

    this.setupFileInput(
      fileInput,
      hiddenInput,
      preview,
      previewImg,
      label,
      labelText,
      loadingText,
      errorDiv,
      container,
      finalConfig,
      repeaterField,
      repeaterIndex,
      repeaterItemField
    );
  }

  private getImageUploadConfig(
    fieldName: string,
    repeaterField?: string,
    repeaterItemField?: string
  ): any {
    if (repeaterField && repeaterItemField) {
      const repeaterFieldsMap = this.config.getRepeaterFieldConfigs().get(repeaterField);
      if (repeaterFieldsMap) {
        const itemFieldConfig = repeaterFieldsMap.get(repeaterItemField);
        if (itemFieldConfig) {
          return itemFieldConfig.imageUploadConfig;
        }
      } else {
        const nestedRenderer = this.config.findNestedRepeaterRenderer(repeaterField);
        if (nestedRenderer) {
          const nestedConfig = (nestedRenderer as any).config;
          if (nestedConfig && nestedConfig.fields) {
            const fieldConfig = nestedConfig.fields.find((f: any) => f.field === repeaterItemField);
            if (fieldConfig) {
              return fieldConfig.imageUploadConfig;
            }
          }
        }
      }
    } else {
      const fieldConfig = this.config.getCurrentFormFields().get(fieldName);
      return fieldConfig?.imageUploadConfig;
    }
    return undefined;
  }

  private getCurrentValue(
    hiddenInput: HTMLInputElement,
    repeaterField?: string,
    repeaterIndex?: string,
    repeaterItemField?: string
  ): any {
    let currentValue: any = hiddenInput.value;

    if (repeaterField && repeaterIndex && repeaterItemField) {
      const repeaterRenderer = this.config.getRepeaterRenderers().get(repeaterField);
      if (repeaterRenderer) {
        const index = Number.parseInt(repeaterIndex, 10);
        const rendererValue = (repeaterRenderer as any).value;
        if (rendererValue && rendererValue[index] !== undefined) {
          currentValue = rendererValue[index][repeaterItemField];
        }
      } else {
        const nestedRenderer = this.config.findNestedRepeaterRenderer(repeaterField);
        if (nestedRenderer) {
          const index = Number.parseInt(repeaterIndex, 10);
          const nestedValue = (nestedRenderer as any).value;
          if (nestedValue && nestedValue[index] !== undefined) {
            currentValue = nestedValue[index][repeaterItemField];
          }
        }
      }
    } else {
      if (currentValue) {
        try {
          const parsed = JSON.parse(currentValue.replaceAll('&quot;', '"'));
          if (typeof parsed === 'object' && parsed !== null) {
            currentValue = parsed;
          }
        } catch {}
      }
    }

    return currentValue;
  }

  private initializePreview(
    currentValue: any,
    preview: HTMLElement | null,
    previewImg: HTMLImageElement | null,
    labelText: HTMLElement | null
  ): void {
    if (!currentValue) {
      return;
    }

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
    } catch {
      // Игнорируем ошибки инициализации preview
    }
  }

  private setupClearButton(
    container: HTMLElement,
    fileInput: HTMLInputElement,
    hiddenInput: HTMLInputElement,
    preview: HTMLElement | null,
    labelText: HTMLElement | null,
    repeaterField?: string,
    repeaterIndex?: string,
    repeaterItemField?: string
  ): void {
    const clearBtn = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}`
    ) as HTMLButtonElement;
    if (!clearBtn) {
      return;
    }

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
        this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, '');
      }
    });
  }

  private setupFileInput(
    fileInput: HTMLInputElement,
    hiddenInput: HTMLInputElement,
    preview: HTMLElement | null,
    previewImg: HTMLImageElement | null,
    label: HTMLLabelElement | null,
    labelText: HTMLElement | null,
    loadingText: HTMLElement | null,
    errorDiv: HTMLElement | null,
    container: HTMLElement,
    finalConfig: any,
    repeaterField?: string,
    repeaterIndex?: string,
    repeaterItemField?: string
  ): void {
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

      this.showLoading(label, labelText, loadingText, fileInput);
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.classList.add(CSS_CLASSES.BB_HIDDEN);
        errorDiv.textContent = '';
      }

      try {
        const result = await this.uploadFile(file, finalConfig);

        if (repeaterField && repeaterIndex && repeaterItemField) {
          this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, result);
        }

        hiddenInput.value =
          typeof result === 'object' && result !== null ? JSON.stringify(result) : result || '';

        this.showPreview(result, preview, previewImg, labelText);
        this.hideErrors(container);

        const changeEvent = new Event('change', { bubbles: true });
        hiddenInput.dispatchEvent(changeEvent);
      } catch (error: any) {
        this.showError(error, errorDiv, labelText);
      } finally {
        this.hideLoading(label, labelText, loadingText, fileInput);
      }
    });
  }

  private async uploadFile(file: File, config: any): Promise<any> {
    if (config.uploadUrl) {
      const formData = new FormData();
      formData.append(config.fileParamName, file);

      const response = await fetch(config.uploadUrl, {
        method: 'POST',
        headers: config.uploadHeaders,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки: ' + response.statusText);
      }

      const responseData = await response.json();

      if (config.responseMapper && typeof config.responseMapper === 'function') {
        return config.responseMapper(responseData);
      }

      return responseData;
    } else {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', e => resolve(e.target?.result as string));
        reader.addEventListener('error', reject);
        reader.readAsDataURL(file);
      });
    }
  }

  private updateRepeaterValue(
    repeaterField: string,
    repeaterIndex: string,
    repeaterItemField: string,
    value: any
  ): void {
    const repeaterRenderer = this.config.getRepeaterRenderers().get(repeaterField);
    if (repeaterRenderer) {
      const index = Number.parseInt(repeaterIndex, 10);
      const rendererValue = (repeaterRenderer as any).value;
      if (rendererValue && rendererValue[index] !== undefined) {
        rendererValue[index][repeaterItemField] = value;
        if (typeof (repeaterRenderer as any).emitChange === 'function') {
          (repeaterRenderer as any).emitChange();
        }
      }
    } else {
      const nestedRenderer = this.config.findNestedRepeaterRenderer(repeaterField);
      if (nestedRenderer) {
        const index = Number.parseInt(repeaterIndex, 10);
        const nestedValue = (nestedRenderer as any).value;
        if (nestedValue && nestedValue[index] !== undefined) {
          nestedValue[index][repeaterItemField] = value;
          if (typeof (nestedRenderer as any).emitChange === 'function') {
            (nestedRenderer as any).emitChange();
          }
        }
      }
    }
  }

  private showLoading(
    label: HTMLLabelElement | null,
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
    if (label) {
      label.style.pointerEvents = 'none';
      label.style.opacity = '0.7';
      label.style.cursor = 'not-allowed';
    }
    fileInput.disabled = true;
  }

  private hideLoading(
    label: HTMLLabelElement | null,
    labelText: HTMLElement | null,
    loadingText: HTMLElement | null,
    fileInput: HTMLInputElement
  ): void {
    if (loadingText) {
      loadingText.style.display = 'none';
      loadingText.classList.add(CSS_CLASSES.BB_HIDDEN);
    }
    if (label) {
      label.style.pointerEvents = 'auto';
      label.style.opacity = '1';
      label.style.cursor = 'pointer';
    }
    fileInput.disabled = false;
  }

  private showPreview(
    result: any,
    preview: HTMLElement | null,
    previewImg: HTMLImageElement | null,
    labelText: HTMLElement | null
  ): void {
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
        preview.classList.remove(CSS_CLASSES.BB_HIDDEN);
        preview.style.display = 'block';
        preview.style.position = 'relative';
        preview.style.marginBottom = '12px';
      }
      if (labelText) {
        labelText.textContent = 'Изменить файл';
        labelText.style.display = 'inline';
        labelText.classList.remove(CSS_CLASSES.BB_HIDDEN);
      }
    } else if (previewImg && preview) {
      preview.classList.add(CSS_CLASSES.BB_HIDDEN);
      preview.style.display = 'none';
      if (labelText) {
        labelText.textContent = 'Выберите изображение';
        labelText.style.display = 'inline';
        labelText.classList.remove(CSS_CLASSES.BB_HIDDEN);
      }
    }
  }

  private showError(error: any, errorDiv: HTMLElement | null, labelText: HTMLElement | null): void {
    if (errorDiv) {
      errorDiv.textContent = error.message || 'Ошибка при загрузке файла';
      errorDiv.style.display = 'block';
      errorDiv.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
    if (labelText) {
      labelText.style.display = 'inline';
      labelText.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
  }

  private hideErrors(container: HTMLElement): void {
    container.classList.remove(CSS_CLASSES.ERROR);
    const fileErrorDiv = container.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE} .${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}`
    ) as HTMLElement;
    if (fileErrorDiv) {
      fileErrorDiv.style.display = 'none';
      fileErrorDiv.textContent = '';
    }
  }
}
