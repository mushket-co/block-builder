import type { MouseEvent, ReactNode } from 'react';

import { CSS_CLASSES } from '../../utils/constants';

interface IBlockFormModalProps {
  title: string;
  submitLabel: string;
  cancelLabel?: string;
  contentClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}

export function BlockFormModal({
  title,
  submitLabel,
  cancelLabel = 'Отмена',
  contentClassName,
  bodyClassName,
  children,
  onClose,
  onSubmit,
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
            ×
          </button>
        </div>
        <div className={[CSS_CLASSES.MODAL_BODY, bodyClassName].filter(Boolean).join(' ')}>{children}</div>
        <div className={CSS_CLASSES.MODAL_FOOTER}>
          <button type="button" className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SECONDARY}`} onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="submit" className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_PRIMARY}`} onClick={onSubmit}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
