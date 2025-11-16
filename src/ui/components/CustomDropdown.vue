<template>
  <div
    ref="rootRef"
    class="bb-dropdown"
    :class="{
      'bb-dropdown--open': isOpen,
      'bb-dropdown--disabled': disabled,
      'bb-dropdown--invalid': invalid,
      'bb-dropdown--multiple': multiple,
    }"
  >
    <div
      ref="triggerRef"
      class="bb-dropdown__control"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeydown"
    >
      <slot name="trigger" v-bind="triggerSlotProps">
        <div class="bb-dropdown__value">
          <template v-if="multiple">
            <div v-if="selectedOptions.length > 0" class="bb-dropdown__chips">
              <span
                v-for="option in visibleChipOptions"
                :key="option.value"
                class="bb-dropdown__chip"
              >
                {{ option.label }}
              </span>
              <span v-if="hiddenChipCount > 0" class="bb-dropdown__chip bb-dropdown__chip--more">
                +{{ hiddenChipCount }}
              </span>
            </div>
            <span v-else class="bb-dropdown__placeholder">
              {{ placeholder }}
            </span>
          </template>

          <template v-else>
            <span v-if="displayValue" class="bb-dropdown__single">
              {{ displayValue }}
            </span>
            <span v-else class="bb-dropdown__placeholder">
              {{ placeholder }}
            </span>
          </template>
        </div>

        <button
          v-if="showClear"
          type="button"
          class="bb-dropdown__clear"
          @click.stop="clearSelection"
        >
          ✕
        </button>

        <span class="bb-dropdown__arrow" :class="{ 'bb-dropdown__arrow--open': isOpen }">▼</span>
      </slot>
    </div>

    <Teleport :to="teleportTo">
      <Transition name="bb-dropdown-fade">
        <div
          v-if="isOpen"
          ref="panelRef"
          class="bb-dropdown__panel"
          :style="panelStyle"
          role="listbox"
          :aria-multiselectable="multiple"
          @mousedown.prevent
        >
          <slot name="panel" v-bind="panelSlotProps">
            <div
              ref="contentRef"
              class="bb-dropdown__content"
              :style="contentStyle"
              @scroll.passive="handleContentScroll"
            >
              <slot name="before-options" />

              <div v-if="loading" class="bb-dropdown__message">
                <slot name="loading">
                  {{ loadingText }}
                </slot>
              </div>

              <div v-else-if="errorText" class="bb-dropdown__message bb-dropdown__message--error">
                <slot name="error">
                  {{ errorText }}
                </slot>
              </div>

              <template v-else-if="options.length > 0">
                <ul class="bb-dropdown__list">
                  <li
                    v-for="(option, index) in options"
                    :key="option.value"
                    class="bb-dropdown__option"
                    :class="{
                      'bb-dropdown__option--selected': isOptionSelected(option.value),
                      'bb-dropdown__option--disabled': option.disabled,
                      'bb-dropdown__option--active': highlightedIndex === index,
                    }"
                    role="option"
                    :aria-selected="isOptionSelected(option.value)"
                    @click="onOptionClick(option)"
                    @mouseenter="highlight(index)"
                  >
                    <slot name="option" :option="option" :selected="isOptionSelected(option.value)">
                      <span class="bb-dropdown__option-label">{{ option.label }}</span>
                      <span v-if="isOptionSelected(option.value)" class="bb-dropdown__option-check"
                        >✓</span
                      >
                    </slot>
                  </li>
                </ul>
              </template>

              <div v-else class="bb-dropdown__message">
                <slot name="empty">
                  {{ emptyText }}
                </slot>
              </div>

              <slot name="after-options" />
            </div>
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

interface IDropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  meta?: Record<string, unknown>;
}

export type TDropdownValue = string | number | (string | number)[] | null;

