import type { ComponentType } from 'react';

import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import { CSS_CLASSES } from '../../utils/constants';
import type { TFormFieldGroup } from '../../utils/formFieldGrouping';
import { ApiSelectField } from './ApiSelectField';
import { CustomField } from './CustomField';
import { FormField } from './form-fields';
import { ToggleControl } from './ToggleControl';
import { toRepeaterFormFieldConfig, type TRepeaterItem } from '../hooks/useRepeaterControl';

export interface INestedRepeaterControlProps {
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
}

interface IRepeaterItemFieldsProps {
  itemIndex: number;
  item: TRepeaterItem;
  fieldGroups: TFormFieldGroup[];
  repeaterFieldName: string;
  formErrors: Record<string, string[]>;
  apiSelectUseCase?: ApiSelectUseCase;
  isApiSelectAvailable: (field: IRepeaterItemFieldConfig) => boolean;
  apiSelectRestrictionMessage: string;
  getApiSelectRestrictionMessage?: () => string;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  isCustomFieldAvailable: (field: IRepeaterItemFieldConfig) => boolean;
  customFieldRestrictionMessage: string;
  getCustomFieldRestrictionMessage?: () => string;
  nestingDepth: number;
  maxNestingDepth: number;
  NestedRepeaterControl: ComponentType<INestedRepeaterControlProps>;
  getFieldId: (itemId: string, fieldKey: string) => string;
  isFieldRequired: (field: IFormFieldConfig) => boolean;
  getFullFieldPath: (index: number, fieldKey: string) => string;
  hasFieldError: (index: number, fieldKey: string) => boolean;
  getFieldErrors: (index: number, fieldKey: string) => string[];
  getNestedErrors: (index: number, fieldKey: string) => Record<string, string[]>;
  canNestRepeater: (field: IRepeaterItemFieldConfig) => boolean;
  getRepeaterBasePath: () => string;
  isRepeaterFieldVisible: (field: IRepeaterItemFieldConfig, item: TRepeaterItem) => boolean;
  updateItemField: (index: number, fieldKey: string, value: unknown) => void;
}

