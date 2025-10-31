/**
 * Утилиты для работы с spacing отступами и брекпоинтами
 */

import { IBreakpoint, TSpacingType } from '../core/types/form';

// Базовые брекпоинты по умолчанию
export const DEFAULT_BREAKPOINTS: IBreakpoint[] = [
  { name: 'desktop', label: 'Десктоп', maxWidth: undefined },
  { name: 'tablet', label: 'Таблет', maxWidth: 1199 },
  { name: 'mobile', label: 'Моб', maxWidth: 767 }
];

/**
 * Интерфейс для структуры spacing данных
 */
export interface ISpacingData {
  [breakpoint: string]: {
  [spacingType: string]: number;
  };
}

/**
 * Генерирует объект CSS переменных из spacing данных
 * @param spacing - Объект с данными отступов по брекпоинтам
 * @param fieldName - Имя поля (используется для создания уникальных CSS переменных)
 * @param breakpoints - Массив брекпоинтов (по умолчанию используются базовые)
 * @returns Объект с CSS переменными для применения в inline стилях
 */
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

/**
 * Генерирует строку CSS кода из spacing данных с медиа-запросами
 * @param spacing - Объект с данными отступов по брекпоинтам
 * @param selector - CSS селектор для применения стилей
 * @param breakpoints - Массив брекпоинтов (по умолчанию используются базовые)
 * @returns Строка с CSS кодом
 */
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

  // Для desktop не нужны медиа-запросы
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
    // Для остальных брекпоинтов используем медиа-запросы
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

/**
 * Применяет spacing стили к элементу
 * @param element - HTML элемент
 * @param spacing - Объект с данными отступов по брекпоинтам
 * @param fieldName - Имя поля (используется для создания уникальных CSS переменных)
 * @param breakpoints - Массив брекпоинтов (по умолчанию используются базовые)
 */
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

/**
 * Получает значение отступа для конкретного брекпоинта и типа
 * @param spacing - Объект с данными отступов по брекпоинтам
 * @param breakpoint - Название брекпоинта
 * @param spacingType - Тип отступа
 * @returns Значение отступа в пикселях или undefined
 */
export function getSpacingValue(
  spacing: ISpacingData,
  breakpoint: string,
  spacingType: TSpacingType
): number | undefined {
  return spacing?.[breakpoint]?.[spacingType];
}

/**
 * Устанавливает значение отступа для конкретного брекпоинта и типа
 * @param spacing - Объект с данными отступов по брекпоинтам
 * @param breakpoint - Название брекпоинта
 * @param spacingType - Тип отступа
 * @param value - Значение отступа в пикселях
 * @returns Обновленный объект spacing
 */
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

/**
 * Валидирует данные spacing
 * @param spacing - Объект с данными отступов по брекпоинтам
 * @param min - Минимальное допустимое значение
 * @param max - Максимальное допустимое значение
 * @returns Объект с результатом валидации
 */
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
      return; // Пропускаем неопределенные значения
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

/**
 * Объединяет несколько spacing объектов (последний имеет приоритет)
 * @param spacings - Массив spacing объектов
 * @returns Объединенный spacing объект
 */
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

