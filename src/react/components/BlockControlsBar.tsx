import { useMemo } from 'react';

import { deleteIconHTML, saveIconHTML } from '../../shared/icons/iconHelpers';
import { CSS_CLASSES, getControlsFixedClass } from '../../utils/constants';
import { useUiStrings } from '../context/uiStringsContext';

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
  const uiStrings = useUiStrings();

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
        getControlsFixedClass(controlsFixedPosition),
      ]
        .filter(Boolean)
        .join(' ')}
      style={controlsInlineStyles}
    >
      <div className={[CSS_CLASSES.CONTROLS_CONTAINER, controlsContainerClass].filter(Boolean).join(' ')}>
        <div className={CSS_CLASSES.CONTROLS_INNER}>
          <button type="button" className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SUCCESS}`} onClick={onSave}>
            <span className={CSS_CLASSES.BB_ICON_WRAPPER} dangerouslySetInnerHTML={{ __html: saveIconHTML }} />{' '}
            {uiStrings.save}
          </button>
          <button type="button" className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_DANGER}`} onClick={onClearAll}>
            <span className={CSS_CLASSES.BB_ICON_WRAPPER} dangerouslySetInnerHTML={{ __html: deleteIconHTML }} />{' '}
            {uiStrings.clearAll}
          </button>
          <div className={CSS_CLASSES.STATS}>
            <span>
              {uiStrings.blocksTotal} <span>{isEdit ? blocksCount : visibleCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
