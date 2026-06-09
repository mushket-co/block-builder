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
    <div className="bb-toggle-control">
      <div className="bb-toggle-control__header">
        <div
          className={`bb-toggle-control__label${modelValue ? ' bb-toggle-control__label--is-active' : ''}`}
          onClick={handleToggleClick}
        >
          {label}
        </div>
        <div
          className={`bb-toggle-control__button${modelValue ? ' bb-toggle-control__button--is-active' : ''}`}
          onClick={handleToggleClick}
        >
          <div className="bb-toggle-control__button-inner">
            <div className="bb-toggle-control__button-circle" />
          </div>
        </div>
      </div>
      {modelValue ? <div className="bb-toggle-control__body">{children}</div> : null}
    </div>
  );
}
