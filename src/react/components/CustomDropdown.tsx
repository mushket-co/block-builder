import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type UIEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { CSS_CLASSES } from '../../utils/constants';

export interface IDropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  meta?: Record<string, unknown>;
}

export type TDropdownValue = string | number | (string | number)[] | null;

export type TScrollSnapshot = { top: number; height: number };

export interface IDropdownTriggerState {
  isOpen: boolean;
  hasValue: boolean;
  selectedOptions: IDropdownOption[];
  multiple: boolean;
  disabled: boolean;
}

export interface IDropdownTriggerActions {
  open: () => Promise<void>;
  close: () => void;
  toggle: () => void;
  clear: () => void;
}

export interface IDropdownPanelState {
  isOpen: boolean;
  selectedOptions: IDropdownOption[];
  highlightedIndex: number;
}

export interface IDropdownPanelActions {
  open: () => Promise<void>;
  close: () => void;
  toggle: () => void;
  updatePosition: () => void;
}

export interface ICustomDropdownRef {
  open: () => Promise<void>;
  close: () => void;
  toggle: () => void;
  updatePosition: () => void;
  saveScrollPosition: () => number;
  restoreScrollPosition: (scrollTop: number) => void;
  saveScrollSnapshot: () => TScrollSnapshot;
  restoreScrollFromSnapshot: (snapshot: TScrollSnapshot | null | undefined) => void;
  isOpen: boolean;
}

export interface ICustomDropdownProps {
  modelValue: TDropdownValue;
  onChange: (value: TDropdownValue) => void;
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
  chipDisplayLimit?: number;
  className?: string;
  renderTrigger?: (props: {
    state: IDropdownTriggerState;
    actions: IDropdownTriggerActions;
  }) => ReactNode;
  renderPanel?: (props: {
    state: IDropdownPanelState;
    actions: IDropdownPanelActions;
  }) => ReactNode;
  children?: ReactNode;
  beforeOptions?: ReactNode;
  afterOptions?: ReactNode;
  renderOption?: (option: IDropdownOption, selected: boolean) => ReactNode;
  renderLoading?: ReactNode;
  renderError?: ReactNode;
  renderEmpty?: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  onScrollBottom?: () => void;
  onClear?: () => void;
}

type TScrollAncestor = HTMLElement | Window;

const DEFAULT_PLACEHOLDER = 'Выберите значение';
const DEFAULT_LOADING_TEXT = 'Загрузка...';
const DEFAULT_EMPTY_TEXT = 'Нет данных';

function nextTick(callback: () => void): void {
  queueMicrotask(() => {
    requestAnimationFrame(callback);
  });
}

function resolvePortalTarget(teleportTo: string): HTMLElement {
  if (teleportTo === 'body') {
    return document.body;
  }
  const element = document.querySelector(teleportTo);
  return (element as HTMLElement | null) ?? document.body;
}

function isElementScrollable(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  const overflow = style.overflow;
  const isScrollable =
    overflowY === 'scroll' || overflowY === 'auto' || overflow === 'scroll' || overflow === 'auto';

  if (!isScrollable) {
    return false;
  }

  return element.scrollHeight > element.clientHeight;
}

function findScrollableAncestors(element: HTMLElement | null): HTMLElement[] {
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
}

