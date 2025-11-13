<template>
  <label v-if="showLabel" :for="fieldId" class="block-builder-form-label">
    {{ label }}
    <span v-if="required" class="required">*</span>
  </label>
  <CustomDropdown
    :model-value="modelValue"
    :options="dropdownOptions"
    :placeholder="placeholder || 'Выберите...'"
    :clearable="isClearable"
    :invalid="showError"
    @update:modelValue="handleUpdate"
  />
  <div v-if="showError && error" class="block-builder-form-errors">
    <span :class="CSS_CLASSES.ERROR">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { CSS_CLASSES } from '../../../utils/constants';
import CustomDropdown from '../CustomDropdown.vue';

interface IOption {
  value: string | number;
  label: string;
  disabled?: boolean;
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
  options: () => [] as IOption[],
  showLabel: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

type TDropdownValue = string | number | (string | number)[] | null;

const dropdownOptions = computed(() => {
  return props.options.map(option => ({
    value: option.value,
    label: option.label,
    disabled: option.disabled ?? false,
  }));
});

const showError = computed(() => !!props.error);

const isClearable = computed(() => !props.required);

const handleUpdate = (value: TDropdownValue) => {
  if (Array.isArray(value)) {
    const [first] = value;
    emit('update:modelValue', (first ?? '') as string | number);
    return;
  }

  if (value === null || value === undefined) {
    emit('update:modelValue', '' as string);
    return;
  }

  emit('update:modelValue', value as string | number);
};
</script>
