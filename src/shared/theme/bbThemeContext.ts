import { UI_THEME_COLORS_DEFAULT } from './uiTheme';

/** Non-color tokens defined in `_variables.scss` on `.bb-app`. */
const BB_LAYOUT_CSS_VARS = [
  '--bb-spacing-xs',
  '--bb-spacing-sm',
  '--bb-spacing-md',
  '--bb-spacing-lg',
  '--bb-spacing-xl',
  '--bb-spacing-2xl',
  '--bb-radius-sm',
  '--bb-radius-md',
  '--bb-radius-lg',
  '--bb-font-family',
  '--bb-font-size-xs',
  '--bb-font-size-sm',
  '--bb-font-size-md',
  '--bb-font-size-lg',
  '--bb-font-size-xl',
  '--bb-shadow-sm',
  '--bb-shadow-md',
  '--bb-shadow-lg',
  '--bb-shadow-sm-light',
  '--bb-shadow-primary',
  '--bb-transition-fast',
  '--bb-transition-base',
  '--bb-transition-slow',
  '--bb-z-index-dropdown',
  '--bb-z-index-modal',
  '--bb-z-index-tooltip',
  '--bb-form-control-height',
  '--bb-form-control-border-width',
  '--bb-form-control-padding-x',
  '--bb-form-control-radius',
  '--bb-form-control-font-size',
  '--bb-form-label-font-size',
  '--bb-form-label-font-weight',
  '--bb-form-error-font-size',
  '--bb-modal-max-width',
  '--bb-modal-radius',
  '--bb-btn-padding-y',
  '--bb-btn-padding-x',
] as const;

export const BB_THEME_CSS_VARS = [
  ...Object.keys(UI_THEME_COLORS_DEFAULT),
  '--bb-color-surface',
  ...BB_LAYOUT_CSS_VARS,
] as const;

/** Read resolved Block Builder theme variables from `.bb-app` (for teleported UI). */
export function readBbThemeVars(source: Element): Record<string, string> {
  const computed = getComputedStyle(source);
  const vars: Record<string, string> = {};

  for (const name of BB_THEME_CSS_VARS) {
    const value = computed.getPropertyValue(name).trim();
    if (value) {
      vars[name] = value;
    }
  }

  return vars;
}

export function readBbThemeVarsFromClosestApp(
  element: Element | null | undefined
): Record<string, string> {
  const bbApp = element?.closest('.bb-app');
  if (!bbApp) {
    return {};
  }

  return readBbThemeVars(bbApp);
}
