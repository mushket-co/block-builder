<template>
  <div class="bb-api-select">
    <label v-if="config.label" class="bb-api-select__label">
      {{ config.label }}
      <span v-if="isRequired" class="bb-api-select__required">*</span>
    </label>

    <div ref="wrapperRef" class="bb-api-select__wrapper">
      <div class="bb-api-select__search">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          class="bb-api-select__input"
          :placeholder="placeholder"
          @click="openDropdown"
          @input="onSearchInput"
        />
        <span v-if="loading" class="bb-api-select__loader">⏳</span>
        <span v-else-if="hasValue" class="bb-api-select__clear" @click.stop="clearSelection"
          >✕</span
        >
        <button
          type="button"
          class="bb-api-select__toggle"
          :class="{ 'bb-api-select__toggle--open': isDropdownOpen }"
          @click="toggleDropdown"
        >
          ▼
        </button>
      </div>

      <div v-if="isDropdownOpen" class="bb-api-select__dropdown">
        <div v-if="loading" class="bb-api-select__message">
          {{ loadingText }}
        </div>

        <div v-else-if="error" class="bb-api-select__message bb-api-select__message--error">
          {{ error }}
        </div>

        <div v-else-if="items.length > 0" class="bb-api-select__list">
          <div
            v-for="item in items"
            :key="item.id"
            class="bb-api-select__item"
            :class="{ 'bb-api-select__item--selected': isSelected(item.id) }"
            @click="selectItem(item)"
          >
            <span class="bb-api-select__item-name">{{ item.name }}</span>
            <span v-if="isSelected(item.id)" class="bb-api-select__item-check">✓</span>
          </div>

          <div v-if="hasMore" class="bb-api-select__load-more" @click="loadMore">
            Загрузить еще...
          </div>
        </div>

        <div v-else class="bb-api-select__message">
          {{ noResultsText }}
        </div>
      </div>
    </div>

    <div v-if="isMultiple && selectedItems.length > 0" class="bb-api-select__selected">
      <div v-for="item in selectedItems" :key="item.id" class="bb-api-select__tag">
        <span class="bb-api-select__tag-name">{{ item.name }}</span>
        <span class="bb-api-select__tag-remove" @click="removeItem(item.id)">✕</span>
      </div>
    </div>

    <div v-if="validationError" class="bb-api-select__error">
      {{ validationError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import type { IApiRequestParams, IApiSelectItem, IFormFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';

interface IProps {
  config: IFormFieldConfig;
  modelValue: string | number | (string | number)[] | null;
  validationError?: string;
  apiSelectUseCase: ApiSelectUseCase;
}

const props = defineProps<IProps>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | (string | number)[] | null): void;
}>();

const searchInput = ref<HTMLInputElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);

const searchQuery = ref('');
const items = ref<IApiSelectItem[]>([]);
const selectedItems = ref<IApiSelectItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const isDropdownOpen = ref(false);
const currentPage = ref(1);
const hasMore = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const apiSelectUseCase = props.apiSelectUseCase;

const apiConfig = computed(() => props.config.apiSelectConfig);

const isRequired = computed(() => {
  return props.config.rules?.some(rule => rule.type === 'required') ?? false;
});

const isMultiple = computed(() => apiConfig.value?.multiple ?? false);

const placeholder = computed(() => apiConfig.value?.placeholder ?? 'Начните вводить для поиска...');

const loadingText = computed(() => apiConfig.value?.loadingText ?? 'Загрузка...');

const noResultsText = computed(() => apiConfig.value?.noResultsText ?? 'Ничего не найдено');

const errorText = computed(() => apiConfig.value?.errorText ?? 'Ошибка загрузки данных');

const debounceMs = computed(() => apiConfig.value?.debounceMs ?? 300);

const minSearchLength = computed(() => apiConfig.value?.minSearchLength ?? 0);

const hasValue = computed(() => {
  if (isMultiple.value) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  }
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '';
});

const isSelected = (id: string | number): boolean => {
  if (isMultiple.value) {
    const value = props.modelValue as (string | number)[];
    return Array.isArray(value) && value.includes(id);
  }
  return props.modelValue === id;
};

