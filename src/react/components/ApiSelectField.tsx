import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';

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
import {
  clearApiSelectDebounceTimer,
  resolveApiSelectDebounceMs,
  scheduleApiSelectSearch,
} from '../../utils/apiSelectSearchDebounce';
import { CSS_CLASSES } from '../../utils/constants';
import { Icon } from './icons/Icon';
import {
  CustomDropdown,
  type ICustomDropdownRef,
  type IDropdownOption,
  type TDropdownValue,
} from './CustomDropdown';

interface IApiSelectFieldProps {
  modelValue?: unknown;
  config: IFormFieldConfig;
  validationError?: string;
  apiSelectUseCase: ApiSelectUseCase;
  onChange: (value: unknown) => void;
}

function nextTick(callback: () => void): void {
  queueMicrotask(() => {
    requestAnimationFrame(callback);
  });
}

export function ApiSelectField({
  modelValue,
  config,
  validationError,
  apiSelectUseCase,
  onChange,
}: IApiSelectFieldProps) {
  const dropdownRef = useRef<ICustomDropdownRef>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownItemsRef = useRef(new Map<string | number, IApiSelectItem>());
  const previousModelValueRef = useRef<unknown>(modelValue ?? null);
  const modelValueRef = useRef(modelValue);
  modelValueRef.current = modelValue;

  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<IApiSelectItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<IApiSelectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const apiConfig = config.apiSelectConfig;

  const isRequired = useMemo(
    () => config.rules?.some(rule => rule.type === 'required') ?? false,
    [config.rules]
  );

  const isMultiple = apiConfig?.multiple ?? false;

  const normalizedDropdownValue = useMemo<TDropdownValue>(
    () => toApiSelectDropdownValue(modelValue, isMultiple),
    [modelValue, isMultiple]
  );

  const placeholder = apiConfig?.placeholder ?? 'Начните вводить для поиска...';
  const loadingText = apiConfig?.loadingText ?? 'Загрузка...';
  const noResultsText = apiConfig?.noResultsText ?? 'Ничего не найдено';
  const errorText = apiConfig?.errorText ?? 'Ошибка загрузки данных';
  const debounceMs = resolveApiSelectDebounceMs(apiConfig?.debounceMs);
  const minSearchLength = apiConfig?.minSearchLength ?? 0;

  const hasValue = useMemo(() => hasApiSelectValue(modelValue, isMultiple), [modelValue, isMultiple]);

  const resolveItemById = useCallback(
    (id: string | number) =>
      knownItemsRef.current.get(id) ??
      items.find(item => item.id === id) ??
      selectedItems.find(item => item.id === id),
    [items, selectedItems]
  );

  const hydrateSelectedItemsFromValue = useCallback((value: unknown) => {
    const nextSelection = extractApiSelectItemsFromValue(value);

    nextSelection.forEach(item => {
      knownItemsRef.current.set(item.id, item);
    });

    setSelectedItems(previousSelection => {
      if (
        previousSelection.length === nextSelection.length &&
        previousSelection.every(
          (item, index) =>
            item.id === nextSelection[index]?.id && item.name === nextSelection[index]?.name
        )
      ) {
        return previousSelection;
      }

      return nextSelection;
    });
  }, []);

  const clearSearchQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  const fetchData = useCallback(
    async (reset = false, explicitPage?: number, searchOverride?: string) => {
      if (!apiConfig) {
        setError('Конфигурация API не указана');
        return;
      }

      const effectiveSearch = searchOverride !== undefined ? searchOverride : searchQuery;

      if (effectiveSearch.length < minSearchLength && effectiveSearch.length > 0) {
        return;
      }

      const page = reset ? 1 : (explicitPage ?? currentPage);
      if (reset) {
        setCurrentPage(1);
      } else if (explicitPage !== undefined) {
        setCurrentPage(explicitPage);
      }

      const savedSnapshot =
        (!reset && dropdownRef.current?.isOpen
          ? dropdownRef.current?.saveScrollSnapshot()
          : null) ?? null;

      setLoading(true);
      setError(null);

      try {
        const params: IApiRequestParams = {
          search: effectiveSearch || undefined,
          page,
          limit: apiConfig.limit || 20,
        };

        const response = await apiSelectUseCase.fetchItems(apiConfig, params);

        setItems(currentItems => {
          const nextItems = reset ? response.data : [...currentItems, ...response.data];
          response.data.forEach(item => {
            knownItemsRef.current.set(item.id, item);
          });
          return nextItems;
        });

        hydrateSelectedItemsFromValue(modelValueRef.current);
        setHasMore(response.hasMore ?? false);
      } catch (error_: unknown) {
        const message =
          error_ instanceof Error ? error_.message : String(error_ ?? errorText);
        setError(message || errorText);
        setItems([]);
      } finally {
        setLoading(false);

        if (dropdownRef.current?.isOpen) {
          nextTick(() => {
            if (!reset && savedSnapshot) {
              dropdownRef.current?.restoreScrollFromSnapshot(savedSnapshot);
            }
            nextTick(() => {
              dropdownRef.current?.updatePosition();
            });
          });
        }
      }
    },
    [
      apiConfig,
      apiSelectUseCase,
      currentPage,
      errorText,
      hydrateSelectedItemsFromValue,
      minSearchLength,
      searchQuery,
    ]
  );

  const dropdownOptions = useMemo<IDropdownOption[]>(() => {
    const map = new Map<string | number, IApiSelectItem>();
    items.forEach(item => {
      map.set(item.id, item);
    });
    selectedItems.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values()).map(item => ({
      value: item.id,
      label: item.name,
    }));
  }, [items, selectedItems]);

  const handleDropdownOpen = useCallback(async () => {
    setIsDropdownOpen(true);
    clearSearchQuery();

    await new Promise<void>(resolve => nextTick(resolve));
    dropdownRef.current?.updatePosition();

    setCurrentPage(1);
    await fetchData(true, undefined, '');
    await new Promise<void>(resolve => nextTick(resolve));
    searchInputRef.current?.focus();
    dropdownRef.current?.updatePosition();
  }, [clearSearchQuery, fetchData]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
    clearSearchQuery();
  }, [clearSearchQuery]);

  const onValueUpdate = useCallback(
    (value: TDropdownValue) => {
      const storedValue = toApiSelectStoredValue(value, isMultiple, resolveItemById);
      const clonedValue = cloneApiSelectStoredValue(storedValue);

      modelValueRef.current = storedValue;
      previousModelValueRef.current = clonedValue;
      onChange(storedValue);
      hydrateSelectedItemsFromValue(storedValue);
      clearSearchQuery();
    },
    [clearSearchQuery, hydrateSelectedItemsFromValue, isMultiple, onChange, resolveItemById]
  );

  const handleClear = useCallback(
    (clear: () => void) => {
      clear();
      void fetchData(true, undefined, '');
    },
    [fetchData]
  );

  const removeItem = useCallback(
    (id: string | number) => {
      if (!isMultiple) {
        return;
      }

      const newValue = removeApiSelectItemById(modelValue, id);
      onChange(newValue);
      hydrateSelectedItemsFromValue(newValue);
      previousModelValueRef.current = cloneApiSelectStoredValue(newValue);
      clearSearchQuery();
    },
    [clearSearchQuery, hydrateSelectedItemsFromValue, isMultiple, modelValue, onChange]
  );

  const loadMore = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (loading || !hasMore) {
        return;
      }

      void fetchData(false, currentPage + 1).then(() => {
        dropdownRef.current?.updatePosition();
      });
    },
    [currentPage, fetchData, hasMore, loading]
  );

  const onSearchInput = useCallback(
    (query: string) => {
      scheduleApiSelectSearch(debounceTimerRef, debounceMs, () => {
        setCurrentPage(1);
        void fetchData(true, undefined, query).then(() => {
          if (!dropdownRef.current?.isOpen) {
            void dropdownRef.current?.open();
          } else {
            dropdownRef.current?.updatePosition();
          }
        });
      });
    },
    [debounceMs, fetchData]
  );

  const selectedDisplayValue = useMemo(() => {
    if (isMultiple || isDropdownOpen) {
      return null;
    }

    return selectedItems[0]?.name ?? null;
  }, [isDropdownOpen, isMultiple, selectedItems]);

  const showSelectedValue = Boolean(selectedDisplayValue);
  const showClosedPlaceholder = !isDropdownOpen && !showSelectedValue;

  const isDropdownOpenRef = useRef(isDropdownOpen);
  isDropdownOpenRef.current = isDropdownOpen;

  useEffect(() => {
    if (!isSameApiSelectModelValue(previousModelValueRef.current, modelValue, isMultiple)) {
      previousModelValueRef.current = cloneApiSelectStoredValue(modelValue);
    }

    hydrateSelectedItemsFromValue(modelValue);
  }, [hydrateSelectedItemsFromValue, isMultiple, modelValue]);

  useEffect(() => {
    return () => {
      clearApiSelectDebounceTimer(debounceTimerRef);
    };
  }, []);

  return (
    <div className={CSS_CLASSES.API_SELECT}>
      {config.label ? (
        <label className={CSS_CLASSES.BB_API_SELECT_LABEL}>
          {config.label}
          {isRequired ? (
            <span className={CSS_CLASSES.BB_API_SELECT_REQUIRED}>*</span>
          ) : null}
        </label>
      ) : null}

      <CustomDropdown
        ref={dropdownRef}
        className={CSS_CLASSES.BB_API_SELECT_DROPDOWN_CONTROL}
        modelValue={normalizedDropdownValue}
        options={dropdownOptions}
        multiple={isMultiple}
        placeholder={placeholder}
        loading={loading}
        loadingText={loadingText}
        emptyText={noResultsText}
        errorText={error}
        clearable={hasValue}
        invalid={Boolean(validationError)}
        chipDisplayLimit={0}
        onChange={onValueUpdate}
        onOpen={() => {
          void handleDropdownOpen();
        }}
        onClose={handleDropdownClose}
        onScrollBottom={() => {
          // Отключаем автозагрузку при скролле
        }}
        renderTrigger={({ state, actions }) => (
          <div
            className={[
              CSS_CLASSES.BB_API_SELECT_SEARCH,
              state.isOpen ? CSS_CLASSES.BB_API_SELECT_SEARCH_OPEN : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={CSS_CLASSES.BB_API_SELECT_FIELD}>
              <span
                className={[
                  CSS_CLASSES.BB_API_SELECT_VALUE,
                  !showSelectedValue ? CSS_CLASSES.BB_API_SELECT_VALUE_HIDDEN : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {selectedDisplayValue ?? ''}
              </span>
              <span
                className={[
                  CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER,
                  !showClosedPlaceholder ? CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER_HIDDEN : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {placeholder}
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className={[
                  CSS_CLASSES.BB_API_SELECT_INPUT,
                  !state.isOpen ? CSS_CLASSES.BB_API_SELECT_INPUT_HIDDEN : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                placeholder={placeholder}
                value={searchQuery}
                onClick={event => {
                  event.stopPropagation();
                }}
                onKeyDown={event => {
                  event.stopPropagation();
                }}
                onChange={event => {
                  const nextQuery = event.target.value;
                  setSearchQuery(nextQuery);
                  onSearchInput(nextQuery);
                }}
              />
            </div>

            {loading ? (
              <span className={CSS_CLASSES.BB_API_SELECT_LOADER}>
                <Icon name="loader" width={14} height={14} className="bb-icon--spin" />
              </span>
            ) : hasValue ? (
              <span
                className={CSS_CLASSES.BB_API_SELECT_CLEAR}
                onClick={event => {
                  event.stopPropagation();
                  handleClear(actions.clear);
                }}
              >
                <Icon name="close" width={14} height={14} />
              </span>
            ) : null}

            <button
              type="button"
              className={[
                CSS_CLASSES.BB_API_SELECT_TOGGLE,
                state.isOpen ? CSS_CLASSES.BB_API_SELECT_TOGGLE_OPEN : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={event => {
                event.stopPropagation();
                actions.toggle();
              }}
            >
              <Icon name="chevronDown" width={12} height={12} />
            </button>
          </div>
        )}
        afterOptions={
          !error && hasMore ? (
            <div
              className={CSS_CLASSES.BB_API_SELECT_LOAD_MORE}
              onClick={loadMore}
              style={loading ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
            >
              {loading && items.length > 0 ? loadingText : 'Загрузить ещё...'}
            </div>
          ) : null
        }
      />

      {isMultiple && selectedItems.length > 0 ? (
        <div className={CSS_CLASSES.BB_API_SELECT_SELECTED}>
          {selectedItems.map(item => (
            <div key={item.id} className={CSS_CLASSES.BB_API_SELECT_TAG}>
              <span className={CSS_CLASSES.BB_API_SELECT_TAG_NAME}>{item.name}</span>
              <span
                className={CSS_CLASSES.BB_API_SELECT_TAG_REMOVE}
                onClick={() => removeItem(item.id)}
              >
                <Icon name="close" width={12} height={12} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
