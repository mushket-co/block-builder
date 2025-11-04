<template>
  <div
    ref="containerRef"
    class="image-upload-field"
    :class="{ [CSS_CLASSES.ERROR]: error }"
    :data-field-name="fieldNamePath"
  >
    <label v-if="label" :for="inputId" class="image-upload-field__label">
      {{ label }}
      <span v-if="required" class="image-upload-field__required">*</span>
    </label>

    <!-- Текущее изображение -->
    <div v-if="displayValue" class="image-upload-field__preview">
      <img :src="displayValue" :alt="label || 'Изображение'" class="image-upload-field__preview-img" />
      <button
        type="button"
        @click="clearImage"
        class="image-upload-field__preview-clear"
        title="Удалить изображение"
      >
        ×
      </button>
    </div>

    <!-- Поле загрузки файла -->
    <div class="image-upload-field__file">
      <input
        :id="inputId"
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="image-upload-field__file-input"
        @change="handleFileChange"
      />
      <label
        :for="inputId"
        class="image-upload-field__file-label"
        :class="{ 'image-upload-field__file-label--loading': isLoading }"
      >
        <span v-if="isLoading">⏳ Загрузка...</span>
        <span v-else>{{ displayValue ? 'Изменить файл' : 'Выберите изображение' }}</span>
      </label>
      <span v-if="fileError" class="image-upload-field__error">{{ fileError }}</span>
    </div>

    <!-- Ошибки валидации -->
    <div v-if="error" class="image-upload-field__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { IImageUploadConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';

interface Props {
  modelValue?: any;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  imageUploadConfig?: IImageUploadConfig;
  // Data attributes - используем camelCase для props, так как Vue не передает props с дефисами
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
  dataRepeaterItemField: undefined
});

// Computed для извлечения значений data-атрибутов
const dataRepeaterField = computed(() => {
  const value = props.dataRepeaterField;
  return typeof value === 'string' ? value : undefined;
});

const dataRepeaterIndex = computed(() => {
  const value = props.dataRepeaterIndex;
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? undefined : parsed;
});

const dataRepeaterItemField = computed(() => {
  const value = props.dataRepeaterItemField;
  return typeof value === 'string' ? value : undefined;
});

// Computed для формирования полного пути поля
const fieldNamePath = computed(() => {
  if (dataRepeaterField.value && dataRepeaterIndex.value !== undefined && dataRepeaterItemField.value) {
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
const inputId = computed(() => `image-upload-${Math.random().toString(36).substring(7)}`);

// Устанавливаем data-атрибуты программно, так как Vue не устанавливает их из props с дефисами
const updateDataAttributes = () => {
  if (!containerRef.value) return;

  const field = dataRepeaterField.value;
  const index = dataRepeaterIndex.value;
  const itemField = dataRepeaterItemField.value;

  if (field) {
    containerRef.value.setAttribute('data-repeater-field', field);
  } else {
    containerRef.value.removeAttribute('data-repeater-field');
  }

  if (index !== undefined && index !== null) {
    containerRef.value.setAttribute('data-repeater-index', String(index));
  } else {
    containerRef.value.removeAttribute('data-repeater-index');
  }

  if (itemField) {
    containerRef.value.setAttribute('data-repeater-item-field', itemField);
  } else {
    containerRef.value.removeAttribute('data-repeater-item-field');
  }
};

// Отслеживаем изменения props и обновляем атрибуты
watch([containerRef, dataRepeaterField, dataRepeaterIndex, dataRepeaterItemField], () => {
  updateDataAttributes();
}, { immediate: true, flush: 'post' });

onMounted(() => {
  nextTick(() => {
    updateDataAttributes();
  });
});

const displayValue = computed(() => {
  const value = props.modelValue;
  if (!value) return '';

  // base64 - всегда строка
  // серверное загрузка - объект с обязательным src
  if (typeof value === 'string') return value;
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
  const accept = config.accept || 'image/*';
  const maxFileSize = config.maxFileSize || (10 * 1024 * 1024); // 10MB по умолчанию

  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    fileError.value = 'Пожалуйста, выберите файл изображения';
    return;
  }

  // Проверка размера файла
  if (file.size > maxFileSize) {
    fileError.value = `Размер файла не должен превышать ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    return;
  }

  fileError.value = '';
  isLoading.value = true;

  try {
    // Если настроен uploadUrl, загружаем на сервер
    if (config.uploadUrl) {
      const uploadedUrl = await uploadFileToServer(file, config);
      emit('update:modelValue', uploadedUrl);
    } else {
      // Иначе конвертируем в base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        emit('update:modelValue', result);
      };
      reader.onerror = () => {
        fileError.value = 'Ошибка при чтении файла';
      };
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
  const uploadUrl = config.uploadUrl!;
  const uploadHeaders = config.uploadHeaders || {};
  const fileParamName = config.fileParamName || 'file';

  // Создаем FormData с файлом
  const formData = new FormData();
  formData.append(fileParamName, file);

  // Выполняем запрос (всегда POST, так как используется FormData)
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: uploadHeaders,
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.statusText}`);
  }

  const responseData = await response.json();

  // Преобразуем ответ, если есть responseMapper
  if (config.responseMapper) {
    return config.responseMapper(responseData);
  }

  // По умолчанию: возвращаем ответ как есть
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

<!-- Стили определены в src/ui/styles/components/_image-upload-field.scss -->