const fetchData = async (reset = false) => {
  if (!apiConfig.value) {
    error.value = 'Конфигурация API не указана';
    return;
  }

  if (searchQuery.value.length < minSearchLength.value && searchQuery.value.length > 0) {
    return;
  }

  if (reset) {
    currentPage.value = 1;
  }

  loading.value = true;
  error.value = null;

  try {
    const params: IApiRequestParams = {
      search: searchQuery.value || undefined,
      page: currentPage.value,
      limit: apiConfig.value.limit || 20,
    };

    const response = await apiSelectUseCase.fetchItems(apiConfig.value, params);

    items.value = reset ? response.data : [...items.value, ...response.data];

    hasMore.value = response.hasMore ?? false;
  } catch (error_: any) {
    error.value = error_.message || errorText.value;
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearchInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    fetchData(true).then(() => {
      if (!isDropdownOpen.value) {
        isDropdownOpen.value = true;
      }
    });
  }, debounceMs.value);
};

const openDropdown = () => {
  if (!isDropdownOpen.value) {
    isDropdownOpen.value = true;

    if (!loading.value) {
      fetchData(true);
    }
  }
};

const toggleDropdown = () => {
  if (isDropdownOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const closeDropdown = () => {
  isDropdownOpen.value = false;

  if (isMultiple.value) {
    searchQuery.value = '';
  } else if (selectedItems.value.length > 0) {
    searchQuery.value = selectedItems.value[0].name;
  } else {
    searchQuery.value = '';
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (!isDropdownOpen.value) {
    return;
  }

  const target = event.target as HTMLElement;

  if (wrapperRef.value && !wrapperRef.value.contains(target)) {
    closeDropdown();
  }
};

const selectItem = (item: IApiSelectItem) => {
  if (isMultiple.value) {
    const currentValue = (props.modelValue as (string | number)[]) || [];

    if (currentValue.includes(item.id)) {
      const newValue = currentValue.filter(id => id !== item.id);
      emit('update:modelValue', newValue);
      selectedItems.value = selectedItems.value.filter(i => i.id !== item.id);
    } else {
      emit('update:modelValue', [...currentValue, item.id]);
      selectedItems.value.push(item);
    }
  } else {
    emit('update:modelValue', item.id);
    selectedItems.value = [item];
    searchQuery.value = item.name;
    closeDropdown();
  }
};

const removeItem = (id: string | number) => {
  if (!isMultiple.value) {
    return;
  }

  const currentValue = (props.modelValue as (string | number)[]) || [];
  const newValue = currentValue.filter(itemId => itemId !== id);
  emit('update:modelValue', newValue);
  selectedItems.value = selectedItems.value.filter(item => item.id !== id);
};

const clearSelection = () => {
  if (isMultiple.value) {
    emit('update:modelValue', []);
    selectedItems.value = [];
    searchQuery.value = '';
    fetchData(true); // Загрузка всех элементов без поиска
  } else {
    emit('update:modelValue', null);
    selectedItems.value = [];
    searchQuery.value = '';
    fetchData(true); // Загрузка всех элементов без поиска
  }
};

const loadMore = () => {
  if (!hasMore.value || loading.value) {
    return;
  }
  currentPage.value += 1;
  fetchData(false);
};

onMounted(async () => {
  await nextTick();
  document.addEventListener('mousedown', handleClickOutside, true);

  if (hasValue.value && apiConfig.value) {
    try {
      loading.value = true;
      const response = await apiSelectUseCase.fetchItems(apiConfig.value, {
        limit: 100, // Загружаем больше для поиска выбранных
      });

      if (isMultiple.value) {
        const ids = props.modelValue as (string | number)[];
        selectedItems.value = response.data.filter((item: IApiSelectItem) => ids.includes(item.id));
      } else {
        const selectedItem = response.data.find(
          (item: IApiSelectItem) => item.id === props.modelValue
        );
        if (selectedItem) {
          selectedItems.value = [selectedItem];
          searchQuery.value = selectedItem.name;
        }
      }
    } catch {
      // Игнорируем ошибки загрузки при инициализации
    } finally {
      loading.value = false;
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside, true);
});
</script>
