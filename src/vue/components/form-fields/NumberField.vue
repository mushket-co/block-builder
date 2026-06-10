<template>
  <label v-if="showLabel" :for="fieldId" :class="CSS_CLASSES.FORM_LABEL">
    {{ label }}
    <span v-if="required" :class="CSS_CLASSES.REQUIRED">*</span>
  </label>
  <input
    :id="fieldId"
    :value="modelValue"
    type="number"
    :placeholder="placeholder"
    :class="inputClass"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { CSS_CLASSES } from '../../../utils/constants';

interface Props {
  fieldId: string;
  modelValue?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: '',
  placeholder: '',
  required: false,
  error: '',
  showLabel: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const inputClass = computed(() => {
  const baseClass = CSS_CLASSES.FORM_CONTROL;
  return props.error ? `${baseClass} ${CSS_CLASSES.ERROR}` : baseClass;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value === '' ? undefined : Number(target.value);
  emit('update:modelValue', value);
};
</script>
