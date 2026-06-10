import { CSS_CLASSES } from '../../utils/constants';
import type { ReactNode } from 'react';

interface IToggleControlProps {
  modelValue: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  children?: ReactNode;
}

export function ToggleControl({ modelValue, onChange, label, children }: IToggleControlProps) {
  const handleToggleClick = () => {
    onChange(!modelValue);
  };

  return (
    <div className={CSS_CLASSES.TOGGLE_CONTROL}>
      <div className={CSS_CLASSES.TOGGLE_CONTROL_HEADER}>
        <div
          className={[
            CSS_CLASSES.TOGGLE_CONTROL_LABEL,
            modelValue ? CSS_CLASSES.TOGGLE_CONTROL_LABEL_ACTIVE : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={handleToggleClick}
        >
          {label}
        </div>
        <div
          className={[
            CSS_CLASSES.TOGGLE_CONTROL_BUTTON,
            modelValue ? CSS_CLASSES.TOGGLE_CONTROL_BUTTON_ACTIVE : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={handleToggleClick}
        >
          <div className={CSS_CLASSES.TOGGLE_CONTROL_BUTTON_INNER}>
            <div className={CSS_CLASSES.TOGGLE_CONTROL_BUTTON_CIRCLE} />
          </div>
        </div>
      </div>
      {modelValue ? <div className={CSS_CLASSES.TOGGLE_CONTROL_BODY}>{children}</div> : null}
    </div>
  );
}
