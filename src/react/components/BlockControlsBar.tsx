import { useMemo } from 'react';

import { deleteIconHTML, saveIconHTML } from '../../shared/icons/iconHelpers';
import { CSS_CLASSES } from '../../utils/constants';

interface IBlockControlsBarProps {
  isEdit: boolean;
  blocksCount: number;
  visibleCount: number;
  controlsFixedPosition?: 'top' | 'bottom';
  controlsOffset?: number;
  controlsOffsetVar?: string;
  controlsContainerClass?: string;
  onSave: () => void;
  onClearAll: () => void;
}

export function BlockControlsBar({
  isEdit,
  blocksCount,
  visibleCount,
  controlsFixedPosition,
  controlsOffset = 0,
  controlsOffsetVar,
  controlsContainerClass,
  onSave,
  onClearAll,
}: IBlockControlsBarProps) {
  const controlsInlineStyles = useMemo(() => {
    if (!controlsFixedPosition) {
      return {};
    }

    if (controlsFixedPosition === 'top') {
      return controlsOffsetVar
        ? { top: `calc(var(${controlsOffsetVar}) + ${controlsOffset}px)` }
        : { top: `${controlsOffset}px` };
    }

    return controlsOffsetVar
      ? { bottom: `calc(var(${controlsOffsetVar}) + ${controlsOffset}px)` }
      : { bottom: `${controlsOffset}px` };
  }, [controlsFixedPosition, controlsOffset, controlsOffsetVar]);

  if (!isEdit) {
    return null;
  }

  return (
    <div
      className={[
        CSS_CLASSES.CONTROLS,
        controlsFixedPosition ? `bb-controls--fixed-${controlsFixedPosition}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={controlsInlineStyles}
    >
      <div className={[CSS_CLASSES.CONTROLS_CONTAINER, controlsContainerClass].filter(Boolean).join(' ')}>
        <div className={CSS_CLASSES.CONTROLS_INNER}>
          <button type="button" className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SUCCESS}`} onClick={onSave}>
            <span className="bb-icon-wrapper" dangerouslySetInnerHTML={{ __html: saveIconHTML }} /> Сохранить
          </button>
          <button type="button" className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_DANGER}`} onClick={onClearAll}>
            <span className="bb-icon-wrapper" dangerouslySetInnerHTML={{ __html: deleteIconHTML }} /> Очистить все
          </button>
          <div className={CSS_CLASSES.STATS}>
            <p>
              Всего блоков: <span>{isEdit ? blocksCount : visibleCount}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
