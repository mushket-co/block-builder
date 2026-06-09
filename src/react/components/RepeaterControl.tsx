import { useEffect, useMemo } from 'react';

import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import type { IRepeaterItemFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import type { IRepeaterRef } from '../../shared/services/ValidationErrorHandler';
import { UI_STRINGS } from '../../utils/constants';
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
    <div className="bb-repeater-control" data-field-name={fieldName}>
      <div className="bb-repeater-control__header">
        <label className="bb-repeater-control__label">
          {label}
          {repeater.isRequired ? <span className="bb-required">*</span> : null}
        </label>
        {repeater.itemCount > 0 ? (
          <span className="bb-repeater-control__count">
            {repeater.getCountText(repeater.itemCount)}
          </span>
        ) : null}
      </div>

      <div className="bb-repeater-control__items">
        {repeater.items.map((item, index) => (
          <div
            key={item._id}
            className={[
              'bb-repeater-control__item',
              repeater.collapsedItems[item._id] ? 'bb-repeater-control__item--collapsed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="bb-repeater-control__item-header">
              <span className="bb-repeater-control__item-title">
                {itemTitle} #{index + 1}
              </span>
              <div className="bb-repeater-control__item-actions">
                <button
                  type="button"
                  className="bb-repeater-control__item-btn bb-repeater-control__item-btn--collapse"
                  title={repeater.collapsedItems[item._id] ? 'Развернуть' : 'Свернуть'}
                  onClick={() => repeater.toggleCollapse(item._id)}
                >
                  {repeater.collapsedItems[item._id] ? '▼' : '▲'}
                </button>
                {index > 0 ? (
                  <button
                    type="button"
                    className="bb-repeater-control__item-btn bb-repeater-control__item-btn--move"
                    title="Переместить вверх"
                    onClick={() => repeater.moveItem(index, index - 1)}
                  >
                    ↑
                  </button>
                ) : null}
                {index < repeater.items.length - 1 ? (
                  <button
                    type="button"
                    className="bb-repeater-control__item-btn bb-repeater-control__item-btn--move"
                    title="Переместить вниз"
                    onClick={() => repeater.moveItem(index, index + 1)}
                  >
                    ↓
                  </button>
                ) : null}
                <button
                  type="button"
                  className="bb-repeater-control__item-btn bb-repeater-control__item-btn--remove"
                  disabled={!repeater.canRemove}
                  title={removeButtonText}
                  onClick={() => repeater.removeItem(index)}
                >
                  ✕
                </button>
              </div>
            </div>

            {!repeater.collapsedItems[item._id] ? (
              <div className="bb-repeater-control__item-fields">
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
        className="bb-repeater-control__add-btn"
        disabled={!repeater.canAdd}
        onClick={repeater.addItem}
      >
        + {addButtonText}
      </button>

      {repeater.effectiveMin || max ? (
        <div className="bb-repeater-control__hint">
          {repeater.effectiveMin && repeater.itemCount < repeater.effectiveMin ? (
            <span className="bb-repeater-control__hint--error">
              {repeater.repeaterMinText} {repeater.effectiveMin}
            </span>
          ) : max && repeater.itemCount >= max ? (
            <span className="bb-repeater-control__hint--warning">
              {repeater.repeaterMaxText} {max}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
