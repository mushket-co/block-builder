/**
 * Типы для работы с формами
 */

import { IValidationRule } from './validation';
import { ICustomFieldConfig } from '../ports/CustomFieldRenderer';

// Типы полей форм
export type TFieldType = 'text' | 'number' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox' | 'color' | 'file' | 'spacing' | 'repeater' | 'api-select' | 'custom';

// Типы отступов
export type TSpacingType = 'padding-top' | 'padding-bottom' | 'margin-top' | 'margin-bottom';

// Брекпоинты для адаптивности
export interface IBreakpoint {
  name: string;
  maxWidth?: number; // undefined для desktop (default)
  label: string;
}

// Значение отступа для конкретного брекпоинта
export interface ISpacingValue {
  [breakpoint: string]: number; // Ключ - название брекпоинта, значение - размер в пикселях
}

// Конфигурация для spacing поля
export interface ISpacingFieldConfig {
  spacingTypes?: TSpacingType[]; // Какие типы отступов доступны
  min?: number; // Минимальное значение (по умолчанию 0)
  max?: number; // Максимальное значение (по умолчанию 200)
  step?: number; // Шаг изменения (по умолчанию 1)
  breakpoints?: IBreakpoint[]; // Кастомные брекпоинты (если не указаны, используются базовые)
}

// Опции для автоматического spacing в блоках
export interface IBlockSpacingOptions {
  enabled?: boolean; // Включить/выключить spacing для блока (по умолчанию true)
  spacingTypes?: TSpacingType[]; // Конкретные типы отступов (по умолчанию все 4)
  config?: Omit<ISpacingFieldConfig, 'spacingTypes'>; // Дополнительная конфигурация
}

// Конфигурация поля внутри repeater
export interface IRepeaterItemFieldConfig {
  field: string; // Имя поля внутри элемента массива
  label: string; // Метка поля
  type: Exclude<TFieldType, 'repeater' | 'spacing'>; // Тип поля (repeater не может быть вложенным)
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[]; // Для типа 'select'
  rules?: IValidationRule[];
}

// Конфигурация для repeater поля
export interface IRepeaterFieldConfig {
  fields: IRepeaterItemFieldConfig[]; // Поля внутри каждого элемента массива
  addButtonText?: string; // Текст кнопки добавления (по умолчанию "Добавить")
  removeButtonText?: string; // Текст кнопки удаления (по умолчанию "Удалить")
  itemTitle?: string; // Заголовок элемента (например, "Карточка", "Слайд")
  min?: number; // Минимальное количество элементов (если не указано, определяется по required: true = 1, false = 0)
  max?: number; // Максимальное количество элементов
  defaultItemValue?: Record<string, any>; // Значения по умолчанию для нового элемента
  collapsible?: boolean; // Можно ли сворачивать элементы (по умолчанию false)
}

// Метод HTTP запроса
export type THttpMethod = 'GET' | 'POST';

// Элемент списка из API
export interface IApiSelectItem {
  id: string | number;
  name: string;
}

// Параметры для HTTP запроса к API
export interface IApiRequestParams {
  search?: string; // Поисковый запрос
  page?: number; // Номер страницы
  limit?: number; // Количество элементов
  [key: string]: any; // Дополнительные параметры
}

// Ответ от API
export interface IApiSelectResponse {
  data: IApiSelectItem[]; // Массив элементов
  total?: number; // Общее количество
  page?: number; // Текущая страница
  hasMore?: boolean; // Есть ли еще элементы
}

// Конфигурация для api-select поля
export interface IApiSelectConfig {
  url: string; // URL API пользователя
  method?: THttpMethod; // Метод запроса (по умолчанию GET)
  headers?: Record<string, string>; // Дополнительные заголовки
  searchParam?: string; // Имя параметра для поиска (по умолчанию 'search')
  pageParam?: string; // Имя параметра для страницы (по умолчанию 'page')
  limitParam?: string; // Имя параметра для лимита (по умолчанию 'limit')
  limit?: number; // Количество элементов на странице (по умолчанию 20)
  debounceMs?: number; // Задержка для поиска в мс (по умолчанию 300)
  multiple?: boolean; // Множественный выбор (по умолчанию false)
  responseMapper?: (response: any) => IApiSelectResponse; // Функция преобразования ответа
  dataPath?: string; // Путь к данным в ответе (например, 'data.items')
  idField?: string; // Поле ID в элементах (по умолчанию 'id')
  nameField?: string; // Поле name в элементах (по умолчанию 'name')
  minSearchLength?: number; // Минимальная длина поиска (по умолчанию 0)
  placeholder?: string; // Плейсхолдер для поля поиска
  noResultsText?: string; // Текст когда нет результатов
  loadingText?: string; // Текст во время загрузки
  errorText?: string; // Текст при ошибке
}

// Конфигурация поля формы
export interface IFormFieldConfig {
  field: string;
  label: string;
  type: TFieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[]; // Для типа 'select'
  rules?: IValidationRule[];
  spacingConfig?: ISpacingFieldConfig; // Для типа 'spacing'
  repeaterConfig?: IRepeaterFieldConfig; // Для типа 'repeater'
  apiSelectConfig?: IApiSelectConfig; // Для типа 'api-select'
  customFieldConfig?: ICustomFieldConfig; // Для типа 'custom'
}

// Конфигурация блока с опциями spacing
export interface IBlockConfigWithSpacing {
  title?: string;
  icon?: string;
  description?: string;
  fields?: IFormFieldConfig[];
  spacingOptions?: IBlockSpacingOptions; // Опции для автоматического добавления spacing
  [key: string]: any;
}

// Конфигурация поля с расширенной валидацией
export interface IFieldValidationConfig {
  field: string;
  label: string;
  type: TFieldType;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>; // Для select
  rules: IValidationRule[];
  defaultValue?: any;
}

// Конфигурация для генерации форм
export interface IFormGenerationConfig {
  title: string;
  description?: string;
  fields: IFormFieldConfig[];
  submitButtonText?: string;
  cancelButtonText?: string;
}
