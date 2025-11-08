/**
 * Naberika - Блочный конструктор для no-code разработки
 *
 * Главный API для использования пакета
 *
 * Стили импортируются автоматически из ui/styles
 */

import './ui/styles/index.scss';

export { BlockBuilderFacade as BlockBuilder } from './BlockBuilderFacade';
export type { IBlockBuilderOptions } from './BlockBuilderFacade';

export { License, TLicenseType } from './core/entities/License';
export type { ILicenseConfig } from './core/entities/License';
export { LicenseService } from './core/services/LicenseService';
export type { ILicenseInfo } from './core/services/LicenseService';
export { LicenseFeatureChecker, LicenseFeature } from './core/services/LicenseFeatureChecker';

export type {
  IBlock,
  IBlockMetadata,
  IBlockDto,
  ICreateBlockDto,
  IUpdateBlockDto
} from './core/types/block';
export type { TBlockId } from './core/types/common';
export type {
  IFormFieldConfig,
  IFieldValidationConfig,
  IFormGenerationConfig,
  TFieldType,
  IApiSelectConfig,
  IApiSelectItem,
  IApiSelectResponse,
  IApiRequestParams,
  THttpMethod
} from './core/types/form';
export type { IValidationRule, TValidationRuleType, IValidationResult } from './core/types/validation';
