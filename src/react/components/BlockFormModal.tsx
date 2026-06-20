import type { MouseEvent, ReactNode } from 'react';

import { CSS_CLASSES } from '../../utils/constants';
import { Icon } from './icons/Icon';

interface IBlockFormModalProps {
  title: string;
  submitLabel: string;
  cancelLabel?: string;
  contentClassName?: string;
  bodyClassName?: string;
  validationErrorCount?: number;
  isFormHydrating?: boolean;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  onValidationErrorNavigate?: () => void;
}

export function BlockFormModal({
  title,
  submitLabel,
  cancelLabel = 'Отмена',
  contentClassName,
  bodyClassName,
  validationErrorCount = 0,
  isFormHydrating = false,
  children,
  onClose,
  onSubmit,
  onValidationErrorNavigate,
}: IBlockFormModalProps) {
  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).classList.contains(CSS_CLASSES.MODAL)) {
      onClose();
    }
  };

  return (
    <div className={CSS_CLASSES.MODAL} onMouseDown={handleOverlayMouseDown}>
      <div
        className={[CSS_CLASSES.MODAL_CONTENT, contentClassName].filter(Boolean).join(' ')}
        onMouseDown={event => event.stopPropagation()}
      >
        <div className={CSS_CLASSES.MODAL_HEADER}>
          <h3>{title}</h3>
          <button type="button" className={CSS_CLASSES.MODAL_CLOSE} onClick={onClose}>
            <Icon name="close" width={20} height={20} />
          </button>
        </div>
        <div className={[CSS_CLASSES.MODAL_BODY, bodyClassName].filter(Boolean).join(' ')}>
          {isFormHydrating ? <div className="bb-modal-hydrating">Загрузка…</div> : children}
        </div>
        <div className={CSS_CLASSES.MODAL_FOOTER}>
          <button type="button" className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SECONDARY}`} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="submit"
            className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_PRIMARY}`}
            disabled={isFormHydrating}
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
          {validationErrorCount > 0 ? (
            <button
              type="button"
              className={CSS_CLASSES.VALIDATION_ERROR_INDICATOR}
              aria-label={`Ошибки валидации: ${validationErrorCount}`}
              onClick={onValidationErrorNavigate}
            >
              {validationErrorCount}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
