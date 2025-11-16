<template>
  <label v-if="showLabel" :for="fieldId" class="bb-form-label">
    {{ label }}
    <span v-if="required" class="bb-required">*</span>
  </label>
  <input :id="fieldId" :value="modelValue" type="color" :class="inputClass" @input="handleInput" />
  <div v-if="showError && error" class="bb-form-errors">
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
  required?: boolean;
  error?: string;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#333333',
  label: '',
  required: false,
  error: '',
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
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>
