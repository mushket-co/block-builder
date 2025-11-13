<template>
  <div class="bb-api-select">
    <label v-if="config.label" class="bb-api-select__label">
      {{ config.label }}
      <span v-if="isRequired" class="bb-api-select__required">*</span>
    </label>

    <CustomDropdown
      ref="dropdownRef"
      class="bb-api-select__dropdown-control"
      :model-value="props.modelValue"
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
      @update:modelValue="onValueUpdate"
      @scroll-bottom="handleScrollBottom"
    >
      <template #trigger="{ state, actions }">
        <div class="bb-api-select__search" :class="{ 'bb-api-select__search--open': state.isOpen }">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="bb-api-select__input"
            :placeholder="effectivePlaceholder(state.selectedOptions)"
            @focus="onSearchFocus(actions.open)"
            @click.stop="onSearchClick(actions.open)"
            @input="onSearchInput"
          />

          <span v-if="loading" class="bb-api-select__loader">⏳</span>
          <span
            v-else-if="hasValue"
            class="bb-api-select__clear"
            @click.stop="() => handleClear(actions.clear)"
          >
            ✕
          </span>

          <button
            type="button"
            class="bb-api-select__toggle"
            :class="{ 'bb-api-select__toggle--open': state.isOpen }"
            @click.stop="actions.toggle"
          >
            ▼
          </button>
        </div>
      </template>

      <template #after-options>
        <div v-if="hasMore" class="bb-api-select__load-more" @click.stop="loadMore">
          Загрузить еще...
        </div>
      </template>
    </CustomDropdown>

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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { IApiRequestParams, IApiSelectItem, IFormFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import CustomDropdown from './CustomDropdown.vue';

type TDropdownValue = string | number | (string | number)[] | null;
type TCustomDropdownExpose = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  updatePosition: () => void;
  saveScrollPosition: () => number;
  restoreScrollPosition: (scrollTop: number) => void;
  isOpen: { value: boolean };
};

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
const previousModelValue = ref<TDropdownValue>(props.modelValue);

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

const updateKnownSelections = (value: string | number | (string | number)[] | null) => {
  const previousSelection = selectedItems.value;

  if (isMultiple.value) {
    const ids = new Set(Array.isArray(value) ? value : []);
    selectedItems.value = Array.from(ids)
      .map(id => knownItems.get(id) ?? previousSelection.find(item => item.id === id))
      .filter((item): item is IApiSelectItem => Boolean(item));
  } else if (
    !Array.isArray(value) &&
    value !== null &&
    value !== undefined &&
    value !== ''
  ) {
    const candidate =
      knownItems.get(value) ?? previousSelection.find(item => item.id === value) ?? null;
    selectedItems.value = candidate ? [candidate] : [];
  } else {
    selectedItems.value = [];
  }
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

  const savedScrollTop = !reset && isDropdownOpen.value ? dropdownRef.value?.saveScrollPosition() ?? 0 : 0;

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
    updateKnownSelections(props.modelValue);

    hasMore.value = response.hasMore ?? false;
    if (isDropdownOpen.value) {
      await nextTick();
      dropdownRef.value?.updatePosition();
      if (savedScrollTop > 0) {
        dropdownRef.value?.restoreScrollPosition(savedScrollTop);
      }
    }
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
        dropdownRef.value?.open();
      }
    });
  }, debounceMs.value);
};

const syncSearchQueryWithSelection = (value: string | number | (string | number)[] | null) => {
  if (isMultiple.value) {
    searchQuery.value = '';
    return;
  }

  if (value === null || value === undefined || value === '') {
    searchQuery.value = '';
    return;
  }

  const selectedItem =
    selectedItems.value.find(item => item.id === value) ||
    items.value.find(item => item.id === value);

  searchQuery.value = selectedItem?.name ?? '';
};

const handleDropdownOpen = () => {
  isDropdownOpen.value = true;

  if (!loading.value) {
    fetchData(true);
  }
};

const handleDropdownClose = () => {
  isDropdownOpen.value = false;
  syncSearchQueryWithSelection(props.modelValue);
};

const removeItem = (id: string | number) => {
  if (!isMultiple.value) {
    return;
  }

  const currentValue = (props.modelValue as (string | number)[]) || [];
  const newValue = currentValue.filter(itemId => itemId !== id);
  emit('update:modelValue', newValue);
  selectedItems.value = selectedItems.value.filter(item => item.id !== id);
  previousModelValue.value = cloneModelValue(newValue);
  syncSearchQueryWithSelection(newValue);
};

const loadMore = () => {
  if (!hasMore.value || loading.value) {
    return;
  }
  currentPage.value += 1;
  fetchData(false).then(() => {
    dropdownRef.value?.updatePosition();
  });
};

const handleScrollBottom = () => {
  if (hasMore.value && !loading.value) {
    loadMore();
  }
};

const onValueUpdate = (value: TDropdownValue) => {
  emit('update:modelValue', value);
  updateKnownSelections(value);
  syncSearchQueryWithSelection(value);
  previousModelValue.value = cloneModelValue(value);
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

const cloneModelValue = (value: TDropdownValue): TDropdownValue => {
  if (Array.isArray(value)) {
    return [...value];
  }
  return value;
};

const isSameModelValue = (first: TDropdownValue, second: TDropdownValue): boolean => {
  if (Array.isArray(first) && Array.isArray(second)) {
    if (first.length !== second.length) {
      return false;
    }
    return first.every((item, index) => item === second[index]);
  }

  if (!Array.isArray(first) && !Array.isArray(second)) {
    return first === second;
  }

  return false;
};

const syncWithModelValue = (value: TDropdownValue) => {
  updateKnownSelections(value);
  if (!isDropdownOpen.value) {
    syncSearchQueryWithSelection(value);
  }
};

watch<TDropdownValue>(
  () => props.modelValue as TDropdownValue,
  value => {
    if (!isSameModelValue(previousModelValue.value, value)) {
      previousModelValue.value = cloneModelValue(value);
    }
    syncWithModelValue(value);
  },
  { immediate: true }
);

onMounted(async () => {
  await nextTick();

  if (hasValue.value && apiConfig.value) {
    try {
      loading.value = true;
      const response = await apiSelectUseCase.fetchItems(apiConfig.value, {
        limit: apiConfig.value.limit ?? 20,
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

      response.data.forEach(item => {
        knownItems.set(item.id, item);
      });
      updateKnownSelections(props.modelValue);
    } catch {
    } finally {
      loading.value = false;
    }

    selectedItems.value.forEach(item => {
      knownItems.set(item.id, item);
    });
  }

  previousModelValue.value = cloneModelValue(props.modelValue);
  syncWithModelValue(props.modelValue);
});

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});

</script>
