import { CSS_CLASSES } from '../../../utils/constants';

export interface IRadioOption {
  value: string | number;
  label: string;
}

export interface IRadioFieldProps {
  fieldId: string;
  modelValue?: string | number;
  label?: string;
  required?: boolean;
  error?: string;
  options?: IRadioOption[];
  onChange: (value: string | number) => void;
}

export function RadioField({
  fieldId,
  modelValue,
  label = '',
  required = false,
  options = [],
  onChange,
}: IRadioFieldProps) {
  return (
    <>
      <label className={CSS_CLASSES.FORM_LABEL}>
        {label}
        {required ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
      </label>
      <div className={CSS_CLASSES.FORM_RADIO_GROUP}>
        {options.map(option => (
          <label key={String(option.value)} className={CSS_CLASSES.FORM_RADIO}>
            <input
              id={`${fieldId}-${option.value}`}
              type="radio"
              name={fieldId}
              value={String(option.value)}
              checked={modelValue === option.value}
              className={CSS_CLASSES.FORM_RADIO_INPUT}
              onChange={() => onChange(option.value)}
            />
            <span className={CSS_CLASSES.FORM_RADIO_LABEL}>{option.label}</span>
          </label>
        ))}
      </div>
    </>
  );
}
