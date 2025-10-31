/**
 * SpacingControlRenderer - генерация HTML для spacing контрола в чистом JS
 * Универсальная реализация для использования без фреймворков
 */

import { IBreakpoint, ISpacingFieldConfig, TSpacingType } from '../../core/types/form';
import { ISpacingData, DEFAULT_BREAKPOINTS } from '../../utils/spacingHelpers';
import { LicenseFeatureChecker, LicenseFeature } from '../../core/services/LicenseFeatureChecker';

export interface ISpacingControlOptions {
  fieldName: string;
  label: string;
  required?: boolean;
  config?: ISpacingFieldConfig;
  value?: ISpacingData;
  onChange?: (value: ISpacingData) => void;
  licenseFeatureChecker?: LicenseFeatureChecker; // Для ограничения кастомных брекпоинтов
}

export class SpacingControlRenderer {
  private fieldName: string;
  private label: string;
  private required: boolean;
  private config: ISpacingFieldConfig;
  private value: ISpacingData;
  private onChange?: (value: ISpacingData) => void;
  private currentBreakpoint: string = 'desktop';
  private container?: HTMLElement;
  private licenseFeatureChecker?: LicenseFeatureChecker;

  constructor(options: ISpacingControlOptions) {
  this.fieldName = options.fieldName;
  this.label = options.label;
  this.required = options.required || false;
  this.config = options.config || {};
  this.value = options.value || this.initializeValue();
  this.onChange = options.onChange;
  this.licenseFeatureChecker = options.licenseFeatureChecker;

  // Инициализируем currentBreakpoint первым доступным брекпоинтом
  const breakpoints = this.getBreakpoints();
  this.currentBreakpoint = breakpoints[0]?.name || 'desktop';
  }

  /**
   * Инициализация значения с нулевыми отступами
   */
  private initializeValue(): ISpacingData {
  const value: ISpacingData = {};
  const breakpoints = this.getBreakpoints();
  const spacingTypes = this.getSpacingTypes();

  breakpoints.forEach(bp => {
    value[bp.name] = {};
    spacingTypes.forEach(type => {
      value[bp.name][type] = 0;
    });
  });

  return value;
  }

  /**
   * Получить список брекпоинтов
   * В FREE версии кастомные брекпоинты недоступны - используются только дефолтные
   */
  private getBreakpoints(): IBreakpoint[] {
  const custom = this.config.breakpoints || [];

  // ВСЕГДА проверяем лицензию ПЕРВЫМ - в FREE версии кастомные брекпоинты недоступны
  if (this.licenseFeatureChecker) {
    // Если лицензия не PRO - используем только дефолтные брекпоинты
    if (!this.licenseFeatureChecker.hasAdvancedSpacing()) {
      return DEFAULT_BREAKPOINTS;
    }
  } else {
    // Если licenseFeatureChecker не передан - предполагаем FREE режим, используем дефолтные
    return DEFAULT_BREAKPOINTS;
  }

  // Только если есть licenseFeatureChecker И лицензия PRO - можем использовать кастомные брекпоинты
  // Если breakpoints передан и не пустой - используем только его
  if (custom.length > 0) {
    return custom;
  }

  // Иначе используем дефолтные
  return DEFAULT_BREAKPOINTS;
  }

  /**
   * Получить список типов отступов
   */
  private getSpacingTypes(): TSpacingType[] {
  return this.config.spacingTypes || [
    'padding-top',
    'padding-bottom',
    'margin-top',
    'margin-bottom'
  ];
  }

  /**
   * Получить значение отступа
   */
  private getSpacingValue(spacingType: TSpacingType): number {
  return this.value?.[this.currentBreakpoint]?.[spacingType] || 0;
  }

  /**
   * Установить значение отступа
   */
  private setSpacingValue(spacingType: TSpacingType, newValue: number): void {
  if (!this.value[this.currentBreakpoint]) {
    this.value[this.currentBreakpoint] = {};
  }

  this.value[this.currentBreakpoint][spacingType] = newValue;

  if (this.onChange) {
    this.onChange(this.value);
  }

  // Обновляем UI
  this.updateUI(spacingType);
  }

