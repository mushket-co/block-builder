/**
 * Утилиты для автоматического добавления spacing полей в формы блоков
 */

import { IFormFieldConfig, IBlockSpacingOptions, TSpacingType } from '../core/types/form';
import { LicenseFeatureChecker } from '../core/services/LicenseFeatureChecker';

/**
 * Генерирует spacing поле на основе опций блока
 * @param options - Опции spacing блока
 * @param licenseFeatureChecker - Опциональный checker для проверки лицензии (для ограничения кастомных брекпоинтов)
 */
export function generateSpacingField(
  options?: IBlockSpacingOptions,
  licenseFeatureChecker?: LicenseFeatureChecker
): IFormFieldConfig | null {
  // Если spacing явно выключен
  if (options?.enabled === false) {
  return null;
  }

  // Определяем типы отступов
  const spacingTypes: TSpacingType[] = options?.spacingTypes || [
  'padding-top',
  'padding-bottom',
  'margin-top',
  'margin-bottom'
  ];

  // Обработка кастомных брекпоинтов по лицензии
  // В FREE версии кастомные брекпоинты недоступны - используем только дефолтные
  let breakpoints = options?.config?.breakpoints;

  // ВСЕГДА проверяем лицензию перед использованием кастомных брекпоинтов
  if (breakpoints && breakpoints.length > 0) {
    // Если есть кастомные брекпоинты, проверяем лицензию
    if (!licenseFeatureChecker || !licenseFeatureChecker.hasAdvancedSpacing()) {
      // В FREE версии или если checker отсутствует - игнорируем кастомные брекпоинты
      breakpoints = undefined;
    }
  }

  // Базовая конфигурация
  const spacingConfig = {
    spacingTypes,
    min: options?.config?.min ?? 0,
    max: options?.config?.max ?? 200,
    step: options?.config?.step ?? 4,
    breakpoints
  };

  // Генерируем defaultValue динамически на основе брекпоинтов
  const defaultValue: Record<string, Record<TSpacingType, number>> = {};

  // Определяем какие брекпоинты использовать
  const hasCustomBreakpoints = spacingConfig.breakpoints && spacingConfig.breakpoints.length > 0;

  // Дефолтные брекпоинты
  const defaultBreakpoints = ['desktop', 'tablet', 'mobile'];

  // Список брекпоинтов для инициализации
  const breakpointsToInit = hasCustomBreakpoints
  ? spacingConfig.breakpoints!.map(bp => bp.name)
  : defaultBreakpoints;

  // Инициализируем значения для всех брекпоинтов
  breakpointsToInit.forEach(bpName => {
  defaultValue[bpName] = {
    'padding-top': 0,
    'padding-bottom': 0,
    'margin-top': 0,
    'margin-bottom': 0
  };
  });

  return {
  field: 'spacing',
  label: 'Отступы блока',
  type: 'spacing',
  spacingConfig,
  defaultValue
  };
}

/**
 * Добавляет spacing поле в массив полей на основе spacingOptions блока
 * Явные поля с типом 'spacing' в fields игнорируются и удаляются
 * @param fields - Массив полей конфигурации блока
 * @param spacingOptions - Опции spacing блока (если enabled !== false, spacing добавляется автоматически)
 * @param licenseFeatureChecker - Опциональный checker для проверки лицензии
 */
export function addSpacingFieldToFields(
  fields: IFormFieldConfig[],
  spacingOptions?: IBlockSpacingOptions,
  licenseFeatureChecker?: LicenseFeatureChecker
): IFormFieldConfig[] {
  // Удаляем все явные spacing поля из fields (они игнорируются)
  const fieldsWithoutSpacing = fields.filter(field => field.type !== 'spacing');

  // Проверяем, нужно ли добавлять spacing поле
  // Если spacingOptions.enabled === false, spacing не добавляется
  if (spacingOptions?.enabled === false) {
    return fieldsWithoutSpacing;
  }

  // Генерируем spacing поле из spacingOptions
  const spacingField = generateSpacingField(spacingOptions, licenseFeatureChecker);

  if (!spacingField) {
    // Spacing не нужен или выключен
    return fieldsWithoutSpacing;
  }

  // Добавляем сгенерированное spacing поле в конец массива полей
  return [...fieldsWithoutSpacing, spacingField];
}

/**
 * Обработка конфигурации блока с автоматическим добавлением spacing
 */
export function processBlockConfigWithSpacing(
  blockConfig: {
  fields?: IFormFieldConfig[];
  spacingOptions?: IBlockSpacingOptions;
  [key: string]: any;
  }
): typeof blockConfig {
  if (!blockConfig.fields) {
  return blockConfig;
  }

  return {
  ...blockConfig,
  fields: addSpacingFieldToFields(blockConfig.fields, blockConfig.spacingOptions)
  };
}

/**
 * Применяет spacing к конфигурациям всех блоков
 */
export function applySpacingToAllBlockConfigs(
  blockConfigs: Record<string, any>,
  globalSpacingOptions?: IBlockSpacingOptions
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, config] of Object.entries(blockConfigs)) {
  // Используем локальные опции блока или глобальные
  const spacingOptions = config.spacingOptions ?? globalSpacingOptions;

  result[key] = processBlockConfigWithSpacing({
    ...config,
    spacingOptions
  });
  }

  return result;
}

