<template>
  <div
    v-if="isFileVariant"
    ref="containerRef"
    :class="[
      CSS_CLASSES.FILE_UPLOAD_FIELD,
      { [CSS_CLASSES.ERROR]: error },
      isMultiple ? CSS_CLASSES.FILE_UPLOAD_FIELD_MULTIPLE : '',
    ]"
    :data-field-name="fieldNamePath"
    data-upload-variant="file"
    :data-upload-multiple="isMultiple ? 'true' : 'false'"
  >
    <label v-if="label" :for="inputId" :class="CSS_CLASSES.FILE_UPLOAD_FIELD_LABEL">
      {{ label }}
      <span v-if="required" :class="CSS_CLASSES.FILE_UPLOAD_FIELD_REQUIRED">*</span>
    </label>

    <ul v-if="isMultiple && items.length" :class="CSS_CLASSES.FILE_UPLOAD_FIELD_LIST">
      <li
        v-for="(itemUrl, index) in items"
        :key="`${itemUrl}-${index}`"
        :class="CSS_CLASSES.FILE_UPLOAD_FIELD_ROW"
      >
        <span :class="CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE">{{ getExtensionBadge(itemUrl) }}</span>
        <a
          :href="itemUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="CSS_CLASSES.FILE_UPLOAD_FIELD_NAME"
        >
          {{ getFileName(itemUrl) }}
        </a>
        <button
          type="button"
          :class="CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE"
          title="Удалить"
          @click="removeItem(index)"
        >
          Удалить
        </button>
      </li>
    </ul>

    <div
      v-else-if="!isMultiple && singleDisplayValue"
      :class="CSS_CLASSES.FILE_UPLOAD_FIELD_ROW"
    >
      <span :class="CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE">
        {{ getExtensionBadge(singleDisplayValue) }}
      </span>
      <a
        :href="singleDisplayValue"
        target="_blank"
        rel="noopener noreferrer"
        :class="CSS_CLASSES.FILE_UPLOAD_FIELD_NAME"
      >
        {{ getFileName(singleDisplayValue) }}
      </a>
      <button
        type="button"
        :class="CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE"
        title="Удалить файл"
        @click="clearValue"
      >
        Удалить
      </button>
    </div>

    <div :class="CSS_CLASSES.FILE_UPLOAD_FIELD_PICKER">
      <input
        :id="inputId"
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="isMultiple"
        :class="CSS_CLASSES.FILE_UPLOAD_FIELD_INPUT"
        @change="handleFileChange"
      />
      <label
        v-if="!isMultiple || canAddMore"
        :for="inputId"
        :class="[
          CSS_CLASSES.BTN,
          CSS_CLASSES.BTN_OUTLINE,
          { [CSS_CLASSES.BTN_LOADING]: isLoading },
        ]"
      >
        <template v-if="isLoading">⏳ Загрузка...</template>
        <template v-else-if="isMultiple">+ {{ addButtonLabel }}</template>
        <template v-else>{{ singleDisplayValue ? changeButtonLabel : chooseButtonLabel }}</template>
      </label>
      <span v-if="fileError" :class="CSS_CLASSES.FILE_UPLOAD_FIELD_ERROR">{{ fileError }}</span>
    </div>
  </div>

  <div
    v-else
    ref="containerRef"
    :class="[
      CSS_CLASSES.IMAGE_UPLOAD_FIELD,
      { [CSS_CLASSES.ERROR]: error },
      isMultiple ? CSS_CLASSES.IMAGE_UPLOAD_FIELD_MULTIPLE : '',
    ]"
    :data-field-name="fieldNamePath"
    data-upload-variant="image"
    :data-upload-multiple="isMultiple ? 'true' : 'false'"
  >
    <label v-if="label" :for="inputId" :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL">
      {{ label }}
      <span v-if="required" :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_REQUIRED">*</span>
    </label>

    <div v-if="isMultiple" :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY">
      <div
        v-for="(itemUrl, index) in items"
        :key="`${itemUrl}-${index}`"
        :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ITEM"
      >
        <img
          :src="itemUrl"
          :alt="label || 'Изображение'"
          :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG"
        />
        <button
          type="button"
          :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR"
          title="Удалить"
          @click="removeItem(index)"
        >
          <Icon name="close" :width="14" :height="14" />
        </button>
      </div>

      <label
        v-if="canAddMore"
        :for="inputId"
        :class="[
          CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ADD,
          { [CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL_LOADING]: isLoading },
        ]"
      >
        <span v-if="isLoading">⏳ Загрузка...</span>
        <span v-else>+ {{ addButtonLabel }}</span>
      </label>
    </div>

    <template v-if="!isMultiple">
      <div v-if="singleDisplayValue" :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW">
        <img
          :src="singleDisplayValue"
          :alt="label || 'Изображение'"
          :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG"
        />
        <button
          type="button"
          :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR"
          title="Удалить изображение"
          @click="clearValue"
        >
          <Icon name="close" :width="14" :height="14" />
        </button>
      </div>
    </template>

    <div :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE">
      <input
        :id="inputId"
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="isMultiple"
        :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_INPUT"
        @change="handleFileChange"
      />
      <label
        v-if="!isMultiple"
        :for="inputId"
        :class="[
          CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL,
          { [CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL_LOADING]: isLoading },
        ]"
      >
        <span v-if="isLoading">⏳ Загрузка...</span>
        <span v-else>{{ singleDisplayValue ? changeButtonLabel : chooseButtonLabel }}</span>
      </label>
      <span v-if="fileError" :class="CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR">{{ fileError }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import type { IFileUploadConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import Icon from '../../shared/icons/Icon.vue';
import {
  canAddUploadItems,
  getDefaultAccept,
  getFileExtensionBadge,
  getFileNameFromUrl,
  getMaxUploadCountErrorMessage,
  getUploadUrl,
  normalizeUploadItems,
  partitionFilesForUpload,
  processUploadFile,
  resolveUploadConfig,
  serializeUploadValue,
  type TUploadFieldVariant,
} from '../../utils/uploadFieldUtils';

interface Props {
  modelValue?: unknown;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  variant?: TUploadFieldVariant;
  multiple?: boolean;
  fileUploadConfig?: IFileUploadConfig;
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
  variant: 'image',
  multiple: false,
  fileUploadConfig: undefined,
  dataRepeaterField: undefined,
  dataRepeaterIndex: undefined,
  dataRepeaterItemField: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
}>();

const containerRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const fileError = ref('');
const isLoading = ref(false);
const inputId = computed(
  () => `${props.variant === 'file' ? 'file' : 'image'}-upload-${Math.random().toString(36).slice(7)}`
);

const uploadConfig = computed(() => resolveUploadConfig({ fileUploadConfig: props.fileUploadConfig }));

const isMultiple = computed(() => props.multiple);
const isFileVariant = computed(() => props.variant === 'file');
const accept = computed(() => getDefaultAccept(props.variant, uploadConfig.value));
const items = computed(() => normalizeUploadItems(props.modelValue, isMultiple.value));
const singleDisplayValue = computed(() => items.value[0] || '');
const canAddMore = computed(() => canAddUploadItems(items.value, uploadConfig.value, isMultiple.value));

const chooseButtonLabel = computed(() => {
  if (props.placeholder) {
    return props.placeholder;
  }
  return isFileVariant.value ? 'Выберите файл' : 'Выберите изображение';
});

const changeButtonLabel = computed(() =>
  isFileVariant.value ? 'Заменить файл' : 'Изменить изображение'
);
const addButtonLabel = computed(() => (isFileVariant.value ? 'Добавить файл' : 'Добавить'));

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

const getFileName = (url: string) => getFileNameFromUrl(url);
const getExtensionBadge = (url: string) => getFileExtensionBadge(url);

const emitValue = (nextItems: string[]) => {
  emit('update:modelValue', serializeUploadValue(nextItems, isMultiple.value));
};

const clearValue = () => {
  emitValue([]);
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  fileError.value = '';
};

const removeItem = (index: number) => {
  const nextItems = items.value.filter((_, itemIndex) => itemIndex !== index);
  emitValue(nextItems);
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedFiles = Array.from(target.files || []);
  if (!selectedFiles.length) {
    return;
  }

  const { filesToUpload, maxCountExceeded, maxCount } = partitionFilesForUpload(
    selectedFiles,
    items.value.length,
    uploadConfig.value,
    isMultiple.value
  );

  if (!filesToUpload.length) {
    if (maxCountExceeded) {
      fileError.value = getMaxUploadCountErrorMessage(maxCount);
    }
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    return;
  }

  fileError.value = '';
  isLoading.value = true;

  try {
    const uploadedItems: string[] = [];

    for (const file of filesToUpload) {
      const result = await processUploadFile(file, uploadConfig.value, props.variant);
      const url = getUploadUrl(result);
      if (url) {
        uploadedItems.push(url);
      }
    }

    if (!uploadedItems.length) {
      return;
    }

    if (isMultiple.value) {
      emitValue([...items.value, ...uploadedItems]);
    } else {
      emitValue([uploadedItems[0]]);
    }

    if (maxCountExceeded) {
      fileError.value = getMaxUploadCountErrorMessage(maxCount);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      fileError.value = 'Не удалось подключиться к серверу загрузки. Проверьте, что API доступен.';
    } else {
      fileError.value = error instanceof Error ? error.message : 'Ошибка при загрузке файла';
    }
    if (uploadConfig.value.onUploadError && error instanceof Error) {
      uploadConfig.value.onUploadError(error);
    }
  } finally {
    isLoading.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
};
</script>
