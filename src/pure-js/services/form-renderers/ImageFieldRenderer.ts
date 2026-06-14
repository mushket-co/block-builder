import { IFormFieldConfig, TFieldType } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import {
  getDefaultAccept,
  getFileExtensionBadge,
  getFileNameFromUrl,
  normalizeUploadItems,
  shouldShowUploadImagePreview,
} from '../../../utils/uploadFieldUtils';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export type TUploadRendererVariant = 'image' | 'file';

export class ImageFieldRenderer extends BaseFieldRenderer {
  readonly fieldType: TFieldType = 'image';

  render(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    return this.renderUploadField(fieldId, field, value, required, context, 'image');
  }

  protected renderUploadField(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context: IRenderContext | undefined,
    variant: TUploadRendererVariant
  ): string {
    if (variant === 'file') {
      return this.renderFileUploadField(fieldId, field, value, required, context);
    }

    const escapedLabel = this.escapeHtml(field.label);
    const labelClass = context?.labelClass || CSS_CLASSES.FORM_LABEL;
    const fieldName = this.getFieldName(context, field);
    const isMultiple = Boolean(field.multiple);
    const config = field.fileUploadConfig || {};
    const accept = getDefaultAccept(variant, config);
    const items = normalizeUploadItems(value, isMultiple);
    const hasValue = items.length > 0;

    const uploadUrl = config.uploadUrl || '';
    const maxFileSize = config.maxFileSize || 10 * 1024 * 1024;
    const fileParamName = config.fileParamName || 'file';

    const configJson = JSON.stringify({
      uploadUrl,
      fileParamName,
      maxFileSize,
      uploadHeaders: config.uploadHeaders || {},
      accept,
      maxCount: config.maxCount,
      responseMapper: config.responseMapper ? 'CUSTOM' : null,
      onUploadError: config.onUploadError ? 'CUSTOM' : null,
    }).replaceAll('"', '&quot;');

    const fileInputDataAttrs: string[] = [`data-config='${configJson}'`];
    if (context?.inputDataAttributes) {
      Object.entries(context.inputDataAttributes).forEach(([key, val]) => {
        fileInputDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
      });
    }

    const clearButtonDataAttrs: string[] = [];
    if (context?.inputDataAttributes) {
      Object.entries(context.inputDataAttributes).forEach(([key, val]) => {
        if (key !== 'config') {
          clearButtonDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
        }
      });
    }

    const hiddenInputDataAttrs: string[] = ['data-image-value="true"'];
    if (context?.inputDataAttributes) {
      Object.entries(context.inputDataAttributes).forEach(([key, val]) => {
        if (key !== 'config') {
          hiddenInputDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
        }
      });
    }

    const errorClass =
      context?.showErrors && context.errors && context.errors.length > 0 ? CSS_CLASSES.ERROR : '';

    const chooseLabel = 'Выберите изображение';
    const changeLabel = 'Изменить изображение';

    const previewHtml = isMultiple
      ? this.renderGalleryPreview(items, variant, clearButtonDataAttrs)
      : this.renderSinglePreview(items[0] || '', variant, escapedLabel, clearButtonDataAttrs);

    const content = `
      <label for="${fieldId}" class="${labelClass}">
        ${escapedLabel} ${required ? `<span class="${CSS_CLASSES.REQUIRED}">*</span>` : ''}
      </label>
      ${previewHtml}
      <div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE}">
        <input
          type="file"
          id="${fieldId}"
          accept="${this.escapeHtml(accept)}"
          ${isMultiple ? 'multiple' : ''}
          class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_INPUT}"
          ${fileInputDataAttrs.join(' ')}
        />
        <label for="${fieldId}" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL}">
          <span class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL_TEXT}">${hasValue ? changeLabel : chooseLabel}</span>
          <span class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LOADING_TEXT} ${CSS_CLASSES.BB_HIDDEN}">⏳ Загрузка...</span>
        </label>
        <span class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR} ${CSS_CLASSES.BB_HIDDEN}"></span>
      </div>
      <input type="hidden" name="${fieldName}" value="${this.escapeHtml(isMultiple ? JSON.stringify(items) : items[0] || '')}" ${hiddenInputDataAttrs.join(' ')} />
      ${this.renderErrors(context)}
    `;

    const containerClass = context?.containerClass
      ? `${context.containerClass} ${CSS_CLASSES.IMAGE_UPLOAD_FIELD}${isMultiple ? ` ${CSS_CLASSES.IMAGE_UPLOAD_FIELD_MULTIPLE}` : ''}${errorClass ? ` ${errorClass}` : ''}`
      : `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.IMAGE_UPLOAD_FIELD}${isMultiple ? ` ${CSS_CLASSES.IMAGE_UPLOAD_FIELD_MULTIPLE}` : ''}${errorClass ? ` ${errorClass}` : ''}`;

    const containerDataAttrs: string[] = [
      `data-field-name="${fieldName}"`,
      `data-upload-variant="${variant}"`,
      `data-upload-multiple="${isMultiple ? 'true' : 'false'}"`,
    ];
    if (context?.containerDataAttributes) {
      Object.entries(context.containerDataAttributes).forEach(([key, val]) => {
        containerDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
      });
    }

    return `
      <div class="${containerClass}" ${containerDataAttrs.join(' ')}>
        ${content}
      </div>
    `;
  }

