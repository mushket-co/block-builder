import { LicenseFeature, LicenseFeatureChecker } from '../../core/services/LicenseFeatureChecker';
import { IBreakpoint, ISpacingFieldConfig, TSpacingType } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import { DEFAULT_BREAKPOINTS, ISpacingData } from '../../utils/spacingHelpers';

export interface ISpacingControlOptions {
  fieldName: string;
  label: string;
  required?: boolean;
  config?: ISpacingFieldConfig;
  value?: ISpacingData;
  onChange?: (value: ISpacingData) => void;
  licenseFeatureChecker?: LicenseFeatureChecker;
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

    const breakpoints = this.getBreakpoints();
    this.currentBreakpoint = breakpoints[0]?.name || 'desktop';
  }

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

  private getBreakpoints(): IBreakpoint[] {
    const custom = this.config.breakpoints || [];

    if (this.licenseFeatureChecker) {
      if (!this.licenseFeatureChecker.hasAdvancedSpacing()) {
        return DEFAULT_BREAKPOINTS;
      }
    } else {
      return DEFAULT_BREAKPOINTS;
    }

    if (custom.length > 0) {
      return custom;
    }

    return DEFAULT_BREAKPOINTS;
  }

  private getSpacingTypes(): TSpacingType[] {
    return (
      this.config.spacingTypes || ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom']
    );
  }

  private getSpacingValue(spacingType: TSpacingType): number {
    return this.value?.[this.currentBreakpoint]?.[spacingType] || 0;
  }

  private setSpacingValue(spacingType: TSpacingType, newValue: number): void {
    if (!this.value[this.currentBreakpoint]) {
      this.value[this.currentBreakpoint] = {};
    }

    this.value[this.currentBreakpoint][spacingType] = newValue;

    if (this.onChange) {
      this.onChange(this.value);
    }

    this.updateUI(spacingType);
  }

  private getSpacingLabel(spacingType: TSpacingType): string {
    const labels: Record<TSpacingType, string> = {
      'padding-top': 'Внутренний верх',
      'padding-bottom': 'Внутренний низ',
      'margin-top': 'Внешний верх',
      'margin-bottom': 'Внешний низ',
    };
    return labels[spacingType];
  }

  private generateCSSPreview(): string {
    const lines: string[] = [];
    const breakpoints = this.getBreakpoints();
    const spacingTypes = this.getSpacingTypes();

    breakpoints.forEach(bp => {
      const bpData = this.value[bp.name] || {};
      const hasValues = Object.values(bpData).some(v => v > 0);

      if (!hasValues) {
        return;
      }

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

  private updateUI(spacingType: TSpacingType): void {
    if (!this.container) {
      return;
    }

    const value = this.getSpacingValue(spacingType);
    const sliderWrapper = this.container.querySelector(`[data-spacing-type="${spacingType}"]`);

    if (sliderWrapper) {
      const slider = sliderWrapper.querySelector(
        `.${CSS_CLASSES.SPACING_CONTROL_SLIDER}`
      ) as HTMLInputElement;
      if (slider) {
        slider.value = value.toString();
      }

      const valueInput = sliderWrapper.querySelector(
        `.${CSS_CLASSES.SPACING_CONTROL_VALUE_INPUT}`
      ) as HTMLInputElement;
      if (valueInput) {
        valueInput.value = value.toString();
      }
    }

    const previewCode = this.container.querySelector(
      `.${CSS_CLASSES.SPACING_CONTROL_PREVIEW_CODE}`
    );
    if (previewCode) {
      previewCode.textContent = this.generateCSSPreview();
    }
  }

  private switchBreakpoint(breakpointName: string): void {
    this.currentBreakpoint = breakpointName;
    if (this.container) {
      this.render(this.container);
    }
  }

  private generateSpacingGroupHTML(spacingType: TSpacingType): string {
    const value = this.getSpacingValue(spacingType);
    const min = this.config.min || 0;
    const max = this.config.max || 200;
    const step = this.config.step || 1;

    return `
    <div class="${CSS_CLASSES.SPACING_CONTROL_GROUP}">
      <label class="${CSS_CLASSES.SPACING_CONTROL_GROUP_LABEL}">
        ${this.getSpacingLabel(spacingType)}
      </label>

      <div class="${CSS_CLASSES.SPACING_CONTROL_SLIDER_WRAPPER}" data-spacing-type="${spacingType}">
        <input
          type="range"
          class="${CSS_CLASSES.SPACING_CONTROL_SLIDER}"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
          data-spacing-type="${spacingType}"
        />
        <input
          type="number"
          class="${CSS_CLASSES.SPACING_CONTROL_VALUE_INPUT}"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
          data-spacing-type="${spacingType}"
        />
        <span class="${CSS_CLASSES.SPACING_CONTROL_UNIT}">px</span>
      </div>
    </div>
  `;
  }

  private shouldShowAdvancedSpacingRestriction(): boolean {
    const hasCustomBreakpoints = !!(this.config.breakpoints && this.config.breakpoints.length > 0);
    const hasAdvancedSpacing = this.licenseFeatureChecker?.hasAdvancedSpacing() ?? false;
    return hasCustomBreakpoints && (!this.licenseFeatureChecker || !hasAdvancedSpacing);
  }

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

  public generateHTML(): string {
    const breakpoints = this.getBreakpoints();
    const spacingTypes = this.getSpacingTypes();

    const breakpointsHTML = breakpoints
      .map(bp => {
        const isActive = bp.name === this.currentBreakpoint;
        return `
        <button
          type="button"
          class="${CSS_CLASSES.SPACING_CONTROL_BREAKPOINT_BTN} ${isActive ? CSS_CLASSES.SPACING_CONTROL_BREAKPOINT_BTN_ACTIVE : ''}"
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
    <div class="${CSS_CLASSES.SPACING_CONTROL_CONTAINER}" data-field-name="${this.fieldName}">
      <div class="${CSS_CLASSES.SPACING_CONTROL}">
        <div class="${CSS_CLASSES.SPACING_CONTROL_HEADER}">
          <label class="${CSS_CLASSES.SPACING_CONTROL_LABEL}">
            ${this.label}
            ${this.required ? `<span class="${CSS_CLASSES.REQUIRED}">*</span>` : ''}
          </label>
        </div>

        ${restrictionHTML}

        <div class="${CSS_CLASSES.SPACING_CONTROL_BREAKPOINTS}">
          ${breakpointsHTML}
        </div>

        <div class="${CSS_CLASSES.SPACING_CONTROL_GROUPS}">
          ${groupsHTML}
        </div>

        <div class="${CSS_CLASSES.SPACING_CONTROL_PREVIEW}">
          <div class="${CSS_CLASSES.SPACING_CONTROL_PREVIEW_TITLE}">CSS переменные:</div>
          <pre class="${CSS_CLASSES.SPACING_CONTROL_PREVIEW_CODE}">${this.generateCSSPreview()}</pre>
        </div>
      </div>
    </div>
  `;
  }

  public render(container: HTMLElement): void {
    this.container = container;
    container.innerHTML = this.generateHTML();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    if (!this.container) {
      return;
    }

    const breakpointButtons = this.container.querySelectorAll(
      `.${CSS_CLASSES.SPACING_CONTROL_BREAKPOINT_BTN}`
    );
    breakpointButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        const breakpoint = (e.currentTarget as HTMLElement).dataset.breakpoint;
        if (breakpoint) {
          this.switchBreakpoint(breakpoint);
        }
      });
    });

    const sliders = this.container.querySelectorAll(`.${CSS_CLASSES.SPACING_CONTROL_SLIDER}`);
    sliders.forEach(slider => {
      slider.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        const spacingType = target.dataset.spacingType as TSpacingType;
        const value = Number.parseInt(target.value, 10);
        this.setSpacingValue(spacingType, value);
      });
    });

    const valueInputs = this.container.querySelectorAll(
      `.${CSS_CLASSES.SPACING_CONTROL_VALUE_INPUT}`
    );
    valueInputs.forEach(input => {
      input.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        const spacingType = target.dataset.spacingType as TSpacingType;
        let value = Number.parseInt(target.value, 10);

        const min = this.config.min || 0;
        const max = this.config.max || 200;
        if (Number.isNaN(value)) {
          value = 0;
        }
        if (value < min) {
          value = min;
        }
        if (value > max) {
          value = max;
        }

        this.setSpacingValue(spacingType, value);
      });
    });
  }

  public getValue(): ISpacingData {
    return this.value;
  }

  public setValue(value: ISpacingData): void {
    this.value = value;
    if (this.container) {
      this.render(this.container);
    }
  }

  public destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = undefined;
    }
  }
}
