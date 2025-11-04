/**
 * Block Builder - Core API Only (without UI)
 * 
 * Этот entry point предоставляет только API без UI компонентов
 * Идеально для тех, кто хочет создать свой UI
 */

// Главный класс - весь доступ к функционалу через него
export { BlockBuilderFacade as BlockBuilder } from './BlockBuilderFacade';
export type { IBlockBuilderOptions } from './BlockBuilderFacade';

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

// Core Ports для расширения функциональности
export type { IBlockRepository } from './core/ports/BlockRepository';
export type { IComponentRegistry } from './core/ports/ComponentRegistry';
export type { IHttpClient } from './core/ports/HttpClient';
export type { ICustomFieldRenderer, ICustomFieldRendererRegistry } from './core/ports/CustomFieldRenderer';

// Infrastructure для кастомизации (опционально)
export { MemoryBlockRepositoryImpl } from './infrastructure/repositories/MemoryBlockRepositoryImpl';
export { MemoryComponentRegistry } from './infrastructure/registries/MemoryComponentRegistry';
export { FetchHttpClient } from './infrastructure/http/FetchHttpClient';

// Utils для работы с блоками
export { cloneBlock, buildBlockHierarchy, getAllChildren, isChildOf } from './utils/blockHelpers';
export {
  generateSpacingCSSVariables,
  generateSpacingCSS,
  getSpacingValue,
  setSpacingValue,
  validateSpacing,
  mergeSpacing,
  DEFAULT_BREAKPOINTS
} from './utils/spacingHelpers';
export { UniversalValidator } from './utils/universalValidation';
