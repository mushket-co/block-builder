<template>
  <label v-if="showLabel" :for="fieldId" :class="CSS_CLASSES.FORM_LABEL">
    {{ label }}
    <span v-if="required" :class="CSS_CLASSES.REQUIRED">*</span>
  </label>

  <CustomDropdown
    :model-value="selectedBlockValue"
    :options="blockOptions"
    :placeholder="dropdownPlaceholder"
    :clearable="true"
    :invalid="showError"
    @update:model-value="handleBlockSelect"
  />

  <input
    v-if="allowCustomUrl"
    :id="fieldId"
    type="text"
    :class="[CSS_CLASSES.FORM_CONTROL, CSS_CLASSES.BLOCK_ANCHOR_CUSTOM]"
    :value="customUrlValue"
    :placeholder="customUrlPlaceholder"
    @input="handleCustomUrlInput"
  />
</template>

<script setup lang="ts">
import type { IBlockAnchorConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import {
  buildBlockAnchorOptions,
  isBlockAnchorHash,
} from '../../utils/blockAnchorHelpers';
import { computed, inject } from 'vue';

import { BLOCK_ANCHOR_CONTEXT_KEY } from '../composables/blockAnchorContext';
import { useUiStrings } from '../composables/useUiStrings';
import CustomDropdown from './CustomDropdown.vue';

const uiStrings = useUiStrings();

interface Props {
  fieldId: string;
  modelValue?: string;
  label?: string;
  required?: boolean;
  error?: string;
  showLabel?: boolean;
  blockAnchorConfig?: IBlockAnchorConfig;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  required: false,
  error: '',
  showLabel: true,
  blockAnchorConfig: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const contextRef = inject(BLOCK_ANCHOR_CONTEXT_KEY);

const anchorContext = computed(() => contextRef?.value ?? { blocks: [], editingBlockId: null, blockTypeLabels: {} });

const allowCustomUrl = computed(() => props.blockAnchorConfig?.allowCustomUrl === true);

const blockOptions = computed(() =>
  buildBlockAnchorOptions(anchorContext.value, props.blockAnchorConfig).map(option => ({
    value: option.value,
    label: option.label,
    disabled: false,
  }))
);

const knownBlockIds = computed(
  () => new Set(anchorContext.value.blocks.map(block => block.id))
);

const selectedBlockValue = computed(() => {
  const value = String(props.modelValue ?? '');
  if (!value || !isBlockAnchorHash(value, knownBlockIds.value)) {
    return null;
  }
  return value;
});

const customUrlValue = computed(() => {
  const value = String(props.modelValue ?? '');
  if (!value || isBlockAnchorHash(value, knownBlockIds.value)) {
    return '';
  }
  return value;
});

const dropdownPlaceholder = computed(
  () => props.blockAnchorConfig?.placeholder || uiStrings.value.blockAnchorPlaceholder
);

const customUrlPlaceholder = computed(() => uiStrings.value.blockAnchorCustomUrlPlaceholder);

const showError = computed(() => Boolean(props.error));

const handleBlockSelect = (value: string | number | (string | number)[] | null) => {
  if (value === null || value === '') {
    emit('update:modelValue', allowCustomUrl.value ? customUrlValue.value : '');
    return;
  }

  emit('update:modelValue', String(value));
};

const handleCustomUrlInput = (event: Event) => {
  const nextValue = (event.target as HTMLInputElement).value;
  emit('update:modelValue', nextValue);
};
</script>
