import { CSS_CLASSES } from '../../../utils/constants';

export interface ICheckboxFieldProps {
  fieldId: string;
  modelValue?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  onChange: (value: boolean) => void;
}

export function CheckboxField({
  fieldId,
  modelValue = false,
  label = '',
  required = false,
  onChange,
}: ICheckboxFieldProps) {
  return (
    <label htmlFor={fieldId} className={CSS_CLASSES.FORM_CHECKBOX}>
      <input
        id={fieldId}
        type="checkbox"
        checked={modelValue}
        className={CSS_CLASSES.FORM_CHECKBOX_INPUT}
        onChange={event => onChange(event.target.checked)}
      />
      <span className={CSS_CLASSES.FORM_CHECKBOX_LABEL}>
        {label}
        {required ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
      </span>
    </label>
  );
}
