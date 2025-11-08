/**
 * Naberika - Блочный конструктор для no-code разработки
 *
 * Главный API для использования пакета
 *
 * Стили импортируются автоматически из ui/styles
 */

import './ui/styles/index.scss';

export type { IBlockBuilderOptions } from './BlockBuilderFacade';
export { BlockBuilderFacade as BlockBuilder } from './BlockBuilderFacade';
export type { ILicenseConfig } from './core/entities/License';
export { License, TLicenseType } from './core/entities/License';
export { LicenseFeature, LicenseFeatureChecker } from './core/services/LicenseFeatureChecker';
export type { ILicenseInfo } from './core/services/LicenseService';
export { LicenseService } from './core/services/LicenseService';
export type {
  IBlock,
  IBlockDto,
  IBlockMetadata,
  ICreateBlockDto,
  IUpdateBlockDto,
} from './core/types/block';
export type { TBlockId } from './core/types/common';
export type {
  IApiRequestParams,
  IApiSelectConfig,
  IApiSelectItem,
  IApiSelectResponse,
  IFieldValidationConfig,
  IFormFieldConfig,
  IFormGenerationConfig,
  TFieldType,
  THttpMethod,
} from './core/types/form';
export type {
  IValidationResult,
  IValidationRule,
  TValidationRuleType,
} from './core/types/validation';
