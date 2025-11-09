<template>
  <label class="block-builder-form-label">
    {{ label }}
    <span v-if="required" class="required">*</span>
  </label>
  <div class="block-builder-form-radio-group">
    <label v-for="option in options" :key="option.value" class="block-builder-form-radio">
      <input
        :id="`${fieldId}-${option.value}`"
        :checked="modelValue === option.value"
        type="radio"
        :name="fieldId"
        :value="option.value"
        class="block-builder-form-radio-input"
        @change="handleChange(option.value)"
      />
      <span class="block-builder-form-radio-label">{{ option.label }}</span>
    </label>
  </div>
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
  required?: boolean;
  error?: string;
  options?: Option[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: '',
  required: false,
  error: '',
  options: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const showError = computed(() => !!props.error);

const handleChange = (value: string | number) => {
  emit('update:modelValue', value);
};
</script>
