import {
  DEFAULT_BREAKPOINTS,
  ISpacingData,
  generateSpacingCSSVariables,
  generateSpacingCSS,
  getSpacingValue,
  setSpacingValue,
  validateSpacing,
  mergeSpacing
} from '../spacingHelpers';
describe('spacingHelpers', () => {
  describe('generateSpacingCSSVariables', () => {
  test('должен генерировать CSS переменные для всех брекпоинтов', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20, bottom: 20 },
      tablet: { top: 15, bottom: 15 },
      mobile: { top: 10, bottom: 10 }
    };
    const variables = generateSpacingCSSVariables(spacing);
    expect(variables).toEqual({
      '--spacing-top': '20px',
      '--spacing-bottom': '20px',
      '--spacing-top-tablet': '15px',
      '--spacing-bottom-tablet': '15px',
      '--spacing-top-mobile': '10px',
      '--spacing-bottom-mobile': '10px'
    });
  });
  test('должен использовать кастомное имя поля', () => {
    const spacing: ISpacingData = {
      desktop: { margin: 20 }
    };
    const variables = generateSpacingCSSVariables(spacing, 'custom');
    expect(variables).toHaveProperty('--custom-margin');
    expect(variables['--custom-margin']).toBe('20px');
  });
  test('должен вернуть пустой объект для пустого spacing', () => {
    const variables = generateSpacingCSSVariables({});
    expect(variables).toEqual({});
  });
  test('должен пропустить undefined и null значения', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20, bottom: undefined as any },
      mobile: { top: null as any }
    };
    const variables = generateSpacingCSSVariables(spacing);
    expect(variables).toEqual({
      '--spacing-top': '20px'
    });
  });
  test('должен обработать значение 0', () => {
    const spacing: ISpacingData = {
      desktop: { margin: 0 }
    };
    const variables = generateSpacingCSSVariables(spacing);
    expect(variables['--spacing-margin']).toBe('0px');
  });
  });
  describe('generateSpacingCSS', () => {
  test('должен генерировать CSS с медиа-запросами', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20, bottom: 20 },
      tablet: { top: 15 },
      mobile: { top: 10 }
    };
    const css = generateSpacingCSS(spacing, '.block');
    expect(css).toContain('.block {');
    expect(css).toContain('top: 20px;');
    expect(css).toContain('bottom: 20px;');
    expect(css).toContain('@media (max-width: 1199px) {');
    expect(css).toContain('top: 15px;');
    expect(css).toContain('@media (max-width: 767px) {');
    expect(css).toContain('top: 10px;');
  });
  test('должен использовать кастомный селектор', () => {
    const spacing: ISpacingData = {
      desktop: { margin: 20 }
    };
    const css = generateSpacingCSS(spacing, '.custom-selector');
    expect(css).toContain('.custom-selector {');
  });
  test('должен вернуть пустую строку для пустого spacing', () => {
    const css = generateSpacingCSS({});
    expect(css).toBe('');
  });
  test('не должен генерировать медиа-запрос для desktop', () => {
    const spacing: ISpacingData = {
      desktop: { margin: 20 }
    };
    const css = generateSpacingCSS(spacing);
    expect(css).not.toContain('@media');
    expect(css).toContain('.block {');
    expect(css).toContain('margin: 20px;');
  });
  test('должен пропустить брекпоинты без значений', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20 },
      tablet: {}
    };
    const css = generateSpacingCSS(spacing);
    expect(css).not.toContain('@media (max-width: 1199px)');
  });
  test('должен обработать несколько типов отступов', () => {
    const spacing: ISpacingData = {
      desktop: {
        'margin-top': 20,
        'padding-bottom': 10,
        'margin-left': 15
      }
    };
    const css = generateSpacingCSS(spacing);
    expect(css).toContain('margin-top: 20px;');
    expect(css).toContain('padding-bottom: 10px;');
    expect(css).toContain('margin-left: 15px;');
  });
  });
  describe('getSpacingValue', () => {
  const spacing: ISpacingData = {
    desktop: { top: 20, bottom: 30 },
    mobile: { top: 10 }
  };
  test('должен получить значение для существующего брекпоинта и типа', () => {
    const value = getSpacingValue(spacing, 'desktop', 'top');
    expect(value).toBe(20);
  });
  test('должен вернуть undefined для несуществующего брекпоинта', () => {
    const value = getSpacingValue(spacing, 'tablet', 'top');
    expect(value).toBeUndefined();
  });
  test('должен вернуть undefined для несуществующего типа', () => {
    const value = getSpacingValue(spacing, 'desktop', 'left' as any);
    expect(value).toBeUndefined();
  });
  test('должен вернуть undefined для пустого spacing', () => {
    const value = getSpacingValue({}, 'desktop', 'top');
    expect(value).toBeUndefined();
  });
  test('должен получить значение 0', () => {
    const spacingWithZero: ISpacingData = {
      desktop: { margin: 0 }
    };
    const value = getSpacingValue(spacingWithZero, 'desktop', 'margin');
    expect(value).toBe(0);
  });
  });
  describe('setSpacingValue', () => {
  test('должен установить значение для нового брекпоинта', () => {
    const spacing: ISpacingData = {};
    const updated = setSpacingValue(spacing, 'desktop', 'top', 20);
    expect(updated.desktop.top).toBe(20);
  });
  test('должен обновить существующее значение', () => {
    const spacing: ISpacingData = {
      desktop: { top: 10 }
    };
    const updated = setSpacingValue(spacing, 'desktop', 'top', 20);
    expect(updated.desktop.top).toBe(20);
  });
  test('должен добавить новый тип к существующему брекпоинту', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20 }
    };
    const updated = setSpacingValue(spacing, 'desktop', 'bottom', 30);
    expect(updated.desktop.top).toBe(20);
    expect(updated.desktop.bottom).toBe(30);
  });
  test('не должен изменять оригинальный объект', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20 }
    };
    const updated = setSpacingValue(spacing, 'desktop', 'top', 30);
    expect(spacing.desktop.top).toBe(20);
    expect(updated.desktop.top).toBe(30);
  });
  test('должен установить значение 0', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20 }
    };
    const updated = setSpacingValue(spacing, 'desktop', 'top', 0);
    expect(updated.desktop.top).toBe(0);
  });
  });
  describe('validateSpacing', () => {
  test('должен пройти валидацию для корректных данных', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20, bottom: 30 },
      mobile: { top: 10 }
    };
    const result = validateSpacing(spacing);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  test('должен вернуть ошибку если spacing не объект', () => {
    const result = validateSpacing(null as any);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Spacing должен быть объектом');
  });
  test('должен вернуть ошибку для значения меньше минимума', () => {
    const spacing: ISpacingData = {
      desktop: { top: -10 }
    };
    const result = validateSpacing(spacing, 0, 500);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('меньше минимума');
  });
  test('должен вернуть ошибку для значения больше максимума', () => {
    const spacing: ISpacingData = {
      desktop: { top: 600 }
    };
    const result = validateSpacing(spacing, 0, 500);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('больше максимума');
  });
  test('должен вернуть ошибку если значение не число', () => {
    const spacing: ISpacingData = {
      desktop: { top: 'invalid' as any }
    };
    const result = validateSpacing(spacing);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('должно быть числом');
  });
  test('должен вернуть ошибку если данные брекпоинта не объект', () => {
    const spacing: any = {
      desktop: 'not-an-object'
    };
    const result = validateSpacing(spacing);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('должны быть объектом');
  });
  test('должен пропустить undefined и null значения', () => {
    const spacing: ISpacingData = {
      desktop: { top: 20, bottom: undefined as any },
      mobile: { left: null as any }
    };
    const result = validateSpacing(spacing);
    expect(result.valid).toBe(true);
  });
  test('должен принять значение 0', () => {
    const spacing: ISpacingData = {
      desktop: { top: 0 }
    };
    const result = validateSpacing(spacing);
    expect(result.valid).toBe(true);
  });
  test('должен использовать кастомные min и max', () => {
    const spacing: ISpacingData = {
      desktop: { top: 50 }
    };
    const result = validateSpacing(spacing, 10, 30);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('больше максимума (30)');
  });
  test('должен вернуть все ошибки одновременно', () => {
    const spacing: ISpacingData = {
      desktop: { top: -10, bottom: 600 }
    };
    const result = validateSpacing(spacing, 0, 500);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });
  });
  describe('mergeSpacing', () => {
  test('должен объединить два spacing объекта', () => {
    const spacing1: ISpacingData = {
      desktop: { top: 20 }
    };
    const spacing2: ISpacingData = {
      mobile: { top: 10 }
    };
    const merged = mergeSpacing(spacing1, spacing2);
    expect(merged.desktop.top).toBe(20);
    expect(merged.mobile.top).toBe(10);
  });
  test('последний spacing должен иметь приоритет', () => {
    const spacing1: ISpacingData = {
      desktop: { top: 20 }
    };
    const spacing2: ISpacingData = {
      desktop: { top: 30 }
    };
    const merged = mergeSpacing(spacing1, spacing2);
    expect(merged.desktop.top).toBe(30);
  });
  test('должен объединить несколько spacing объектов', () => {
    const spacing1: ISpacingData = {
      desktop: { top: 20 }
    };
    const spacing2: ISpacingData = {
      tablet: { top: 15 }
    };
    const spacing3: ISpacingData = {
      mobile: { top: 10 }
    };
    const merged = mergeSpacing(spacing1, spacing2, spacing3);
    expect(merged.desktop.top).toBe(20);
    expect(merged.tablet.top).toBe(15);
    expect(merged.mobile.top).toBe(10);
  });
  test('должен объединить разные типы отступов', () => {
    const spacing1: ISpacingData = {
      desktop: { top: 20, bottom: 30 }
    };
    const spacing2: ISpacingData = {
      desktop: { left: 15 }
    };
    const merged = mergeSpacing(spacing1, spacing2);
    expect(merged.desktop.top).toBe(20);
    expect(merged.desktop.bottom).toBe(30);
    expect(merged.desktop.left).toBe(15);
  });
  test('должен пропустить null и undefined spacing', () => {
    const spacing1: ISpacingData = {
      desktop: { top: 20 }
    };
    const merged = mergeSpacing(spacing1, null as any, undefined as any);
    expect(merged.desktop.top).toBe(20);
  });
  test('должен вернуть пустой объект для пустых аргументов', () => {
    const merged = mergeSpacing();
    expect(merged).toEqual({});
  });
  test('не должен изменять оригинальные объекты', () => {
    const spacing1: ISpacingData = {
      desktop: { top: 20 }
    };
    const spacing2: ISpacingData = {
      desktop: { bottom: 30 }
    };
    const merged = mergeSpacing(spacing1, spacing2);
    merged.desktop.top = 99;
    expect(spacing1.desktop.top).toBe(20);
    expect(spacing2.desktop).not.toHaveProperty('top');
  });
  });
  describe('DEFAULT_BREAKPOINTS', () => {
  test('должен иметь правильную структуру', () => {
    expect(DEFAULT_BREAKPOINTS).toHaveLength(3);
    
    expect(DEFAULT_BREAKPOINTS[0].name).toBe('desktop');
    expect(DEFAULT_BREAKPOINTS[0].maxWidth).toBeUndefined();
    
    expect(DEFAULT_BREAKPOINTS[1].name).toBe('tablet');
    expect(DEFAULT_BREAKPOINTS[1].maxWidth).toBe(1199);
    
    expect(DEFAULT_BREAKPOINTS[2].name).toBe('mobile');
    expect(DEFAULT_BREAKPOINTS[2].maxWidth).toBe(767);
  });
  });
});