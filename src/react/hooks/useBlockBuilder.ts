import { CSS_CLASSES } from '../../utils/constants';
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import type { IBlock, TBlockId } from '../../core/types';
import { initIcons } from '../../shared/icons/index';
import { notificationService } from '../../shared/services/NotificationService';
import { updateBodyEditModeClass } from '../../shared/dom/domClassHelpers';
import {
  canRenderReactBlock,
  prepareBlocksForDisplay,
  resolveReactComponentForBlock,
  type IBlockTypeRenderConfig,
} from '../../utils/blockDisplayHelpers';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { enableViewportBreakpointDetection, isClient } from '../../utils/ssr';
import { unlockBodyScroll } from '../../utils/scrollLock';
import type { IBlockBuilderProps } from '../types/blockBuilder';
import { useBlockForm } from './useBlockForm';
import { useBlocks } from './useBlocks';
import { useModals } from './useModals';

export function useBlockBuilder({
  config,
  blockManagementUseCase,
  onSave,
  initialBlocks,
  controlsFixedPosition,
  controlsOffset = 0,
  controlsOffsetVar,
  isEdit = true,
  onBlockAdded,
  onBlockUpdated,
  onBlockDeleted,
}: IBlockBuilderProps) {
  const blockService = blockManagementUseCase;
  const componentRegistry = blockService.getComponentRegistry();

  const getBlockTypeConfig = useCallback(
    (type: string): IBlockTypeRenderConfig | undefined =>
      (config?.availableBlockTypes || []).find(blockType => blockType.type === type),
    [config?.availableBlockTypes]
  );

  const availableBlockTypes = config?.availableBlockTypes || [];

  const {
    blocks,
    setBlocks,
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
  } = useBlocks({
    blockService,
    isEdit,
    getBlockTypeConfig,
    availableBlockTypes,
    initialBlocks,
    controlsFixedPosition,
    onBlockAdded,
    onBlockDeleted,
  });

  const {
    showModal,
    modalMode,
    currentBlockType,
    currentBlockFields,
    formData,
    formErrors,
    selectedPosition,
    setSelectedPosition,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    updateFormField,
    registerRepeaterRef,
  } = useBlockForm({
    blockService,
    availableBlockTypes,
    isEdit,
    loadBlocks,
    setupBreakpointWatchers,
    scrollToBlock,
    setBlocks,
    onBlockPersisted: () => {
      setSpacingLayoutEpoch(epoch => epoch + 1);
    },
    onBlockAdded,
    onBlockUpdated,
  });

  const {
    showTypeSelectionModal,
    setShowTypeSelectionModal,
    closeTypeSelectionModal,
  } = useModals(showModal);

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

  const appClassName = [
    CSS_CLASSES.APP,
    CSS_CLASSES.BLOCK_BUILDER_ROOT,
    controlsFixedPosition ? CSS_CLASSES.HAS_FIXED_CONTROLS : '',
    controlsFixedPosition === 'top' ? CSS_CLASSES.HAS_TOP_CONTROLS : '',
    controlsFixedPosition === 'bottom' ? CSS_CLASSES.HAS_BOTTOM_CONTROLS : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleSave = useCallback(async () => {
    if (!onSave) {
      notificationService.error(
        'Функция сохранения не настроена. Передайте onSave в пропсы компонента.'
      );
      return;
    }
    try {
      const result = await Promise.resolve(onSave(blocks));
      if (result === true) {
        notificationService.success('Данные успешно сохранены');
      } else {
        notificationService.error('Произошла ошибка при сохранении');
      }
    } catch {
      notificationService.error('Произошла ошибка при сохранении');
    }
  }, [blocks, onSave]);

  const handleCopyId = useCallback(async (blockId: TBlockId) => {
    try {
      const success = await copyToClipboard(blockId as string);
      if (success !== false) {
        notificationService.success(`ID скопирован: ${blockId}`);
      }
    } catch {
      notificationService.error('Ошибка копирования ID');
    }
  }, []);

  const renderBlockContent = useCallback(
    (block: IBlock) => {
      if (!canRenderReactBlock(block, componentRegistry)) {
        return createElement(
          'div',
          { className: CSS_CLASSES.BLOCK_CONTENT_FALLBACK },
          createElement(
            'strong',
            null,
            availableBlockTypes.find(blockType => blockType.type === block.type)?.title || block.type
          ),
          createElement('pre', null, JSON.stringify(getUserComponentProps(block), null, 2))
        );
      }
      const Component = resolveReactComponentForBlock(block, componentRegistry);
      return createElement(Component, getUserComponentProps(block));
    },
    [availableBlockTypes, componentRegistry, getUserComponentProps]
  );

  const openTypeSelectionModal = useCallback(
    (position?: number) => {
      if (!isEdit) {
        return;
      }
      setSelectedPosition(position);
      setShowTypeSelectionModal(true);
    },
    [isEdit, setSelectedPosition, setShowTypeSelectionModal]
  );

  const selectBlockType = useCallback(
    (type: string) => {
      const position = selectedPosition;
      closeTypeSelectionModal();
      openCreateModal(type, position);
    },
    [closeTypeSelectionModal, openCreateModal, selectedPosition]
  );

  useEffect(() => {
    if (!initialBlocks?.length) {
      return;
    }
    setBlocks(prepareBlocksForDisplay(initialBlocks, getBlockTypeConfig));
  }, [initialBlocks, getBlockTypeConfig, setBlocks]);

  useEffect(() => {
    if (isClient()) {
      initIcons();
      updateBodyEditModeClass(isEdit);
    }

    void syncBlocksWithRepository().then(async () => {
      if (isClient()) {
        enableViewportBreakpointDetection();
        setSpacingLayoutEpoch(epoch => epoch + 1);
        await setupBreakpointWatchers();
      }
    });

    return () => {
      cleanupBreakpointWatchers();
      updateBodyEditModeClass(false);
      unlockBodyScroll();
    };
  }, []);

  useEffect(() => {
    if (isClient()) {
      updateBodyEditModeClass(isEdit);
    }
  }, [isEdit]);

  return {
    appClassName,
    controlsInlineStyles,
    controlsFixedPosition,
    visibleBlocks,
    blocks,
    isEdit,
    showModal,
    showTypeSelectionModal,
    modalMode,
    currentBlockType,
    currentBlockFields,
    formData,
    formErrors,
    availableBlockTypes,
    getBlockSpacingStyles,
    renderBlockContent,
    handleSave,
    handleClearAll,
    handleCopyId,
    handleDuplicateBlock,
    handleDeleteBlock,
    reorderBlock,
    handleToggleVisibility,
    openEditModal,
    openTypeSelectionModal,
    closeTypeSelectionModal,
    selectBlockType,
    closeModal,
    handleSubmit,
    updateFormField,
    registerRepeaterRef,
  };
}
