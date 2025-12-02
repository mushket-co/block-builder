<template>
  <div ref="containerRef" class="custom-field-container" />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

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
  isFieldRequired: () => false,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const containerRef = ref<HTMLElement | null>(null);
let rendererInstance: any = null;

const initializeRenderer = async () => {
  if (!containerRef.value || !props.customFieldRendererRegistry) {
    return;
  }

  const renderer = props.customFieldRendererRegistry.get(props.field.customFieldConfig?.rendererId);
  if (!renderer) {
    return;
  }

  if (rendererInstance?.destroy) {
    rendererInstance.destroy();
    rendererInstance = null;
  }

  const context = {
    fieldName: props.field.field,
    label: props.field.label,
    value: props.modelValue || props.field.defaultValue,
    required: props.isFieldRequired(props.field),
    options: props.field.customFieldConfig?.options,
    onChange: (newValue: any) => {
      nextTick(() => {
        emit('update:modelValue', newValue);
      });
    },
    onError: (_error: string | null) => {
      // Ошибки обрабатываются в renderer
    },
  };

  try {
    rendererInstance = await renderer.render(containerRef.value, context);
  } catch {
    // Игнорируем ошибки инициализации кастомного поля
  }
};

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (rendererInstance?.setValue && newValue !== undefined && newValue !== oldValue) {
      try {
        const currentValue = rendererInstance.getValue ? rendererInstance.getValue() : undefined;
        if (currentValue !== newValue) {
          rendererInstance.setValue(newValue);
        }
      } catch {
        // Игнорируем ошибки при установке значения
      }
    }
  },
  { flush: 'post' }
); // Используем post flush, чтобы обновлять после рендера

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
