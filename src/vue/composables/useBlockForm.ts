import { computed, reactive, ref } from 'vue';

import { IBlock, TBlockId } from '../../core/types';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import { resolveFormFieldDefaultValue } from '../../utils/formFieldDefaults';
import {
  applyFormErrors,
  ReactiveFormValidationTracker,
} from '../../utils/reactiveFormValidation';
import { UniversalValidator } from '../../utils/universalValidation';

export function useBlockForm(
  blockService: BlockManagementUseCase,
  getBlockConfig: (type: string) => any
) {
  const showModal = ref(false);
  const modalMode = ref<'create' | 'edit'>('create');
  const currentType = ref<string | null>(null);
  const currentBlockId = ref<TBlockId | null>(null);
  const selectedPosition = ref<number | undefined>(undefined);
  const formData = reactive<Record<string, any>>({});
  const formErrors = reactive<Record<string, string[]>>({});
  const validationTracker = new ReactiveFormValidationTracker();

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
    return addSpacingFieldToFields(blockType.fields || [], blockType.spacingOptions);
  });

  const revalidateIfTouched = (): void => {
    const nextErrors = validationTracker.revalidateIfTouched(formData, currentBlockFields.value);
    if (nextErrors) {
      applyFormErrors(formErrors, nextErrors);
    }
  };

  const updateFormField = (fieldName: string, value: unknown): void => {
    formData[fieldName] = value;
    revalidateIfTouched();
  };

  const openCreateModal = (type: string, position?: number) => {
    modalMode.value = 'create';
    currentType.value = type;
    currentBlockId.value = null;
    selectedPosition.value = position;
    validationTracker.reset();

    Object.keys(formData).forEach(key => delete formData[key]);
    Object.keys(formErrors).forEach(key => delete formErrors[key]);
    const blockType = currentBlockType.value;
    blockType?.fields?.forEach((field: any) => {
      formData[field.field] = resolveFormFieldDefaultValue(field);
    });

    showModal.value = true;
  };

  const openEditModal = (block: IBlock) => {
    modalMode.value = 'edit';
    currentType.value = block.type;
    currentBlockId.value = block.id;
    validationTracker.reset();

    Object.keys(formData).forEach(key => delete formData[key]);
    Object.keys(formErrors).forEach(key => delete formErrors[key]);
    Object.assign(formData, { ...block.props });

    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    currentType.value = null;
    currentBlockId.value = null;
    validationTracker.reset();
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

    if (!validation.isValid) {
      validationTracker.touch();
      applyFormErrors(formErrors, validation.errors);
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

    if (!validation.isValid) {
      validationTracker.touch();
      applyFormErrors(formErrors, validation.errors);
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
    updateFormField,
    validationTracker,
  };
}
