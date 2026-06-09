import { CSS_CLASSES } from '../../../utils/constants';

export interface INumberFieldProps {
  fieldId: string;
  modelValue?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showLabel?: boolean;
  onChange: (value: number | undefined) => void;
}

export function NumberField({
  fieldId,
  modelValue,
  label = '',
  placeholder = '',
  required = false,
  error = '',
  showLabel = true,
  onChange,
}: INumberFieldProps) {
  const inputClass = error
    ? `${CSS_CLASSES.FORM_CONTROL} ${CSS_CLASSES.ERROR}`
    : CSS_CLASSES.FORM_CONTROL;

  return (
    <>
      {showLabel ? (
        <label htmlFor={fieldId} className={CSS_CLASSES.FORM_LABEL}>
          {label}
          {required ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
        </label>
      ) : null}
      <input
        id={fieldId}
        type="number"
        value={modelValue === undefined || modelValue === null ? '' : modelValue}
        placeholder={placeholder}
        className={inputClass}
        onChange={event =>
          onChange(event.target.value === '' ? undefined : Number(event.target.value))
        }
      />
    </>
  );
}
