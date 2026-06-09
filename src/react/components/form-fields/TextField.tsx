import { CSS_CLASSES } from '../../../utils/constants';

export interface ITextFieldProps {
  fieldId: string;
  modelValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  inputType?: 'text' | 'url' | 'email';
  showLabel?: boolean;
  onChange: (value: string) => void;
}

export function TextField({
  fieldId,
  modelValue = '',
  label = '',
  placeholder = '',
  required = false,
  error = '',
  inputType = 'text',
  showLabel = true,
  onChange,
}: ITextFieldProps) {
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
        type={inputType}
        value={modelValue}
        placeholder={placeholder}
        className={inputClass}
        onChange={event => onChange(event.target.value)}
      />
    </>
  );
}