  protected renderFileUploadField(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const escapedLabel = this.escapeHtml(field.label);
    const fieldName = this.getFieldName(context, field);
    const isMultiple = Boolean(field.multiple);
    const config = field.fileUploadConfig || {};
    const accept = getDefaultAccept('file', config);
    const items = normalizeUploadItems(value, isMultiple);
    const hasValue = items.length > 0;

    const uploadUrl = config.uploadUrl || '';
    const maxFileSize = config.maxFileSize || 10 * 1024 * 1024;
    const fileParamName = config.fileParamName || 'file';

    const configJson = JSON.stringify({
      uploadUrl,
      fileParamName,
      maxFileSize,
      uploadHeaders: config.uploadHeaders || {},
      accept,
      maxCount: config.maxCount,
      responseMapper: config.responseMapper ? 'CUSTOM' : null,
      onUploadError: config.onUploadError ? 'CUSTOM' : null,
    }).replaceAll('"', '&quot;');

    const fileInputDataAttrs: string[] = [`data-config='${configJson}'`];
    const clearButtonDataAttrs: string[] = [];
    const hiddenInputDataAttrs: string[] = ['data-file-value="true"'];

    if (context?.inputDataAttributes) {
      Object.entries(context.inputDataAttributes).forEach(([key, val]) => {
        fileInputDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
        if (key !== 'config') {
          clearButtonDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
          hiddenInputDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
        }
      });
    }

    const errorClass =
      context?.showErrors && context.errors && context.errors.length > 0 ? CSS_CLASSES.ERROR : '';

    const chooseLabel = 'Выберите файл';
    const changeLabel = 'Заменить файл';
    const addLabel = 'Добавить файл';

    const listHtml = isMultiple
      ? this.renderFileListPreview(items, clearButtonDataAttrs)
      : this.renderSingleFilePreview(items[0] || '', clearButtonDataAttrs);

    const pickerLabel = isMultiple
      ? `+ ${addLabel}`
      : hasValue
        ? changeLabel
        : chooseLabel;

    const content = `
      <label for="${fieldId}" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_LABEL}">
        ${escapedLabel} ${required ? `<span class="${CSS_CLASSES.FILE_UPLOAD_FIELD_REQUIRED}">*</span>` : ''}
      </label>
      ${listHtml}
      <div class="${CSS_CLASSES.FILE_UPLOAD_FIELD_PICKER}">
        <input
          type="file"
          id="${fieldId}"
          accept="${this.escapeHtml(accept)}"
          ${isMultiple ? 'multiple' : ''}
          class="${CSS_CLASSES.FILE_UPLOAD_FIELD_INPUT}"
          ${fileInputDataAttrs.join(' ')}
        />
        <label for="${fieldId}" class="${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_OUTLINE}">
          <span class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL_TEXT}">${pickerLabel}</span>
          <span class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_LOADING_TEXT} ${CSS_CLASSES.BB_HIDDEN}">⏳ Загрузка...</span>
        </label>
        <span class="${CSS_CLASSES.FILE_UPLOAD_FIELD_ERROR} ${CSS_CLASSES.BB_HIDDEN}"></span>
      </div>
      <input type="hidden" name="${fieldName}" class="${CSS_CLASSES.FILE_UPLOAD_VALUE_INPUT}" value="${this.escapeHtml(isMultiple ? JSON.stringify(items) : items[0] || '')}" ${hiddenInputDataAttrs.join(' ')} />
      ${this.renderErrors(context)}
    `;

    const containerClass = context?.containerClass
      ? `${context.containerClass} ${CSS_CLASSES.FILE_UPLOAD_FIELD}${isMultiple ? ` ${CSS_CLASSES.FILE_UPLOAD_FIELD_MULTIPLE}` : ''}${errorClass ? ` ${errorClass}` : ''}`
      : `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.FILE_UPLOAD_FIELD}${isMultiple ? ` ${CSS_CLASSES.FILE_UPLOAD_FIELD_MULTIPLE}` : ''}${errorClass ? ` ${errorClass}` : ''}`;

    const containerDataAttrs: string[] = [
      `data-field-name="${fieldName}"`,
      'data-upload-variant="file"',
      `data-upload-multiple="${isMultiple ? 'true' : 'false'}"`,
    ];
    if (context?.containerDataAttributes) {
      Object.entries(context.containerDataAttributes).forEach(([key, val]) => {
        containerDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
      });
    }

    return `
      <div class="${containerClass}" ${containerDataAttrs.join(' ')}>
        ${content}
      </div>
    `;
  }

