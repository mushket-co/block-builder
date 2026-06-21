import { useMemo } from 'react';

import { CSS_CLASSES } from '../../../utils/constants';
import { CustomDropdown, type TDropdownValue } from '../CustomDropdown';

export interface ISelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ISelectFieldProps {
  fieldId: string;
  modelValue?: string | number | (string | number)[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: ISelectOption[];
  showLabel?: boolean;
  multiple?: boolean;
  onChange: (value: string | number | (string | number)[]) => void;
}

export function SelectField({
  fieldId,
  modelValue,
  label = '',
  placeholder = '',
  required = false,
  error = '',
  options = [],
  showLabel = true,
  multiple = false,
  onChange,
}: ISelectFieldProps) {
  const dropdownOptions = useMemo(
    () =>
      options.map(option => ({
        value: option.value,
        label: option.label,
        disabled: option.disabled ?? false,
        group: option.group,
      })),
    [options]
  );

  const dropdownValue = useMemo(() => {
    if (multiple) {
      return Array.isArray(modelValue) ? modelValue : [];
    }

    if (modelValue === null || modelValue === undefined) {
      return '';
    }

    return modelValue as string | number;
  }, [modelValue, multiple]);

  const showError = Boolean(error);
  const isClearable = !required;

  const handleUpdate = (value: TDropdownValue) => {
    if (multiple) {
      if (Array.isArray(value)) {
        onChange(value);
        return;
      }

      onChange(value === null || value === undefined ? [] : [value]);
      return;
    }

    if (value === null || value === undefined) {
      onChange('' as string);
      return;
    }

    if (Array.isArray(value)) {
      onChange((value[0] ?? '') as string | number);
      return;
    }

    onChange(value as string | number);
  };

  return (
    <>
      {showLabel ? (
        <label htmlFor={fieldId} className={CSS_CLASSES.FORM_LABEL}>
          {label}
          {required ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
        </label>
      ) : null}
      <CustomDropdown
        modelValue={dropdownValue}
        options={dropdownOptions}
        placeholder={placeholder || 'Выберите...'}
        multiple={multiple}
        clearable={isClearable}
        invalid={showError}
        onChange={handleUpdate}
      />
    </>
  );
}
