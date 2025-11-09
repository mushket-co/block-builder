<template>
  <label :for="fieldId" class="block-builder-form-checkbox">
    <input
      :id="fieldId"
      :checked="modelValue"
      type="checkbox"
      class="block-builder-form-checkbox-input"
      @change="handleChange"
    />
    <span class="block-builder-form-checkbox-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </span>
  </label>
  <div v-if="showError && error" class="block-builder-form-errors">
    <span :class="CSS_CLASSES.ERROR">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { CSS_CLASSES } from '../../../utils/constants';

interface Props {
  fieldId: string;
  modelValue?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  required: false,
  error: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const showError = computed(() => !!props.error);

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>
