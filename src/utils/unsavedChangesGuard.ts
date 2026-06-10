import type { IBlock, IBlockDto } from '../core/types';
import { isClient } from './ssr';

type TComparableBlock = IBlock | IBlockDto;

interface IBlockComparisonSnapshot {
  id: string;
  type: string;
  settings: unknown;
  props: unknown;
  style?: unknown;
  visible: boolean;
  locked: boolean;
  order: number;
  parent?: string;
}

function normalizeBlockForComparison(block: TComparableBlock, index: number): IBlockComparisonSnapshot {
  return {
    id: String(block.id),
    type: block.type,
    settings: block.settings ?? {},
    props: block.props ?? {},
    style: block.style,
    visible: block.visible !== false,
    locked: block.locked === true,
    order: 'order' in block && typeof block.order === 'number' ? block.order : index,
    parent: block.parent !== undefined ? String(block.parent) : undefined,
  };
}

function serializeBlocksForComparison(blocks: ReadonlyArray<TComparableBlock>): string {
  const snapshots = blocks.map((block, index) => normalizeBlockForComparison(block, index));
  snapshots.sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }
    return left.id.localeCompare(right.id);
  });
  return JSON.stringify(snapshots);
}

export function shouldActivatePageLeaveWarning(options: {
  warnOnPageLeave?: boolean;
  isEdit?: boolean;
}): boolean {
  return options.warnOnPageLeave === true && options.isEdit !== false;
}

export function haveBlocksChanged(
  initialBlocks: ReadonlyArray<TComparableBlock> | undefined,
  currentBlocks: ReadonlyArray<TComparableBlock>
): boolean {
  return (
    serializeBlocksForComparison(initialBlocks ?? []) !== serializeBlocksForComparison(currentBlocks)
  );
}

export function attachPageLeaveWarning(shouldWarn: () => boolean): () => void {
  if (!isClient()) {
    return () => {};
  }

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!shouldWarn()) {
      return;
    }
    event.preventDefault();
    event.returnValue = '';
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

export interface IUnsavedChangesTracker {
  setBaseline: (blocks: ReadonlyArray<TComparableBlock>) => void;
  resetBaseline: (blocks: ReadonlyArray<TComparableBlock>) => void;
  isDirty: (currentBlocks: ReadonlyArray<TComparableBlock>) => boolean;
}

export function createUnsavedChangesTracker(
  initialBlocks?: ReadonlyArray<TComparableBlock>
): IUnsavedChangesTracker {
  let baseline = initialBlocks ? [...initialBlocks] : [];

  return {
    setBaseline(blocks: ReadonlyArray<TComparableBlock>) {
      baseline = [...blocks];
    },
    resetBaseline(blocks: ReadonlyArray<TComparableBlock>) {
      baseline = [...blocks];
    },
    isDirty(currentBlocks: ReadonlyArray<TComparableBlock>) {
      return haveBlocksChanged(baseline, currentBlocks);
    },
  };
}