  private renderSingleFilePreview(url: string, clearButtonDataAttrs: string[]): string {
    if (!url) {
      return '';
    }

    return `
      <div class="${CSS_CLASSES.FILE_UPLOAD_FIELD_ROW}">
        <span class="${CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE}">${this.escapeHtml(getFileExtensionBadge(url))}</span>
        <a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_NAME}">${this.escapeHtml(getFileNameFromUrl(url))}</a>
        <button type="button" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE}" ${clearButtonDataAttrs.join(' ')} title="Удалить файл">Удалить</button>
      </div>
    `;
  }

  private renderFileListPreview(items: string[], clearButtonDataAttrs: string[]): string {
    if (!items.length) {
      return '';
    }

    const rows = items
      .map(
        url => `
        <li class="${CSS_CLASSES.FILE_UPLOAD_FIELD_ROW}">
          <span class="${CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE}">${this.escapeHtml(getFileExtensionBadge(url))}</span>
          <a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_NAME}">${this.escapeHtml(getFileNameFromUrl(url))}</a>
          <button type="button" class="${CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE}" ${clearButtonDataAttrs.join(' ')} title="Удалить">Удалить</button>
        </li>
      `
      )
      .join('');

    return `<ul class="${CSS_CLASSES.FILE_UPLOAD_FIELD_LIST}">${rows}</ul>`;
  }

  private renderSinglePreview(
    url: string,
    variant: TUploadRendererVariant,
    escapedLabel: string,
    clearButtonDataAttrs: string[]
  ): string {
    if (!url) {
      return `<div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW} ${CSS_CLASSES.BB_HIDDEN}"></div>`;
    }

    const showImage = shouldShowUploadImagePreview(variant, url);
    if (showImage) {
      return `
        <div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW}">
          <img src="${this.escapeHtml(url)}" alt="${escapedLabel}" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG}" />
          <button type="button" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}" ${clearButtonDataAttrs.join(' ')} title="Удалить">×</button>
        </div>
      `;
    }

    return `
      <div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW} ${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_INFO}">
        <a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_NAME}">${this.escapeHtml(getFileNameFromUrl(url))}</a>
        <button type="button" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}" ${clearButtonDataAttrs.join(' ')} title="Удалить">×</button>
      </div>
    `;
  }

  private renderGalleryPreview(
    items: string[],
    variant: TUploadRendererVariant,
    clearButtonDataAttrs: string[]
  ): string {
    if (!items.length) {
      return `<div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY}"></div>`;
    }

    const cards = items
      .map(url => {
        const showImage = shouldShowUploadImagePreview(variant, url);
        const preview = showImage
          ? `<img src="${this.escapeHtml(url)}" alt="" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG}" />`
          : `<div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_INFO}"><a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_NAME}">${this.escapeHtml(getFileNameFromUrl(url))}</a></div>`;

        return `
          <div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ITEM}">
            ${preview}
            <button type="button" class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}" ${clearButtonDataAttrs.join(' ')} title="Удалить">×</button>
          </div>
        `;
      })
      .join('');

    return `<div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY}">${cards}</div>`;
  }

  protected renderInput(
    _fieldId: string,
    _field: IFormFieldConfig,
    _value: any,
    _required: string,
    _context?: IRenderContext
  ): string {
    return '';
  }
}
