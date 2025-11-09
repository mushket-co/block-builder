import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class ImageFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'image';

  render(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const escapedLabel = this.escapeHtml(field.label);
    // Для image полей используем стандартный label класс из контекста, если передан
    // Иначе используем стандартный block-builder-form-label
    const labelClass = context?.labelClass || 'block-builder-form-label';
    const fieldName = this.getFieldName(context, field);

    const getImageUrl = (val: any): string => {
      if (!val) {
        return '';
      }
      if (typeof val === 'string') {
        return val;
      }
      if (typeof val === 'object' && val !== null) {
        return val.src || val.url || '';
      }
      return '';
    };

    const imageUrl = getImageUrl(value);
    const hasImage = !!imageUrl;

    const config = field.imageUploadConfig || {};
    const uploadUrl = config.uploadUrl || '';
    const maxFileSize = config.maxFileSize || 10 * 1024 * 1024;
    const fileParamName = config.fileParamName || 'file';

    const configJson = JSON.stringify({
      uploadUrl,
      fileParamName,
      maxFileSize,
      uploadHeaders: config.uploadHeaders || {},
      responseMapper: config.responseMapper ? 'CUSTOM' : null,
      onUploadError: config.onUploadError ? 'CUSTOM' : null,
    }).replaceAll('"', '&quot;');

    // Собираем data-атрибуты для file input
    const fileInputDataAttrs: string[] = [`data-config='${configJson}'`];
    if (context?.inputDataAttributes) {
      Object.entries(context.inputDataAttributes).forEach(([key, val]) => {
        fileInputDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
      });
    }

    // Собираем data-атрибуты для кнопки очистки
    const clearButtonDataAttrs: string[] = [];
    if (context?.inputDataAttributes) {
      // Берем все data-атрибуты для кнопки очистки (кроме config)
      Object.entries(context.inputDataAttributes).forEach(([key, val]) => {
        if (key !== 'config') {
          clearButtonDataAttrs.push(`data-${key}="${this.escapeHtml(val)}"`);
        }
      });
    }

    // Собираем data-атрибуты для hidden input
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

    const content = `
      <label for="${fieldId}" class="${labelClass}">
        ${escapedLabel} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <div class="image-upload-field__preview${hasImage ? '' : ' bb-hidden'}">
        <img src="${this.escapeHtml(imageUrl)}" alt="${escapedLabel}" class="image-upload-field__preview-img" />
        <button type="button" class="image-upload-field__preview-clear" ${clearButtonDataAttrs.join(' ')} title="Удалить изображение">×</button>
      </div>
      <div class="image-upload-field__file">
        <input
          type="file"
          id="${fieldId}"
          name="${fieldName}"
          accept="image/*"
          class="image-upload-field__file-input"
          ${fileInputDataAttrs.join(' ')}
        />
        <label for="${fieldId}" class="image-upload-field__file-label">
          <span class="image-upload-field__label-text">${hasImage ? 'Изменить файл' : 'Выберите изображение'}</span>
          <span class="image-upload-field__loading-text bb-hidden">⏳ Загрузка...</span>
        </label>
        <span class="image-upload-field__error bb-hidden"></span>
      </div>
      ${
        context?.showErrors && context.errors && context.errors.length > 0
          ? `<div class="${CSS_CLASSES.FORM_ERRORS}"><div class="${CSS_CLASSES.ERROR}">${this.escapeHtml(context.errors[0])}</div></div>`
          : ''
      }
      <input type="hidden" name="${fieldName}" value="${this.escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value || '')}" ${hiddenInputDataAttrs.join(' ')} />
    `;

    const containerClass = context?.containerClass
      ? `${context.containerClass} image-upload-field${errorClass ? ` ${errorClass}` : ''}`
      : `${CSS_CLASSES.FORM_GROUP} image-upload-field${errorClass ? ` ${errorClass}` : ''}`;

    // Собираем data-атрибуты для контейнера
    const containerDataAttrs: string[] = [`data-field-name="${fieldName}"`];
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
