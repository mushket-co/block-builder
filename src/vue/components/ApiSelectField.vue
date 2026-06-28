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
          <div :class="CSS_CLASSES.BB_API_SELECT_FIELD">
            <span
              :class="[
                CSS_CLASSES.BB_API_SELECT_VALUE,
                { [CSS_CLASSES.BB_API_SELECT_VALUE_HIDDEN]: !showSelectedValue },
              ]"
            >
              {{ selectedDisplayValue ?? '' }}
            </span>
            <span
              :class="[
                CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER,
                { [CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER_HIDDEN]: !showClosedPlaceholder },
              ]"
            >
              {{ placeholder }}
            </span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :class="[
                CSS_CLASSES.BB_API_SELECT_INPUT,
                { [CSS_CLASSES.BB_API_SELECT_INPUT_HIDDEN]: !state.isOpen },
              ]"
              :placeholder="placeholder"
              @click.stop
              @keydown.stop
              @input="onSearchInput(($event.target as HTMLInputElement).value)"
            />
          </div>

          <span v-if="loading" :class="CSS_CLASSES.BB_API_SELECT_LOADER">
            <Icon name="loader" :width="14" :height="14" class="bb-icon--spin" />
          </span>
          <span
            v-else-if="hasValue"
            :class="CSS_CLASSES.BB_API_SELECT_CLEAR"
            @click.stop="() => handleClear(actions.clear)"
          >
            <Icon name="close" :width="14" :height="14" />
          </span>

          <button
            type="button"
            :class="[
              CSS_CLASSES.BB_API_SELECT_TOGGLE,
              { [CSS_CLASSES.BB_API_SELECT_TOGGLE_OPEN]: state.isOpen },
            ]"
            @click.stop="actions.toggle"
          >
            <Icon name="chevronDown" :width="12" :height="12" />
          </button>
        </div>
      </template>

      <template #after-options>
        <div
          v-if="!loading && !error && hasMore"
          :class="CSS_CLASSES.BB_API_SELECT_LOAD_MORE"
          @click.stop="loadMore"
        >
          {{ uiStrings.apiSelectLoadMore }}
        </div>
      </template>
    </CustomDropdown>

    <div v-if="isMultiple && selectedItems.length > 0" :class="CSS_CLASSES.BB_API_SELECT_SELECTED">
      <div v-for="item in selectedItems" :key="item.id" :class="CSS_CLASSES.BB_API_SELECT_TAG">
        <span :class="CSS_CLASSES.BB_API_SELECT_TAG_NAME">{{ item.name }}</span>
        <span :class="CSS_CLASSES.BB_API_SELECT_TAG_REMOVE" @click="removeItem(item.id)">
          <Icon name="close" :width="12" :height="12" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  clearApiSelectDebounceTimer,
  resolveApiSelectDebounceMs,
  scheduleApiSelectSearch,
} from '../../utils/apiSelectSearchDebounce';
import { CSS_CLASSES } from '../../utils/constants';
import Icon from '../../shared/icons/Icon.vue';
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
import { useUiStrings } from '../composables/useUiStrings';

const uiStrings = useUiStrings();

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

const debounceTimer = { current: null as ReturnType<typeof setTimeout> | null };
const knownItems = new Map<string | number, IApiSelectItem>();
const previousModelValue = ref<unknown>(props.modelValue ?? null);
const currentModelValue = ref<unknown>(props.modelValue ?? null);

const apiSelectUseCase = props.apiSelectUseCase;

const apiConfig = computed(() => props.config.apiSelectConfig);

const isRequired = computed(() => {
  return props.config.rules?.some(rule => rule.type === 'required') ?? false;
});

const isMultiple = computed(() => apiConfig.value?.multiple ?? false);

const placeholder = computed(() => apiConfig.value?.placeholder ?? uiStrings.value.apiSelectPlaceholder);

