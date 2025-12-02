<template>
  <label class="bb-form-label">
    {{ label }}
    <span v-if="required" class="bb-required">*</span>
  </label>
  <div class="bb-form-radio-group">
    <label v-for="option in options" :key="option.value" class="bb-form-radio">
      <input
        :id="`${fieldId}-${option.value}`"
        :checked="modelValue === option.value"
        type="radio"
        :name="fieldId"
        :value="option.value"
        class="bb-form-radio-input"
        @change="handleChange(option.value)"
      />
      <span class="bb-form-radio-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
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
