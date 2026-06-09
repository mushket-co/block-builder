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
import { CSS_CLASSES } from '../../utils/constants';
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
  const debounceMs = apiConfig?.debounceMs ?? 300;
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

  const syncSearchQueryWithSelection = useCallback(
    (value: unknown) => {
      if (isMultiple) {
        setSearchQuery('');
        return;
      }

      const selectedItem = extractApiSelectItemsFromValue(value)[0];
      setSearchQuery(selectedItem?.name ?? '');
    },
    [isMultiple]
  );

  const fetchData = useCallback(
    async (reset = false, explicitPage?: number) => {
      if (!apiConfig) {
        setError('Конфигурация API не указана');
        return;
      }

      if (searchQuery.length < minSearchLength && searchQuery.length > 0) {
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
          search: searchQuery || undefined,
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

        hydrateSelectedItemsFromValue(modelValue);
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
      modelValue,
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

    await new Promise<void>(resolve => nextTick(resolve));
    dropdownRef.current?.updatePosition();

    setCurrentPage(1);
    await fetchData(true);
    await new Promise<void>(resolve => nextTick(resolve));
    dropdownRef.current?.updatePosition();
  }, [fetchData]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
    syncSearchQueryWithSelection(modelValue);
  }, [modelValue, syncSearchQueryWithSelection]);

  const onValueUpdate = useCallback(
    (value: TDropdownValue) => {
      const storedValue = toApiSelectStoredValue(value, isMultiple, resolveItemById);
      onChange(storedValue);
      hydrateSelectedItemsFromValue(storedValue);
      syncSearchQueryWithSelection(storedValue);
      previousModelValueRef.current = cloneApiSelectStoredValue(storedValue);
    },
    [
      hydrateSelectedItemsFromValue,
      isMultiple,
      onChange,
      resolveItemById,
      syncSearchQueryWithSelection,
    ]
  );

  const handleClear = useCallback(
    (clear: () => void) => {
      clear();
      void fetchData(true);
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
      syncSearchQueryWithSelection(newValue);
    },
    [hydrateSelectedItemsFromValue, isMultiple, modelValue, onChange, syncSearchQueryWithSelection]
  );

  const loadMore = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (loading) {
        return;
      }

      const isFirstLoad = items.length === 0;
      if (isFirstLoad) {
        void fetchData(true).then(() => {
          dropdownRef.current?.updatePosition();
        });
        return;
      }

      if (!hasMore) {
        return;
      }

      void fetchData(false, currentPage + 1).then(() => {
        dropdownRef.current?.updatePosition();
      });
    },
    [currentPage, fetchData, hasMore, items.length, loading]
  );

  const onSearchInput = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      void fetchData(true).then(() => {
        if (!dropdownRef.current?.isOpen) {
          void dropdownRef.current?.open();
        } else {
          dropdownRef.current?.updatePosition();
        }
      });
    }, debounceMs);
  }, [debounceMs, fetchData]);

  const effectivePlaceholder = useCallback(
    (selectedOptions: { label: string }[]) => {
      if (!isMultiple && selectedOptions.length > 0 && !isDropdownOpen) {
        return '';
      }
      return placeholder;
    },
    [isDropdownOpen, isMultiple, placeholder]
  );

  const isDropdownOpenRef = useRef(isDropdownOpen);
  isDropdownOpenRef.current = isDropdownOpen;

  useEffect(() => {
    if (!isSameApiSelectModelValue(previousModelValueRef.current, modelValue, isMultiple)) {
      previousModelValueRef.current = cloneApiSelectStoredValue(modelValue);
    }

    hydrateSelectedItemsFromValue(modelValue);

    if (!isDropdownOpenRef.current) {
      syncSearchQueryWithSelection(modelValue);
    }
  }, [hydrateSelectedItemsFromValue, isMultiple, modelValue, syncSearchQueryWithSelection]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="bb-api-select">
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
        className="bb-api-select__dropdown-control"
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
            className={`${CSS_CLASSES.BB_API_SELECT_SEARCH}${state.isOpen ? ` ${CSS_CLASSES.BB_API_SELECT_SEARCH_OPEN}` : ''}`}
          >
            <input
              ref={searchInputRef}
              type="text"
              className={CSS_CLASSES.BB_API_SELECT_INPUT}
              placeholder={effectivePlaceholder(state.selectedOptions)}
              value={searchQuery}
              onFocus={() => {
                void actions.open();
              }}
              onClick={event => {
                event.stopPropagation();
                void actions.open();
              }}
              onChange={event => {
                setSearchQuery(event.target.value);
                onSearchInput();
              }}
            />

            {loading ? (
              <span className={CSS_CLASSES.BB_API_SELECT_LOADER}>⏳</span>
            ) : hasValue ? (
              <span
                className={CSS_CLASSES.BB_API_SELECT_CLEAR}
                onClick={event => {
                  event.stopPropagation();
                  handleClear(actions.clear);
                }}
              >
                ✕
              </span>
            ) : null}

            <button
              type="button"
              className={`${CSS_CLASSES.BB_API_SELECT_TOGGLE}${state.isOpen ? ` ${CSS_CLASSES.BB_API_SELECT_TOGGLE_OPEN}` : ''}`}
              onClick={event => {
                event.stopPropagation();
                actions.toggle();
              }}
            >
              ▼
            </button>
          </div>
        )}
        afterOptions={
          !error && (hasMore || items.length === 0) ? (
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
                ✕
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
