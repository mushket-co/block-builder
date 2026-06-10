<template>
  <label :class="CSS_CLASSES.FORM_LABEL">
    {{ label }}
    <span v-if="required" :class="CSS_CLASSES.REQUIRED">*</span>
  </label>
  <div :class="CSS_CLASSES.FORM_RADIO_GROUP">
    <label v-for="option in options" :key="option.value" :class="CSS_CLASSES.FORM_RADIO">
      <input
        :id="`${fieldId}-${option.value}`"
        :checked="modelValue === option.value"
        type="radio"
        :name="fieldId"
        :value="option.value"
        :class="CSS_CLASSES.FORM_RADIO_INPUT"
        @change="handleChange(option.value)"
      />
      <span :class="CSS_CLASSES.FORM_RADIO_LABEL">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
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

withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: '',
  required: false,
  error: '',
  options: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const handleChange = (value: string | number) => {
  emit('update:modelValue', value);
};
</script>