  /**
   * Получить подпись для типа отступа
   */
  private getSpacingLabel(spacingType: TSpacingType): string {
  const labels: Record<TSpacingType, string> = {
    'padding-top': 'Внутренний верх',
    'padding-bottom': 'Внутренний низ',
    'margin-top': 'Внешний верх',
    'margin-bottom': 'Внешний низ'
  };
  return labels[spacingType];
  }


  /**
   * Генерация HTML для превью CSS переменных
   */
  private generateCSSPreview(): string {
  const lines: string[] = [];
  const breakpoints = this.getBreakpoints();
  const spacingTypes = this.getSpacingTypes();

  breakpoints.forEach(bp => {
    const bpData = this.value[bp.name] || {};
    const hasValues = Object.values(bpData).some(v => v > 0);

    if (!hasValues) return;

    if (bp.maxWidth) {
      lines.push(`@media (max-width: ${bp.maxWidth}px) {`);
    }

    spacingTypes.forEach(spacingType => {
      const value = bpData[spacingType];
      if (value > 0) {
        const varName = `--${this.fieldName}-${spacingType}`;
        const line = bp.maxWidth ? `  ${varName}: ${value}px;` : `${varName}: ${value}px;`;
        lines.push(line);
      }
    });

    if (bp.maxWidth) {
      lines.push('}');
    }
  });

  return lines.join('\n') || '/* Нет заданных отступов */';
  }

  /**
   * Обновление UI после изменения значения
   */
  private updateUI(spacingType: TSpacingType): void {
  if (!this.container) return;

  const value = this.getSpacingValue(spacingType);
  const sliderWrapper = this.container.querySelector(
    `[data-spacing-type="${spacingType}"]`
  );

  if (sliderWrapper) {
    // Обновляем слайдер
    const slider = sliderWrapper.querySelector('.spacing-control__slider') as HTMLInputElement;
    if (slider) {
      slider.value = value.toString();
    }

    // Обновляем числовой инпут
    const valueInput = sliderWrapper.querySelector('.spacing-control__value-input') as HTMLInputElement;
    if (valueInput) {
      valueInput.value = value.toString();
    }
  }

  // Обновляем превью
  const previewCode = this.container.querySelector('.spacing-control__preview-code');
  if (previewCode) {
    previewCode.textContent = this.generateCSSPreview();
  }
  }

  /**
   * Переключение брекпоинта
   */
  private switchBreakpoint(breakpointName: string): void {
  this.currentBreakpoint = breakpointName;
  this.render(this.container!);
  }

  /**
   * Генерация HTML для одной группы отступов
   */
  private generateSpacingGroupHTML(spacingType: TSpacingType): string {
  const value = this.getSpacingValue(spacingType);
  const min = this.config.min || 0;
  const max = this.config.max || 200;
  const step = this.config.step || 1;

  return `
    <div class="spacing-control__group">
      <label class="spacing-control__group-label">
        ${this.getSpacingLabel(spacingType)}
      </label>

      <div class="spacing-control__slider-wrapper" data-spacing-type="${spacingType}">
        <input
          type="range"
          class="spacing-control__slider"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
          data-spacing-type="${spacingType}"
        />
        <input
          type="number"
          class="spacing-control__value-input"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
          data-spacing-type="${spacingType}"
        />
        <span class="spacing-control__unit">px</span>
      </div>
    </div>
  `;
  }

  /**
   * Проверка, нужно ли показывать заглушку для продвинутых настроек spacing
   */
  private shouldShowAdvancedSpacingRestriction(): boolean {
    // Проверяем, есть ли кастомные брекпоинты в оригинальной конфигурации
    const hasCustomBreakpoints = !!(this.config.breakpoints && this.config.breakpoints.length > 0);
    // Проверяем лицензию
    const hasAdvancedSpacing = this.licenseFeatureChecker?.hasAdvancedSpacing() ?? false;
    return hasCustomBreakpoints && (!this.licenseFeatureChecker || !hasAdvancedSpacing);
  }

