import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../../core/types/form';
import { UI_STRINGS } from '../../utils/constants';
import { groupFormFields, type TFormFieldGroup } from '../../utils/formFieldGrouping';
import { isFieldRequired, isFieldVisible } from '../../utils/formFieldHelpers';
import { getRepeaterCountText } from '../../utils/repeaterCountText';

export type TRepeaterItem = Record<string, unknown> & { _id: string };

export interface IUseRepeaterControlProps {
  fieldName: string;
  modelValue?: unknown[];
  fields: IRepeaterItemFieldConfig[];
  rules?: Array<{ type: string; message?: string; value?: unknown }>;
  errors?: Record<string, string[]>;
  min?: number;
  max?: number;
  defaultItemValue?: Record<string, unknown>;
  countLabelVariants?: {
    one: string;
    few: string;
    many: string;
    zero?: string;
  };
  parentFieldPath?: string;
  nestingDepth?: number;
  maxNestingDepth?: number;
  onChange: (value: unknown[]) => void;
}

export function toRepeaterFormFieldConfig(field: IRepeaterItemFieldConfig): IFormFieldConfig {
  return {
    field: field.field,
    label: field.label,
    type: field.type,
    placeholder: field.placeholder,
    defaultValue: field.defaultValue,
    options: field.options,
    rules: field.rules,
    apiSelectConfig: field.apiSelectConfig,
    customFieldConfig: field.customFieldConfig,
    imageUploadConfig: field.imageUploadConfig,
  };
}