const props = withDefaults(
  defineProps<{
    modelValue: TDropdownValue;
    options?: IDropdownOption[];
    placeholder?: string;
    multiple?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    loading?: boolean;
    loadingText?: string;
    emptyText?: string;
    errorText?: string | null;
    invalid?: boolean;
    teleportTo?: string;
    maxHeight?: number;
    closeOnSelect?: boolean;
    chipDisplayLimit?: number;
  }>(),
  {
    options: () => [],
    placeholder: 'Выберите значение',
    multiple: false,
    disabled: false,
    clearable: false,
    loading: false,
    loadingText: 'Загрузка...',
    emptyText: 'Нет данных',
    errorText: null,
    invalid: false,
    teleportTo: 'body',
    maxHeight: 320,
    chipDisplayLimit: 3,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: TDropdownValue): void;
  (e: 'open'): void;
  (e: 'close'): void;
  (e: 'scroll-bottom'): void;
  (e: 'clear'): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const highlightedIndex = ref(-1);
const panelStyle = ref<Record<string, string>>({});

const options = computed(() => props.options ?? []);

type TScrollAncestor = HTMLElement | (Window & typeof globalThis);
let scrollableAncestors: TScrollAncestor[] = [];
let scrollListeners: Array<{ ancestor: TScrollAncestor; handler: () => void }> = [];

const selectedOptions = computed<IDropdownOption[]>(() => {
  if (props.multiple) {
    const value = Array.isArray(props.modelValue) ? props.modelValue : [];
    return options.value.filter(option => value.includes(option.value));
  }

  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return [];
  }

  const option = options.value.find(item => item.value === props.modelValue);
  return option ? [option] : [];
});

const displayValue = computed(() => {
  if (selectedOptions.value.length === 0) {
    return '';
  }
  return selectedOptions.value[0]?.label ?? '';
});

const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  }
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '';
});

const showClear = computed(() => props.clearable && hasValue.value && !props.disabled);

const contentStyle = computed(() => {
  const maxPanelHeight = props.maxHeight ?? 320;
  return {
    maxHeight: `${maxPanelHeight}px`,
  };
});

const visibleChipOptions = computed(() => {
  if (!props.multiple) {
    return [];
  }

  const limitConfig = props.chipDisplayLimit ?? 0;
  const limit = Math.max(limitConfig, 0);

  if (limit === 0) {
    return selectedOptions.value;
  }

  return selectedOptions.value.slice(0, limit);
});

const hiddenChipCount = computed(() => {
  if (!props.multiple) {
    return 0;
  }

  return Math.max(0, selectedOptions.value.length - visibleChipOptions.value.length);
});

const open = async () => {
  if (props.disabled || isOpen.value) {
    if (isOpen.value) {
      await nextTick();
      updatePosition();
    }
    return;
  }

  // Сбрасываем прошлый snapshot перед открытием,
  // чтобы не восстановить позицию от предыдущего сеанса
  lastScrollSnapshot.value = null;

  isOpen.value = true;
  emit('open');

  await nextTick();
  updatePosition();
  highlightInitial();
};

const close = () => {
  if (!isOpen.value) {
    return;
  }

  isOpen.value = false;
  highlightedIndex.value = -1;
  cleanupScrollableAncestors();
  emit('close');

  // После закрытия сбрасываем snapshot
  lastScrollSnapshot.value = null;
};

const toggle = () => {
  if (isOpen.value) {
    close();
  } else {
    void open();
  }
};

const saveScrollPosition = (): number => {
  if (!contentRef.value) {
    return 0;
  }
  return contentRef.value.scrollTop;
};

const restoreScrollPosition = (scrollTop: number) => {
  if (!contentRef.value || scrollTop <= 0) {
    return;
  }
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = scrollTop;
    }
  });
};

type TScrollSnapshot = { top: number; height: number };

const saveScrollSnapshot = (): TScrollSnapshot => {
  const top = contentRef.value?.scrollTop ?? 0;
  const height = contentRef.value?.scrollHeight ?? 0;
  return { top, height };
};

const restoreScrollFromSnapshot = (snapshot: TScrollSnapshot | null | undefined) => {
  if (!contentRef.value || !snapshot) {
    return;
  }
  nextTick(() => {
    if (!contentRef.value) {
      return;
    }
    const prevTop = snapshot.top;
    const prevHeight = snapshot.height;
    const newHeight = contentRef.value.scrollHeight;
    const client = contentRef.value.clientHeight;
    // Если это первый рендер (нечего восстанавливать), остаёмся в начале
    if (prevHeight === 0) {
      contentRef.value.scrollTop = 0;
      return;
    }
    const delta = Math.max(0, newHeight - prevHeight);
    // Считаем расстояние до низа в прошлом состоянии
    const distanceFromBottomPrev = prevHeight - (prevTop + client);
    // Считаем "близко к низу" только если расстояние неотрицательное и мало
    const wasNearBottom = distanceFromBottomPrev >= 0 && distanceFromBottomPrev <= 48;
    const targetTop = wasNearBottom ? prevTop + delta : prevTop;
    contentRef.value.scrollTop = Math.max(0, targetTop);
  });
};

