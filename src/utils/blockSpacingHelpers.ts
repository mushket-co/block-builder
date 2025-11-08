import { LicenseFeatureChecker } from '../core/services/LicenseFeatureChecker';
import { IBlockSpacingOptions, IFormFieldConfig, TSpacingType } from '../core/types/form';

export function generateSpacingField(
  options?: IBlockSpacingOptions,
  _licenseFeatureChecker?: LicenseFeatureChecker
): IFormFieldConfig | null {
  if (options?.enabled === false) {
    return null;
  }
  const spacingTypes: TSpacingType[] = options?.spacingTypes || [
    'padding-top',
    'padding-bottom',
    'margin-top',
    'margin-bottom',
  ];
  const breakpoints = options?.config?.breakpoints;
  const spacingConfig = {
    spacingTypes,
    min: options?.config?.min ?? 0,
    max: options?.config?.max ?? 200,
    step: options?.config?.step ?? 4,
    breakpoints,
  };
  const defaultValue: Record<string, Record<TSpacingType, number>> = {};
  const hasCustomBreakpoints = spacingConfig.breakpoints && spacingConfig.breakpoints.length > 0;
  const defaultBreakpoints = ['desktop', 'tablet', 'mobile'];
  const breakpointsToInit =
    hasCustomBreakpoints && spacingConfig.breakpoints
      ? spacingConfig.breakpoints.map(bp => bp.name)
      : defaultBreakpoints;
  breakpointsToInit.forEach(bpName => {
    defaultValue[bpName] = {
      'padding-top': 0,
      'padding-bottom': 0,
      'margin-top': 0,
      'margin-bottom': 0,
    };
  });
  return {
    field: 'spacing',
    label: 'Отступы блока',
    type: 'spacing',
    spacingConfig,
    defaultValue,
  };
}
export function addSpacingFieldToFields(
  fields: IFormFieldConfig[],
  spacingOptions?: IBlockSpacingOptions,
  licenseFeatureChecker?: LicenseFeatureChecker
): IFormFieldConfig[] {
  const fieldsWithoutSpacing = fields.filter(field => field.type !== 'spacing');
  if (spacingOptions?.enabled === false) {
    return fieldsWithoutSpacing;
  }
  const spacingField = generateSpacingField(spacingOptions, licenseFeatureChecker);
  if (!spacingField) {
    return fieldsWithoutSpacing;
  }
  return [...fieldsWithoutSpacing, spacingField];
}
export function processBlockConfigWithSpacing(blockConfig: {
  fields?: IFormFieldConfig[];
  spacingOptions?: IBlockSpacingOptions;
  [key: string]: unknown;
}): typeof blockConfig {
  if (!blockConfig.fields) {
    return blockConfig;
  }
  return {
    ...blockConfig,
    fields: addSpacingFieldToFields(blockConfig.fields, blockConfig.spacingOptions),
  };
}
export function applySpacingToAllBlockConfigs(
  blockConfigs: Record<
    string,
    { fields?: IFormFieldConfig[]; spacingOptions?: IBlockSpacingOptions; [key: string]: unknown }
  >,
  globalSpacingOptions?: IBlockSpacingOptions
): Record<
  string,
  { fields?: IFormFieldConfig[]; spacingOptions?: IBlockSpacingOptions; [key: string]: unknown }
> {
  const result: Record<
    string,
    { fields?: IFormFieldConfig[]; spacingOptions?: IBlockSpacingOptions; [key: string]: unknown }
  > = {};
  for (const [key, config] of Object.entries(blockConfigs)) {
    const spacingOptions = config.spacingOptions ?? globalSpacingOptions;
    result[key] = processBlockConfigWithSpacing({
      ...config,
      spacingOptions,
    });
  }
  return result;
}
