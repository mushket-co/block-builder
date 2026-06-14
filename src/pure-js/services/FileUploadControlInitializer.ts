import { CSS_CLASSES } from '../../utils/constants';
import {
  getDefaultAccept,
  getFileExtensionBadge,
  getFileNameFromUrl,
  getMaxUploadCountErrorMessage,
  getUploadUrl,
  normalizeUploadItems,
  partitionFilesForUpload,
  processUploadFile,
  serializeUploadValue,
} from '../../utils/uploadFieldUtils';
import { IImageUploadControlConfig } from './ImageUploadControlInitializer';

export class FileUploadControlInitializer {
  constructor(private config: IImageUploadControlConfig) {}

  initialize(container: HTMLElement): void {
    const fieldName = container.dataset.fieldName;
    if (!fieldName) {
      return;
    }

    if (Object.hasOwn(container.dataset, 'fileInitialized')) {
      return;
    }
    container.dataset.fileInitialized = 'true';

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const hiddenInput = container.querySelector(
      `input[type="hidden"][data-file-value="true"]`
    ) as HTMLInputElement;
    const pickerBtn = container.querySelector(
      `.${CSS_CLASSES.FILE_UPLOAD_FIELD_PICKER} .${CSS_CLASSES.BTN}`
    ) as HTMLLabelElement;
    const pickerText = pickerBtn?.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL_TEXT}`
    ) as HTMLElement;
    const loadingText = pickerBtn?.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LOADING_TEXT}`
    ) as HTMLElement;
    const errorDiv = container.querySelector(
      `.${CSS_CLASSES.FILE_UPLOAD_FIELD_ERROR}`
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
      accept: fileUploadConfig?.accept || config.accept || getDefaultAccept('file', fileUploadConfig || config),
      maxCount: fileUploadConfig?.maxCount ?? config.maxCount,
      responseMapper: fileUploadConfig?.responseMapper,
      onUploadError: fileUploadConfig?.onUploadError,
    };

    this.setupRemoveHandler(
      container,
      fileInput,
      hiddenInput,
      pickerText,
      repeaterField,
      repeaterIndex,
      repeaterItemField,
      isMultiple
    );

    this.setupFileInput(
      fileInput,
      hiddenInput,
      container,
      pickerBtn,
      pickerText,
      loadingText,
      errorDiv,
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
      } else {
        const nestedRenderer = this.config.findNestedRepeaterRenderer(repeaterField);
        if (nestedRenderer) {
          const nestedConfig = (nestedRenderer as any).config;
          if (nestedConfig && nestedConfig.fields) {
            const fieldConfig = nestedConfig.fields.find((f: any) => f.field === repeaterItemField);
            if (fieldConfig) {
              return pickConfig(fieldConfig);
            }
          }
        }
      }
    } else {
      const fieldConfig = this.config.getCurrentFormFields().get(fieldName);
      return pickConfig(fieldConfig);
    }
    return undefined;
  }

  private setupRemoveHandler(
    container: HTMLElement,
    fileInput: HTMLInputElement,
    hiddenInput: HTMLInputElement,
    pickerText: HTMLElement | null,
    repeaterField?: string,
    repeaterIndex?: string,
    repeaterItemField?: string,
    isMultiple?: boolean
  ): void {
    if (Object.hasOwn(container.dataset, 'fileRemoveBound')) {
      return;
    }
    container.dataset.fileRemoveBound = 'true';

    container.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const button = target.closest(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE}`) as HTMLButtonElement | null;
      if (!button || !container.contains(button)) {
        return;
      }

      if (isMultiple) {
        const row = button.closest(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_ROW}`);
        row?.remove();
        const urls = this.collectFileUrls(container);
        hiddenInput.value = JSON.stringify(urls);
        this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, urls);
        return;
      }

      fileInput.value = '';
      hiddenInput.value = '';
      const row = container.querySelector(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_ROW}`);
      row?.remove();
      if (pickerText) {
        pickerText.textContent = 'Выберите файл';
      }
      this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, '');
    });
  }

  private setupFileInput(
    fileInput: HTMLInputElement,
    hiddenInput: HTMLInputElement,
    container: HTMLElement,
    pickerBtn: HTMLLabelElement | null,
    pickerText: HTMLElement | null,
    loadingText: HTMLElement | null,
    errorDiv: HTMLElement | null,
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
        ? this.collectFileUrls(container)
        : normalizeUploadItems(hiddenInput.value, false);

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

      this.showLoading(pickerBtn, pickerText, loadingText, fileInput);
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.classList.add(CSS_CLASSES.BB_HIDDEN);
        errorDiv.textContent = '';
      }

      try {
        const uploadedItems: string[] = [];

        for (const file of filesToUpload) {
          const result = await processUploadFile(file, uploadConfig, 'file');
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
          const serialized = serializeUploadValue(nextItems, true);
          hiddenInput.value = JSON.stringify(serialized);
          uploadedItems.forEach(url => this.appendFileRow(container, url));
          this.updateRepeaterValue(repeaterField, repeaterIndex, repeaterItemField, nextItems);
        } else {
          const url = uploadedItems[0];
          hiddenInput.value = url;
          this.renderSingleFileRow(container, url);
          if (pickerText) {
            pickerText.textContent = 'Заменить файл';
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
        this.showError(error, errorDiv, pickerText);
      } finally {
        this.hideLoading(pickerBtn, pickerText, loadingText, fileInput);
        fileInput.value = '';
      }
    });
  }

  private collectFileUrls(container: HTMLElement): string[] {
    const links = container.querySelectorAll(
      `.${CSS_CLASSES.FILE_UPLOAD_FIELD_NAME}`
    ) as NodeListOf<HTMLAnchorElement>;
    return Array.from(links).map(link => link.getAttribute('href') || '').filter(Boolean);
  }

  private renderSingleFileRow(container: HTMLElement, url: string): void {
    const existing = container.querySelector(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_ROW}`);
    existing?.remove();

    const label = container.querySelector(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_LABEL}`);
    const picker = container.querySelector(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_PICKER}`);
    if (!picker) {
      return;
    }

    const row = document.createElement('div');
    row.className = CSS_CLASSES.FILE_UPLOAD_FIELD_ROW;
    row.innerHTML = `
      <span class="${CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE}">${getFileExtensionBadge(url)}</span>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_NAME}">${getFileNameFromUrl(url)}</a>
      <button type="button" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE}" title="Удалить файл">Удалить</button>
    `;

    if (label) {
      label.insertAdjacentElement('afterend', row);
    } else {
      picker.insertAdjacentElement('beforebegin', row);
    }
  }

  private appendFileRow(container: HTMLElement, url: string): void {
    let list = container.querySelector(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_LIST}`) as HTMLUListElement;
    if (!list) {
      list = document.createElement('ul');
      list.className = CSS_CLASSES.FILE_UPLOAD_FIELD_LIST;
      const label = container.querySelector(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_LABEL}`);
      const picker = container.querySelector(`.${CSS_CLASSES.FILE_UPLOAD_FIELD_PICKER}`);
      if (label) {
        label.insertAdjacentElement('afterend', list);
      } else if (picker) {
        picker.insertAdjacentElement('beforebegin', list);
      }
    }

    const item = document.createElement('li');
    item.className = CSS_CLASSES.FILE_UPLOAD_FIELD_ROW;
    item.innerHTML = `
      <span class="${CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE}">${getFileExtensionBadge(url)}</span>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_NAME}">${getFileNameFromUrl(url)}</a>
      <button type="button" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE}" title="Удалить">Удалить</button>
    `;
    list.append(item);
  }

  private updateRepeaterValue(
    repeaterField: string | undefined,
    repeaterIndex: string | undefined,
    repeaterItemField: string | undefined,
    value: any
  ): void {
    if (!repeaterField || !repeaterIndex || !repeaterItemField) {
      return;
    }

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
      return;
    }

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

  private showLoading(
    pickerBtn: HTMLLabelElement | null,
    pickerText: HTMLElement | null,
    loadingText: HTMLElement | null,
    fileInput: HTMLInputElement
  ): void {
    if (pickerText) {
      pickerText.style.display = 'none';
      pickerText.classList.add(CSS_CLASSES.BB_HIDDEN);
    }
    if (loadingText) {
      loadingText.style.display = 'inline';
      loadingText.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
    if (pickerBtn) {
      pickerBtn.classList.add(CSS_CLASSES.BTN_LOADING);
      pickerBtn.style.pointerEvents = 'none';
      pickerBtn.style.cursor = 'not-allowed';
    }
    fileInput.disabled = true;
  }

  private hideLoading(
    pickerBtn: HTMLLabelElement | null,
    pickerText: HTMLElement | null,
    loadingText: HTMLElement | null,
    fileInput: HTMLInputElement
  ): void {
    if (loadingText) {
      loadingText.style.display = 'none';
      loadingText.classList.add(CSS_CLASSES.BB_HIDDEN);
    }
    if (pickerText) {
      pickerText.style.display = 'inline';
      pickerText.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
    if (pickerBtn) {
      pickerBtn.classList.remove(CSS_CLASSES.BTN_LOADING);
      pickerBtn.style.pointerEvents = 'auto';
      pickerBtn.style.cursor = 'pointer';
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

  private showError(error: any, errorDiv: HTMLElement | null, pickerText: HTMLElement | null): void {
    if (errorDiv) {
      errorDiv.textContent = error.message || 'Ошибка при загрузке файла';
      errorDiv.style.display = 'block';
      errorDiv.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
    if (pickerText) {
      pickerText.style.display = 'inline';
      pickerText.classList.remove(CSS_CLASSES.BB_HIDDEN);
    }
  }
}