export const CustomDropdown = forwardRef<ICustomDropdownRef, ICustomDropdownProps>(
  function CustomDropdown(
    {
      modelValue,
      onChange,
      options = [],
      placeholder = DEFAULT_PLACEHOLDER,
      multiple = false,
      disabled = false,
      clearable = false,
      loading = false,
      loadingText = DEFAULT_LOADING_TEXT,
      emptyText = DEFAULT_EMPTY_TEXT,
      errorText = null,
      invalid = false,
      teleportTo = 'body',
      maxHeight = 320,
      chipDisplayLimit = 3,
      className,
      renderTrigger,
      renderPanel,
      children,
      beforeOptions,
      afterOptions,
      renderOption,
      renderLoading,
      renderError,
      renderEmpty,
      onOpen,
      onClose,
      onScrollBottom,
      onClear,
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const lastScrollSnapshotRef = useRef<TScrollSnapshot | null>(null);
    const scrollListenersRef = useRef<Array<{ ancestor: TScrollAncestor; handler: () => void }>>(
      []
    );

    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    const selectedOptions = useMemo<IDropdownOption[]>(() => {
      if (multiple) {
        const value = Array.isArray(modelValue) ? modelValue : [];
        return options.filter(option => value.includes(option.value));
      }

      if (modelValue === null || modelValue === undefined || modelValue === '') {
        return [];
      }

      const option = options.find(item => item.value === modelValue);
      return option ? [option] : [];
    }, [modelValue, multiple, options]);

    const displayValue = selectedOptions.length > 0 ? (selectedOptions[0]?.label ?? '') : '';

    const hasValue = useMemo(() => {
      if (multiple) {
        return Array.isArray(modelValue) && modelValue.length > 0;
      }
      return modelValue !== null && modelValue !== undefined && modelValue !== '';
    }, [modelValue, multiple]);

    const showClear = clearable && hasValue && !disabled;

    const visibleChipOptions = useMemo(() => {
      if (!multiple) {
        return [];
      }

      const limit = Math.max(chipDisplayLimit, 0);
      if (limit === 0) {
        return selectedOptions;
      }

      return selectedOptions.slice(0, limit);
    }, [chipDisplayLimit, multiple, selectedOptions]);

    const hiddenChipCount = multiple
      ? Math.max(0, selectedOptions.length - visibleChipOptions.length)
      : 0;

    const contentStyle = useMemo(
      () => ({
        maxHeight: `${maxHeight}px`,
      }),
      [maxHeight]
    );

    const cleanupScrollableAncestors = useCallback(() => {
      scrollListenersRef.current.forEach(({ ancestor, handler }) => {
        ancestor.removeEventListener('scroll', handler);
      });
      scrollListenersRef.current = [];
    }, []);

    const updatePosition = useCallback(() => {
      if (!isOpen || !triggerRef.current || !panelRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportMargin = 8;
      const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - viewportMargin);
      const spaceAbove = Math.max(0, rect.top - viewportMargin);
      const shouldShowAbove = spaceBelow < spaceAbove;
      const availableSpace = shouldShowAbove ? spaceAbove : spaceBelow;
      const effectiveMaxHeight = Math.min(
        maxHeight,
        Math.max(160, availableSpace > 0 ? availableSpace : maxHeight)
      );

      const dropdownHeight = Math.min(panelRef.current.scrollHeight, effectiveMaxHeight);

      let top = shouldShowAbove
        ? rect.top - dropdownHeight - viewportMargin
        : rect.bottom + viewportMargin;
      const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
      top += viewportOffsetTop;

      const maxTop = window.innerHeight - dropdownHeight - viewportMargin;
      const minTop = viewportMargin;
      top = Math.max(minTop, Math.min(maxTop, top));

      setPanelStyle({
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        top: `${top}px`,
        maxHeight: `${effectiveMaxHeight}px`,
      });
    }, [isOpen, maxHeight]);

    const handleWindowChange = useCallback(() => {
      if (isOpen) {
        updatePosition();
      }
    }, [isOpen, updatePosition]);

    const attachScrollableAncestors = useCallback(() => {
      cleanupScrollableAncestors();
      const triggerElement = triggerRef.current;
      if (!triggerElement) {
        return;
      }

      const ancestors = findScrollableAncestors(triggerElement);
      const scrollableAncestors: TScrollAncestor[] = [window, ...ancestors];

      scrollableAncestors.forEach(ancestor => {
        const handler = handleWindowChange;
        ancestor.addEventListener('scroll', handler, { passive: true });
        scrollListenersRef.current.push({ ancestor, handler });
      });
    }, [cleanupScrollableAncestors, handleWindowChange]);

    const getNextIndex = useCallback(
      (direction: 1 | -1, currentIndex: number) => {
        if (options.length === 0) {
          return -1;
        }

        let nextIndex = currentIndex;

        for (let i = 0; i < options.length; i += 1) {
          nextIndex = (nextIndex + direction + options.length) % options.length;
          const option = options[nextIndex];
          if (!option?.disabled) {
            return nextIndex;
          }
        }

        return currentIndex;
      },
      [options]
    );

    const highlight = useCallback(
      (index: number) => {
        if (options[index]?.disabled) {
          return;
        }
        setHighlightedIndex(index);
      },
      [options]
    );

    const highlightInitial = useCallback(() => {
      if (multiple) {
        setHighlightedIndex(getNextIndex(1, -1));
        return;
      }

      const selectedIndex = options.findIndex(option => option.value === modelValue);

      if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) {
        setHighlightedIndex(selectedIndex);
        return;
      }

      setHighlightedIndex(getNextIndex(1, -1));
    }, [getNextIndex, modelValue, multiple, options]);

    const isOpenRef = useRef(isOpen);
    isOpenRef.current = isOpen;

    const close = useCallback(() => {
      if (!isOpenRef.current) {
        return;
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
      cleanupScrollableAncestors();
      onClose?.();
      lastScrollSnapshotRef.current = null;
    }, [cleanupScrollableAncestors, onClose]);

    const open = useCallback(async () => {
      if (disabled) {
        return;
      }

      if (isOpen) {
        await new Promise<void>(resolve => nextTick(resolve));
        updatePosition();
        return;
      }

      lastScrollSnapshotRef.current = null;
      setIsOpen(true);
      onOpen?.();

      await new Promise<void>(resolve => nextTick(resolve));
      updatePosition();
      highlightInitial();
    }, [disabled, highlightInitial, isOpen, onOpen, updatePosition]);

    const toggle = useCallback(() => {
      if (isOpen) {
        close();
      } else {
        void open();
      }
    }, [close, isOpen, open]);

    const saveScrollPosition = useCallback((): number => {
      if (!contentRef.current) {
        return 0;
      }
      return contentRef.current.scrollTop;
    }, []);

    const restoreScrollPosition = useCallback((scrollTop: number) => {
      if (!contentRef.current || scrollTop <= 0) {
        return;
      }
      nextTick(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = scrollTop;
        }
      });
    }, []);

    const saveScrollSnapshot = useCallback((): TScrollSnapshot => {
      const top = contentRef.current?.scrollTop ?? 0;
      const height = contentRef.current?.scrollHeight ?? 0;
      return { top, height };
    }, []);

    const restoreScrollFromSnapshot = useCallback((snapshot: TScrollSnapshot | null | undefined) => {
      if (!contentRef.current || !snapshot) {
        return;
      }
      nextTick(() => {
        if (!contentRef.current) {
          return;
        }
        const prevTop = snapshot.top;
        const prevHeight = snapshot.height;
        const newHeight = contentRef.current.scrollHeight;
        const client = contentRef.current.clientHeight;
        if (prevHeight === 0) {
          contentRef.current.scrollTop = 0;
          return;
        }
        const delta = Math.max(0, newHeight - prevHeight);
        const distanceFromBottomPrev = prevHeight - (prevTop + client);
        const wasNearBottom = distanceFromBottomPrev >= 0 && distanceFromBottomPrev <= 48;
        const targetTop = wasNearBottom ? prevTop + delta : prevTop;
        contentRef.current.scrollTop = Math.max(0, targetTop);
      });
    }, []);

    const isOptionSelected = useCallback(
      (value: string | number) => {
        if (multiple) {
          const currentValue = Array.isArray(modelValue) ? modelValue : [];
          return currentValue.includes(value);
        }

        return modelValue === value;
      },
      [modelValue, multiple]
    );

    const onOptionClick = useCallback(
      (option: IDropdownOption) => {
        if (option.disabled) {
          return;
        }

        if (multiple) {
          const currentValue = Array.isArray(modelValue) ? [...modelValue] : [];

          if (currentValue.includes(option.value)) {
            onChange(currentValue.filter(value => value !== option.value));
          } else {
            onChange([...currentValue, option.value]);
          }
        } else {
          onChange(option.value);
          close();
        }
      },
      [close, modelValue, multiple, onChange]
    );

    const clearSelection = useCallback(() => {
      if (!hasValue || disabled) {
        return;
      }

      if (multiple) {
        onChange([]);
      } else {
        onChange(null);
      }

      onClear?.();
    }, [disabled, hasValue, multiple, onChange, onClear]);

    const scrollHighlightedIntoView = useCallback((index: number) => {
      if (!contentRef.current || index < 0) {
        return;
      }

      const optionElements = contentRef.current.querySelectorAll<HTMLElement>(
        `.${CSS_CLASSES.BB_DROPDOWN_OPTION}`
      );
      const element = optionElements[index];

      if (!element) {
        return;
      }

      const { offsetTop, offsetHeight } = element;
      const { scrollTop, clientHeight } = contentRef.current;

      const isAbove = offsetTop < scrollTop;
      const isBelow = offsetTop + offsetHeight > scrollTop + clientHeight;

      if (isAbove) {
        contentRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
      } else if (isBelow) {
        contentRef.current.scrollTo({
          top: offsetTop - clientHeight + offsetHeight,
          behavior: 'smooth',
        });
      }
    }, []);

    const handleTriggerKeydown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }

        switch (event.key) {
          case 'ArrowDown': {
            event.preventDefault();
            if (!isOpen) {
              void open();
            } else {
              const next = getNextIndex(1, highlightedIndex);
              setHighlightedIndex(next);
              nextTick(() => scrollHighlightedIntoView(next));
            }
            break;
          }
          case 'ArrowUp': {
            event.preventDefault();
            if (isOpen) {
              const next = getNextIndex(-1, highlightedIndex);
              setHighlightedIndex(next);
              nextTick(() => scrollHighlightedIntoView(next));
            } else {
              void open();
            }
            break;
          }
          case 'Enter':
          case ' ': {
            event.preventDefault();
            if (!isOpen) {
              void open();
            } else if (highlightedIndex >= 0) {
              const option = options[highlightedIndex];
              if (option) {
                onOptionClick(option);
              }
            }
            break;
          }
          case 'Escape': {
            if (isOpen) {
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
      },
      [
        close,
        disabled,
        getNextIndex,
        highlightedIndex,
        isOpen,
        onOptionClick,
        open,
        options,
        scrollHighlightedIntoView,
      ]
    );

    const handleContentScroll = useCallback(
      (event: UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        const threshold = 32;

        if (element.scrollHeight - element.scrollTop - element.clientHeight <= threshold) {
          onScrollBottom?.();
        }
      },
      [onScrollBottom]
    );

    const handleOutsideClick = useCallback(
      (event: globalThis.MouseEvent) => {
        const target = event.target as HTMLElement;
        const containsTarget =
          rootRef.current?.contains(target) || panelRef.current?.contains(target) || false;

        if (!containsTarget) {
          close();
        }
      },
      [close]
    );

    useImperativeHandle(
      ref,
      () => ({
        open,
        close,
        toggle,
        updatePosition,
        saveScrollPosition,
        restoreScrollPosition,
        saveScrollSnapshot,
        restoreScrollFromSnapshot,
        isOpen,
      }),
      [
        close,
        isOpen,
        open,
        restoreScrollFromSnapshot,
        restoreScrollPosition,
        saveScrollPosition,
        saveScrollSnapshot,
        toggle,
        updatePosition,
      ]
    );

    useEffect(() => {
      setPortalTarget(resolvePortalTarget(teleportTo));
    }, [teleportTo]);

    useEffect(() => {
      if (!multiple) {
        highlightInitial();
      }
    }, [modelValue, multiple]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      if (loading) {
        lastScrollSnapshotRef.current = saveScrollSnapshot();
        return;
      }

      nextTick(() => {
        restoreScrollFromSnapshot(lastScrollSnapshotRef.current);
        nextTick(updatePosition);
      });
    }, [isOpen, loading, restoreScrollFromSnapshot, saveScrollSnapshot, updatePosition]);

    useEffect(() => {
      if (!isOpen) {
        document.removeEventListener('mousedown', handleOutsideClick, true);
        window.removeEventListener('resize', handleWindowChange);
        cleanupScrollableAncestors();
        return;
      }

      document.addEventListener('mousedown', handleOutsideClick, true);
      window.addEventListener('resize', handleWindowChange);
      nextTick(() => {
        attachScrollableAncestors();
        updatePosition();
      });

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick, true);
        window.removeEventListener('resize', handleWindowChange);
        cleanupScrollableAncestors();
      };
    }, [
      attachScrollableAncestors,
      cleanupScrollableAncestors,
      handleOutsideClick,
      handleWindowChange,
      isOpen,
      updatePosition,
    ]);

    useEffect(() => {
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick, true);
        window.removeEventListener('resize', handleWindowChange);
        cleanupScrollableAncestors();
      };
    }, [cleanupScrollableAncestors, handleOutsideClick, handleWindowChange]);

    const triggerSlotProps = useMemo(
      () => ({
        state: {
          isOpen,
          hasValue,
          selectedOptions,
          multiple,
          disabled,
        },
        actions: {
          open,
          close,
          toggle,
          clear: clearSelection,
        },
      }),
      [clearSelection, close, disabled, hasValue, isOpen, multiple, open, selectedOptions, toggle]
    );

    const panelSlotProps = useMemo(
      () => ({
        state: {
          isOpen,
          selectedOptions,
          highlightedIndex,
        },
        actions: {
          open,
          close,
          toggle,
          updatePosition,
        },
      }),
      [close, highlightedIndex, isOpen, open, selectedOptions, toggle, updatePosition]
    );

    const defaultTrigger = (
      <>
        <div className={CSS_CLASSES.BB_DROPDOWN_VALUE}>
          {multiple ? (
            selectedOptions.length > 0 ? (
              <div className={CSS_CLASSES.BB_DROPDOWN_CHIPS}>
                {visibleChipOptions.map(option => (
                  <span key={option.value} className={CSS_CLASSES.BB_DROPDOWN_CHIP}>
                    {option.label}
                  </span>
                ))}
                {hiddenChipCount > 0 ? (
                  <span
                    className={`${CSS_CLASSES.BB_DROPDOWN_CHIP} ${CSS_CLASSES.BB_DROPDOWN_CHIP_MORE}`}
                  >
                    +{hiddenChipCount}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className={CSS_CLASSES.BB_DROPDOWN_PLACEHOLDER}>{placeholder}</span>
            )
          ) : displayValue ? (
            <span className={CSS_CLASSES.BB_DROPDOWN_SINGLE}>{displayValue}</span>
          ) : (
            <span className={CSS_CLASSES.BB_DROPDOWN_PLACEHOLDER}>{placeholder}</span>
          )}
        </div>

        {showClear ? (
          <button
            type="button"
            className={CSS_CLASSES.BB_DROPDOWN_CLEAR}
            onClick={event => {
              event.stopPropagation();
              clearSelection();
            }}
          >
            ✕
          </button>
        ) : null}

        <span
          className={[
            CSS_CLASSES.BB_DROPDOWN_ARROW,
            isOpen ? CSS_CLASSES.BB_DROPDOWN_ARROW_OPEN : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          ▼
        </span>
      </>
    );

    const defaultPanelContent = (
      <div
        ref={contentRef}
        className={CSS_CLASSES.BB_DROPDOWN_CONTENT}
        style={contentStyle}
        onScroll={handleContentScroll}
      >
        {beforeOptions}

        {errorText && !loading && options.length === 0 ? (
          <div
            className={`${CSS_CLASSES.BB_DROPDOWN_MESSAGE} ${CSS_CLASSES.BB_DROPDOWN_MESSAGE_ERROR}`}
          >
            {renderError ?? errorText}
          </div>
        ) : null}

        {options.length > 0 ? (
          <ul className={CSS_CLASSES.BB_DROPDOWN_LIST}>
            {options.map((option, index) => {
              const selected = isOptionSelected(option.value);
              return (
                <li
                  key={option.value}
                  className={[
                    CSS_CLASSES.BB_DROPDOWN_OPTION,
                    selected ? CSS_CLASSES.BB_DROPDOWN_OPTION_SELECTED : '',
                    option.disabled ? CSS_CLASSES.BB_DROPDOWN_OPTION_DISABLED : '',
                    highlightedIndex === index ? CSS_CLASSES.BB_DROPDOWN_OPTION_ACTIVE : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="option"
                  aria-selected={selected}
                  onClick={() => onOptionClick(option)}
                  onMouseEnter={() => highlight(index)}
                >
                  {renderOption ? (
                    renderOption(option, selected)
                  ) : (
                    <>
                      <span className={CSS_CLASSES.BB_DROPDOWN_OPTION_LABEL}>{option.label}</span>
                      {selected ? (
                        <span className={CSS_CLASSES.BB_DROPDOWN_OPTION_CHECK}>✓</span>
                      ) : null}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : loading ? (
          <div className={CSS_CLASSES.BB_DROPDOWN_MESSAGE}>
            {renderLoading ?? loadingText}
          </div>
        ) : errorText ? null : (
          <div className={CSS_CLASSES.BB_DROPDOWN_MESSAGE}>{renderEmpty ?? emptyText}</div>
        )}

        {loading && options.length > 0 ? (
          <div className={CSS_CLASSES.BB_DROPDOWN_MESSAGE}>
            {renderLoading ?? loadingText}
          </div>
        ) : null}

        {afterOptions}
      </div>
    );

    const panelNode =
      isOpen && portalTarget
        ? createPortal(
            <div
              ref={panelRef}
              className={CSS_CLASSES.BB_DROPDOWN_PANEL}
              style={panelStyle}
              role="listbox"
              aria-multiselectable={multiple}
              onMouseDown={event => event.preventDefault()}
            >
              {renderPanel ? renderPanel(panelSlotProps) : children ?? defaultPanelContent}
            </div>,
            portalTarget
          )
        : null;

    const rootClassName = [
      CSS_CLASSES.BB_DROPDOWN,
      isOpen ? CSS_CLASSES.BB_DROPDOWN_OPEN : '',
      disabled ? CSS_CLASSES.BB_DROPDOWN_DISABLED : '',
      invalid ? CSS_CLASSES.BB_DROPDOWN_INVALID : '',
      multiple ? CSS_CLASSES.BB_DROPDOWN_MULTIPLE : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={rootRef} className={rootClassName}>
        <div
          ref={triggerRef}
          className={CSS_CLASSES.BB_DROPDOWN_CONTROL}
          role="combobox"
          aria-expanded={isOpen}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={() => toggle()}
          onKeyDown={handleTriggerKeydown}
        >
          {renderTrigger ? renderTrigger(triggerSlotProps) : defaultTrigger}
        </div>
        {panelNode}
      </div>
    );
  }
);
