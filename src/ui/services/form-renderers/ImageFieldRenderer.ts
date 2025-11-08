import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class ImageFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'image';

  render(fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);

    const getImageUrl = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object' && val !== null) {
        return val.src || '';
      }
      return '';
    };
    
    const imageUrl = getImageUrl(value);
    const hasImage = !!imageUrl;

    const config = field.imageUploadConfig || {};
    const uploadUrl = config.uploadUrl || '';
    const maxFileSize = config.maxFileSize || (10 * 1024 * 1024);
    const fileParamName = config.fileParamName || 'file';

    const configJson = JSON.stringify({
      uploadUrl,
      fileParamName,
      maxFileSize,
      uploadHeaders: config.uploadHeaders || {},
      responseMapper: config.responseMapper ? 'CUSTOM' : null,
      onUploadError: config.onUploadError ? 'CUSTOM' : null
    }).replace(/"/g, '&quot;');
    
    const content = `
      <label for="${fieldId}" class="image-upload-field__label">
        ${escapedLabel} ${required ? '<span class="image-upload-field__required">*</span>' : ''}
      </label>
      <div class="image-upload-field__preview${hasImage ? '' : ' bb-hidden'}">
        <img src="${this.escapeHtml(imageUrl)}" alt="${escapedLabel}" class="image-upload-field__preview-img" />
        <button type="button" class="image-upload-field__preview-clear" title="Удалить изображение">×</button>
      </div>
      <div class="image-upload-field__file">
        <input
          type="file"
          id="${fieldId}"
          name="${field.field}"
          accept="image/*"
          class="image-upload-field__file-input"
          data-config='${configJson}'
          data-field-name="${field.field}"
        />
        <label for="${fieldId}" class="image-upload-field__file-label">
          <span class="image-upload-field__label-text">${hasImage ? 'Изменить файл' : 'Выберите изображение'}</span>
          <span class="image-upload-field__loading-text bb-hidden">⏳ Загрузка...</span>
        </label>
        <span class="image-upload-field__error bb-hidden"></span>
      </div>
      <div class="image-upload-field__error bb-hidden"></div>
      <input type="hidden" name="${field.field}" value="${this.escapeHtml(typeof value === 'object' ? JSON.stringify(value) : (value || ''))}" data-image-value="true" />
    `;

    return `
      <div class="${CSS_CLASSES.FORM_GROUP} image-upload-field" data-field-name="${field.field}">
        ${content}
      </div>
    `;
  }

  protected renderInput(fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    return '';
  }
}

