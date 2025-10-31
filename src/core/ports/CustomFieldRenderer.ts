/**
 * Порт (интерфейс) для кастомных рендереров полей форм
 * Принцип Dependency Inversion Principle (DIP)
 * Позволяет пользователям внедрять свои компоненты редактирования полей
 */

/**
 * Конфигурация кастомного поля
 */
export interface ICustomFieldConfig {
  /**
   * Уникальный ID рендерера (например, 'wysiwyg-editor', 'date-picker')
   */
  rendererId: string;

  /**
   * Дополнительные опции для рендерера
   * Передаются в метод render()
   */
  options?: Record<string, any>;
}

/**
 * Контекст для рендерера кастомного поля
 */
export interface ICustomFieldContext {
  /**
   * Имя поля (из field.field)
   */
  fieldName: string;

  /**
   * Метка поля
   */
  label: string;

  /**
   * Текущее значение поля
   */
  value: any;

  /**
   * Обязательно ли поле
   */
  required: boolean;

  /**
   * Дополнительные опции из customFieldConfig.options
   */
  options?: Record<string, any>;

  /**
   * Callback для обновления значения
   * Вызывается когда пользователь изменяет значение в кастомном компоненте
   */
  onChange: (newValue: any) => void;

  /**
   * Callback для обработки ошибок валидации
   */
  onError?: (error: string | null) => void;
}

/**
 * Результат рендеринга кастомного поля
 */
export interface ICustomFieldRenderResult {
  /**
   * HTML элемент или строка с HTML
   */
  element: HTMLElement | string;

  /**
   * Метод для очистки ресурсов (опционально)
   * Вызывается при удалении поля из DOM
   */
  destroy?: () => void;

  /**
   * Метод для получения текущего значения (опционально)
   * Если не указан, значение берется из onChange callback
   */
  getValue?: () => any;

  /**
   * Метод для установки значения программно (опционально)
   */
  setValue?: (value: any) => void;

  /**
   * Метод для валидации (опционально)
   * Возвращает строку с ошибкой или null если валидация прошла
   */
  validate?: () => string | null;
}

/**
 * Интерфейс рендерера кастомного поля
 * Реализуется пользователем для добавления своих компонентов
 */
export interface ICustomFieldRenderer {
  /**
   * Уникальный ID рендерера
   */
  readonly id: string;

  /**
   * Название рендерера для отображения
   */
  readonly name: string;

  /**
   * Рендеринг кастомного поля
   * @param container - HTML элемент, куда нужно вставить поле
   * @param context - Контекст с данными поля
   * @returns Результат рендеринга
   */
  render(container: HTMLElement, context: ICustomFieldContext): ICustomFieldRenderResult | Promise<ICustomFieldRenderResult>;
}

/**
 * Интерфейс реестра кастомных рендереров полей
 */
export interface ICustomFieldRendererRegistry {
  /**
   * Регистрация рендерера
   */
  register(renderer: ICustomFieldRenderer): void;

  /**
   * Получение рендерера по ID
   */
  get(id: string): ICustomFieldRenderer | null;

  /**
   * Проверка существования рендерера
   */
  has(id: string): boolean;

  /**
   * Удаление рендерера
   */
  unregister(id: string): boolean;

  /**
   * Получение всех рендереров
   */
  getAll(): Map<string, ICustomFieldRenderer>;

  /**
   * Очистка всех рендереров
   */
  clear(): void;
}

