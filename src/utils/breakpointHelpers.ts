/**
 * Утилиты для работы с брекпоинтами и адаптивностью
 */

import { IBreakpoint } from '../core/types/form';
import { DEFAULT_BREAKPOINTS, ISpacingData } from './spacingHelpers';

/**
 * Определяет текущий активный брекпоинт на основе ширины экрана
 */
export function getCurrentBreakpoint(
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): IBreakpoint {
  const width = window.innerWidth;
  
  // Сортируем брекпоинты по maxWidth (от меньшего к большему)
  const sortedBreakpoints = [...breakpoints].sort((a, b) => {
  if (a.maxWidth === undefined) return 1; // Desktop всегда последний
  if (b.maxWidth === undefined) return -1;
  return a.maxWidth - b.maxWidth;
  });

  // Находим первый подходящий брекпоинт
  for (const bp of sortedBreakpoints) {
  if (bp.maxWidth === undefined) {
    return bp; // Desktop (без ограничения)
  }
  if (width <= bp.maxWidth) {
    return bp;
  }
  }

  // Fallback на desktop
  return breakpoints.find(bp => bp.maxWidth === undefined) || breakpoints[0];
}

/**
 * Применяет margin из spacing к элементу для текущего брекпоинта
 */
export function applyMarginToElement(
  element: HTMLElement,
  spacing: ISpacingData,
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): void {
  const currentBp = getCurrentBreakpoint(breakpoints);
  const bpData = spacing[currentBp.name] || {};

  // Применяем только margin к элементу
  // Важно: устанавливаем значение всегда, даже если оно 0, чтобы перезаписать старые значения
  const marginTop = bpData['margin-top'];
  const marginBottom = bpData['margin-bottom'];
  
  element.style.marginTop = marginTop !== undefined ? `${marginTop}px` : '';
  element.style.marginBottom = marginBottom !== undefined ? `${marginBottom}px` : '';
}

/**
 * Устанавливает CSS переменные для padding (для использования внутри блока)
 */
export function setPaddingCSSVariables(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): void {
  const currentBp = getCurrentBreakpoint(breakpoints);
  const bpData = spacing[currentBp.name] || {};

  // Устанавливаем CSS переменные для padding (пользователь сам использует их)
  // Важно: устанавливаем значение всегда, даже если оно 0, чтобы перезаписать старые значения
  const paddingTop = bpData['padding-top'];
  const paddingBottom = bpData['padding-bottom'];
  
  if (paddingTop !== undefined) {
  element.style.setProperty(`--${fieldName}-padding-top`, `${paddingTop}px`);
  } else {
  element.style.removeProperty(`--${fieldName}-padding-top`);
  }
  
  if (paddingBottom !== undefined) {
  element.style.setProperty(`--${fieldName}-padding-bottom`, `${paddingBottom}px`);
  } else {
  element.style.removeProperty(`--${fieldName}-padding-bottom`);
  }
}

/**
 * Применяет все отступы из spacing к элементу
 * margin - напрямую к элементу
 * padding - через CSS переменные
 */
export function applySpacingToBlockElement(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): void {
  if (!spacing || Object.keys(spacing).length === 0) {
  return;
  }

  // Применяем margin напрямую
  applyMarginToElement(element, spacing, breakpoints);
  
  // Устанавливаем CSS переменные для padding
  setPaddingCSSVariables(element, spacing, fieldName, breakpoints);
}

/**
 * Создаёт обработчик изменения размера окна для обновления отступов
 */
export function createBreakpointChangeHandler(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): () => void {
  let currentBpName = getCurrentBreakpoint(breakpoints).name;

  const handler = () => {
  const newBp = getCurrentBreakpoint(breakpoints);
  
  // Обновляем только если брекпоинт изменился
  if (newBp.name !== currentBpName) {
    currentBpName = newBp.name;
    applySpacingToBlockElement(element, spacing, fieldName, breakpoints);
  }
  };

  return handler;
}

/**
 * Инициализирует отслеживание брекпоинтов для элемента
 * Возвращает функцию для отписки
 */
export function watchBreakpointChanges(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): () => void {
  // Применяем начальные значения
  applySpacingToBlockElement(element, spacing, fieldName, breakpoints);

  // Создаём обработчик
  const handler = createBreakpointChangeHandler(element, spacing, fieldName, breakpoints);

  // Используем ResizeObserver для более эффективного отслеживания
  let resizeObserver: ResizeObserver | null = null;
  
  if (typeof ResizeObserver !== 'undefined') {
  resizeObserver = new ResizeObserver(() => {
    handler();
  });
  resizeObserver.observe(document.body);
  } else {
  // Fallback на window.resize
  window.addEventListener('resize', handler);
  }

  // Возвращаем функцию для отписки
  return () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  } else {
    window.removeEventListener('resize', handler);
  }
  };
}

/**
 * Получает inline стили для блока (margin напрямую, padding через CSS переменные)
 */
export function getBlockInlineStyles(
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (!spacing || Object.keys(spacing).length === 0) {
  return styles;
  }

  const currentBp = getCurrentBreakpoint(breakpoints);
  const bpData = spacing[currentBp.name] || {};

  // Margin - применяем напрямую
  // Важно: устанавливаем значение даже если оно 0, чтобы перезаписать старые значения
  const marginTop = bpData['margin-top'];
  const marginBottom = bpData['margin-bottom'];
  
  if (marginTop !== undefined) {
  styles.marginTop = `${marginTop}px`;
  }
  if (marginBottom !== undefined) {
  styles.marginBottom = `${marginBottom}px`;
  }

  // Padding - через CSS переменные (для использования внутри блока)
  // Важно: устанавливаем значение даже если оно 0, чтобы перезаписать старые значения
  const paddingTop = bpData['padding-top'];
  const paddingBottom = bpData['padding-bottom'];
  
  if (paddingTop !== undefined) {
  styles[`--${fieldName}-padding-top`] = `${paddingTop}px`;
  }
  if (paddingBottom !== undefined) {
  styles[`--${fieldName}-padding-bottom`] = `${paddingBottom}px`;
  }

  return styles;
}

