import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../../core/types/form';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import type { IRepeaterRef } from '../../shared/services/ValidationErrorHandler';
import { CSS_CLASSES } from '../../utils/constants';
import { groupFormFields } from '../../utils/formFieldGrouping';
import {
  getFieldError,
  getSpacingBreakpoints,
  isFieldRequired,
  isFieldVisible,
} from '../../utils/formFieldHelpers';
import type { ISpacingData } from '../../utils/spacingHelpers';
import { ApiSelectField } from './ApiSelectField';
import { CustomField } from './CustomField';
import { FormField } from './form-fields';
import { ImageUploadField } from './ImageUploadField';
import { RepeaterControl } from './RepeaterControl';
import { SpacingControl } from './SpacingControl';
import { ToggleControl } from './ToggleControl';
import type { IBlockType } from '../types/blockBuilder';

const SPECIAL_FIELD_TYPES = new Set(['spacing', 'repeater', 'api-select', 'custom', 'image', 'file']);

interface IBlockFormFieldsProps {
  fields: IFormFieldConfig[];
  currentBlockType: IBlockType | null;
  formData: Record<string, unknown>;
  formErrors: Record<string, string[]>;
  apiSelectUseCase?: ApiSelectUseCase;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  onFieldChange: (fieldName: string, value: unknown) => void;
  onRepeaterReady?: (fieldName: string, renderer: IRepeaterRef) => void;
}

export function BlockFormFields({
  fields,
  currentBlockType,
  formData,
  formErrors,
  apiSelectUseCase,
  customFieldRendererRegistry,
  onFieldChange,
  onRepeaterReady,
}: IBlockFormFieldsProps) {
  const groupedFields = groupFormFields(fields);

  const renderSpecialField = (field: IFormFieldConfig) => {
    const value = formData[field.field];
    const error = getFieldError(field, formErrors);

    if (field.type === 'spacing') {
      return (
        <SpacingControl
          modelValue={value as ISpacingData}
          label={field.label}
          fieldName={field.field}
          spacingTypes={field.spacingConfig?.spacingTypes}
          min={field.spacingConfig?.min}
          max={field.spacingConfig?.max}
          step={field.spacingConfig?.step}
          breakpoints={getSpacingBreakpoints(field, currentBlockType?.spacingOptions)}
          required={isFieldRequired(field)}
          onChange={nextValue => onFieldChange(field.field, nextValue)}
        />
      );
    }

    if (field.type === 'repeater') {
      return (
        <RepeaterControl
          modelValue={(value as unknown[]) || []}
          fieldName={field.field}
          label={field.label}
          fields={(field.repeaterConfig?.fields || []) as IRepeaterItemFieldConfig[]}
          rules={field.rules}
          errors={formErrors}
          addButtonText={field.repeaterConfig?.addButtonText}
          removeButtonText={field.repeaterConfig?.removeButtonText}
          itemTitle={field.repeaterConfig?.itemTitle}
          countLabelVariants={field.repeaterConfig?.countLabelVariants}
          min={field.repeaterConfig?.min}
          max={field.repeaterConfig?.max}
          defaultItemValue={field.repeaterConfig?.defaultItemValue}
          maxNestingDepth={field.repeaterConfig?.maxNestingDepth ?? 2}
          apiSelectUseCase={apiSelectUseCase}
          isApiSelectAvailable={() => !!apiSelectUseCase}
          getApiSelectRestrictionMessage={() =>
            'Передайте apiSelectUseCase для использования API Select полей.'
          }
          customFieldRendererRegistry={customFieldRendererRegistry}
          isCustomFieldAvailable={() => !!customFieldRendererRegistry}
          getCustomFieldRestrictionMessage={() =>
            'Зарегистрируйте customFieldRendererRegistry для использования кастомных полей.'
          }
          onChange={nextValue => onFieldChange(field.field, nextValue)}
          onRendererReady={onRepeaterReady}
        />
      );
    }

    if (field.type === 'api-select') {
      if (!apiSelectUseCase) {
        return (
          <div className={CSS_CLASSES.BB_WARNING_BOX}>
            ⚠️ Передайте apiSelectUseCase для использования API Select полей.
          </div>
        );
      }
      return (
        <ApiSelectField
          modelValue={value}
          config={field}
          validationError={error}
          apiSelectUseCase={apiSelectUseCase}
          onChange={nextValue => onFieldChange(field.field, nextValue)}
        />
      );
    }

    if (field.type === 'custom') {
      const renderer = customFieldRendererRegistry?.get(field.customFieldConfig?.rendererId || '');
      if (!renderer) {
        return (
          <div className={CSS_CLASSES.BB_WARNING_BOX}>
            ⚠️ Зарегистрируйте customFieldRendererRegistry для использования кастомных полей.
          </div>
        );
      }
      return (
        <CustomField
          field={field}
          modelValue={value}
          formErrors={formErrors}
          customFieldRendererRegistry={customFieldRendererRegistry}
          isFieldRequired={isFieldRequired}
          onChange={nextValue => onFieldChange(field.field, nextValue)}
        />
      );
    }

    if (field.type === 'image' || field.type === 'file') {
      return (
        <ImageUploadField
          modelValue={value}
          label={field.label}
          required={isFieldRequired(field)}
          placeholder={field.placeholder}
          error={error}
          variant={field.type === 'file' ? 'file' : 'image'}
          multiple={field.multiple ?? false}
          fileUploadConfig={field.fileUploadConfig}
          fieldNamePath={field.field}
          onChange={nextValue => onFieldChange(field.field, nextValue)}
        />
      );
    }

    return null;
  };

  return (
    <>
      {groupedFields.map(fieldGroup => {
        if (fieldGroup.type === 'toggle-group') {
          return (
            <ToggleControl
              key={fieldGroup.key}
              modelValue={Boolean(formData[fieldGroup.toggleField.field])}
              onChange={value => onFieldChange(fieldGroup.toggleField.field, value)}
              label={fieldGroup.toggleField.label}
            >
              {fieldGroup.dependentFields.map(dependentField => (
                <FormField
                  key={dependentField.field}
                  field={dependentField}
                  fieldId={`field-${dependentField.field}`}
                  modelValue={formData[dependentField.field]}
                  required={isFieldRequired(dependentField)}
                  error={getFieldError(dependentField, formErrors)}
                  containerClass={
                    formErrors[dependentField.field]
                      ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                      : CSS_CLASSES.FORM_GROUP
                  }
                  onChange={value => onFieldChange(dependentField.field, value)}
                >
                  {renderSpecialField(dependentField)}
                </FormField>
              ))}
            </ToggleControl>
          );
        }

        const field = fieldGroup.field;
        if (!isFieldVisible(field, formData)) {
          return null;
        }

        const specialField = SPECIAL_FIELD_TYPES.has(field.type) ? (
          <div className={CSS_CLASSES.FORM_GROUP}>{renderSpecialField(field)}</div>
        ) : null;

        return (
          <FormField
            key={fieldGroup.key}
            field={field}
            fieldId={`field-${field.field}`}
            modelValue={formData[field.field]}
            required={isFieldRequired(field)}
            error={getFieldError(field, formErrors)}
            containerClass={
              formErrors[field.field]
                ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                : CSS_CLASSES.FORM_GROUP
            }
            onChange={value => onFieldChange(field.field, value)}
          >
            {specialField}
          </FormField>
        );
      })}
    </>
  );
}
