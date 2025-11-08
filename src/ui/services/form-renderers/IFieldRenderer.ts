import { IFormFieldConfig } from '../../../core/types/form';

export interface IFieldRenderer {
  readonly fieldType: string;

  /**
   * @param fieldId - Уникальный ID поля
   * @param field - Конфигурация поля
   * @param value - Текущее значение поля
   * @param required - Атрибут required (строка 'required' или пустая строка)
   * @returns HTML строка поля
   */
  render(fieldId: string, field: IFormFieldConfig, value: any, required: string): string;
}

