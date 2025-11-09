<template>
  <label v-if="showLabel" :for="fieldId" class="block-builder-form-label">
    {{ label }}
    <span v-if="required" class="required">*</span>
  </label>
  <select :id="fieldId" :value="modelValue" :class="inputClass" @change="handleChange">
    <option value="">{{ placeholder || 'Выберите...' }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
  <div v-if="showError && error" class="block-builder-form-errors">
    <span :class="CSS_CLASSES.ERROR">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { CSS_CLASSES } from '../../../utils/constants';

interface Option {
  value: string | number;
  label: string;
}

interface Props {
  fieldId: string;
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Option[];
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  required: false,
  error: '',
  options: () => [],
  showLabel: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const inputClass = computed(() => {
  const baseClass = CSS_CLASSES.FORM_CONTROL;
  return props.error ? `${baseClass} ${CSS_CLASSES.ERROR}` : baseClass;
});

const showError = computed(() => !!props.error);

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>