  /**
   * Получить HTML для заглушки продвинутых настроек spacing
   */
  private generateAdvancedSpacingRestrictionHTML(): string {
    if (!this.shouldShowAdvancedSpacingRestriction()) {
      return '';
    }

    const message = this.licenseFeatureChecker
      ? this.licenseFeatureChecker.getFeatureRestrictionMessage(LicenseFeature.ADVANCED_SPACING)
      : 'Продвинутые настройки spacing доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.';

    return `
      <div style="padding: 10px; border: 1px solid #ff9800; border-radius: 4px; background-color: #fff3cd; color: #856404; margin-bottom: 10px;">
        ⚠️ ${message}
      </div>
    `;
  }

  /**
   * Генерация полного HTML
   */
  public generateHTML(): string {
  const breakpoints = this.getBreakpoints();
  const spacingTypes = this.getSpacingTypes();

  const breakpointsHTML = breakpoints
    .map(bp => {
      const isActive = bp.name === this.currentBreakpoint;
      return `
        <button
          type="button"
          class="spacing-control__breakpoint-btn ${isActive ? 'spacing-control__breakpoint-btn--active' : ''}"
          data-breakpoint="${bp.name}"
        >
          ${bp.label}
        </button>
      `;
    })
    .join('');

  const groupsHTML = spacingTypes.map(type => this.generateSpacingGroupHTML(type)).join('');
  const restrictionHTML = this.generateAdvancedSpacingRestrictionHTML();

  return `
    <div class="spacing-control" data-field-name="${this.fieldName}">
      <div class="spacing-control__header">
        <label class="spacing-control__label">
          ${this.label}
          ${this.required ? '<span class="required">*</span>' : ''}
        </label>
      </div>

      ${restrictionHTML}

      <div class="spacing-control__breakpoints">
        ${breakpointsHTML}
      </div>

      <div class="spacing-control__groups">
        ${groupsHTML}
      </div>

      <div class="spacing-control__preview">
        <div class="spacing-control__preview-title">CSS переменные:</div>
        <pre class="spacing-control__preview-code">${this.generateCSSPreview()}</pre>
      </div>
    </div>
  `;
  }

  /**
   * Рендеринг в контейнер
   */
  public render(container: HTMLElement): void {
  this.container = container;
  container.innerHTML = this.generateHTML();
  this.attachEventListeners();
  }

  /**
   * Привязка обработчиков событий
   */
  private attachEventListeners(): void {
  if (!this.container) return;

  // Переключение брекпоинтов
  const breakpointButtons = this.container.querySelectorAll('.spacing-control__breakpoint-btn');
  breakpointButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const breakpoint = (e.currentTarget as HTMLElement).dataset.breakpoint;
      if (breakpoint) {
        this.switchBreakpoint(breakpoint);
      }
    });
  });

  // Слайдеры
  const sliders = this.container.querySelectorAll('.spacing-control__slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const spacingType = target.dataset.spacingType as TSpacingType;
      const value = parseInt(target.value, 10);
      this.setSpacingValue(spacingType, value);
    });
  });

  // Числовые инпуты
  const valueInputs = this.container.querySelectorAll('.spacing-control__value-input');
  valueInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const spacingType = target.dataset.spacingType as TSpacingType;
      let value = parseInt(target.value, 10);

      // Валидация
      const min = this.config.min || 0;
      const max = this.config.max || 200;
      if (isNaN(value)) value = 0;
      if (value < min) value = min;
      if (value > max) value = max;

      this.setSpacingValue(spacingType, value);
    });
  });
  }

  /**
   * Получить текущее значение
   */
  public getValue(): ISpacingData {
  return this.value;
  }

  /**
   * Установить значение
   */
  public setValue(value: ISpacingData): void {
  this.value = value;
  if (this.container) {
    this.render(this.container);
  }
  }

  /**
   * Уничтожение контрола
   */
  public destroy(): void {
  if (this.container) {
    this.container.innerHTML = '';
    this.container = undefined;
  }
  }
}

