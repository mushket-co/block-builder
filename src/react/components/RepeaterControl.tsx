import { useEffect, useMemo } from 'react';

import type {
  ICustomFieldFormScope,
  ICustomFieldRendererRegistry,
} from '../../core/ports/CustomFieldRenderer';
import type { IRepeaterItemFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import type { IRepeaterRef } from '../../shared/services/ValidationErrorHandler';
import { CSS_CLASSES } from '../../utils/constants';
import { Icon } from './icons/Icon';
import { useRepeaterControl } from '../hooks/useRepeaterControl';
import { useUiStrings } from '../context/uiStringsContext';
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
  blockFormData?: Record<string, unknown>;
  setBlockField?: (name: string, value: unknown) => void;
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
  addButtonText,
  removeButtonText,
  itemTitle,
  countLabelVariants,
  min,
  max,
  defaultItemValue,
  apiSelectUseCase,
  isApiSelectAvailable = () => false,
  getApiSelectRestrictionMessage,
  customFieldRendererRegistry,
  isCustomFieldAvailable = () => false,
  getCustomFieldRestrictionMessage,
  nestingDepth = 0,
  maxNestingDepth = 2,
  parentFieldPath = '',
  blockFormData = {},
  setBlockField,
  onChange,
  onRendererReady,
}: IRepeaterControlProps) {
  const uiStrings = useUiStrings();
  const resolvedAddButtonText = addButtonText ?? uiStrings.repeaterAdd;
  const resolvedRemoveButtonText = removeButtonText ?? uiStrings.repeaterRemove;
  const resolvedItemTitle = itemTitle ?? uiStrings.repeaterItem;
  const resolveApiSelectRestrictionMessage =
    getApiSelectRestrictionMessage ?? (() => uiStrings.apiSelectUnavailable);
  const resolveCustomFieldRestrictionMessage =
    getCustomFieldRestrictionMessage ?? (() => uiStrings.customFieldsUnavailable);

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
    const message = resolveApiSelectRestrictionMessage();
    return typeof message === 'string' && message.trim().length > 0
      ? message
      : uiStrings.apiSelectUnavailable;
  }, [resolveApiSelectRestrictionMessage, uiStrings.apiSelectUnavailable]);

  const customFieldRestrictionMessage = useMemo(() => {
    const message = resolveCustomFieldRestrictionMessage();
    return typeof message === 'string' && message.trim().length > 0
      ? message
      : uiStrings.customFieldsUnavailable;
  }, [resolveCustomFieldRestrictionMessage, uiStrings.customFieldsUnavailable]);

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
                {resolvedItemTitle} #{index + 1}
              </span>
              <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS}>
                {index > 0 ? (
                  <button
                    type="button"
                    className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                    title={uiStrings.moveUp}
                    onClick={() => repeater.moveItem(index, index - 1)}
                  >
                    <Icon name="arrowUp" />
                  </button>
                ) : null}
                {index < repeater.items.length - 1 ? (
                  <button
                    type="button"
                    className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                    title={uiStrings.moveDown}
                    onClick={() => repeater.moveItem(index, index + 1)}
                  >
                    <Icon name="arrowDown" />
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_REMOVE}`}
                  disabled={!repeater.canRemove}
                  title={resolvedRemoveButtonText}
                  onClick={() => repeater.removeItem(index)}
                >
                  <Icon name="delete" />
                </button>
                <span
                  className={CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS_SEPARATOR}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`}
                  title={repeater.collapsedItems[item._id] ? uiStrings.expand : uiStrings.collapse}
                  onClick={() => repeater.toggleCollapse(item._id)}
                >
                  <Icon name="chevronDown" />
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
                  blockFormData={blockFormData}
                  setBlockField={setBlockField}
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
        className={`${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN} ${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SUCCESS} ${CSS_CLASSES.BTN_BLOCK}`}
        disabled={!repeater.canAdd}
        onClick={repeater.addItem}
      >
        + {resolvedAddButtonText}
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
