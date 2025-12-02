import { computed, reactive, ref } from 'vue';

import { LicenseService } from '../../core/services/LicenseService';
import { IBlock, TBlockId } from '../../core/types';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import { UniversalValidator } from '../../utils/universalValidation';

export function useBlockForm(
  blockService: BlockManagementUseCase,
  licenseService: LicenseService,
  getBlockConfig: (type: string) => any
) {
  const showModal = ref(false);
  const modalMode = ref<'create' | 'edit'>('create');
  const currentType = ref<string | null>(null);
  const currentBlockId = ref<TBlockId | null>(null);
  const selectedPosition = ref<number | undefined>(undefined);
  const formData = reactive<Record<string, any>>({});
  const formErrors = reactive<Record<string, string[]>>({});

  const currentBlockType = computed(() => {
    if (!currentType.value) {
      return null;
    }
    return getBlockConfig(currentType.value);
  });

  const currentBlockFields = computed(() => {
    if (!currentBlockType.value) {
      return [];
    }
    const blockType = currentBlockType.value;
    const fields = addSpacingFieldToFields(
      blockType.fields || [],
      blockType.spacingOptions,
      licenseService.getFeatureChecker()
    );
    return fields;
  });

  const openCreateModal = (type: string, position?: number) => {
    modalMode.value = 'create';
    currentType.value = type;
    currentBlockId.value = null;
    selectedPosition.value = position;

    Object.keys(formData).forEach(key => delete formData[key]);
    const blockType = currentBlockType.value;
    blockType?.fields?.forEach((field: any) => {
      if (field.type === 'api-select') {
        const isMultiple = field.apiSelectConfig?.multiple ?? false;
        formData[field.field] = field.defaultValue ?? (isMultiple ? [] : null);
      } else {
        formData[field.field] = field.defaultValue;
      }
    });

    showModal.value = true;
  };

  const openEditModal = (block: IBlock) => {
    modalMode.value = 'edit';
    currentType.value = block.type;
    currentBlockId.value = block.id;

    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, { ...block.props });

    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    currentType.value = null;
    currentBlockId.value = null;
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.keys(formErrors).forEach(key => delete formErrors[key]);
  };

  const createBlock = async (): Promise<boolean> => {
    if (!currentType.value) {
      return false;
    }

    const blockType = currentBlockType.value;
    if (!blockType) {
      return false;
    }

    const fields = currentBlockFields.value;
    const validation = UniversalValidator.validateForm(formData, fields);

    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (!validation.isValid) {
      Object.assign(formErrors, validation.errors);
      return false;
    }

    try {
      const newBlock = await blockService.createBlock({
        type: currentType.value,
        props: { ...formData },
        settings: blockType.defaultSettings || {},
        render: blockType.render,
      } as any);

      if (selectedPosition.value !== undefined) {
        const allBlocks = (await blockService.getAllBlocks()) as any[];

        const blockIds = allBlocks.map((b: any) => b.id);

        const newBlockIndex = blockIds.indexOf(newBlock.id);
        if (newBlockIndex !== -1) {
          blockIds.splice(newBlockIndex, 1);
        }

        blockIds.splice(selectedPosition.value, 0, newBlock.id);

        await blockService.reorderBlocks(blockIds);
      }

      return true;
    } catch (error) {
      alert('Ошибка создания блока: ' + (error as Error).message);
      return false;
    }
  };

  const updateBlock = async (): Promise<boolean> => {
    if (!currentBlockId.value) {
      return false;
    }

    const fields = currentBlockFields.value;
    const validation = UniversalValidator.validateForm(formData, fields);

    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (!validation.isValid) {
      Object.assign(formErrors, validation.errors);
      return false;
    }

    try {
      await blockService.updateBlock(currentBlockId.value, {
        props: { ...formData },
      } as any);

      return true;
    } catch (error) {
      alert('Ошибка обновления блока: ' + (error as Error).message);
      return false;
    }
  };

  const handleSubmit = async (): Promise<boolean> => {
    const success = await (modalMode.value === 'create' ? createBlock() : updateBlock());
    if (success) {
      closeModal();
    }
    return success;
  };

  return {
    showModal,
    modalMode,
    currentType,
    currentBlockId,
    selectedPosition,
    formData,
    formErrors,
    currentBlockType,
    currentBlockFields,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
  };
}
