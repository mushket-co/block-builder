import type { CSSProperties, ReactNode } from 'react';
import { Fragment } from 'react';

import type { IBlock, TBlockId } from '../../core/types';
import { CSS_CLASSES } from '../../utils/constants';
import { AddBlockSeparator } from './AddBlockSeparator';
import { BlockItem } from './BlockItem';

interface IBlocksPanelProps {
  blocks: IBlock[];
  isEdit: boolean;
  controlsContainerClass?: string;
  getSpacingStyles: (block: IBlock) => CSSProperties;
  renderBlockContent: (block: IBlock) => ReactNode;
  onAddBlock: (position?: number) => void;
  onCopyId: (blockId: TBlockId) => void;
  onMoveUp: (blockId: TBlockId) => void;
  onMoveDown: (blockId: TBlockId) => void;
  onEdit: (block: IBlock) => void;
  onDuplicate: (blockId: TBlockId) => void;
  onToggleVisibility: (blockId: TBlockId) => void;
  onDelete: (blockId: TBlockId) => void;
}

export function BlocksPanel({
  blocks,
  isEdit,
  controlsContainerClass,
  getSpacingStyles,
  renderBlockContent,
  onAddBlock,
  onCopyId,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDuplicate,
  onToggleVisibility,
  onDelete,
}: IBlocksPanelProps) {
  return (
    <div className={CSS_CLASSES.BLOCKS}>
      {blocks.length === 0 ? (
        <div className={CSS_CLASSES.EMPTY_STATE}>
          {isEdit ? <AddBlockSeparator onAdd={() => onAddBlock(0)} /> : null}
        </div>
      ) : (
        <>
          {isEdit ? <AddBlockSeparator onAdd={() => onAddBlock(0)} /> : null}
          {blocks.map((block, index) => (
            <Fragment key={block.id}>
              <BlockItem
                block={block}
                index={index}
                total={blocks.length}
                isEdit={isEdit}
                controlsContainerClass={controlsContainerClass}
                spacingStyles={getSpacingStyles(block)}
                onCopyId={onCopyId}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onToggleVisibility={onToggleVisibility}
                onDelete={onDelete}
              >
                {renderBlockContent(block)}
              </BlockItem>
              {isEdit ? <AddBlockSeparator onAdd={() => onAddBlock(index + 1)} /> : null}
            </Fragment>
          ))}
        </>
      )}
    </div>
  );
}