const lastScrollSnapshot = ref<TScrollSnapshot | null>(null);

watch(
  () => props.loading,
  (isLoading) => {
    if (!isOpen.value) {
      return;
    }
    if (isLoading) {
      lastScrollSnapshot.value = saveScrollSnapshot();
    } else {
      // Восстанавливаем позицию после обновления списка
      nextTick(() => {
        restoreScrollFromSnapshot(lastScrollSnapshot.value);
        // Обновляем позицию панели (мог изменииться размер)
        nextTick(() => updatePosition());
      });
    }
  }
);

const updatePosition = () => {
  if (!isOpen.value || !triggerRef.value || !panelRef.value) {
    return;
  }

  const rect = triggerRef.value.getBoundingClientRect();
  const viewportMargin = 8;
  const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - viewportMargin);
  const spaceAbove = Math.max(0, rect.top - viewportMargin);
  const shouldShowAbove = spaceBelow < spaceAbove;
  const availableSpace = shouldShowAbove ? spaceAbove : spaceBelow;
  const maxPanelHeight = props.maxHeight ?? 320;
  const effectiveMaxHeight = Math.min(
    maxPanelHeight,
    Math.max(160, availableSpace > 0 ? availableSpace : maxPanelHeight)
  );

  const dropdownHeight = Math.min(panelRef.value.scrollHeight, effectiveMaxHeight);

  let top = shouldShowAbove
    ? rect.top - dropdownHeight - viewportMargin
    : rect.bottom + viewportMargin;
  const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
  top += viewportOffsetTop;

  const maxTop = window.innerHeight - dropdownHeight - viewportMargin;
  const minTop = viewportMargin;
  top = Math.max(minTop, Math.min(maxTop, top));

  panelStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    top: `${top}px`,
    maxHeight: `${effectiveMaxHeight}px`,
  };
};

const getNextIndex = (direction: 1 | -1) => {
  if (options.value.length === 0) {
    return -1;
  }

  let nextIndex = highlightedIndex.value;

  for (let i = 0; i < options.value.length; i += 1) {
    nextIndex = (nextIndex + direction + options.value.length) % options.value.length;
    const option = options.value[nextIndex];
    if (!option.disabled) {
      return nextIndex;
    }
  }

  return highlightedIndex.value;
};

const highlight = (index: number) => {
  if (options.value[index]?.disabled) {
    return;
  }
  highlightedIndex.value = index;
};

const highlightInitial = () => {
  if (props.multiple) {
    highlightedIndex.value = getNextIndex(1);
    return;
  }

  const selectedIndex = options.value.findIndex(option => option.value === props.modelValue);

  if (selectedIndex >= 0 && !options.value[selectedIndex]?.disabled) {
    highlightedIndex.value = selectedIndex;
    return;
  }

  highlightedIndex.value = getNextIndex(1);
};

const isOptionSelected = (value: string | number) => {
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? props.modelValue : [];
    return currentValue.includes(value);
  }

  return props.modelValue === value;
};

const onOptionClick = (option: IDropdownOption) => {
  if (option.disabled) {
    return;
  }

  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];

    if (currentValue.includes(option.value)) {
      const nextValue = currentValue.filter(value => value !== option.value);
      emit('update:modelValue', nextValue);
    } else {
      emit('update:modelValue', [...currentValue, option.value]);
    }
  } else {
    emit('update:modelValue', option.value);
    close();
  }
};

const clearSelection = () => {
  if (!hasValue.value || props.disabled) {
    return;
  }

  if (props.multiple) {
    emit('update:modelValue', []);
  } else {
    emit('update:modelValue', null);
  }

  emit('clear');
};

const handleTriggerClick = () => {
  toggle();
};

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      if (!isOpen.value) {
        void open();
      } else {
        highlight(getNextIndex(1));
        scrollHighlightedIntoView();
      }
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      if (isOpen.value) {
        highlight(getNextIndex(-1));
        scrollHighlightedIntoView();
      } else {
        void open();
      }
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (!isOpen.value) {
        void open();
      } else if (highlightedIndex.value >= 0) {
        const option = options.value[highlightedIndex.value];
        if (option) {
          onOptionClick(option);
        }
      }
      break;
    }
    case 'Escape': {
      if (isOpen.value) {
        event.preventDefault();
        close();
      }
      break;
    }
    case 'Tab': {
      close();
      break;
    }
    default:
      break;
  }
};

