import { IBreakpoint } from '../core/types/form';
import { DEFAULT_BREAKPOINTS, ISpacingData } from './spacingHelpers';
export function getCurrentBreakpoint(
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): IBreakpoint {
  const width = window.innerWidth;
  
  const sortedBreakpoints = [...breakpoints].sort((a, b) => {
  if (a.maxWidth === undefined) return 1;
  if (b.maxWidth === undefined) return -1;
  return a.maxWidth - b.maxWidth;
  });
  for (const bp of sortedBreakpoints) {
  if (bp.maxWidth === undefined) {
    return bp;
  }
  if (width <= bp.maxWidth) {
    return bp;
  }
  }
  return breakpoints.find(bp => bp.maxWidth === undefined) || breakpoints[0];
}
export function applyMarginToElement(
  element: HTMLElement,
  spacing: ISpacingData,
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): void {
  const currentBp = getCurrentBreakpoint(breakpoints);
  const bpData = spacing[currentBp.name] || {};
  const marginTop = bpData['margin-top'];
  const marginBottom = bpData['margin-bottom'];
  
  element.style.marginTop = marginTop !== undefined ? `${marginTop}px` : '';
  element.style.marginBottom = marginBottom !== undefined ? `${marginBottom}px` : '';
}
export function setPaddingCSSVariables(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): void {
  const currentBp = getCurrentBreakpoint(breakpoints);
  const bpData = spacing[currentBp.name] || {};
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
export function applySpacingToBlockElement(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): void {
  if (!spacing || Object.keys(spacing).length === 0) {
  return;
  }
  applyMarginToElement(element, spacing, breakpoints);
  
  setPaddingCSSVariables(element, spacing, fieldName, breakpoints);
}
export function createBreakpointChangeHandler(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): () => void {
  let currentBpName = getCurrentBreakpoint(breakpoints).name;
  const handler = () => {
  const newBp = getCurrentBreakpoint(breakpoints);
  
  if (newBp.name !== currentBpName) {
    currentBpName = newBp.name;
    applySpacingToBlockElement(element, spacing, fieldName, breakpoints);
  }
  };
  return handler;
}
export function watchBreakpointChanges(
  element: HTMLElement,
  spacing: ISpacingData,
  fieldName: string = 'spacing',
  breakpoints: IBreakpoint[] = DEFAULT_BREAKPOINTS
): () => void {
  applySpacingToBlockElement(element, spacing, fieldName, breakpoints);
  const handler = createBreakpointChangeHandler(element, spacing, fieldName, breakpoints);
  let resizeObserver: ResizeObserver | null = null;
  
  if (typeof ResizeObserver !== 'undefined') {
  resizeObserver = new ResizeObserver(() => {
    handler();
  });
  resizeObserver.observe(document.body);
  } else {
  window.addEventListener('resize', handler);
  }
  return () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  } else {
    window.removeEventListener('resize', handler);
  }
  };
}
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
  const marginTop = bpData['margin-top'];
  const marginBottom = bpData['margin-bottom'];
  
  if (marginTop !== undefined) {
  styles.marginTop = `${marginTop}px`;
  }
  if (marginBottom !== undefined) {
  styles.marginBottom = `${marginBottom}px`;
  }
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