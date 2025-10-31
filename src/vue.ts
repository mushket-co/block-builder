/**
 * Vue3 компоненты для BlockBuilder
 * Используйте этот модуль если работаете с Vue3
 */

// Vue компоненты
export { default as BlockBuilderComponent } from './ui/components/BlockBuilder.vue'
export { default as BlockComponent } from './ui/components/BlockComponent.vue'
export { default as BlockProperties } from './ui/components/BlockProperties.vue'
export { default as SpacingControl } from './ui/components/SpacingControl.vue'
export { default as RepeaterControl } from './ui/components/RepeaterControl.vue'
export { default as ApiSelectField } from './ui/components/ApiSelectField.vue'

// Core для использования в Vue компонентах
export * from './core/use-cases/BlockManagementUseCase'
export * from './core/use-cases/ComponentManagementUseCase'
export * from './core/use-cases/ApiSelectUseCase'
export * from './infrastructure/repositories/MemoryBlockRepositoryImpl'
export * from './infrastructure/registries/MemoryComponentRegistry'
export * from './infrastructure/registries/CustomFieldRendererRegistry'
export * from './infrastructure/http/FetchHttpClient'

// Ports
export * from './core/ports/CustomFieldRenderer'

// Utils helpers
export * from './utils/createBlockManagementUseCase'

// Типы
export type * from './core/types'