function renderSingleFieldSlot(
  props: IRepeaterItemFieldsProps,
  slotField: IRepeaterItemFieldConfig,
  slotModelValue: unknown,
  slotError: string
) {
  const {
    item,
    itemIndex,
    repeaterFieldName,
    apiSelectUseCase,
    isApiSelectAvailable,
    apiSelectRestrictionMessage,
    getApiSelectRestrictionMessage,
    customFieldRendererRegistry,
    isCustomFieldAvailable,
    customFieldRestrictionMessage,
    getCustomFieldRestrictionMessage,
    nestingDepth,
    maxNestingDepth,
    NestedRepeaterControl,
    getFieldId,
    isFieldRequired,
    getFullFieldPath,
    getNestedErrors,
    canNestRepeater,
    getRepeaterBasePath,
    updateItemField,
    formErrors,
  } = props;

  if (slotField.type === 'api-select') {
    if (isApiSelectAvailable(slotField) && apiSelectUseCase) {
      return (
        <ApiSelectField
          modelValue={slotModelValue}
          config={toRepeaterFormFieldConfig(slotField)}
          validationError={slotError}
          apiSelectUseCase={apiSelectUseCase}
          onChange={value => updateItemField(itemIndex, slotField.field, value)}
        />
      );
    }
    return <div className={CSS_CLASSES.BB_WARNING_BOX}>⚠️ {apiSelectRestrictionMessage}</div>;
  }

  if (slotField.type === 'custom') {
    return (
      <>
        <label htmlFor={getFieldId(item._id, slotField.field)} className={CSS_CLASSES.FORM_LABEL}>
          {slotField.label}
          {isFieldRequired(slotField) ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
        </label>
        {isCustomFieldAvailable(slotField) &&
        customFieldRendererRegistry?.get(slotField.customFieldConfig?.rendererId || '') ? (
          <CustomField
            field={toRepeaterFormFieldConfig(slotField)}
            modelValue={slotModelValue}
            formErrors={formErrors}
            customFieldRendererRegistry={customFieldRendererRegistry}
            isFieldRequired={isFieldRequired}
            onChange={value => updateItemField(itemIndex, slotField.field, value)}
          />
        ) : (
          <div className={CSS_CLASSES.BB_WARNING_BOX}>⚠️ {customFieldRestrictionMessage}</div>
        )}
      </>
    );
  }

  if (slotField.type === 'repeater' && canNestRepeater(slotField)) {
    const basePath = getRepeaterBasePath();
    const parentPath = basePath
      ? `${basePath}[${itemIndex}].${slotField.field}`
      : `${repeaterFieldName}[${itemIndex}].${slotField.field}`;

    return (
      <NestedRepeaterControl
        modelValue={(slotModelValue as unknown[]) || []}
        fieldName={slotField.field}
        label={slotField.label}
        fields={slotField.repeaterConfig?.fields || []}
        rules={slotField.rules || []}
        errors={getNestedErrors(itemIndex, slotField.field)}
        addButtonText={slotField.repeaterConfig?.addButtonText}
        removeButtonText={slotField.repeaterConfig?.removeButtonText}
        itemTitle={slotField.repeaterConfig?.itemTitle}
        countLabelVariants={slotField.repeaterConfig?.countLabelVariants}
        min={slotField.repeaterConfig?.min}
        max={slotField.repeaterConfig?.max}
        defaultItemValue={slotField.repeaterConfig?.defaultItemValue}
        apiSelectUseCase={apiSelectUseCase}
        isApiSelectAvailable={isApiSelectAvailable}
        getApiSelectRestrictionMessage={
          getApiSelectRestrictionMessage || (() => apiSelectRestrictionMessage)
        }
        customFieldRendererRegistry={customFieldRendererRegistry}
        isCustomFieldAvailable={isCustomFieldAvailable}
        getCustomFieldRestrictionMessage={
          getCustomFieldRestrictionMessage || (() => customFieldRestrictionMessage)
        }
        nestingDepth={nestingDepth + 1}
        maxNestingDepth={slotField.repeaterConfig?.maxNestingDepth ?? maxNestingDepth}
        parentFieldPath={parentPath}
        onChange={value => updateItemField(itemIndex, slotField.field, value)}
      />
    );
  }

  return null;
}

export function RepeaterItemFields(props: IRepeaterItemFieldsProps) {
  const {
    itemIndex,
    item,
    fieldGroups,
    getFieldId,
    isFieldRequired,
    getFullFieldPath,
    hasFieldError,
    getFieldErrors,
    updateItemField,
    isRepeaterFieldVisible,
  } = props;

  return (
    <>
      {fieldGroups.map(fieldGroup => {
        if (fieldGroup.type === 'toggle-group') {
          return (
            <ToggleControl
              key={fieldGroup.key}
              modelValue={Boolean(item[fieldGroup.toggleField.field])}
              label={fieldGroup.toggleField.label}
              onChange={value =>
                updateItemField(itemIndex, fieldGroup.toggleField.field, value)
              }
            >
              {fieldGroup.dependentFields.map(dependentField => (
                <FormField
                  key={dependentField.field}
                  field={dependentField}
                  fieldId={getFieldId(item._id, dependentField.field)}
                  fieldPath={getFullFieldPath(itemIndex, dependentField.field)}
                  modelValue={item[dependentField.field]}
                  required={isFieldRequired(dependentField)}
                  error={
                    hasFieldError(itemIndex, dependentField.field)
                      ? getFieldErrors(itemIndex, dependentField.field)[0]
                      : ''
                  }
                  containerClass={
                    hasFieldError(itemIndex, dependentField.field)
                      ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                      : CSS_CLASSES.FORM_GROUP
                  }
                  onChange={value => updateItemField(itemIndex, dependentField.field, value)}
                />
              ))}
            </ToggleControl>
          );
        }

        const field = fieldGroup.field as IRepeaterItemFieldConfig;
        if (!isRepeaterFieldVisible(field, item)) {
          return null;
        }

        return (
          <FormField
            key={fieldGroup.key}
            field={field}
            fieldId={getFieldId(item._id, field.field)}
            fieldPath={getFullFieldPath(itemIndex, field.field)}
            modelValue={item[field.field]}
            required={isFieldRequired(field)}
            error={
              hasFieldError(itemIndex, field.field)
                ? getFieldErrors(itemIndex, field.field)[0]
                : ''
            }
            containerClass={
              hasFieldError(itemIndex, field.field)
                ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                : CSS_CLASSES.FORM_GROUP
            }
            onChange={value => updateItemField(itemIndex, field.field, value)}
          >
            {renderSingleFieldSlot(
              props,
              field,
              item[field.field],
              hasFieldError(itemIndex, field.field)
                ? getFieldErrors(itemIndex, field.field)[0]
                : ''
            )}
          </FormField>
        );
      })}
    </>
  );
}
