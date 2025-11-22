import { ICustomFieldConfig } from '../ports/CustomFieldRenderer';
import { IValidationRule } from './validation';

export type TFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'color'
  | 'file'
  | 'image'
  | 'spacing'
  | 'repeater'
  | 'api-select'
  | 'custom';
export type TSpacingType = 'padding-top' | 'padding-bottom' | 'margin-top' | 'margin-bottom';
export interface IBreakpoint {
  name: string;
  maxWidth?: number;
  label: string;
}
export interface ISpacingValue {
  [breakpoint: string]: number;
}
export interface ISpacingFieldConfig {
  spacingTypes?: TSpacingType[];
  min?: number;
  max?: number;
  step?: number;
  breakpoints?: IBreakpoint[];
}
export interface IBlockSpacingOptions {
  enabled?: boolean;
  spacingTypes?: TSpacingType[];
  config?: Omit<ISpacingFieldConfig, 'spacingTypes'>;
}
export interface IRepeaterItemFieldConfig {
  field: string;
  label: string;
  type: Exclude<TFieldType, 'spacing'>;
  placeholder?: string;
  defaultValue?: unknown;
  options?: { value: string | number; label: string; disabled?: boolean }[];
  rules?: IValidationRule[];
  multiple?: boolean;
  apiSelectConfig?: IApiSelectConfig;
  customFieldConfig?: ICustomFieldConfig;
  imageUploadConfig?: IImageUploadConfig;
  repeaterConfig?: IRepeaterFieldConfig;
}
export interface IRepeaterFieldConfig {
  fields: IRepeaterItemFieldConfig[];
  addButtonText?: string;
  removeButtonText?: string;
  itemTitle?: string;
  /**
   * Опциональные формы лейбла для счетчика (русская множественная форма)
   * Пример: { one: 'карточка', few: 'карточки', many: 'карточек', zero: 'карточек' }
   */
  countLabelVariants?: {
    one: string;
    few: string;
    many: string;
    zero?: string;
  };
  min?: number;
  max?: number;
  defaultItemValue?: Record<string, unknown>;
  /**
   * Максимальная глубина вложенности репитеров (по умолчанию 2)
   * Используется для предотвращения бесконечной рекурсии
   */
  maxNestingDepth?: number;
}
export type THttpMethod = 'GET' | 'POST';
export interface IApiSelectItem {
  id: string | number;
  name: string;
}
export interface IApiRequestParams {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
export interface IApiSelectResponse {
  data: IApiSelectItem[];
  total?: number;
  page?: number;
  hasMore?: boolean;
}
export interface IApiSelectConfig {
  url: string;
  method?: THttpMethod;
  headers?: Record<string, string>;
  searchParam?: string;
  pageParam?: string;
  limitParam?: string;
  limit?: number;
  debounceMs?: number;
  multiple?: boolean;
  responseMapper?: (response: unknown) => IApiSelectResponse;
  dataPath?: string;
  idField?: string;
  nameField?: string;
  minSearchLength?: number;
  placeholder?: string;
  noResultsText?: string;
  loadingText?: string;
  errorText?: string;
}
export interface IImageUploadConfig {
  uploadUrl?: string;

  fileParamName?: string;

  uploadHeaders?: Record<string, string>;

  maxFileSize?: number;

  accept?: string;

  responseMapper?: (response: unknown) => unknown;

  onUploadError?: (error: Error) => void;
}
export interface IFormFieldConfig {
  field: string;
  label: string;
  type: TFieldType;
  placeholder?: string;
  defaultValue?: unknown;
  options?: { value: string | number; label: string; disabled?: boolean }[];
  rules?: IValidationRule[];
  multiple?: boolean;
  spacingConfig?: ISpacingFieldConfig;
  repeaterConfig?: IRepeaterFieldConfig;
  apiSelectConfig?: IApiSelectConfig;
  customFieldConfig?: ICustomFieldConfig;
  imageUploadConfig?: IImageUploadConfig;
}
export interface IBlockConfigWithSpacing {
  title?: string;
  icon?: string;
  description?: string;
  fields?: IFormFieldConfig[];
  spacingOptions?: IBlockSpacingOptions;
  [key: string]: unknown;
}
export interface IFieldValidationConfig {
  field: string;
  label: string;
  type: TFieldType;
  placeholder?: string;
  options?: Array<{ value: unknown; label: string }>;
  rules: IValidationRule[];
  defaultValue?: unknown;
}
export interface IFormGenerationConfig {
  title: string;
  description?: string;
  fields: IFormFieldConfig[];
  submitButtonText?: string;
  cancelButtonText?: string;
}
