/**
 * Контекст рендеринга поля для кастомизации классов и атрибутов
 */
export interface IRenderContext {
  /**
   * Класс для контейнера поля (form-group)
   */
  containerClass?: string;

  /**
   * Класс для label
   */
  labelClass?: string;

  /**
   * Класс для input/textarea/select элементов
   */
  inputClass?: string;

  /**
   * Класс для checkbox контейнера
   */
  checkboxContainerClass?: string;

  /**
   * Класс для checkbox label
   */
  checkboxLabelClass?: string;

  /**
   * Класс для checkbox input
   */
  checkboxInputClass?: string;

  /**
   * Дополнительные data-атрибуты для контейнера
   */
  containerDataAttributes?: Record<string, string>;

  /**
   * Дополнительные data-атрибуты для input/textarea/select
   */
  inputDataAttributes?: Record<string, string>;

  /**
   * Имя поля с учетом пути (например, "items[0].name")
   */
  fieldNamePath?: string;

  /**
   * Показывать ли ошибки валидации
   */
  showErrors?: boolean;

  /**
   * Ошибки валидации
   */
  errors?: string[];

  /**
   * Callback для изменения значения поля
   */
  onFieldChange?: (fieldName: string, value: unknown) => void;
}
