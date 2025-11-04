/**
 * CustomFieldControlRenderer - рендерит кастомные поля из пользовательских рендереров
 * Принцип единой ответственности (SRP)
 * Dependency Inversion Principle (DIP) - зависит от абстракции ICustomFieldRenderer
 */

import { ICustomFieldRenderer, ICustomFieldContext, ICustomFieldRenderResult } from '../../core/ports/CustomFieldRenderer';

/**
 * Опции для CustomFieldControlRenderer
 */
export interface ICustomFieldControlOptions {
  fieldName: string;
  label: string;
  value: any;
  required: boolean;
  rendererId: string;
  options?: Record<string, any>;
  onChange: (value: any) => void;
  onError?: (error: string | null) => void;
}

/**
 * Рендерер кастомных полей
 * Делегирует рендеринг зарегистрированным пользовательским рендерерам
 */
export class CustomFieldControlRenderer {
  private container: HTMLElement;
  private renderer: ICustomFieldRenderer;
  private renderResult: ICustomFieldRenderResult | null = null;
  private currentValue: any;
  private onChange: (value: any) => void;

  constructor(
  container: HTMLElement,
  renderer: ICustomFieldRenderer,
  options: ICustomFieldControlOptions
  ) {
  this.container = container;
  this.renderer = renderer;
  this.currentValue = options.value;
  this.onChange = options.onChange;

  // Создаем контекст для рендерера
  const context: ICustomFieldContext = {
    fieldName: options.fieldName,
    label: options.label,
    value: options.value,
    required: options.required,
    options: options.options,
    onChange: (newValue: any) => {
      this.currentValue = newValue;
      this.onChange(newValue);
    },
    onError: options.onError
  };

  // Инициализируем рендерер
  this.initRenderer(context);
  }

  /**
   * Инициализация рендерера
   */
  private async initRenderer(context: ICustomFieldContext): Promise<void> {
  try {
    // Вызываем рендерер пользователя
    const result = await this.renderer.render(this.container, context);
    this.renderResult = result;

    // Если результат - строка HTML, вставляем её
    if (typeof result.element === 'string') {
      this.container.innerHTML = result.element;
    }
    // Если результат - HTMLElement, вставляем его
    else if (result.element instanceof HTMLElement) {
      this.container.innerHTML = '';
      this.container.appendChild(result.element);
    }

    // Удаляем инлайн стили с placeholder после инициализации
    if (this.container.classList.contains('custom-field-placeholder')) {
      this.container.removeAttribute('style');
      // Удаляем класс placeholder после инициализации
      this.container.classList.remove('bb-placeholder-box');
    }
    } catch (error) {
    this.showError(`Ошибка инициализации поля: ${error}`);
  }
  }

  /**
   * Получение текущего значения
   */
  getValue(): any {
  // Если рендерер предоставил метод getValue, используем его
  if (this.renderResult?.getValue) {
    return this.renderResult.getValue();
  }
  // Иначе используем значение из onChange callback
  return this.currentValue;
  }

  /**
   * Установка значения программно
   */
  setValue(value: any): void {
  this.currentValue = value;
  if (this.renderResult?.setValue) {
    this.renderResult.setValue(value);
  }
  }

  /**
   * Валидация поля
   */
  validate(): string | null {
  if (this.renderResult?.validate) {
    return this.renderResult.validate();
  }
  return null;
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
  if (this.renderResult?.destroy) {
    this.renderResult.destroy();
  }
  this.container.innerHTML = '';
  }

  /**
   * Показ ошибки в контейнере
   */
  private showError(message: string): void {
    // Удаляем инлайн стили с placeholder, если контейнер - это placeholder
    if (this.container.classList.contains('custom-field-placeholder')) {
      this.container.removeAttribute('style');
      // Удаляем класс placeholder при ошибке
      this.container.classList.remove('bb-placeholder-box');
    }
    this.container.innerHTML = `
      <div class="bb-error-box">
        ❌ ${message}
      </div>
    `;
  }
}

