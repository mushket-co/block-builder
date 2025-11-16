<template>
  <div
    ref="containerRef"
    class="bb-image-upload-field"
    :class="{ [CSS_CLASSES.ERROR]: error }"
    :data-field-name="fieldNamePath"
  >
    <label v-if="label" :for="inputId" class="bb-image-upload-field__label">
      {{ label }}
      <span v-if="required" class="bb-image-upload-field__required">*</span>
    </label>

    <div v-if="displayValue" class="bb-image-upload-field__preview">
      <img
        :src="displayValue"
        :alt="label || 'Изображение'"
        class="bb-image-upload-field__preview-img"
      />
      <button
        type="button"
        class="bb-image-upload-field__preview-clear"
        title="Удалить изображение"
        @click="clearImage"
      >
        ×
      </button>
    </div>

    <div class="bb-image-upload-field__file">
      <input
        :id="inputId"
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="bb-image-upload-field__file-input"
        @change="handleFileChange"
      />
      <label
        :for="inputId"
        class="bb-image-upload-field__file-label"
        :class="{ 'bb-image-upload-field__file-label--loading': isLoading }"
      >
        <span v-if="isLoading">⏳ Загрузка...</span>
        <span v-else>{{ displayValue ? 'Изменить файл' : 'Выберите изображение' }}</span>
      </label>
      <span v-if="fileError" class="bb-image-upload-field__error">{{ fileError }}</span>
    </div>

    <div v-if="error" class="bb-image-upload-field__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import type { IImageUploadConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';

interface Props {
  modelValue?: any;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  imageUploadConfig?: IImageUploadConfig;
  dataRepeaterField?: string;
  dataRepeaterIndex?: number | string;
  dataRepeaterItemField?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  required: false,
  placeholder: '',
  error: '',
  imageUploadConfig: undefined,
  dataRepeaterField: undefined,
  dataRepeaterIndex: undefined,
  dataRepeaterItemField: undefined,
});

const dataRepeaterField = computed(() => {
  const value = props.dataRepeaterField;
  return typeof value === 'string' ? value : undefined;
});

const dataRepeaterIndex = computed(() => {
  const value = props.dataRepeaterIndex;
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
});

const dataRepeaterItemField = computed(() => {
  const value = props.dataRepeaterItemField;
  return typeof value === 'string' ? value : undefined;
});

const fieldNamePath = computed(() => {
  if (
    dataRepeaterField.value &&
    dataRepeaterIndex.value !== undefined &&
    dataRepeaterItemField.value
  ) {
    return `${dataRepeaterField.value}[${dataRepeaterIndex.value}].${dataRepeaterItemField.value}`;
  }
  return '';
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const containerRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const fileError = ref('');
const isLoading = ref(false);
const inputId = computed(() => `image-upload-${Math.random().toString(36).slice(7)}`);

const updateDataAttributes = () => {
  if (!containerRef.value) {
    return;
  }

  const field = dataRepeaterField.value;
  const index = dataRepeaterIndex.value;
  const itemField = dataRepeaterItemField.value;

  if (field) {
    containerRef.value.dataset.repeaterField = field;
  } else {
    delete containerRef.value.dataset.repeaterField;
  }

  if (index !== undefined && index !== null) {
    containerRef.value.dataset.repeaterIndex = String(index);
  } else {
    delete containerRef.value.dataset.repeaterIndex;
  }

  if (itemField) {
    containerRef.value.dataset.repeaterItemField = itemField;
  } else {
    delete containerRef.value.dataset.repeaterItemField;
  }
};

watch(
  [containerRef, dataRepeaterField, dataRepeaterIndex, dataRepeaterItemField],
  () => {
    updateDataAttributes();
  },
  { immediate: true, flush: 'post' }
);

onMounted(() => {
  nextTick(() => {
    updateDataAttributes();
  });
});

const displayValue = computed(() => {
  const value = props.modelValue;
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return value.src || '';
  }

  return '';
});

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  const config = props.imageUploadConfig || {};
  const _accept = config.accept || 'image/*';
  const maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB по умолчанию

  if (!file.type.startsWith('image/')) {
    fileError.value = 'Пожалуйста, выберите файл изображения';
    return;
  }

  if (file.size > maxFileSize) {
    fileError.value = `Размер файла не должен превышать ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    return;
  }

  fileError.value = '';
  isLoading.value = true;

  try {
    if (config.uploadUrl) {
      const uploadedUrl = await uploadFileToServer(file, config);
      emit('update:modelValue', uploadedUrl);
    } else {
      const reader = new FileReader();
      reader.addEventListener('load', e => {
        const result = e.target?.result as string;
        emit('update:modelValue', result);
      });
      reader.addEventListener('error', () => {
        fileError.value = 'Ошибка при чтении файла';
      });
      reader.readAsDataURL(file);
    }
  } catch (error) {
    fileError.value = error instanceof Error ? error.message : 'Ошибка при загрузке файла';
    if (config.onUploadError && error instanceof Error) {
      config.onUploadError(error);
    }
  } finally {
    isLoading.value = false;
  }
};

const uploadFileToServer = async (file: File, config: IImageUploadConfig): Promise<any> => {
  const uploadUrl = config.uploadUrl;
  if (!uploadUrl) {
    throw new Error('uploadUrl не указан в конфигурации');
  }
  const uploadHeaders = config.uploadHeaders || {};
  const fileParamName = config.fileParamName || 'file';

  const formData = new FormData();
  formData.append(fileParamName, file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: uploadHeaders,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.statusText}`);
  }

  const responseData = await response.json();

  if (config.responseMapper) {
    return config.responseMapper(responseData);
  }

  return responseData;
};

const clearImage = () => {
  emit('update:modelValue', '');
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  fileError.value = '';
};
</script>
