import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

import type { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import {
  areSelectValuesEqual,
  pruneSelectValueByOptions,
} from '../../../utils/pruneOptionsFromDependents';
import { resolveDynamicSelectOptions } from '../../../utils/resolveDynamicSelectOptions';
import { ImageUploadField } from '../ImageUploadField';
import { BlockAnchorField } from '../BlockAnchorField';
import { CheckboxField } from './CheckboxField';
import { ColorField } from './ColorField';
import { NumberField } from './NumberField';
import { RadioField } from './RadioField';
import { SelectField } from './SelectField';
import { TextareaField } from './TextareaField';
import { TextField } from './TextField';

export interface IFormFieldProps {
  field: IFormFieldConfig;
  fieldId: string;
  modelValue?: unknown;
  required?: boolean;
  error?: string;
  showLabel?: boolean;
  containerClass?: string;
  fieldPath?: string;
  formData?: Record<string, unknown>;
  itemData?: Record<string, unknown>;
  onChange: (value: unknown) => void;
  children?: ReactNode;
}

export function FormField({
  field,
  fieldId,
  modelValue,
  required = false,
  error = '',
  showLabel = true,
  containerClass,
  fieldPath,
  formData = {},
  itemData,
  onChange,
  children,
}: IFormFieldProps) {
  const resolvedSelectOptions = useMemo(
    () => resolveDynamicSelectOptions(field, formData, itemData),
    [field, formData, itemData]
  );

  useEffect(() => {
    if (field.type !== 'select' || !field.optionsFrom) {
      return;
    }

    const prunedValue = pruneSelectValueByOptions(
      modelValue,
      resolvedSelectOptions,
      field.multiple ?? false
    );

    if (!areSelectValuesEqual(modelValue, prunedValue, field.multiple ?? false)) {
      onChange(prunedValue);
    }
  }, [field, modelValue, onChange, resolvedSelectOptions]);

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fieldId={fieldId}
            modelValue={String(modelValue ?? '')}
            label={field.label}
            placeholder={field.placeholder}
            required={required}
            error={error}
            inputType="text"
            showLabel={showLabel}
            onChange={onChange}
          />
        );
      case 'url':
        return (
          <TextField
            fieldId={fieldId}
            modelValue={String(modelValue ?? '')}
            label={field.label}
            placeholder={field.placeholder}
            required={required}
            error={error}
            inputType="url"
            showLabel={showLabel}
            onChange={onChange}
          />
        );
      case 'email':
        return (
          <TextField
            fieldId={fieldId}
            modelValue={String(modelValue ?? '')}
            label={field.label}
            placeholder={field.placeholder}
            required={required}
            error={error}
            inputType="email"
            showLabel={showLabel}
            onChange={onChange}
          />
        );
      case 'textarea':
        return (
          <TextareaField
            fieldId={fieldId}
            modelValue={String(modelValue ?? '')}
            label={field.label}
            placeholder={field.placeholder}
            required={required}
            error={error}
            showLabel={showLabel}
            onChange={onChange}
          />
        );
      case 'number':
        return (
          <NumberField
            fieldId={fieldId}
            modelValue={
              modelValue === undefined || modelValue === null || modelValue === ''
                ? undefined
                : Number(modelValue)
            }
            label={field.label}
            placeholder={field.placeholder}
            required={required}
            error={error}
            showLabel={showLabel}
            onChange={onChange}
          />
        );
      case 'color':
        return (
          <ColorField
            fieldId={fieldId}
            modelValue={String(modelValue ?? '#333333')}
            label={field.label}
            required={required}
            error={error}
            showLabel={showLabel}
            onChange={onChange}
          />
        );
      case 'select':
        return (
          <SelectField
            fieldId={fieldId}
            modelValue={modelValue as string | number | (string | number)[] | undefined}
            label={field.label}
            placeholder={field.placeholder}
            required={required}
            error={error}
            options={resolvedSelectOptions}
            multiple={field.multiple ?? false}
            showLabel={showLabel}
            onChange={onChange}
          />
        );
      case 'checkbox':
        return (
          <CheckboxField
            fieldId={fieldId}
            modelValue={Boolean(modelValue)}
            label={field.label}
            required={required}
            error={error}
            onChange={onChange}
          />
        );
      case 'radio':
        return (
          <RadioField
            fieldId={fieldId}
            modelValue={modelValue as string | number | undefined}
            label={field.label}
            required={required}
            error={error}
            options={field.options || []}
            onChange={onChange}
          />
        );
      case 'image':
      case 'file':
        return (
          <ImageUploadField
            modelValue={modelValue}
            label={showLabel ? field.label : ''}
            required={required}
            placeholder={field.placeholder}
            error={error}
            variant={field.type === 'file' ? 'file' : 'image'}
            multiple={field.multiple ?? false}
            fileUploadConfig={field.fileUploadConfig}
            fieldNamePath={fieldPath || field.field}
            onChange={onChange}
          />
        );
      case 'block-anchor':
        return (
          <BlockAnchorField
            fieldId={fieldId}
            modelValue={String(modelValue ?? '')}
            label={field.label}
            required={required}
            error={error}
            showLabel={showLabel}
            blockAnchorConfig={field.blockAnchorConfig}
            onChange={onChange}
          />
        );
      default:
        return children;
    }
  };

  return (
    <div
      className={containerClass || CSS_CLASSES.FORM_GROUP}
      data-field-name={fieldPath || field.field}
    >
      {renderField()}
      {error ? (
        <div className={CSS_CLASSES.FORM_ERRORS}>
          <span className={CSS_CLASSES.ERROR}>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
