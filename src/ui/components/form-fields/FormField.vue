<template>
  <div
    :class="containerClass || CSS_CLASSES.FORM_GROUP"
    :data-field-name="fieldPath || field.field"
  >
    <TextField
      v-if="field.type === 'text'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="required"
      :error="error"
      input-type="text"
      :show-label="showLabel"
      @update:model-value="handleUpdate"
    />
    <TextField
      v-else-if="field.type === 'url'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="required"
      :error="error"
      input-type="url"
      :show-label="showLabel"
      @update:model-value="handleUpdate"
    />
    <TextField
      v-else-if="field.type === 'email'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="required"
      :error="error"
      input-type="email"
      :show-label="showLabel"
      @update:model-value="handleUpdate"
    />
    <TextareaField
      v-else-if="field.type === 'textarea'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="required"
      :error="error"
      :show-label="showLabel"
      @update:model-value="handleUpdate"
    />
    <NumberField
      v-else-if="field.type === 'number'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="required"
      :error="error"
      :show-label="showLabel"
      @update:model-value="handleUpdate"
    />
    <ColorField
      v-else-if="field.type === 'color'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :required="required"
      :error="error"
      :show-label="showLabel"
      @update:model-value="handleUpdate"
    />
    <SelectField
      v-else-if="field.type === 'select'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="required"
      :error="error"
      :options="field.options || []"
      :show-label="showLabel"
      @update:model-value="handleUpdate"
    />
    <CheckboxField
      v-else-if="field.type === 'checkbox'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :required="required"
      :error="error"
      @update:model-value="handleUpdate"
    />
    <RadioField
      v-else-if="field.type === 'radio'"
      :field-id="fieldId"
      :model-value="modelValue"
      :label="field.label"
      :required="required"
      :error="error"
      :options="field.options || []"
      @update:model-value="handleUpdate"
    />
    <ImageUploadField
      v-else-if="field.type === 'image'"
      :model-value="modelValue"
      :label="showLabel ? field.label : ''"
      :required="required"
      :placeholder="field.placeholder"
      :error="error"
      :image-upload-config="field.imageUploadConfig"
      @update:model-value="handleUpdate"
    />
    <slot v-else :field="field" :field-id="fieldId" :model-value="modelValue" :error="error" />
    <div v-if="error" :class="CSS_CLASSES.FORM_ERRORS">
      <span :class="CSS_CLASSES.ERROR">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import ImageUploadField from '../ImageUploadField.vue';
import CheckboxField from './CheckboxField.vue';
import ColorField from './ColorField.vue';
import NumberField from './NumberField.vue';
import RadioField from './RadioField.vue';
import SelectField from './SelectField.vue';
import TextareaField from './TextareaField.vue';
import TextField from './TextField.vue';

interface Props {
  field: IFormFieldConfig;
  fieldId: string;
  modelValue?: any;
  required?: boolean;
  error?: string;
  showLabel?: boolean;
  containerClass?: string;
  fieldPath?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  required: false,
  error: '',
  showLabel: true,
  containerClass: '',
  fieldPath: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const handleUpdate = (value: any) => {
  emit('update:modelValue', value);
};
</script>
