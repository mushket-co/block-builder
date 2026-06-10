import type { MouseEvent } from 'react';

import { CSS_CLASSES } from '../../utils/constants';

export interface IBlockTypeOption {
  type: string;
  label: string;
  icon?: string;
}

interface IBlockTypeSelectionModalProps {
  blockTypes: IBlockTypeOption[];
  onSelect: (type: string) => void;
  onClose: () => void;
}

export function BlockTypeSelectionModal({
  blockTypes,
  onSelect,
  onClose,
}: IBlockTypeSelectionModalProps) {
  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).classList.contains(CSS_CLASSES.MODAL)) {
      onClose();
    }
  };

  return (
    <div className={CSS_CLASSES.MODAL} onMouseDown={handleOverlayMouseDown}>
      <div className={CSS_CLASSES.MODAL_CONTENT} onMouseDown={event => event.stopPropagation()}>
        <div className={CSS_CLASSES.MODAL_HEADER}>
          <h3>Выберите тип блока</h3>
          <button type="button" className={CSS_CLASSES.MODAL_CLOSE} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={CSS_CLASSES.MODAL_BODY}>
          <div className={CSS_CLASSES.BLOCK_TYPE_SELECTION}>
            {blockTypes.map(blockType => (
              <button
                key={blockType.type}
                type="button"
                className={CSS_CLASSES.BLOCK_TYPE_CARD}
                onClick={() => onSelect(blockType.type)}
              >
                <span className={CSS_CLASSES.BLOCK_TYPE_CARD_ICON}>
                  {blockType.icon ? (
                    <img
                      src={blockType.icon}
                      alt={blockType.label}
                      className={CSS_CLASSES.BLOCK_TYPE_CARD_ICON_IMG}
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </span>
                <span className={CSS_CLASSES.BLOCK_TYPE_CARD_TITLE}>{blockType.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
