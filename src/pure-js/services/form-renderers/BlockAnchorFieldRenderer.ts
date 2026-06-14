import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { isBlockAnchorHash } from '../../../utils/blockAnchorHelpers';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class BlockAnchorFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'block-anchor';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: unknown,
    _required: string,
    context?: IRenderContext
  ): string {
    const fieldName = this.getFieldName(context, field);
    const stringValue = value === null || value === undefined ? '' : String(value);
    const allowCustomUrl = field.blockAnchorConfig?.allowCustomUrl === true;
    const customValue =
      allowCustomUrl && stringValue && !stringValue.startsWith('#') ? this.escapeHtml(stringValue) : '';

    const customInput = allowCustomUrl
      ? `<input
          type="text"
          class="${CSS_CLASSES.FORM_CONTROL} ${CSS_CLASSES.BLOCK_ANCHOR_CUSTOM}"
          data-block-anchor-custom="${this.escapeHtml(fieldName)}"
          placeholder="или введите URL"
          value="${customValue}"
        />`
      : '';

    return `
      <div
        class="${CSS_CLASSES.BLOCK_ANCHOR_PLACEHOLDER}"
        data-field-name="${this.escapeHtml(fieldName)}"
        data-field-id="${fieldId}"
      ></div>
      ${customInput}
      <input type="hidden" name="${this.escapeHtml(fieldName)}" value="${this.escapeHtml(stringValue)}" />
    `;
  }
}

export function resolveBlockAnchorHiddenValue(
  value: unknown,
  knownBlockIds: Set<string>
): string {
  const stringValue = value === null || value === undefined ? '' : String(value);
  if (!stringValue) {
    return '';
  }

  if (isBlockAnchorHash(stringValue, knownBlockIds)) {
    return stringValue;
  }

  return stringValue;
}
