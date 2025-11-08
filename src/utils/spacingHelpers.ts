import { IBreakpoint, TSpacingType } from '../core/types/form';
export const DEFAULT_BREAKPOINTS: IBreakpoint[] = [
  { name: 'desktop', label: 'Десктоп', maxWidth: undefined },
  { name: 'tablet', label: 'Таблет', maxWidth: 1199 },
  { name: 'mobile', label: 'Моб', maxWidth: 767 }
];
export interface ISpacingData {
  [breakpoint: string]: {
  [spacingType: string]: number;
  };
}
export function generateSpacingCSSVariables(
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): Record<string, string> {
  const cssVariables: Record<string, string> = {};
  if (!spacing || Object.keys(spacing).length === 0) {
  return cssVariables;
  }
  breakpoints.forEach(bp => {
  const bpData = spacing[bp.name] || {};
  const suffix = bp.name === 'desktop' ? '' : `-${bp.name}`;
  Object.keys(bpData).forEach(spacingType => {
    const value = bpData[spacingType];
    if (value !== undefined && value !== null) {
      const varName = `--${fieldName}-${spacingType}${suffix}`;
      cssVariables[varName] = `${value}px`;
    }
  });
  });
  return cssVariables;
}
export function generateSpacingCSS(
  spacing: ISpacingData,
  selector: string = '.block',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): string {
  const cssLines: string[] = [];
  if (!spacing || Object.keys(spacing).length === 0) {
  return '';
  }
  breakpoints.forEach(bp => {
  const bpData = spacing[bp.name] || {};
  const hasValues = Object.values(bpData).some(v => v !== undefined && v !== null && v > 0);
  if (!hasValues) return;
  if (bp.name === 'desktop' || !bp.maxWidth) {
    cssLines.push(`${selector} {`);
    Object.keys(bpData).forEach(spacingType => {
      const value = bpData[spacingType];
      if (value !== undefined && value !== null) {
        cssLines.push(`  ${spacingType}: ${value}px;`);
      }
    });
    cssLines.push('}');
  } else {
    cssLines.push(`@media (max-width: ${bp.maxWidth}px) {`);
    cssLines.push(`  ${selector} {`);
    Object.keys(bpData).forEach(spacingType => {
      const value = bpData[spacingType];
      if (value !== undefined && value !== null) {
        cssLines.push(`    ${spacingType}: ${value}px;`);
      }
    });
    cssLines.push('  }');
    cssLines.push('}');
  }
  });
  return cssLines.join('\n');
}
export function applySpacingToElement(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): void {
  const cssVariables = generateSpacingCSSVariables(spacing, fieldName, breakpoints);
  
  Object.keys(cssVariables).forEach(varName => {
  element.style.setProperty(varName, cssVariables[varName]);
  });
}
export function getSpacingValue(
  spacing: ISpacingData,
  breakpoint: string,
  spacingType: TSpacingType
): number | undefined {
  return spacing?.[breakpoint]?.[spacingType];
}
export function setSpacingValue(
  spacing: ISpacingData,
  breakpoint: string,
  spacingType: TSpacingType,
  value: number
): ISpacingData {
  return {
  ...spacing,
  [breakpoint]: {
    ...spacing[breakpoint],
    [spacingType]: value
  }
  };
}
export function validateSpacing(
  spacing: ISpacingData,
  min: number = 0,
  max: number = 500
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!spacing || typeof spacing !== 'object') {
  errors.push('Spacing должен быть объектом');
  return { valid: false, errors };
  }
  Object.keys(spacing).forEach(breakpoint => {
  const bpData = spacing[breakpoint];
  
  if (typeof bpData !== 'object') {
    errors.push(`Данные для брекпоинта "${breakpoint}" должны быть объектом`);
    return;
  }
  Object.keys(bpData).forEach(spacingType => {
    const value = bpData[spacingType];
    
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value !== 'number') {
      errors.push(`Значение ${spacingType} для брекпоинта "${breakpoint}" должно быть числом`);
      return;
    }
    if (value < min) {
      errors.push(`Значение ${spacingType} для брекпоинта "${breakpoint}" меньше минимума (${min})`);
    }
    if (value > max) {
      errors.push(`Значение ${spacingType} для брекпоинта "${breakpoint}" больше максимума (${max})`);
    }
  });
  });
  return {
  valid: errors.length === 0,
  errors
  };
}
export function mergeSpacing(...spacings: ISpacingData[]): ISpacingData {
  const result: ISpacingData = {};
  spacings.forEach(spacing => {
  if (!spacing) return;
  Object.keys(spacing).forEach(breakpoint => {
    if (!result[breakpoint]) {
      result[breakpoint] = {};
    }
    Object.assign(result[breakpoint], spacing[breakpoint]);
  });
  });
  return result;
}