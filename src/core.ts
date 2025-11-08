/**
 * Block Builder - Core API Only (without UI)
 * 
 * Этот entry point предоставляет только API без UI компонентов
 * Идеально для тех, кто хочет создать свой UI
 */

export { BlockBuilderFacade as BlockBuilder } from './BlockBuilderFacade';
export type { IBlockBuilderOptions } from './BlockBuilderFacade';

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

export type { IBlockRepository } from './core/ports/BlockRepository';
export type { IComponentRegistry } from './core/ports/ComponentRegistry';
export type { IHttpClient } from './core/ports/HttpClient';
export type { ICustomFieldRenderer, ICustomFieldRendererRegistry } from './core/ports/CustomFieldRenderer';

export { MemoryBlockRepositoryImpl } from './infrastructure/repositories/MemoryBlockRepositoryImpl';
export { MemoryComponentRegistry } from './infrastructure/registries/MemoryComponentRegistry';
export { FetchHttpClient } from './infrastructure/http/FetchHttpClient';

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
