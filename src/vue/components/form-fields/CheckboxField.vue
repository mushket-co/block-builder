<template>
  <label :for="fieldId" class="bb-form-checkbox">
    <input
      :id="fieldId"
      :checked="modelValue"
      type="checkbox"
      class="bb-form-checkbox-input"
      @change="handleChange"
    />
    <span class="bb-form-checkbox-label">
      {{ label }}
      <span v-if="required" class="bb-required">*</span>
    </span>
  </label>
</template>

<script setup lang="ts">
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
