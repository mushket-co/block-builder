import { CSS_CLASSES } from '../../utils/constants';
import { lazy, Suspense, useMemo } from 'react';
import { useBlockBuilder } from '../hooks/useBlockBuilder';
import type { IBlockBuilderProps } from '../types/blockBuilder';
import { BlockAnchorContext } from '../context/blockAnchorContext';
import { BlockControlsBar } from './BlockControlsBar';
import { BlockFormModal } from './BlockFormModal';
import { BlockTypeSelectionModal } from './BlockTypeSelectionModal';
import { BlocksPanel } from './BlocksPanel';

export type { IBlockBuilderProps } from '../types/blockBuilder';

const BlockFormFields = lazy(() =>
  import('./BlockFormFields').then(module => ({ default: module.BlockFormFields }))
);

export function BlockBuilder(props: IBlockBuilderProps) {
  const {
    apiSelectUseCase,
    customFieldRendererRegistry,
    controlsContainerClass,
    controlsFixedPosition,
    controlsOffset,
    controlsOffsetVar,
    isEdit = true,
  } = props;

  const builder = useBlockBuilder(props);

  const blockAnchorContext = useMemo(() => {
    const blockTypeLabels: Record<string, string> = {};
    builder.availableBlockTypes.forEach(blockType => {
      blockTypeLabels[blockType.type] = blockType.label || blockType.type;
    });

    return {
      blocks: builder.blocks.map(block => ({
        id: block.id,
        type: block.type,
        props: block.props,
        settings: block.settings,
        visible: block.visible,
      })),
      editingBlockId: builder.currentBlockId,
      blockTypeLabels,
    };
  }, [builder.availableBlockTypes, builder.blocks, builder.currentBlockId]);

  return (
    <div className={builder.appClassName}>
      <BlockControlsBar
        isEdit={isEdit}
        blocksCount={builder.blocks.length}
        visibleCount={builder.visibleBlocks.length}
        controlsFixedPosition={controlsFixedPosition}
        controlsOffset={controlsOffset}
        controlsOffsetVar={controlsOffsetVar}
        controlsContainerClass={controlsContainerClass}
        onSave={() => void builder.handleSave()}
        onClearAll={() => void builder.handleClearAll()}
      />

      <BlocksPanel
        blocks={builder.visibleBlocks}
        isEdit={isEdit}
        controlsContainerClass={controlsContainerClass}
        getSpacingStyles={builder.getBlockSpacingStyles}
        renderBlockContent={builder.renderBlockContent}
        onAddBlock={builder.openTypeSelectionModal}
        onCopyId={blockId => void builder.handleCopyId(blockId)}
        onMoveUp={blockId => void builder.reorderBlock(blockId, 'up')}
        onMoveDown={blockId => void builder.reorderBlock(blockId, 'down')}
        onEdit={builder.openEditModal}
        onDuplicate={blockId => void builder.handleDuplicateBlock(blockId)}
        onToggleVisibility={blockId => void builder.handleToggleVisibility(blockId)}
        onDelete={blockId => void builder.handleDeleteBlock(blockId)}
      />

      {builder.showTypeSelectionModal ? (
        <BlockTypeSelectionModal
          blockTypes={builder.availableBlockTypes}
          onClose={builder.closeTypeSelectionModal}
          onSelect={builder.selectBlockType}
        />
      ) : null}

      {builder.showModal && builder.currentBlockType ? (
        <BlockFormModal
          title={`${builder.modalMode === 'create' ? 'Создать' : 'Редактировать'} ${builder.currentBlockType.label}`}
          submitLabel={builder.modalMode === 'create' ? 'Создать' : 'Сохранить'}
          contentClassName={CSS_CLASSES.MODAL_CONTENT}
          bodyClassName={CSS_CLASSES.MODAL_BODY}
          validationErrorCount={builder.validationErrorCount}
          isFormHydrating={builder.isFormHydrating}
          onClose={builder.closeModal}
          onSubmit={() => void builder.handleSubmit()}
          onValidationErrorNavigate={() => void builder.navigateToValidationError()}
        >
          <form
            className={CSS_CLASSES.FORM}
            style={builder.isFormHydrating ? { display: 'none' } : undefined}
            onSubmit={event => {
              event.preventDefault();
              void builder.handleSubmit();
            }}
          >
            <BlockAnchorContext.Provider value={blockAnchorContext}>
              <Suspense fallback={null}>
                <BlockFormFields
                  fields={builder.currentBlockFields}
                  currentBlockType={builder.currentBlockType}
                  formData={builder.formData}
                  formErrors={builder.formErrors}
                  apiSelectUseCase={apiSelectUseCase}
                  customFieldRendererRegistry={customFieldRendererRegistry}
                  onFieldChange={builder.updateFormField}
                  onRepeaterReady={builder.registerRepeaterRef}
                />
              </Suspense>
            </BlockAnchorContext.Provider>
          </form>
        </BlockFormModal>
      ) : null}
    </div>
  );
}

export const BlockBuilderComponent = BlockBuilder;
