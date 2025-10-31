import { TBlock, TBlockWithChildren, TBlockId, IBlockDto } from '../core/types';
import { deepClone } from './deepClone';

// Реэкспорт типов для обратной совместимости
export type { TBlock, TBlockWithChildren, TBlockId } from '../core/types';

/**
 * Утилиты для работы с блоками
 */





/**
 * Создает копию блока с новым ID
 */
export function cloneBlock(block: TBlock, newId: TBlockId): TBlock {
  const cloned = deepClone(block);
  cloned.id = newId;
  cloned.metadata = {
  ...cloned.metadata,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1
  };
  return cloned;
}

/**
 * Создает иерархию блоков из плоского списка
 */
export function buildBlockHierarchy(blocks: TBlock[]): TBlockWithChildren[] {
  const blockMap = new Map<string, TBlockWithChildren>(
  blocks.map(block => [block.id, { ...(block as Omit<IBlockDto, 'children'>), children: [] }])
  );
  const rootBlocks: TBlockWithChildren[] = [];

  blocks.forEach(block => {
  const blockWithChildren = blockMap.get(block.id)!;

  if (block.parent) {
    const parent = blockMap.get(block.parent);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(blockWithChildren);
    }
  } else {
    rootBlocks.push(blockWithChildren);
  }
  });

  return rootBlocks;
}

/**
 * Получает все дочерние блоки рекурсивно
 */
export function getAllChildren(block: TBlock, allBlocks: TBlock[]): TBlock[] {
  const children = allBlocks.filter(b => b.parent === block.id);
  let allChildren = [...children];

  children.forEach(child => {
  allChildren = [...allChildren, ...getAllChildren(child, allBlocks)];
  });

  return allChildren;
}

/**
 * Проверяет, является ли блок дочерним для другого блока
 */
export function isChildOf(childBlock: TBlock, parentBlock: TBlock, allBlocks: TBlock[]): boolean {
  if (childBlock.parent === parentBlock.id) return true;

  const parent = allBlocks.find(b => b.id === childBlock.parent);
  if (!parent) return false;

  return isChildOf(parent, parentBlock, allBlocks);
}
