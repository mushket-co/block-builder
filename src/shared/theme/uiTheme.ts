/** Public CSS color tokens for Block Builder UI theming. */
export type TUiTheme = 'default' | 'dark';

export type IUiThemeVarName = `--bb-${string}`;

export type IUiThemeVars = Partial<Record<IUiThemeVarName, string>>;

/** Color palette — spacing/radius tokens are set in CSS on `.bb-app`. */
export const UI_THEME_COLORS_DEFAULT = {
  '--bb-color-primary': '#2d2079',
  '--bb-color-primary-dark': '#120c39',
  '--bb-color-primary-light': '#e0f0ff',
  '--bb-color-primary-alpha-10': 'rgba(45, 32, 121, 0.1)',
  '--bb-color-primary-alpha-15': 'rgba(45, 32, 121, 0.15)',
  '--bb-color-primary-alpha-20': 'rgba(45, 32, 121, 0.2)',
  '--bb-color-primary-alpha-30': 'rgba(45, 32, 121, 0.3)',
  '--bb-color-white': '#ffffff',
  '--bb-color-surface': '#ffffff',
  '--bb-color-black': '#000000',
  '--bb-color-neutral-1': '#f8f9fa',
  '--bb-color-neutral-2': '#e9ecef',
  '--bb-color-neutral-3': '#dddddd',
  '--bb-color-neutral-4': '#ced4da',
  '--bb-color-neutral-5': '#999999',
  '--bb-color-neutral-6': '#666666',
  '--bb-color-neutral-7': '#495057',
  '--bb-color-neutral-8': '#0e2133',
  '--bb-color-neutral-8-rgb': '44, 62, 80',
  '--bb-color-neutral-alpha-30': 'rgba(153, 153, 153, 0.3)',
  '--bb-color-neutral-alpha-50': 'rgba(153, 153, 153, 0.5)',
  '--bb-color-dark': '#111243',
  '--bb-color-dark-alpha-20': 'rgba(17, 18, 67, 0.2)',
  '--bb-color-secondary': '#6c757d',
  '--bb-color-secondary-dark': '#5a6268',
  '--bb-color-danger': '#dc3545',
  '--bb-color-danger-dark': '#c82333',
  '--bb-color-danger-light': '#feeeee',
  '--bb-color-danger-border': '#f5c6cb',
  '--bb-color-danger-bg': '#fff5f5',
  '--bb-color-danger-alpha-10': 'rgba(220, 53, 69, 0.1)',
  '--bb-color-success': '#28a745',
  '--bb-color-success-dark': '#218838',
  '--bb-color-success-alpha-30': 'rgba(40, 167, 69, 0.3)',
  '--bb-color-success-alpha-40': 'rgba(16, 185, 129, 0.4)',
  '--bb-color-warning': '#ffc107',
  '--bb-color-warning-border': '#ff9800',
  '--bb-color-warning-bg': '#fff3cd',
  '--bb-color-warning-text': '#856404',
  '--bb-color-info': '#17a2b8',
  '--bb-color-overlay': 'rgba(0, 0, 0, 0.5)',
  '--bb-color-overlay-medium': 'rgba(0, 0, 0, 0.7)',
  '--bb-color-overlay-dark': 'rgba(0, 0, 0, 0.9)',
  '--bb-color-overlay-alpha-10': 'rgba(0, 0, 0, 0.1)',
  '--bb-color-code-1': '#282c34',
  '--bb-color-code-2': '#abb2bf',
  '--bb-color-gradient-1': '#667eea',
  '--bb-color-gradient-2': '#764ba2',
  '--bb-color-gradient-success-1': '#10b981',
  '--bb-color-gradient-success-2': '#059669',
} as const satisfies IUiThemeVars;

export type IUiThemeColorKey = keyof typeof UI_THEME_COLORS_DEFAULT;

export const UI_THEME_COLORS_DARK: IUiThemeVars = {
  '--bb-color-primary': '#8ab4f8',
  '--bb-color-primary-dark': '#669df6',
  '--bb-color-primary-light': '#1e3a5f',
  '--bb-color-primary-alpha-10': 'rgba(138, 180, 248, 0.15)',
  '--bb-color-primary-alpha-15': 'rgba(138, 180, 248, 0.22)',
  '--bb-color-surface': '#1e2228',
  '--bb-color-neutral-1': '#252a31',
  '--bb-color-neutral-2': '#2f343c',
  '--bb-color-neutral-3': '#3c4043',
  '--bb-color-neutral-4': '#5f6368',
  '--bb-color-neutral-5': '#80868b',
  '--bb-color-neutral-6': '#9aa0a6',
  '--bb-color-neutral-7': '#bdc1c6',
  '--bb-color-neutral-8': '#e8eaed',
  '--bb-color-neutral-8-rgb': '232, 234, 237',
  '--bb-color-overlay': 'rgba(0, 0, 0, 0.72)',
  '--bb-color-danger-light': 'rgba(242, 139, 130, 0.16)',
  '--bb-color-danger-border': 'rgba(242, 139, 130, 0.45)',
  '--bb-color-danger-bg': 'rgba(220, 53, 69, 0.14)',
  '--bb-color-danger-alpha-10': 'rgba(242, 139, 130, 0.2)',
  '--bb-color-warning-bg': 'rgba(255, 193, 7, 0.14)',
};

export function resolveThemeVars(
  theme?: TUiTheme,
  overrides?: IUiThemeVars
): Record<IUiThemeVarName, string> {
  const preset = theme === 'dark' ? UI_THEME_COLORS_DARK : {};
  return {
    ...UI_THEME_COLORS_DEFAULT,
    ...preset,
    ...overrides,
  };
}