const loadingText = computed(() => apiConfig.value?.loadingText ?? uiStrings.value.apiSelectLoading);

const noResultsText = computed(() => apiConfig.value?.noResultsText ?? uiStrings.value.apiSelectNoResults);

const errorText = computed(() => apiConfig.value?.errorText ?? uiStrings.value.apiSelectError);

const debounceMs = computed(() => resolveApiSelectDebounceMs(apiConfig.value?.debounceMs));

const minSearchLength = computed(() => apiConfig.value?.minSearchLength ?? 0);

const normalizedDropdownValue = computed<TDropdownValue>(() =>
  toApiSelectDropdownValue(props.modelValue, isMultiple.value)
);

const hasValue = computed(() => hasApiSelectValue(props.modelValue, isMultiple.value));

const selectedDisplayValue = computed(() => {
  if (isMultiple.value || isDropdownOpen.value) {
    return null;
  }

  return selectedItems.value[0]?.name ?? null;
});

const showSelectedValue = computed(() => Boolean(selectedDisplayValue.value));

const showClosedPlaceholder = computed(() => !isDropdownOpen.value && !showSelectedValue.value);

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

const fetchData = async (reset = false, searchOverride?: string) => {
  if (!apiConfig.value) {
    error.value = uiStrings.value.apiSelectConfigMissing;
    return;
  }

  const effectiveSearch = searchOverride !== undefined ? searchOverride : searchQuery.value;

  if (effectiveSearch.length < minSearchLength.value && effectiveSearch.length > 0) {
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
      search: effectiveSearch || undefined,
      page: currentPage.value,
      limit: apiConfig.value.limit || 20,
    };

    const response = await apiSelectUseCase.fetchItems(apiConfig.value, params);

    items.value = reset ? response.data : [...items.value, ...response.data];
    response.data.forEach(item => {
      knownItems.set(item.id, item);
    });
    hydrateSelectedItemsFromValue(currentModelValue.value);

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

const onSearchInput = (query: string) => {
  scheduleApiSelectSearch(debounceTimer, debounceMs.value, () => {
    currentPage.value = 1;
    fetchData(true, query).then(() => {
      if (!isDropdownOpen.value) {
        dropdownRef.value?.open();
      } else {
        dropdownRef.value?.updatePosition();
      }
    });
  });
};

const clearSearchQuery = () => {
  searchQuery.value = '';
};

const handleDropdownOpen = async () => {
  isDropdownOpen.value = true;
  clearSearchQuery();

  await nextTick();
  dropdownRef.value?.updatePosition();

  currentPage.value = 1;
  await fetchData(true, '');
  await nextTick();
  searchInput.value?.focus();
  dropdownRef.value?.updatePosition();
};

const handleDropdownClose = () => {
  isDropdownOpen.value = false;
  clearSearchQuery();
};

const removeItem = (id: string | number) => {
  if (!isMultiple.value) {
    return;
  }

  const newValue = removeApiSelectItemById(props.modelValue, id);
  emit('update:modelValue', newValue);
  hydrateSelectedItemsFromValue(newValue);
  previousModelValue.value = cloneApiSelectStoredValue(newValue);
  clearSearchQuery();
};

const loadMore = () => {
  if (loading.value || !hasMore.value) {
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

  currentModelValue.value = storedValue;
  previousModelValue.value = cloneApiSelectStoredValue(storedValue);
  emit('update:modelValue', storedValue);
  hydrateSelectedItemsFromValue(storedValue);
  clearSearchQuery();
};

const handleClear = (clear: () => void) => {
  clear();
  fetchData(true);
};

watch(
  () => props.modelValue,
  value => {
    currentModelValue.value = value;

    if (!isSameApiSelectModelValue(previousModelValue.value, value, isMultiple.value)) {
      previousModelValue.value = cloneApiSelectStoredValue(value);
    }

    hydrateSelectedItemsFromValue(value);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearApiSelectDebounceTimer(debounceTimer);
});
</script>
