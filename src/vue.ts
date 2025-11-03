/**
 * Vue3 компоненты для BlockBuilder
 * Используйте этот модуль если работаете с Vue3
 */

// Vue компоненты (оставляем из src, так как их нужно обрабатывать через vue-loader/vite)
export { default as BlockBuilderComponent } from './ui/components/BlockBuilder.vue'
export { default as BlockComponent } from './ui/components/BlockComponent.vue'
export { default as BlockProperties } from './ui/components/BlockProperties.vue'
export { default as SpacingControl } from './ui/components/SpacingControl.vue'
export { default as RepeaterControl } from './ui/components/RepeaterControl.vue'
export { default as ApiSelectField } from './ui/components/ApiSelectField.vue'

// Core для использования в Vue компонентах - используем из исходников для правильного резолвинга
export * from './core/use-cases/BlockManagementUseCase'
export * from './core/use-cases/ComponentManagementUseCase'
export * from './core/use-cases/ApiSelectUseCase'
export * from './infrastructure/repositories/MemoryBlockRepositoryImpl'
export * from './infrastructure/registries/MemoryComponentRegistry'
export * from './infrastructure/registries/CustomFieldRendererRegistry'
export * from './infrastructure/http/FetchHttpClient'

// Ports
export * from './core/ports/CustomFieldRenderer'

// Utils helpers - реэкспортируем через явный импорт, чтобы избежать проблем с резолвингом
export { createBlockManagementUseCase } from './utils/createBlockManagementUseCase'
export type { ICreateBlockManagementUseCaseOptions } from './utils/createBlockManagementUseCase'

// BlockBuilderFactory (нужен для createBlockManagementUseCase)
export { BlockBuilderFactory } from './BlockBuilderFactory'
export type { IBlockBuilderFactoryDependencies } from './BlockBuilderFactory'

// Типы
export type * from './core/types'
