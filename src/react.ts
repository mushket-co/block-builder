export type { IBlockBuilderFactoryDependencies } from './BlockBuilderFactory';
export { BlockBuilderFactory } from './BlockBuilderFactory';
export * from './core/ports/CustomFieldRenderer';
export type * from './core/types';
export * from './core/use-cases/ApiSelectUseCase';
export * from './core/use-cases/BlockManagementUseCase';
export * from './core/use-cases/ComponentManagementUseCase';
export * from './infrastructure/http/FetchHttpClient';
export * from './infrastructure/registries/CustomFieldRendererRegistry';
export * from './infrastructure/registries/MemoryComponentRegistry';
export * from './infrastructure/repositories/MemoryBlockRepositoryImpl';
export { BlockBuilder, BlockBuilderComponent } from './react/components/BlockBuilder';
export type { IBlockBuilderProps } from './react/types/blockBuilder';
export type { ICreateBlockManagementUseCaseOptions } from './utils/createBlockManagementUseCase';
export { createBlockManagementUseCase } from './utils/createBlockManagementUseCase';
export {
  canRenderReactBlock,
  canRenderVueBlock,
  enrichBlockForDisplay,
  prepareBlocksForDisplay,
  resolveReactComponentForBlock,
  resolveVueComponentForBlock,
} from './utils/blockDisplayHelpers';
export { seedRepositoryFromBlocks } from './utils/blockRepositorySync';
export { getDefaultBreakpoint } from './utils/breakpointHelpers';
export {
  enableViewportBreakpointDetection,
  isClient,
  isServer,
  isViewportBreakpointDetectionEnabled,
  resetViewportBreakpointDetection,
} from './utils/ssr';
export type { IUiStrings, TUiLocale } from './shared/i18n/uiStrings';
export { UI_STRINGS_RU, UI_STRINGS_EN, resolveUiStrings } from './shared/i18n/uiStrings';
