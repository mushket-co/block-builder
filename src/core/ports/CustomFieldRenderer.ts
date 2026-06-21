export interface ICustomFieldConfig {
  rendererId: string;

  options?: Record<string, unknown>;
}

export interface ICustomFieldRepeaterScope {
  /** Имя repeater-поля, напр. `filterOptions` или `items` */
  fieldName: string;
  /** Индекс item в repeater */
  index: number;
  /** Текущий item (reactive / live reference) */
  item: Record<string, unknown>;
  /** Обновить поле текущего item и синхронизировать RepeaterControl */
  updateItemField: (field: string, value: unknown) => void;
}

export interface ICustomFieldFormScope {
  /** Весь formData модалки (reactive / live reference) */
  formData: Record<string, unknown>;
  /** Обновить поле верхнего уровня формы */
  setField: (name: string, value: unknown) => void;
  /** Заполнено, если custom field рендерится внутри item repeater */
  repeater?: ICustomFieldRepeaterScope;
}

export interface ICustomFieldContext {
  fieldName: string;

  label: string;

  value: unknown;

  required: boolean;

  options?: Record<string, unknown>;

  /** Сообщение об ошибке валидации (используется кастомными renderers, напр. WYSIWYG) */
  error?: string;

  /** Доступ к форме блока и (опционально) контексту repeater */
  formScope?: ICustomFieldFormScope;

  onChange: (newValue: unknown) => void;

  onError?: (error: string | null) => void;
}
export interface ICustomFieldRenderResult {
  element: HTMLElement | string;

  destroy?: () => void;

  getValue?: () => unknown;

  setValue?: (value: unknown) => void;

  /** Обновление состояния ошибки валидации без пересоздания поля */
  setError?: (error: string | null) => void;

  validate?: () => string | null;
}
export interface ICustomFieldRenderer {
  readonly id: string;

  readonly name: string;

  render(
    container: HTMLElement,
    context: ICustomFieldContext
  ): ICustomFieldRenderResult | Promise<ICustomFieldRenderResult>;
}
export interface ICustomFieldRendererRegistry {
  register(renderer: ICustomFieldRenderer): void;
  get(id: string): ICustomFieldRenderer | null;
  has(id: string): boolean;
  unregister(id: string): boolean;
  getAll(): Map<string, ICustomFieldRenderer>;
  clear(): void;
}
