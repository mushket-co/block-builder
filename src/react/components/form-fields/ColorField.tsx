import { CSS_CLASSES } from '../../../utils/constants';

export interface IColorFieldProps {
  fieldId: string;
  modelValue?: string;
  label?: string;
  required?: boolean;
  error?: string;
  showLabel?: boolean;
  onChange: (value: string) => void;
}

export function ColorField({
  fieldId,
  modelValue = '#333333',
  label = '',
  required = false,
  error = '',
  showLabel = true,
  onChange,
}: IColorFieldProps) {
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
        type="color"
        value={modelValue}
        className={inputClass}
        onChange={event => onChange(event.target.value)}
      />
    </>
  );
}
