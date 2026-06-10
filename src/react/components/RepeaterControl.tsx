import { useEffect, useMemo } from 'react';

import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import type { IRepeaterItemFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import type { IRepeaterRef } from '../../shared/services/ValidationErrorHandler';
import { CSS_CLASSES, UI_STRINGS } from '../../utils/constants';
import { useRepeaterControl } from '../hooks/useRepeaterControl';
import { RepeaterItemFields } from './RepeaterItemFields';

export interface IRepeaterControlProps {
  modelValue?: unknown[];
  fieldName: string;
  label: string;
  fields: IRepeaterItemFieldConfig[];
  rules?: Array<{ type: string; message?: string; value?: unknown }>;
  errors?: Record<string, string[]>;
  addButtonText?: string;
  removeButtonText?: string;
  itemTitle?: string;
  countLabelVariants?: {
    one: string;
    few: string;
    many: string;
    zero?: string;
  };
  min?: number;
  max?: number;
  defaultItemValue?: Record<string, unknown>;
  apiSelectUseCase?: ApiSelectUseCase;
  isApiSelectAvailable?: (field: IRepeaterItemFieldConfig) => boolean;
  getApiSelectRestrictionMessage?: () => string;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  isCustomFieldAvailable?: (field: IRepeaterItemFieldConfig) => boolean;
  getCustomFieldRestrictionMessage?: () => string;
  nestingDepth?: number;
  maxNestingDepth?: number;
  parentFieldPath?: string;
  onChange: (value: unknown[]) => void;
  onRendererReady?: (fieldName: string, renderer: IRepeaterRef) => void;
}

export function RepeaterControl({
  modelValue,
  fieldName,
  label,
  fields,
  rules,
  errors,
  addButtonText = UI_STRINGS.repeaterAdd,
  removeButtonText = UI_STRINGS.repeaterRemove,
  itemTitle = UI_STRINGS.repeaterItem,
  countLabelVariants,
  min,
  max,
  defaultItemValue,
  apiSelectUseCase,
  isApiSelectAvailable = () => false,
  getApiSelectRestrictionMessage = () => 'API Select поля недоступны.',
  customFieldRendererRegistry,
  isCustomFieldAvailable = () => false,
  getCustomFieldRestrictionMessage = () => 'Кастомные поля недоступны.',
  nestingDepth = 0,
  maxNestingDepth = 2,
  parentFieldPath = '',
  onChange,
  onRendererReady,
}: IRepeaterControlProps) {
  const repeater = useRepeaterControl({
    fieldName,
    modelValue,
    fields,
    rules,
    errors,
    min,
    max,
    defaultItemValue,
    countLabelVariants,
    parentFieldPath,
    nestingDepth,
    maxNestingDepth,
    onChange,
  });

  const apiSelectRestrictionMessage = useMemo(() => {
    const message = getApiSelectRestrictionMessage();
    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'API Select поля недоступны.';
  }, [getApiSelectRestrictionMessage]);

  const customFieldRestrictionMessage = useMemo(() => {
    const message = getCustomFieldRestrictionMessage();
    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'Кастомные поля недоступны.';
  }, [getCustomFieldRestrictionMessage]);

  useEffect(() => {
    onRendererReady?.(fieldName, {
      expandItem: repeater.expandItem,
      isItemCollapsed: repeater.isItemCollapsed,
    });
  }, [fieldName, onRendererReady, repeater.expandItem, repeater.isItemCollapsed]);

  return (
    <div className={CSS_CLASSES.REPEATER_CONTROL} data-field-name={fieldName}>
      <div className={CSS_CLASSES.REPEATER_CONTROL_HEADER}>
        <label className={CSS_CLASSES.REPEATER_CONTROL_LABEL}>
          {label}
          {repeater.isRequired ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
        </label>
        {repeater.itemCount > 0 ? (
          <span className={CSS_CLASSES.REPEATER_CONTROL_COUNT}>
            {repeater.getCountText(repeater.itemCount)}
          </span>
        ) : null}
      </div>

      <div className={CSS_CLASSES.REPEATER_CONTROL_ITEMS}>
        {repeater.items.map((item, index) => (
          <div
            key={item._id}
            className={[
              CSS_CLASSES.REPEATER_CONTROL_ITEM,
              repeater.collapsedItems[item._id] ? CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER}>
              <span className={CSS_CLASSES.REPEATER_CONTROL_ITEM_TITLE}>
                {itemTitle} #{index + 1}
              </span>
              <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS}>
                <button
                  type="button"
                  className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`}
                  title={repeater.collapsedItems[item._id] ? 'Развернуть' : 'Свернуть'}
                  onClick={() => repeater.toggleCollapse(item._id)}
                >
                  {repeater.collapsedItems[item._id] ? '▼' : '▲'}
                </button>
                {index > 0 ? (
                  <button
                    type="button"
                    className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                    title="Переместить вверх"
                    onClick={() => repeater.moveItem(index, index - 1)}
                  >
                    ↑
                  </button>
                ) : null}
                {index < repeater.items.length - 1 ? (
                  <button
                    type="button"
                    className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                    title="Переместить вниз"
                    onClick={() => repeater.moveItem(index, index + 1)}
                  >
                    ↓
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_REMOVE}`}
                  disabled={!repeater.canRemove}
                  title={removeButtonText}
                  onClick={() => repeater.removeItem(index)}
                >
                  ✕
                </button>
              </div>
            </div>

            {!repeater.collapsedItems[item._id] ? (
              <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}>
                <RepeaterItemFields
                  itemIndex={index}
                  item={item}
                  fieldGroups={repeater.getGroupedFieldsForItem(index)}
                  repeaterFieldName={fieldName}
                  formErrors={repeater.formErrors}
                  apiSelectUseCase={apiSelectUseCase}
                  isApiSelectAvailable={isApiSelectAvailable}
                  apiSelectRestrictionMessage={apiSelectRestrictionMessage}
                  getApiSelectRestrictionMessage={getApiSelectRestrictionMessage}
                  customFieldRendererRegistry={customFieldRendererRegistry}
                  isCustomFieldAvailable={isCustomFieldAvailable}
                  customFieldRestrictionMessage={customFieldRestrictionMessage}
                  getCustomFieldRestrictionMessage={getCustomFieldRestrictionMessage}
                  nestingDepth={nestingDepth}
                  maxNestingDepth={maxNestingDepth}
                  NestedRepeaterControl={RepeaterControl}
                  getFieldId={repeater.getFieldId}
                  isFieldRequired={repeater.isFieldRequired}
                  getFullFieldPath={repeater.getFullFieldPath}
                  hasFieldError={repeater.hasFieldError}
                  getFieldErrors={repeater.getFieldErrors}
                  getNestedErrors={repeater.getNestedErrors}
                  canNestRepeater={repeater.canNestRepeater}
                  getRepeaterBasePath={repeater.getRepeaterBasePath}
                  isRepeaterFieldVisible={repeater.isRepeaterFieldVisible}
                  updateItemField={repeater.updateItemField}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}
        disabled={!repeater.canAdd}
        onClick={repeater.addItem}
      >
        + {addButtonText}
      </button>

      {repeater.effectiveMin || max ? (
        <div className={CSS_CLASSES.REPEATER_CONTROL_HINT}>
          {repeater.effectiveMin && repeater.itemCount < repeater.effectiveMin ? (
            <span className={CSS_CLASSES.REPEATER_CONTROL_HINT_ERROR}>
              {repeater.repeaterMinText} {repeater.effectiveMin}
            </span>
          ) : max && repeater.itemCount >= max ? (
            <span className={CSS_CLASSES.REPEATER_CONTROL_HINT_WARNING}>
              {repeater.repeaterMaxText} {max}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
