import { readBbThemeVarsFromClosestApp } from '../../shared/theme/bbThemeContext';
import { resolveThemeVars, UI_THEME_COLORS_DARK } from '../../shared/theme/uiTheme';

describe('bbThemeContext', () => {
  test('readBbThemeVarsFromClosestApp reads vars from .bb-app', () => {
    document.body.innerHTML = `
      <div class="bb-app" style="--bb-color-primary: #abc; --bb-color-surface: #222;">
        <div class="trigger"></div>
      </div>
    `;

    const trigger = document.querySelector('.trigger')!;
    const vars = readBbThemeVarsFromClosestApp(trigger);

    expect(vars['--bb-color-primary']).toBe('#abc');
    expect(vars['--bb-color-surface']).toBe('#222');
  });
});

describe('resolveThemeVars', () => {
  test('returns default color tokens', () => {
    expect(resolveThemeVars()['--bb-color-primary']).toBe('#2d2079');
    expect(resolveThemeVars()['--bb-color-white']).toBe('#ffffff');
    expect(resolveThemeVars()['--bb-color-surface']).toBe('#ffffff');
  });

  test('returns dark preset', () => {
    const dark = resolveThemeVars('dark');
    expect(dark['--bb-color-neutral-8']).toBe(
      UI_THEME_COLORS_DARK['--bb-color-neutral-8']
    );
    expect(dark['--bb-color-white']).toBe('#ffffff');
    expect(dark['--bb-color-surface']).toBe('#1e2228');
    expect(dark['--bb-color-danger-bg']).toBe('rgba(220, 53, 69, 0.14)');
  });

  test('merges overrides', () => {
    const vars = resolveThemeVars('default', { '--bb-color-primary': '#ff0000' });
    expect(vars['--bb-color-primary']).toBe('#ff0000');
    expect(vars['--bb-color-neutral-1']).toBe('#f8f9fa');
  });
});
