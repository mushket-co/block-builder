export type { IBlockBuilderOptions } from './BlockBuilderFacade';
export { BlockBuilderFacade as BlockBuilder } from './BlockBuilderFacade';
export type { IBlockRepository } from './core/ports/BlockRepository';
export type { IComponentRegistry } from './core/ports/ComponentRegistry';
export type {
  ICustomFieldRenderer,
  ICustomFieldRendererRegistry,
} from './core/ports/CustomFieldRenderer';
export type { IHttpClient } from './core/ports/HttpClient';
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
export { FetchHttpClient } from './infrastructure/http/FetchHttpClient';
export { MemoryComponentRegistry } from './infrastructure/registries/MemoryComponentRegistry';
export { MemoryBlockRepositoryImpl } from './infrastructure/repositories/MemoryBlockRepositoryImpl';
export { buildBlockHierarchy, cloneBlock, getAllChildren, isChildOf } from './utils/blockHelpers';
export {
  DEFAULT_BREAKPOINTS,
  generateSpacingCSS,
  generateSpacingCSSVariables,
  getSpacingValue,
  mergeSpacing,
  setSpacingValue,
  validateSpacing,
} from './utils/spacingHelpers';
export { UniversalValidator } from './utils/universalValidation';
export { setScrollLockHandlers, lockBodyScroll, unlockBodyScroll } from './utils/scrollLock';
