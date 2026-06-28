<template>
  <label v-if="showLabel" :for="fieldId" :class="CSS_CLASSES.FORM_LABEL">
    {{ label }}
    <span v-if="required" :class="CSS_CLASSES.REQUIRED">*</span>
  </label>
  <CustomDropdown
    :model-value="dropdownValue"
    :options="dropdownOptions"
    :placeholder="placeholder || uiStrings.selectPlaceholder"
    :multiple="multiple"
    :clearable="isClearable"
    :invalid="showError"
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
import { CSS_CLASSES } from '../../../utils/constants';
import { computed } from 'vue';

import { useUiStrings } from '../../composables/useUiStrings';
import CustomDropdown from '../CustomDropdown.vue';

const uiStrings = useUiStrings();

interface IOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface Props {
  fieldId: string;
  modelValue?: string | number | (string | number)[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: IOption[];
  showLabel?: boolean;
  multiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: '',
  placeholder: '',
  required: false,
  error: '',
  options: () => [] as IOption[],
  showLabel: true,
  multiple: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]];
}>();

type TDropdownValue = string | number | (string | number)[] | null;

const dropdownOptions = computed(() => {
  return props.options.map(option => ({
    value: option.value,
    label: option.label,
    disabled: option.disabled ?? false,
    group: option.group,
  }));
});

const dropdownValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }

  if (props.modelValue === null || props.modelValue === undefined) {
    return '';
  }

  return props.modelValue as string | number;
});

const showError = computed(() => !!props.error);

const isClearable = computed(() => !props.required);

const handleUpdate = (value: TDropdownValue) => {
  if (props.multiple) {
    if (Array.isArray(value)) {
      emit('update:modelValue', value);
      return;
    }

    emit('update:modelValue', value === null || value === undefined ? [] : [value]);
    return;
  }

  if (value === null || value === undefined) {
    emit('update:modelValue', '' as string);
    return;
  }

  if (Array.isArray(value)) {
    emit('update:modelValue', (value[0] ?? '') as string | number);
    return;
  }

  emit('update:modelValue', value as string | number);
};
</script>
