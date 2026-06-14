import { IFormFieldConfig, TFieldType } from '../../../core/types/form';
import { ImageFieldRenderer } from './ImageFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class FileFieldRenderer extends ImageFieldRenderer {
  readonly fieldType: TFieldType = 'file';

  render(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    return this.renderUploadField(fieldId, field, value, required, context, 'file');
  }
}
