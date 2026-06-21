<template>
  <div v-if="initError" :class="CSS_CLASSES.CUSTOM_FIELD_CONTAINER">
    <div :class="CSS_CLASSES.BB_ERROR_BOX">❌ {{ initError }}</div>
  </div>
  <div v-else ref="containerRef" :class="CSS_CLASSES.CUSTOM_FIELD_CONTAINER" />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { ICustomFieldFormScope } from '../../core/ports/CustomFieldRenderer';
import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import { CSS_CLASSES } from '../../utils/constants';
import { getFieldError } from '../../utils/formFieldHelpers';

interface Props {
  field: any;
  modelValue?: any;
  formErrors?: Record<string, string[]>;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  isFieldRequired?: (field: any) => boolean;
  formScope?: ICustomFieldFormScope;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  formErrors: () => ({}),
  customFieldRendererRegistry: undefined,
  isFieldRequired: () => false,
  formScope: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const containerRef = ref<HTMLElement | null>(null);
const initError = ref<string | null>(null);
let rendererInstance: any = null;
let lastSyncedValidationError: string | null = null;

const getValidationError = () => getFieldError(props.field, props.formErrors || {});

const initializeRenderer = async () => {
  if (!containerRef.value || !props.customFieldRendererRegistry) {
    return;
  }

  const rendererId = props.field.customFieldConfig?.rendererId;
  const renderer = props.customFieldRendererRegistry.get(rendererId);
  if (!renderer) {
    initError.value = `Рендерер "${rendererId}" не зарегистрирован`;
    return;
  }

  if (rendererInstance?.destroy) {
    rendererInstance.destroy();
    rendererInstance = null;
  }

  lastSyncedValidationError = null;
  initError.value = null;

  const context = {
    fieldName: props.field.field,
    label: props.field.label,
    value: props.modelValue ?? props.field.defaultValue,
    required: props.isFieldRequired(props.field),
    options: props.field.customFieldConfig?.options,
    error: getValidationError() || undefined,
    formScope: props.formScope,
    onChange: (newValue: any) => {
      nextTick(() => {
        emit('update:modelValue', newValue);
      });
    },
    onError: (error: string | null) => {
      initError.value = error;
    },
  };

  try {
    rendererInstance = await renderer.render(containerRef.value, context);
    lastSyncedValidationError = getValidationError() || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка инициализации кастомного поля';
    initError.value = message;
    console.error(`[CustomField] ${props.field.field}:`, error);
  }
};

const syncValidationError = () => {
  const fieldError = getValidationError() || null;
  if (fieldError === lastSyncedValidationError) {
    return;
  }

  lastSyncedValidationError = fieldError;

  if (rendererInstance?.setError) {
    rendererInstance.setError(fieldError);
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
      } catch (error) {
        console.warn(`[CustomField] setValue failed for "${props.field.field}":`, error);
      }
    }
  },
  { flush: 'post' }
);

watch(
  () => props.formErrors,
  () => {
    syncValidationError();
  },
  { deep: true, flush: 'post' }
);

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