const scrollHighlightedIntoView = () => {
  if (!contentRef.value || highlightedIndex.value < 0) {
    return;
  }

  const optionElements = contentRef.value.querySelectorAll<HTMLElement>('.bb-dropdown__option');
  const element = optionElements[highlightedIndex.value];

  if (!element) {
    return;
  }

  const { offsetTop, offsetHeight } = element;
  const { scrollTop, clientHeight } = contentRef.value;

  const isAbove = offsetTop < scrollTop;
  const isBelow = offsetTop + offsetHeight > scrollTop + clientHeight;

  if (isAbove) {
    contentRef.value.scrollTo({ top: offsetTop, behavior: 'smooth' });
  } else if (isBelow) {
    contentRef.value.scrollTo({
      top: offsetTop - clientHeight + offsetHeight,
      behavior: 'smooth',
    });
  }
};

const handleContentScroll = (event: Event) => {
  const element = event.target as HTMLElement;
  const threshold = 32;

  if (element.scrollHeight - element.scrollTop - element.clientHeight <= threshold) {
    emit('scroll-bottom');
  }
};

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const containsTarget =
    rootRef.value?.contains(target) || panelRef.value?.contains(target) || false;

  if (!containsTarget) {
    close();
  }
};

const handleWindowChange = () => {
  if (isOpen.value) {
    updatePosition();
  }
};

const isElementScrollable = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  const overflow = style.overflow;
  const isScrollable =
    overflowY === 'scroll' || overflowY === 'auto' || overflow === 'scroll' || overflow === 'auto';

  if (!isScrollable) {
    return false;
  }

  return element.scrollHeight > element.clientHeight;
};

const findScrollableAncestors = (element: HTMLElement | null) => {
  const ancestors: HTMLElement[] = [];
  if (!element) {
    return ancestors;
  }

  let current = element.parentElement;
  while (current && current !== document.body) {
    if (isElementScrollable(current)) {
      ancestors.push(current);
    }
    current = current.parentElement;
  }

  return ancestors;
};

const cleanupScrollableAncestors = () => {
  scrollListeners.forEach(({ ancestor, handler }) => {
    ancestor.removeEventListener('scroll', handler);
  });
  scrollListeners = [];
  scrollableAncestors = [];
};

const attachScrollableAncestors = () => {
  cleanupScrollableAncestors();
  const triggerElement = triggerRef.value;
  if (!triggerElement) {
    return;
  }

  const ancestors = findScrollableAncestors(triggerElement);
  scrollableAncestors = [window, ...ancestors];

  scrollableAncestors.forEach(ancestor => {
    const handler = handleWindowChange;
    ancestor.addEventListener('scroll', handler, { passive: true });
    scrollListeners.push({ ancestor, handler });
  });
};

const triggerSlotProps = computed(() => ({
  state: {
    isOpen: isOpen.value,
    hasValue: hasValue.value,
    selectedOptions: selectedOptions.value,
    multiple: props.multiple,
    disabled: props.disabled,
  },
  actions: {
    open,
    close,
    toggle,
    clear: clearSelection,
  },
}));

const panelSlotProps = computed(() => ({
  state: {
    isOpen: isOpen.value,
    selectedOptions: selectedOptions.value,
    highlightedIndex: highlightedIndex.value,
  },
  actions: {
    open,
    close,
    toggle,
    updatePosition,
  },
}));

watch(
  () => props.modelValue as TDropdownValue,
  () => {
    if (!props.multiple) {
      highlightInitial();
    }
  }
);

watch(isOpen, (value: boolean) => {
  if (value) {
    document.addEventListener('mousedown', handleOutsideClick, true);
    window.addEventListener('resize', handleWindowChange);
    void nextTick(() => {
      attachScrollableAncestors();
      updatePosition();
    });
  } else {
    document.removeEventListener('mousedown', handleOutsideClick, true);
    window.removeEventListener('resize', handleWindowChange);
    cleanupScrollableAncestors();
  }
});

onMounted(() => {
  if (props.invalid) {
    void nextTick(() => {
      if (isOpen.value) {
        updatePosition();
      }
    });
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick, true);
  window.removeEventListener('resize', handleWindowChange);
  cleanupScrollableAncestors();
});

defineExpose({
  open,
  close,
  toggle,
  updatePosition,
  saveScrollPosition,
  restoreScrollPosition,
  saveScrollSnapshot,
  restoreScrollFromSnapshot,
  isOpen,
});
</script>
