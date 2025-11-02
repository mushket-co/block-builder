<template>
  <div ref="containerRef" class="custom-field-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';

interface Props {
  field: any;
  modelValue?: any;
  formErrors?: Record<string, string[]>;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  isFieldRequired?: (field: any) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  formErrors: () => ({}),
  customFieldRendererRegistry: undefined,
  isFieldRequired: () => false
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const containerRef = ref<HTMLElement | null>(null);
let rendererInstance: any = null;

const initializeRenderer = async () => {
  if (!containerRef.value || !props.customFieldRendererRegistry) return;

  const renderer = props.customFieldRendererRegistry.get(props.field.customFieldConfig?.rendererId);
  if (!renderer) return;

  // Очищаем предыдущий инстанс, если есть
  if (rendererInstance?.destroy) {
    rendererInstance.destroy();
    rendererInstance = null;
  }

  // Создаем контекст для renderer
  const context = {
    fieldName: props.field.field,
    label: props.field.label,
    value: props.modelValue || props.field.defaultValue,
    required: props.isFieldRequired(props.field),
    options: props.field.customFieldConfig?.options,
    onChange: (newValue: any) => {
      // Используем nextTick, чтобы избежать синхронного обновления во время рендера
      // Это предотвращает потерю фокуса при реактивных обновлениях
      nextTick(() => {
        emit('update:modelValue', newValue);
      });
    },
    onError: (error: string | null) => {
      // Ошибки валидации обрабатываются в родительском компоненте
      // Можно добавить emit для ошибок, если нужно
    }
  };

  try {
    // Рендерим поле через renderer
    rendererInstance = await renderer.render(containerRef.value, context);
  } catch (error) {
    console.error('Ошибка инициализации кастомного поля:', error);
  }
};

// Отслеживаем изменения значения извне
// Используем watch только для обновления значения, когда оно меняется извне компонента
// (например, при загрузке данных или программном изменении)
watch(() => props.modelValue, (newValue, oldValue) => {
  // Обновляем только если значение действительно изменилось извне
  // и редактор уже инициализирован
  if (rendererInstance?.setValue && newValue !== undefined && newValue !== oldValue) {
    try {
      const currentValue = rendererInstance.getValue ? rendererInstance.getValue() : undefined;
      // Обновляем только если значения действительно отличаются
      // Это предотвращает потерю фокуса при редактировании
      if (currentValue !== newValue) {
        rendererInstance.setValue(newValue);
      }
    } catch (error) {
      // Игнорируем ошибки при получении/установке значения
      // Это может происходить во время размонтирования
    }
  }
}, { flush: 'post' }); // Используем post flush, чтобы обновлять после рендера

onMounted(async () => {
  await nextTick();
  await initializeRenderer();
});

onBeforeUnmount(() => {
  if (rendererInstance?.destroy) {
    rendererInstance.destroy();
    rendererInstance = null;
  }
});
</script>

<style scoped>
.custom-field-container {
  width: 100%;
}
</style>

