import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import type { IBlock, TBlockId } from '../../core/types';
import type { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import {
  ValidationErrorHandler,
  type IRepeaterRef,
} from '../../shared/services/ValidationErrorHandler';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import { countValidationErrors } from '../../utils/formErrorHelpers';
import { isFieldVisible } from '../../utils/formFieldHelpers';
import { ReactiveFormValidationTracker } from '../../utils/reactiveFormValidation';
import { UniversalValidator } from '../../utils/universalValidation';
import type { IBlockType } from '../types/blockBuilder';

interface IUseBlockFormParams {
  blockService: BlockManagementUseCase;
  availableBlockTypes: IBlockType[];
  isEdit: boolean;
  loadBlocks: () => Promise<IBlock[]>;
  setupBreakpointWatchers: (blocksSnapshot?: IBlock[]) => Promise<void>;
  onBlockPersisted?: () => void;
  scrollToBlock: (blockId: TBlockId, behavior?: ScrollBehavior) => Promise<void>;
  setBlocks: Dispatch<SetStateAction<IBlock[]>>;
  onBlockAdded?: (block: IBlock) => void;
  onBlockUpdated?: (block: IBlock) => void;
}

export function useBlockForm({
  blockService,
  availableBlockTypes,
  isEdit,
  loadBlocks,
  setupBreakpointWatchers,
  scrollToBlock,
  setBlocks,
  onBlockPersisted,
  onBlockAdded,
  onBlockUpdated,
}: IUseBlockFormParams) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [currentBlockId, setCurrentBlockId] = useState<TBlockId | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const validationTrackerRef = useRef(new ReactiveFormValidationTracker());
  const repeaterRefs = useRef<Map<string, IRepeaterRef>>(new Map());
  const validationErrorHandler = useMemo(
    () => new ValidationErrorHandler(repeaterRefs.current),
    []
  );

  const currentBlockType = useMemo(() => {
    if (!currentType) {
      return null;
    }
    return availableBlockTypes.find(blockType => blockType.type === currentType) || null;
  }, [availableBlockTypes, currentType]);

  const currentBlockFields = useMemo(() => {
    if (!currentBlockType) {
      return [];
    }
    return addSpacingFieldToFields(currentBlockType.fields || [], currentBlockType.spacingOptions);
  }, [currentBlockType]);

  const updateFormField = useCallback(
    (fieldName: string, value: unknown) => {
      setFormData(prev => {
        const nextFormData = { ...prev, [fieldName]: value };
        const nextErrors = validationTrackerRef.current.revalidateIfTouched(
          nextFormData,
          currentBlockFields,
          (field, itemData) =>
            isFieldVisible(field, nextFormData, itemData as Record<string, unknown> | undefined)
        );

        if (nextErrors) {
          setFormErrors(nextErrors);
        }

        return nextFormData;
      });
    },
    [currentBlockFields]
  );

  const handleValidationErrors = useCallback(
    async (errors: Record<string, string[]>) => {
      await validationErrorHandler.handleValidationErrors(errors, 350);
    },
    [validationErrorHandler]
  );

  const navigateToValidationError = useCallback(async () => {
    await validationErrorHandler.navigateToValidationError(formErrors);
  }, [formErrors, validationErrorHandler]);

  const validationErrorCount = useMemo(
    () => countValidationErrors(formErrors),
    [formErrors]
  );

  useEffect(() => {
    return () => {
      validationErrorHandler.cancelPending();
    };
  }, [validationErrorHandler]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setCurrentType(null);
    setCurrentBlockId(null);
    setFormData({});
    setFormErrors({});
    validationTrackerRef.current.reset();
    repeaterRefs.current.clear();
  }, []);

  const openCreateModal = useCallback(
    (type: string, position?: number) => {
      if (!isEdit) {
        return;
      }
      setModalMode('create');
      setCurrentType(type);
      setCurrentBlockId(null);
      setSelectedPosition(position);
      const blockType = availableBlockTypes.find(bt => bt.type === type);
      const fields = blockType
        ? addSpacingFieldToFields(blockType.fields || [], blockType.spacingOptions)
        : [];
      const nextFormData: Record<string, unknown> = {};
      fields.forEach(field => {
        if (field.type === 'api-select') {
          const isMultiple = field.apiSelectConfig?.multiple ?? false;
          nextFormData[field.field] = field.defaultValue ?? (isMultiple ? [] : null);
        } else {
          nextFormData[field.field] = field.defaultValue;
        }
      });
      setFormData(nextFormData);
      setFormErrors({});
      validationTrackerRef.current.reset();
      setShowModal(true);
    },
    [availableBlockTypes, isEdit]
  );

  const openEditModal = useCallback(
    (block: IBlock) => {
      if (!isEdit) {
        return;
      }
      setModalMode('edit');
      setCurrentType(block.type);
      setCurrentBlockId(block.id);
      setFormData({ ...block.props });
      setFormErrors({});
      validationTrackerRef.current.reset();
      setShowModal(true);
    },
    [isEdit]
  );

  const createBlock = useCallback(async (): Promise<IBlock | null> => {
    if (!currentType || !currentBlockType) {
      return null;
    }

    const validation = UniversalValidator.validateForm(
      formData,
      currentBlockFields,
      (field, itemData) =>
        isFieldVisible(field, formData, itemData as Record<string, unknown> | undefined)
    );
    if (!validation.isValid) {
      validationTrackerRef.current.touch();
      setFormErrors(validation.errors);
      await handleValidationErrors(validation.errors);
      return null;
    }

    try {
      const newBlock = await blockService.createBlock({
        type: currentType,
        props: { ...formData },
        settings: currentBlockType.defaultSettings || {},
        render: currentBlockType.render,
      } as IBlock);

      if (selectedPosition !== undefined) {
        const allBlocks = (await blockService.getAllBlocks()) as IBlock[];
        const blockIds = allBlocks.map(block => block.id);
        const newBlockIndex = blockIds.indexOf(newBlock.id);
        if (newBlockIndex !== -1) {
          blockIds.splice(newBlockIndex, 1);
        }
        blockIds.splice(selectedPosition, 0, newBlock.id);
        await blockService.reorderBlocks(blockIds);
      }

      const loadedBlocks = await loadBlocks();
      await setupBreakpointWatchers(loadedBlocks);
      await scrollToBlock(newBlock.id, 'smooth');
      return newBlock as IBlock;
    } catch (error) {
      alert(`Ошибка создания блока: ${(error as Error).message}`);
      return null;
    }
  }, [
    blockService,
    currentBlockFields,
    currentBlockType,
    currentType,
    formData,
    handleValidationErrors,
    loadBlocks,
    scrollToBlock,
    selectedPosition,
    setupBreakpointWatchers,
  ]);

  const updateBlock = useCallback(async (): Promise<boolean> => {
    if (!currentBlockId) {
      return false;
    }

    const validation = UniversalValidator.validateForm(
      formData,
      currentBlockFields,
      (field, itemData) =>
        isFieldVisible(field, formData, itemData as Record<string, unknown> | undefined)
    );
    if (!validation.isValid) {
      validationTrackerRef.current.touch();
      setFormErrors(validation.errors);
      await handleValidationErrors(validation.errors);
      return false;
    }

    try {
      const updated = await blockService.updateBlock(currentBlockId, {
        props: { ...formData },
      } as Partial<IBlock>);
      let nextBlocks: IBlock[] = [];
      setBlocks(prev => {
        nextBlocks = prev.map(block =>
          block.id === currentBlockId ? (updated as IBlock) : block
        );
        return nextBlocks;
      });
      onBlockPersisted?.();
      await setupBreakpointWatchers(nextBlocks);
      onBlockUpdated?.(updated as IBlock);
      return true;
    } catch (error) {
      alert(`Ошибка обновления блока: ${(error as Error).message}`);
      return false;
    }
  }, [
    blockService,
    currentBlockFields,
    currentBlockId,
    formData,
    handleValidationErrors,
    onBlockPersisted,
    onBlockUpdated,
    setBlocks,
    setupBreakpointWatchers,
  ]);

  const handleSubmit = useCallback(async () => {
    if (modalMode === 'create') {
      const newBlock = await createBlock();
      if (!newBlock) {
        return;
      }

      onBlockAdded?.(newBlock);
      closeModal();
      return;
    }

    const success = await updateBlock();
    if (success) {
      closeModal();
    }
  }, [closeModal, createBlock, modalMode, onBlockAdded, updateBlock]);

  const registerRepeaterRef = useCallback((fieldName: string, renderer: IRepeaterRef) => {
    repeaterRefs.current.set(fieldName, renderer);
  }, []);

  return {
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
    validationErrorCount,
    navigateToValidationError,
  };
}
