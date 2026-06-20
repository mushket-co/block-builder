import type { CSSProperties, ReactNode } from 'react';

import type { IBlock, TBlockId } from '../../core/types';
import { CSS_CLASSES } from '../../utils/constants';
import { Icon } from './icons/Icon';

interface IBlockItemProps {
  block: IBlock;
  index: number;
  total: number;
  isEdit: boolean;
  controlsContainerClass?: string;
  spacingStyles?: CSSProperties;
  children: ReactNode;
  onCopyId: (blockId: TBlockId) => void;
  onMoveUp: (blockId: TBlockId) => void;
  onMoveDown: (blockId: TBlockId) => void;
  onEdit: (block: IBlock) => void;
  onDuplicate: (blockId: TBlockId) => void;
  onToggleVisibility: (blockId: TBlockId) => void;
  onDelete: (blockId: TBlockId) => void;
}

export function BlockItem({
  block,
  index,
  total,
  isEdit,
  controlsContainerClass,
  spacingStyles,
  children,
  onCopyId,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDuplicate,
  onToggleVisibility,
  onDelete,
}: IBlockItemProps) {
  return (
    <div
      className={[CSS_CLASSES.BLOCK, isEdit && block.visible === false ? CSS_CLASSES.OPACITY_HIDDEN : '']
        .filter(Boolean)
        .join(' ')}
      data-block-id={block.id}
      style={spacingStyles}
    >
      {isEdit ? (
        <div className={CSS_CLASSES.BLOCK_CONTROLS}>
          <div
            className={[CSS_CLASSES.BLOCK_CONTROLS_CONTAINER, controlsContainerClass].filter(Boolean).join(' ')}
          >
            <div className={CSS_CLASSES.BLOCK_CONTROLS_INNER}>
              <button
                type="button"
                className={CSS_CLASSES.CONTROL_BTN}
                title="Редактировать"
                onClick={() => onEdit(block)}
              >
                <Icon name="edit" />
              </button>
              <button
                type="button"
                className={CSS_CLASSES.CONTROL_BTN}
                title="Переместить вверх"
                disabled={index === 0}
                onClick={() => onMoveUp(block.id)}
              >
                <Icon name="arrowUp" />
              </button>
              <button
                type="button"
                className={CSS_CLASSES.CONTROL_BTN}
                title="Переместить вниз"
                disabled={index === total - 1}
                onClick={() => onMoveDown(block.id)}
              >
                <Icon name="arrowDown" />
              </button>
              <button
                type="button"
                className={CSS_CLASSES.CONTROL_BTN}
                title={`Копировать ID: ${block.id}`}
                onClick={() => onCopyId(block.id)}
              >
                <Icon name="id" />
              </button>
              <button
                type="button"
                className={CSS_CLASSES.CONTROL_BTN}
                title="Дублировать"
                onClick={() => onDuplicate(block.id)}
              >
                <Icon name="duplicate" />
              </button>
              <button
                type="button"
                className={CSS_CLASSES.CONTROL_BTN}
                title={block.visible ? 'Скрыть' : 'Показать'}
                onClick={() => onToggleVisibility(block.id)}
              >
                <Icon name={block.visible ? 'eye' : 'eyeOff'} />
              </button>
              <button
                type="button"
                className={CSS_CLASSES.CONTROL_BTN}
                title="Удалить"
                onClick={() => onDelete(block.id)}
              >
                <Icon name="delete" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className={CSS_CLASSES.BLOCK_CONTENT}>{children}</div>
    </div>
  );
}