export function useRepeaterControl({
  fieldName,
  modelValue,
  fields,
  rules,
  errors = {},
  min,
  max,
  defaultItemValue,
  countLabelVariants,
  parentFieldPath = '',
  nestingDepth = 0,
  maxNestingDepth = 2,
  onChange,
}: IUseRepeaterControlProps) {
  const idCounterRef = useRef(0);
  const [items, setItems] = useState<TRepeaterItem[]>([]);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const isRequired = useMemo(
    () => rules?.some(rule => rule.type === 'required') ?? false,
    [rules]
  );

  const effectiveMin = useMemo(() => {
    if (!isRequired) {
      return 0;
    }
    if (min !== undefined) {
      return min;
    }
    return 1;
  }, [isRequired, min]);

  const createNewItem = useCallback((): TRepeaterItem => {
    const newItem: TRepeaterItem = { _id: `item-${idCounterRef.current++}` };

    fields.forEach(field => {
      if (defaultItemValue && defaultItemValue[field.field] !== undefined) {
        newItem[field.field] = defaultItemValue[field.field];
      } else if (field.defaultValue !== undefined) {
        newItem[field.field] = field.defaultValue;
      } else {
        switch (field.type) {
          case 'checkbox':
            newItem[field.field] = false;
            break;
          case 'number':
            newItem[field.field] = 0;
            break;
          case 'api-select':
            newItem[field.field] = field.apiSelectConfig?.multiple ? [] : null;
            break;
          case 'repeater':
            newItem[field.field] = [];
            break;
          case 'custom':
            newItem[field.field] = '';
            break;
          default:
            newItem[field.field] = '';
        }
      }
    });

    return newItem;
  }, [defaultItemValue, fields]);

  const emitUpdate = useCallback(
    (nextItems: TRepeaterItem[]) => {
      const cleanItems = nextItems.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });
      onChange(cleanItems);
    },
    [onChange]
  );

  const initializeItems = useCallback(() => {
    if (modelValue && modelValue.length > 0) {
      setItems(
        modelValue.map(item => ({
          _id: `item-${idCounterRef.current++}`,
          ...(item as Record<string, unknown>),
        }))
      );
      return;
    }

    if (effectiveMin > 0) {
      const initialItems: TRepeaterItem[] = [];
      for (let i = 0; i < effectiveMin; i++) {
        initialItems.push(createNewItem());
      }
      setItems(initialItems);
      queueMicrotask(() => emitUpdate(initialItems));
    } else {
      setItems([]);
    }
  }, [createNewItem, effectiveMin, emitUpdate, modelValue]);

  useEffect(() => {
    initializeItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only init mirrors Vue onMounted
  }, []);

  const itemCount = items.length;

  const canAdd = !max || itemCount < max;
  const canRemove = itemCount > effectiveMin;

  const addItem = useCallback(() => {
    if (!canAdd) {
      return;
    }
    const next = [...itemsRef.current, createNewItem()];
    setItems(next);
    emitUpdate(next);
  }, [canAdd, createNewItem, emitUpdate]);

  const removeItem = useCallback(
    (index: number) => {
      if (!canRemove) {
        return;
      }
      const item = itemsRef.current[index];
      const next = itemsRef.current.filter((_, i) => i !== index);
      setItems(next);
      emitUpdate(next);
      if (item) {
        setCollapsedItems(prev => {
          if (!prev[item._id]) {
            return prev;
          }
          const next = { ...prev };
          delete next[item._id];
          return next;
        });
      }
    },
    [canRemove, emitUpdate]
  );

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      const next = [...itemsRef.current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      setItems(next);
      emitUpdate(next);
    },
    [emitUpdate]
  );

  const toggleCollapse = useCallback((itemId: string) => {
    setCollapsedItems(prev => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = true;
      }
      return next;
    });
  }, []);

  const updateItemField = useCallback(
    (index: number, fieldKey: string, value: unknown) => {
      const next = itemsRef.current.map((item, i) =>
        i === index ? { ...item, [fieldKey]: value } : item
      );
      setItems(next);
      emitUpdate(next);
    },
    [emitUpdate]
  );

  const getFieldId = useCallback((itemId: string, fieldKey: string) => {
    return `repeater-${itemId}-${fieldKey}`;
  }, []);

  const getFullFieldPath = useCallback(
    (index: number, fieldKey: string) => {
      if (parentFieldPath) {
        return `${parentFieldPath}[${index}].${fieldKey}`;
      }
      return `${fieldName}[${index}].${fieldKey}`;
    },
    [fieldName, parentFieldPath]
  );

  const getRepeaterBasePath = useCallback(() => {
    if (parentFieldPath) {
      return parentFieldPath;
    }
    return fieldName;
  }, [fieldName, parentFieldPath]);

  const getFieldErrors = useCallback(
    (index: number, fieldKey: string): string[] => {
      if (!errors || Object.keys(errors).length === 0) {
        return [];
      }
      const errorKey = getFullFieldPath(index, fieldKey);
      const directError = errors[errorKey];
      if (directError && Array.isArray(directError) && directError.length > 0) {
        return directError;
      }
      return [];
    },
    [errors, getFullFieldPath]
  );

  const getNestedErrors = useCallback(
    (index: number, fieldKey: string): Record<string, string[]> => {
      const basePath = getFullFieldPath(index, fieldKey);
      const nestedErrors: Record<string, string[]> = {};
      Object.keys(errors).forEach(key => {
        if (key.startsWith(`${basePath}[`) || key === basePath) {
          nestedErrors[key] = errors[key];
        }
      });
      return nestedErrors;
    },
    [errors, getFullFieldPath]
  );

  const hasFieldError = useCallback(
    (index: number, fieldKey: string) => getFieldErrors(index, fieldKey).length > 0,
    [getFieldErrors]
  );

  const canNestRepeater = useCallback(
    (field: IRepeaterItemFieldConfig) => {
      const maxDepth = field.repeaterConfig?.maxNestingDepth ?? maxNestingDepth;
      return nestingDepth < maxDepth;
    },
    [maxNestingDepth, nestingDepth]
  );

  const isRepeaterFieldVisible = useCallback(
    (field: IRepeaterItemFieldConfig, item: TRepeaterItem) => {
      return isFieldVisible(field as IFormFieldConfig, {}, item);
    },
    []
  );

  const getGroupedFieldsForItem = useCallback(
    (index: number): TFormFieldGroup[] => {
      const item = items[index];
      if (!item) {
        return [];
      }

      return groupFormFields(fields as IFormFieldConfig[]).map(group => {
        if (group.type === 'toggle-group') {
          return {
            ...group,
            key: `toggle-${index}-${group.toggleField.field}`,
          };
        }
        return {
          ...group,
          key: `field-${index}-${group.field.field}`,
        };
      });
    },
    [fields, items]
  );

  const getCountText = useCallback(
    (count: number) => getRepeaterCountText(count, countLabelVariants || undefined),
    [countLabelVariants]
  );

  const expandItem = useCallback((index: number) => {
    const item = itemsRef.current[index];
    if (!item) {
      return;
    }
    setCollapsedItems(prev => {
      if (!prev[item._id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[item._id];
      return next;
    });
  }, []);

  const isItemCollapsed = useCallback(
    (index: number) => {
      const item = items[index];
      return item ? !!collapsedItems[item._id] : false;
    },
    [collapsedItems, items]
  );

  return {
    items,
    collapsedItems,
    itemCount,
    canAdd,
    canRemove,
    effectiveMin,
    isRequired,
    addItem,
    removeItem,
    moveItem,
    toggleCollapse,
    getFieldId,
    isFieldRequired,
    getCountText,
    getFieldErrors,
    hasFieldError,
    expandItem,
    isItemCollapsed,
    updateItemField,
    repeaterMinText: UI_STRINGS.repeaterMin || 'Минимум:',
    repeaterMaxText: UI_STRINGS.repeaterMax || 'Максимум:',
    getFullFieldPath,
    getNestedErrors,
    canNestRepeater,
    getRepeaterBasePath,
    isRepeaterFieldVisible,
    getGroupedFieldsForItem,
    formErrors: errors,
  };
}
