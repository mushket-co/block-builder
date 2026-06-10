<template>
  <div :class="CSS_CLASSES.API_SELECT">
    <label v-if="config.label" :class="CSS_CLASSES.BB_API_SELECT_LABEL">
      {{ config.label }}
      <span v-if="isRequired" :class="CSS_CLASSES.BB_API_SELECT_REQUIRED">*</span>
    </label>

    <CustomDropdown
      ref="dropdownRef"
      :class="CSS_CLASSES.BB_API_SELECT_DROPDOWN_CONTROL"
      :model-value="normalizedDropdownValue"
      :options="dropdownOptions"
      :multiple="isMultiple"
      :placeholder="placeholder"
      :loading="loading"
      :loading-text="loadingText"
      :empty-text="noResultsText"
      :error-text="error"
      :clearable="hasValue"
      :invalid="!!validationError"
      :close-on-select="!isMultiple"
      :chip-display-limit="0"
      @open="handleDropdownOpen"
      @close="handleDropdownClose"
      @update:model-value="onValueUpdate"
      @scroll-bottom="handleScrollBottom"
    >
      <template #trigger="{ state, actions }">
        <div
          :class="[
            CSS_CLASSES.BB_API_SELECT_SEARCH,
            { [CSS_CLASSES.BB_API_SELECT_SEARCH_OPEN]: state.isOpen },
          ]"
        >
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            :class="CSS_CLASSES.BB_API_SELECT_INPUT"
            :placeholder="effectivePlaceholder(state.selectedOptions)"
            @focus="onSearchFocus(actions.open)"
            @click.stop="onSearchClick(actions.open)"
            @input="onSearchInput"
          />

          <span v-if="loading" :class="CSS_CLASSES.BB_API_SELECT_LOADER">⏳</span>
          <span
            v-else-if="hasValue"
            :class="CSS_CLASSES.BB_API_SELECT_CLEAR"
            @click.stop="() => handleClear(actions.clear)"
          >
            ✕
          </span>

          <button
            type="button"
            :class="[
              CSS_CLASSES.BB_API_SELECT_TOGGLE,
              { [CSS_CLASSES.BB_API_SELECT_TOGGLE_OPEN]: state.isOpen },
            ]"
            @click.stop="actions.toggle"
          >
            ▼
          </button>
        </div>
      </template>

      <template #after-options>
        <div
          v-if="!loading && !error && (hasMore || items.length === 0)"
          :class="CSS_CLASSES.BB_API_SELECT_LOAD_MORE"
          @click.stop="loadMore"
        >
          Загрузить ещё...
        </div>
      </template>
    </CustomDropdown>

    <div v-if="isMultiple && selectedItems.length > 0" :class="CSS_CLASSES.BB_API_SELECT_SELECTED">
      <div v-for="item in selectedItems" :key="item.id" :class="CSS_CLASSES.BB_API_SELECT_TAG">
        <span :class="CSS_CLASSES.BB_API_SELECT_TAG_NAME">{{ item.name }}</span>
        <span :class="CSS_CLASSES.BB_API_SELECT_TAG_REMOVE" @click="removeItem(item.id)">✕</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CSS_CLASSES } from '../../utils/constants';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { defineAsyncComponent } from 'vue';

import type { IApiRequestParams, IApiSelectItem, IFormFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import {
  cloneApiSelectStoredValue,
  extractApiSelectItemsFromValue,
  hasApiSelectValue,
  isSameApiSelectModelValue,
  removeApiSelectItemById,
  toApiSelectDropdownValue,
  toApiSelectStoredValue,
} from '../../utils/apiSelectValueHelpers';

const CustomDropdown = defineAsyncComponent(
  () => import('./CustomDropdown.vue') as unknown as Promise<any>
);

type TDropdownValue = string | number | (string | number)[] | null;
type TCustomDropdownExpose = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  updatePosition: () => void;
  saveScrollPosition: () => number;
  restoreScrollPosition: (scrollTop: number) => void;
  saveScrollSnapshot: () => { top: number; height: number };
  restoreScrollFromSnapshot: (snapshot: { top: number; height: number } | null) => void;
  isOpen: { value: boolean };
};

interface IProps {
  config: IFormFieldConfig;
  modelValue?: unknown;
  validationError?: string;
  apiSelectUseCase: ApiSelectUseCase;
}

const props = defineProps<IProps>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void;
}>();

const searchInput = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<TCustomDropdownExpose | null>(null);

const searchQuery = ref('');
const items = ref<IApiSelectItem[]>([]);
const selectedItems = ref<IApiSelectItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const isDropdownOpen = ref(false);
const currentPage = ref(1);
const hasMore = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const knownItems = new Map<string | number, IApiSelectItem>();
const previousModelValue = ref<unknown>(props.modelValue ?? null);

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

const normalizedDropdownValue = computed<TDropdownValue>(() =>
  toApiSelectDropdownValue(props.modelValue, isMultiple.value)
);

const hasValue = computed(() => hasApiSelectValue(props.modelValue, isMultiple.value));

