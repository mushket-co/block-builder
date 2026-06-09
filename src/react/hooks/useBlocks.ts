import { useCallback, useMemo, useRef, useState } from 'react';

import type { IBlock, TBlockId } from '../../core/types';
import type { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import { blockScrollService } from '../../shared/services/BlockScrollService';
import { prepareBlocksForDisplay, type IBlockTypeRenderConfig } from '../../utils/blockDisplayHelpers';
import type { IBlockType } from '../types/blockBuilder';
import { seedRepositoryFromBlocks } from '../../utils/blockRepositorySync';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import { ERROR_MESSAGES } from '../../utils/constants';
import { getBlockScrollMargins } from '../../utils/scrollHelpers';
import { afterPaint } from '../../utils/scheduling';
import { isClient } from '../../utils/ssr';
import type { ISpacingData } from '../../utils/spacingHelpers';

interface IUseBlocksParams {
  blockService: BlockManagementUseCase;
  isEdit: boolean;
  getBlockTypeConfig: (type: string) => IBlockTypeRenderConfig | undefined;
  availableBlockTypes: IBlockType[];
  initialBlocks?: IBlock[];
  controlsFixedPosition?: 'top' | 'bottom';
  onBlockAdded?: (block: IBlock) => void;
  onBlockDeleted?: (id: TBlockId) => void;
}

export function useBlocks({
  blockService,
  isEdit,
  getBlockTypeConfig,
  availableBlockTypes,
  initialBlocks,
  controlsFixedPosition,
  onBlockAdded,
  onBlockDeleted,
}: IUseBlocksParams) {
  const [blocks, setBlocks] = useState<IBlock[]>(() =>
    prepareBlocksForDisplay(initialBlocks, getBlockTypeConfig)
  );
  const [spacingLayoutEpoch, setSpacingLayoutEpoch] = useState(0);
  const breakpointUnsubscribers = useRef<Map<TBlockId, () => void>>(new Map());

  const visibleBlocks = useMemo(() => {
    if (isEdit) {
      return blocks;
    }
    return blocks.filter(block => block.visible !== false);
  }, [blocks, isEdit]);

  const getBlockSpacingStyles = useCallback(
    (block: IBlock) => {
      void spacingLayoutEpoch;
      const spacing = block.props?.spacing as ISpacingData | undefined;
      if (!spacing || Object.keys(spacing).length === 0) {
        return {};
      }
      const blockConfig = availableBlockTypes.find(bt => bt.type === block.type);
      const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;
      return getBlockInlineStyles(spacing, 'spacing', breakpoints);
    },
    [availableBlockTypes, spacingLayoutEpoch]
  );

  const getUserComponentProps = useCallback((block: IBlock) => {
    if (!block.props) {
      return {};
    }
    const { spacing: _spacing, ...userProps } = block.props;
    return userProps;
  }, []);

  const setupBreakpointWatchers = useCallback(async (blocksSnapshot?: IBlock[]) => {
    await afterPaint();
    const sourceBlocks = blocksSnapshot ?? blocks;
    sourceBlocks.forEach(block => {
      const spacing = block.props?.spacing as ISpacingData | undefined;
      if (!spacing || Object.keys(spacing).length === 0) {
        return;
      }
      const element = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
      if (!element) {
        return;
      }
      breakpointUnsubscribers.current.get(block.id)?.();
      const blockConfig = availableBlockTypes.find(bt => bt.type === block.type);
      const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;
      const unsubscribe = watchBreakpointChanges(element, spacing, 'spacing', breakpoints);
      breakpointUnsubscribers.current.set(block.id, unsubscribe);
    });
  }, [availableBlockTypes, blocks]);

  const cleanupBreakpointWatchers = useCallback(() => {
    breakpointUnsubscribers.current.forEach(unsubscribe => unsubscribe());
    breakpointUnsubscribers.current.clear();
  }, []);

  const loadBlocks = useCallback(async (): Promise<IBlock[]> => {
    const repositoryBlocks = (await blockService.getAllBlocks()) as IBlock[];
    const preparedBlocks = prepareBlocksForDisplay(repositoryBlocks, getBlockTypeConfig);
    setBlocks(preparedBlocks);
    return preparedBlocks;
  }, [blockService, getBlockTypeConfig]);

  const scrollToBlock = useCallback(
    async (blockId: TBlockId, behavior: ScrollBehavior = 'smooth') => {
      const session = blockScrollService.beginSession();
      await blockScrollService.scrollToBlockWhenReady(
        blockId,
        { ...getBlockScrollMargins({ controlsFixedPosition }), behavior },
        session
      );
    },
    [controlsFixedPosition]
  );

  const syncBlocksWithRepository = useCallback(async () => {
    try {
      await seedRepositoryFromBlocks(blockService, blocks, getBlockTypeConfig);
      if (blocks.length === 0) {
        const repositoryBlocks = await blockService.getAllBlocks();
        if (repositoryBlocks.length > 0) {
          setBlocks(prepareBlocksForDisplay(repositoryBlocks as IBlock[], getBlockTypeConfig));
        }
      }
    } catch (error) {
      if (isClient()) {
        alert(
          `Ошибка загрузки начальных блоков: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
        );
      } else {
        console.error('Ошибка синхронизации блоков с репозиторием:', error);
      }
    }
  }, [blockService, blocks, getBlockTypeConfig]);

  const handleDuplicateBlock = useCallback(
    async (id: TBlockId) => {
      if (!isEdit) {
        return;
      }
      try {
        const duplicated = await blockService.duplicateBlock(id);
        if (!duplicated) {
          return;
        }
        setBlocks(prev => [...prev, duplicated as IBlock]);
        await setupBreakpointWatchers();
        await scrollToBlock(duplicated.id, 'smooth');
        onBlockAdded?.(duplicated as IBlock);
      } catch (error) {
        alert(
          `Ошибка дублирования блока: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
        );
      }
    },
    [blockService, isEdit, onBlockAdded, scrollToBlock, setupBreakpointWatchers]
  );

  const handleDeleteBlock = useCallback(
    async (id: TBlockId) => {
      if (!isEdit || !confirm('Удалить блок?')) {
        return;
      }
      try {
        breakpointUnsubscribers.current.get(id)?.();
        breakpointUnsubscribers.current.delete(id);
        await blockService.deleteBlock(id);
        setBlocks(prev => prev.filter(block => block.id !== id));
        onBlockDeleted?.(id);
      } catch (error) {
        alert(
          `Ошибка удаления блока: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
        );
      }
    },
    [blockService, isEdit, onBlockDeleted]
  );

  const reorderBlock = useCallback(
    async (id: TBlockId, direction: 'up' | 'down') => {
      const index = blocks.findIndex(block => block.id === id);
      if (
        (direction === 'up' && index <= 0) ||
        (direction === 'down' && index >= blocks.length - 1)
      ) {
        return;
      }
      const newBlocks = [...blocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      await blockService.reorderBlocks(newBlocks.map(block => block.id));
      await loadBlocks();
      await setupBreakpointWatchers();
      await scrollToBlock(id, 'auto');
    },
    [blockService, blocks, loadBlocks, scrollToBlock, setupBreakpointWatchers]
  );

  const handleToggleVisibility = useCallback(
    async (blockId: TBlockId) => {
      if (!isEdit) {
        return;
      }
      const block = blocks.find(item => item.id === blockId);
      if (!block) {
        return;
      }
      await blockService.setBlockVisible(blockId, !block.visible);
      await loadBlocks();
      await setupBreakpointWatchers();
    },
    [blockService, blocks, isEdit, loadBlocks, setupBreakpointWatchers]
  );

  const handleClearAll = useCallback(async () => {
    if (!isEdit || !confirm('Удалить все блоки?')) {
      return;
    }
    try {
      await blockService.clearAllBlocks();
      setBlocks([]);
      cleanupBreakpointWatchers();
    } catch (error) {
      alert(
        `Ошибка очистки блоков: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
      );
    }
  }, [blockService, cleanupBreakpointWatchers, isEdit]);

  return {
    blocks,
    setBlocks,
    spacingLayoutEpoch,
    setSpacingLayoutEpoch,
    visibleBlocks,
    loadBlocks,
    getBlockSpacingStyles,
    getUserComponentProps,
    setupBreakpointWatchers,
    cleanupBreakpointWatchers,
    syncBlocksWithRepository,
    handleDuplicateBlock,
    handleDeleteBlock,
    reorderBlock,
    handleToggleVisibility,
    handleClearAll,
    scrollToBlock,
  };
}
