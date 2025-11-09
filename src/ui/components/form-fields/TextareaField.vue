<template>
  <label v-if="showLabel" :for="fieldId" class="block-builder-form-label">
    {{ label }}
    <span v-if="required" class="required">*</span>
  </label>
  <textarea
    :id="fieldId"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :class="inputClass"
    @input="handleInput"
  />
  <div v-if="showError && error" class="block-builder-form-errors">
    <span :class="CSS_CLASSES.ERROR">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { CSS_CLASSES } from '../../../utils/constants';

interface Props {
  fieldId: string;
  modelValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  required: false,
  error: '',
  rows: 4,
  showLabel: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputClass = computed(() => {
  const baseClass = CSS_CLASSES.FORM_CONTROL;
  return props.error ? `${baseClass} ${CSS_CLASSES.ERROR}` : baseClass;
});

const showError = computed(() => !!props.error);

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>
