// Типы для Vue компонентов в библиотеке
// Не требует установки Vue как зависимости

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

// Базовые типы Vue для использования в библиотеке
declare module 'vue' {
  export interface Ref<T = unknown> {
    value: T
  }
  
  export function ref<T>(value: T): Ref<T>
  export function reactive<T extends object>(target: T): T
  export function computed<T>(getter: () => T): Ref<T>
  export function onMounted(fn: () => void): void
  export function onBeforeUnmount(fn: () => void): void
  export function nextTick(fn?: () => void): Promise<void>
  
  export function withDefaults<T>(props: T, defaults: Record<string, unknown>): T
  export function defineProps<T>(): T
  export function defineEmits<T>(): T
  export function defineComponent<T>(options: T): T
}
