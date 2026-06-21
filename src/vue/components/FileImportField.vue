<template>
  <div :class="CSS_CLASSES.FILE_IMPORT_FIELD">
    <div v-if="label" :class="CSS_CLASSES.FORM_LABEL">{{ label }}</div>
    <button
      type="button"
      :class="[CSS_CLASSES.BTN, CSS_CLASSES.BTN_SECONDARY]"
      :disabled="isLoading"
      @click="openFileDialog"
    >
      <Icon v-if="isLoading" name="loader" class="bb-icon--spin" :width="14" :height="14" />
      <span>{{ isLoading ? 'Загрузка…' : 'Выберите файл' }}</span>
    </button>
    <input
      ref="fileInputRef"
      type="file"
      hidden
      :accept="accept"
      :disabled="isLoading"
      @change="handleFileChange"
    />
    <div v-if="displayError" :class="CSS_CLASSES.FORM_ERRORS">
      <span :class="CSS_CLASSES.ERROR">{{ displayError }}</span>
    </div>
    <div v-if="importNotice" :class="CSS_CLASSES.FILE_IMPORT_NOTICE">{{ importNotice }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { ICustomFieldFormScope } from '../../core/ports/CustomFieldRenderer';
import type { IFileImportConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import {
  applyFileImportMergeRules,
  formatFileImportMergeMessage,
} from '../../utils/fileImportMerge';
import Icon from '../../shared/icons/Icon.vue';

interface Props {
  label?: string;
  error?: string;
  fileImportConfig: IFileImportConfig;
  formScope: ICustomFieldFormScope;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  error: '',
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const isLoading = ref(false);
const localError = ref('');
const importNotice = ref('');

const accept = computed(() => props.fileImportConfig.accept?.join(',') || '*/*');
const displayError = computed(() => props.error || localError.value);

const openFileDialog = () => {
  if (!isLoading.value) {
    fileInputRef.value?.click();
  }
};

function validateImportFile(file: File, config: IFileImportConfig): string | null {
  const maxSizeMb = config.maxSizeMb ?? 5;
  const maxBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxBytes) {
    return `Размер файла не должен превышать ${maxSizeMb}MB`;
  }

  if (config.accept?.length) {
    const fileName = file.name.toLowerCase();
    const matches = config.accept.some(pattern => {
      const normalized = pattern.toLowerCase().trim();
      if (normalized.startsWith('.')) {
        return fileName.endsWith(normalized);
      }
      return file.type === normalized;
    });

    if (!matches) {
      return `Допустимые форматы: ${config.accept.join(', ')}`;
    }
  }

  return null;
}

async function uploadImportFile(file: File, config: IFileImportConfig): Promise<unknown> {
  const formData = new FormData();
  formData.append(config.formDataKey || 'file', file);

  const response = await fetch(config.uploadUrl, {
    method: 'POST',
    headers: config.uploadHeaders || {},
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.statusText}`);
  }

  const responseData = await response.json();
  return config.responseMapper ? config.responseMapper(responseData) : responseData;
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file || isLoading.value) {
    return;
  }

  const validationError = validateImportFile(file, props.fileImportConfig);
  if (validationError) {
    localError.value = validationError;
    return;
  }

  localError.value = '';
  importNotice.value = '';
  isLoading.value = true;

  try {
    const data = await uploadImportFile(file, props.fileImportConfig);

    let mergeStats;
    if (props.fileImportConfig.merge?.length) {
      mergeStats = applyFileImportMergeRules(props.formScope, data, props.fileImportConfig.merge);
      const message = formatFileImportMergeMessage(mergeStats);
      if (message) {
        importNotice.value = message;
      }
    }

    if (props.fileImportConfig.onImport) {
      await props.fileImportConfig.onImport({
        data,
        formScope: props.formScope,
        mergeStats,
      });
    } else if (!props.fileImportConfig.merge?.length) {
      throw new Error('fileImportConfig: укажите merge и/или onImport');
    }

    const message = formatFileImportMergeMessage(mergeStats || []);
    if (message) {
      importNotice.value = message;
    }
  } catch (uploadError) {
    localError.value =
      uploadError instanceof Error ? uploadError.message : 'Ошибка импорта файла';
  } finally {
    isLoading.value = false;
  }
};
</script>
