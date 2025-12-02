import { computed, ref } from 'vue';

import { IBlock, TBlockId } from '../../core/types';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import { ERROR_MESSAGES } from '../../utils/constants';
import { ISpacingData } from '../../utils/spacingHelpers';

export function useBlocks(
  blockService: BlockManagementUseCase,
  isEdit: boolean,
  getBlockConfig: (type: string) => any
) {
  const blocks = ref<IBlock[]>([]);
  const breakpointUnsubscribers = new Map<TBlockId, () => void>();

  const visibleBlocks = computed(() => {
    if (isEdit) {
      return blocks.value;
    }
    return blocks.value.filter((block: IBlock) => block.visible !== false);
  });

  const loadBlocks = async () => {
    try {
      blocks.value = (await blockService.getAllBlocks()) as any;
    } catch (error) {
      alert(`Ошибка загрузки блоков: ${error}`);
    }
  };

  const getBlockSpacingStyles = (block: IBlock): Record<string, string> => {
    const spacing = block.props?.spacing as ISpacingData | undefined;

    if (!spacing || Object.keys(spacing).length === 0) {
      return {};
    }

    const blockConfig = getBlockConfig(block.type);
    const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;

    return getBlockInlineStyles(spacing, 'spacing', breakpoints);
  };

  const getUserComponentProps = (block: IBlock): Record<string, any> => {
    if (!block.props) {
      return {};
    }
    const { spacing: _spacing, ...userProps } = block.props;
    return userProps;
  };

  const setupBreakpointWatchers = async () => {
    await new Promise(resolve => setTimeout(resolve, 0));

    blocks.value.forEach((block: IBlock) => {
      const spacing = block.props?.spacing as ISpacingData | undefined;
      if (!spacing || Object.keys(spacing).length === 0) {
        return;
      }
      const element = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
      if (!element) {
        return;
      }
      const oldUnsubscribe = breakpointUnsubscribers.get(block.id);
      if (oldUnsubscribe) {
        oldUnsubscribe();
      }
      const blockConfig = getBlockConfig(block.type);
      const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;
      const unsubscribe = watchBreakpointChanges(element, spacing, 'spacing', breakpoints);
      breakpointUnsubscribers.set(block.id, unsubscribe);
    });
  };

  const cleanupBreakpointWatchers = () => {
    breakpointUnsubscribers.forEach(unsubscribe => unsubscribe());
    breakpointUnsubscribers.clear();
  };

  const deleteBlock = async (id: TBlockId) => {
    const unsubscribe = breakpointUnsubscribers.get(id);
    if (unsubscribe) {
      unsubscribe();
      breakpointUnsubscribers.delete(id);
    }

    await blockService.deleteBlock(id);
    blocks.value = blocks.value.filter((b: IBlock) => b.id !== id);
  };

  const duplicateBlock = async (id: TBlockId) => {
    const duplicated = await blockService.duplicateBlock(id);
    blocks.value.push(duplicated as any);
    await setupBreakpointWatchers();
    return duplicated;
  };

  const moveBlock = async (id: TBlockId, direction: 'up' | 'down') => {
    const index = blocks.value.findIndex((b: IBlock) => b.id === id);
    if (
      (direction === 'up' && index <= 0) ||
      (direction === 'down' && index >= blocks.value.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks.value];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    const blockIds = newBlocks.map((b: IBlock) => b.id);

    await blockService.reorderBlocks(blockIds);

    await loadBlocks();
    await setupBreakpointWatchers();
  };

  const toggleBlockVisibility = async (blockId: TBlockId) => {
    const block = blocks.value.find((b: IBlock) => b.id === blockId);
    if (!block) {
      return;
    }

    await blockService.setBlockVisible(blockId, !block.visible);
    await loadBlocks();
    await setupBreakpointWatchers();
  };

  const clearAllBlocks = async () => {
    try {
      await blockService.clearAllBlocks();
      blocks.value = [];
      cleanupBreakpointWatchers();
    } catch (error) {
      alert(
        `Ошибка очистки блоков: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
      );
    }
  };

  return {
    blocks,
    visibleBlocks,
    loadBlocks,
    getBlockSpacingStyles,
    getUserComponentProps,
    setupBreakpointWatchers,
    cleanupBreakpointWatchers,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    toggleBlockVisibility,
    clearAllBlocks,
  };
}
