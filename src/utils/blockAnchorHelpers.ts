import type { IBlockAnchorConfig } from '../core/types/form';

export interface IBlockAnchorOptionSource {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  visible?: boolean;
}

export interface IBlockAnchorContext {
  blocks: IBlockAnchorOptionSource[];
  editingBlockId: string | null;
  blockTypeLabels: Record<string, string>;
}

export const BLOCK_ANCHOR_HASH_PREFIX = '#';
const BLOCK_ANCHOR_USER_TITLE_FIELDS = ['title', 'name'] as const;
const BLOCK_ANCHOR_LABEL_SEPARATOR = ' | ';

export function getBlockAnchorUserTitle(props?: Record<string, unknown>): string {
  if (!props) {
    return '';
  }

  for (const field of BLOCK_ANCHOR_USER_TITLE_FIELDS) {
    const value = props[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

export function getBlockTypeLabel(
  block: IBlockAnchorOptionSource,
  blockTypeLabels: Record<string, string>
): string {
  return blockTypeLabels[block.type] || block.type;
}

export function getBlockAnchorOptionLabel(
  block: IBlockAnchorOptionSource,
  blockTypeLabels: Record<string, string>
): string {
  const typeLabel = getBlockTypeLabel(block, blockTypeLabels);
  const baseLabel = `${typeLabel} (${block.type})`;
  const userTitle = getBlockAnchorUserTitle(block.props);

  if (!userTitle) {
    return baseLabel;
  }

  return `${userTitle}${BLOCK_ANCHOR_LABEL_SEPARATOR}${baseLabel}`;
}

export function formatBlockAnchorValue(blockId: string): string {
  return `${BLOCK_ANCHOR_HASH_PREFIX}${blockId}`;
}

export function isBlockAnchorHash(value: string, knownBlockIds: Set<string>): boolean {
  if (!value.startsWith(BLOCK_ANCHOR_HASH_PREFIX)) {
    return false;
  }

  return knownBlockIds.has(value.slice(1));
}

export function buildBlockAnchorOptions(
  context: IBlockAnchorContext,
  config?: IBlockAnchorConfig
): { value: string; label: string }[] {
  const excludeEditing = config?.excludeEditingBlock !== false;
  const onlyVisible = config?.onlyVisibleBlocks !== false;

  return context.blocks
    .filter(block => !onlyVisible || block.visible !== false)
    .filter(
      block =>
        !(
          excludeEditing &&
          context.editingBlockId &&
          block.id === context.editingBlockId
        )
    )
    .map(block => ({
      value: formatBlockAnchorValue(block.id),
      label: getBlockAnchorOptionLabel(block, context.blockTypeLabels),
    }));
}

export function createEmptyBlockAnchorContext(): IBlockAnchorContext {
  return {
    blocks: [],
    editingBlockId: null,
    blockTypeLabels: {},
  };
}
