<template>
  <label :for="fieldId" :class="CSS_CLASSES.FORM_CHECKBOX">
    <input
      :id="fieldId"
      :checked="modelValue"
      type="checkbox"
      :class="CSS_CLASSES.FORM_CHECKBOX_INPUT"
      @change="handleChange"
    />
    <span :class="CSS_CLASSES.FORM_CHECKBOX_LABEL">
      {{ label }}
      <span v-if="required" :class="CSS_CLASSES.REQUIRED">*</span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { CSS_CLASSES } from '../../../utils/constants';
interface Props {
  fieldId: string;
  modelValue?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  required: false,
  error: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>
