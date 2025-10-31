/**
 * Naberika - Блочный конструктор для no-code разработки
 *
 * Главный API для использования пакета
 *
 * Стили импортируются автоматически из ui/styles
 */

// Импортируем стили для генерации CSS файла
import './ui/styles/index.scss';

// Главный класс - весь доступ к функционалу через него
export { BlockBuilderFacade as BlockBuilder } from './BlockBuilderFacade';
export type { IBlockBuilderOptions } from './BlockBuilderFacade';

// Лицензирование
export { License, TLicenseType } from './core/entities/License';
export type { ILicenseConfig } from './core/entities/License';
export { LicenseService } from './core/services/LicenseService';
export type { ILicenseInfo } from './core/services/LicenseService';
export { LicenseFeatureChecker, LicenseFeature } from './core/services/LicenseFeatureChecker';

// Типы для конфигурации блоков и работы с API
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
