import { CSS_CLASSES } from '../../../utils/constants';

export interface ITextareaFieldProps {
  fieldId: string;
  modelValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  showLabel?: boolean;
  onChange: (value: string) => void;
}

export function TextareaField({
  fieldId,
  modelValue = '',
  label = '',
  placeholder = '',
  required = false,
  error = '',
  rows = 4,
  showLabel = true,
  onChange,
}: ITextareaFieldProps) {
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
      <textarea
        id={fieldId}
        value={modelValue}
        placeholder={placeholder}
        rows={rows}
        className={inputClass}
        onChange={event => onChange(event.target.value)}
      />
    </>
  );
}