const dropdownOptions = computed(() => {
  const map = new Map<string | number, IApiSelectItem>();
  items.value.forEach(item => {
    map.set(item.id, item);
  });
  selectedItems.value.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values()).map(item => ({
    value: item.id,
    label: item.name,
  }));
});

const resolveItemById = (id: string | number): IApiSelectItem | undefined =>
  knownItems.get(id) ??
  items.value.find(item => item.id === id) ??
  selectedItems.value.find(item => item.id === id);

const hydrateSelectedItemsFromValue = (value: unknown) => {
  const nextSelection = extractApiSelectItemsFromValue(value);

  nextSelection.forEach(item => {
    knownItems.set(item.id, item);
  });

  if (
    selectedItems.value.length === nextSelection.length &&
    selectedItems.value.every(
      (item, index) =>
        item.id === nextSelection[index]?.id && item.name === nextSelection[index]?.name
    )
  ) {
    return;
  }

  selectedItems.value = nextSelection;
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

  const savedSnapshot =
    (!reset && isDropdownOpen.value ? dropdownRef.value?.saveScrollSnapshot() : null) ?? null;

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
    response.data.forEach(item => {
      knownItems.set(item.id, item);
    });
    hydrateSelectedItemsFromValue(props.modelValue);

    hasMore.value = response.hasMore ?? false;
    if (isDropdownOpen.value) {
      await nextTick();
      dropdownRef.value?.updatePosition();
      dropdownRef.value?.restoreScrollFromSnapshot(savedSnapshot);
      await nextTick();
      dropdownRef.value?.updatePosition();
    }
  } catch (error_: any) {
    error.value = error_.message || errorText.value;
    items.value = [];
  } finally {
    loading.value = false;
    if (isDropdownOpen.value) {
      nextTick(() => {
        dropdownRef.value?.updatePosition();
      });
    }
  }
};

const onSearchInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchData(true).then(() => {
      if (!isDropdownOpen.value) {
        dropdownRef.value?.open();
      } else {
        dropdownRef.value?.updatePosition();
      }
    });
  }, debounceMs.value);
};

const syncSearchQueryWithSelection = (value: unknown) => {
  if (isMultiple.value) {
    searchQuery.value = '';
    return;
  }

  const selectedItem = extractApiSelectItemsFromValue(value)[0];
  searchQuery.value = selectedItem?.name ?? '';
};

const handleDropdownOpen = async () => {
  isDropdownOpen.value = true;

  await nextTick();
  dropdownRef.value?.updatePosition();

  // Всегда обновляем первую страницу при открытии
  currentPage.value = 1;
  await fetchData(true);
  await nextTick();
  dropdownRef.value?.updatePosition();
};

const handleDropdownClose = () => {
  isDropdownOpen.value = false;
  syncSearchQueryWithSelection(props.modelValue);
};

const removeItem = (id: string | number) => {
  if (!isMultiple.value) {
    return;
  }

  const newValue = removeApiSelectItemById(props.modelValue, id);
  emit('update:modelValue', newValue);
  hydrateSelectedItemsFromValue(newValue);
  previousModelValue.value = cloneApiSelectStoredValue(newValue);
  syncSearchQueryWithSelection(newValue);
};

const loadMore = () => {
  if (loading.value) {
    return;
  }
  // Если списка еще нет — стартуем с reset
  const isFirstLoad = items.value.length === 0;
  if (isFirstLoad) {
    currentPage.value = 1;
    fetchData(true).then(() => {
      dropdownRef.value?.updatePosition();
    });
    return;
  }
  if (!hasMore.value) {
    return;
  }
  currentPage.value += 1;
  fetchData(false).then(() => {
    dropdownRef.value?.updatePosition();
  });
};

const handleScrollBottom = () => {
  // Отключаем автозагрузку при скролле
};

const onValueUpdate = (value: TDropdownValue) => {
  const storedValue = toApiSelectStoredValue(value, isMultiple.value, resolveItemById);
  emit('update:modelValue', storedValue);
  hydrateSelectedItemsFromValue(storedValue);
  syncSearchQueryWithSelection(storedValue);
  previousModelValue.value = cloneApiSelectStoredValue(storedValue);
};

const handleClear = (clear: () => void) => {
  clear();
  fetchData(true);
};

const effectivePlaceholder = (selectedOptions: { label: string }[]) => {
  if (!isMultiple.value && selectedOptions.length > 0 && !isDropdownOpen.value) {
    return '';
  }
  return placeholder.value;
};

const onSearchFocus = (openDropdownSlot: () => Promise<void> | void) => {
  openDropdownSlot();
};

const onSearchClick = (openDropdownSlot: () => Promise<void> | void) => {
  openDropdownSlot();
};

watch(
  () => props.modelValue,
  value => {
    if (!isSameApiSelectModelValue(previousModelValue.value, value, isMultiple.value)) {
      previousModelValue.value = cloneApiSelectStoredValue(value);
    }

    hydrateSelectedItemsFromValue(value);

    if (!isDropdownOpen.value) {
      syncSearchQueryWithSelection(value);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>
