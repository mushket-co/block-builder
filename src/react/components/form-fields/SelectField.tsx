import { useMemo } from 'react';

import { CSS_CLASSES } from '../../../utils/constants';
import { CustomDropdown, type TDropdownValue } from '../CustomDropdown';

export interface ISelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ISelectFieldProps {
  fieldId: string;
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: ISelectOption[];
  showLabel?: boolean;
  onChange: (value: string | number) => void;
}

export function SelectField({
  fieldId,
  modelValue = '',
  label = '',
  placeholder = '',
  required = false,
  error = '',
  options = [],
  showLabel = true,
  onChange,
}: ISelectFieldProps) {
  const dropdownOptions = useMemo(
    () =>
      options.map(option => ({
        value: option.value,
        label: option.label,
        disabled: option.disabled ?? false,
      })),
    [options]
  );

  const showError = Boolean(error);
  const isClearable = !required;

  const handleUpdate = (value: TDropdownValue) => {
    if (Array.isArray(value)) {
      const [first] = value;
      onChange((first ?? '') as string | number);
      return;
    }

    if (value === null || value === undefined) {
      onChange('' as string);
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
        modelValue={modelValue}
        options={dropdownOptions}
        placeholder={placeholder || 'Выберите...'}
        clearable={isClearable}
        invalid={showError}
        onChange={handleUpdate}
      />
    </>
  );
}
