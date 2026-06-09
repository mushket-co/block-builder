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
export { default as ApiSelectField } from './vue/components/ApiSelectField.vue';
export { default as BlockBuilderComponent } from './vue/components/BlockBuilder.vue';
export { default as BlockComponent } from './vue/components/BlockComponent.vue';
export { default as BlockProperties } from './vue/components/BlockProperties.vue';
export { default as RepeaterControl } from './vue/components/RepeaterControl.vue';
export { default as SpacingControl } from './vue/components/SpacingControl.vue';
export type { ICreateBlockManagementUseCaseOptions } from './utils/createBlockManagementUseCase';
export { createBlockManagementUseCase } from './utils/createBlockManagementUseCase';
export {
  canRenderVueBlock,
  enrichBlockForDisplay,
  prepareBlocksForDisplay,
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
