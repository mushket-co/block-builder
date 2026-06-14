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
  | 'custom'
  | 'block-anchor';
export type TSpacingType = 'padding-top' | 'padding-bottom' | 'margin-top' | 'margin-bottom';
export interface IBreakpoint {
  name: string;
  maxWidth?: number;
  label: string;
}
export interface ISpacingValue {
  [breakpoint: string]: number;
}
export interface IDependsOnConfig {
  field: string;
  value: boolean | string | number;
  operator?: 'equals' | 'notEquals' | 'in' | 'notIn';
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
  fileUploadConfig?: IFileUploadConfig;
  blockAnchorConfig?: IBlockAnchorConfig;
  repeaterConfig?: IRepeaterFieldConfig;
  /**
   * Условное отображение поля: поле показывается только если другое поле имеет определенное значение
   * Используется только в Vue версии
   */
  dependsOn?: IDependsOnConfig;
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
   * Системное поле `id` элементов генерируется автоматически (не отображается в форме),
   * если в fields нет пользовательского поля `id` другого типа (например api-select).
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
  /** Debounce поискового запроса, мс. 0 — без задержки. */
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
export interface IFileUploadConfig {
  uploadUrl?: string;

  fileParamName?: string;

  uploadHeaders?: Record<string, string>;

  maxFileSize?: number;

  accept?: string;

  /** Максимум файлов при field.multiple = true */
  maxCount?: number;

  responseMapper?: (response: unknown) => unknown;

  onUploadError?: (error: Error) => void;
}
export interface IBlockAnchorConfig {
  placeholder?: string;
  /** Разрешить произвольный URL помимо якоря на блок страницы */
  allowCustomUrl?: boolean;
  /** Исключить редактируемый блок из списка (по умолчанию true) */
  excludeEditingBlock?: boolean;
  /** Показывать только видимые блоки (по умолчанию true) */
  onlyVisibleBlocks?: boolean;
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
  fileUploadConfig?: IFileUploadConfig;
  blockAnchorConfig?: IBlockAnchorConfig;
  /**
   * Условное отображение поля: поле показывается только если другое поле имеет определенное значение
   * Используется только в Vue версии
   */
  dependsOn?: IDependsOnConfig;
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
