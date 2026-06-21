<template>
  <div :class="appClass">
    <div
      v-if="props.isEdit"
      :class="[CSS_CLASSES.CONTROLS, controlsFixedClass]"
      :style="controlsInlineStyles"
    >
      <div :class="[CSS_CLASSES.CONTROLS_CONTAINER, props.controlsContainerClass].filter(Boolean)">
        <div :class="CSS_CLASSES.CONTROLS_INNER">
          <button
            v-if="props.isEdit"
            :class="[CSS_CLASSES.BTN, CSS_CLASSES.BTN_SUCCESS]"
            @click="handleSave"
          >
            <span :class="CSS_CLASSES.BB_ICON_WRAPPER" v-html="saveIconHTML" /> Сохранить
          </button>
          <button
            v-if="props.isEdit"
            :class="[CSS_CLASSES.BTN, CSS_CLASSES.BTN_DANGER]"
            @click="handleClearAll"
          >
            <span :class="CSS_CLASSES.BB_ICON_WRAPPER" v-html="deleteIconHTML" /> Очистить все
          </button>

          <div :class="CSS_CLASSES.STATS">
            <span>
              Всего блоков: <span>{{ props.isEdit ? blocks.length : visibleBlocks.length }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div :class="CSS_CLASSES.BLOCKS">
      <div v-if="visibleBlocks.length === 0" :class="CSS_CLASSES.EMPTY_STATE">
        <div v-if="props.isEdit" :class="CSS_CLASSES.ADD_BLOCK_SEPARATOR">
          <button
            :class="CSS_CLASSES.ADD_BLOCK_BTN"
            title="Добавить блок"
            @click="openBlockTypeSelectionModal(0)"
          >
            <span :class="CSS_CLASSES.ADD_BLOCK_BTN_ICON">+</span>
            <span :class="CSS_CLASSES.ADD_BLOCK_BTN_TEXT">Добавить блок</span>
          </button>
        </div>
      </div>

      <template v-else>
        <div v-if="props.isEdit" :class="CSS_CLASSES.ADD_BLOCK_SEPARATOR">
          <button
            :class="CSS_CLASSES.ADD_BLOCK_BTN"
            title="Добавить блок"
            @click="openBlockTypeSelectionModal(0)"
          >
            <span :class="CSS_CLASSES.ADD_BLOCK_BTN_ICON">+</span>
            <span :class="CSS_CLASSES.ADD_BLOCK_BTN_TEXT">Добавить блок</span>
          </button>
        </div>

        <template v-for="(block, index) in visibleBlocks" :key="block.id">
          <div
            :class="[
              CSS_CLASSES.BLOCK,
              { [CSS_CLASSES.OPACITY_HIDDEN]: props.isEdit && block.visible === false },
            ]"
            :data-block-id="block.id"
            :style="getBlockSpacingStyles(block)"
          >
            <div v-if="props.isEdit" :class="CSS_CLASSES.BLOCK_CONTROLS">
              <div :class="[CSS_CLASSES.BLOCK_CONTROLS_CONTAINER, props.controlsContainerClass]">
                <div :class="CSS_CLASSES.BLOCK_CONTROLS_INNER">
                  <button
                    v-if="props.isEdit"
                    :class="CSS_CLASSES.CONTROL_BTN"
                    title="Редактировать"
                    @click="openEditModal(block)"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    :class="CSS_CLASSES.CONTROL_BTN"
                    title="Переместить вверх"
                    :disabled="index === 0"
                    @click="handleMoveUp(block.id)"
                  >
                    <Icon name="arrowUp" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    :class="CSS_CLASSES.CONTROL_BTN"
                    title="Переместить вниз"
                    :disabled="index === visibleBlocks.length - 1"
                    @click="handleMoveDown(block.id)"
                  >
                    <Icon name="arrowDown" />
                  </button>
                  <button
                    :class="CSS_CLASSES.CONTROL_BTN"
                    title="Копировать ID: {{ block.id }}"
                    @click="handleCopyId(block.id)"
                  >
                    <Icon name="id" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    :class="CSS_CLASSES.CONTROL_BTN"
                    title="Дублировать"
                    @click="handleDuplicateBlock(block.id)"
                  >
                    <Icon name="duplicate" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    :class="CSS_CLASSES.CONTROL_BTN"
                    :title="getBlockVisibilityTooltip(block)"
                    @click="handleToggleVisibility(block.id)"
                  >
                    <Icon :name="block.visible ? 'eye' : 'eyeOff'" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    :class="CSS_CLASSES.CONTROL_BTN"
                    title="Удалить"
                    @click="handleDeleteBlock(block.id)"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </div>
            </div>

            <div :class="CSS_CLASSES.BLOCK_CONTENT">
              <component
                :is="getVueComponent(block)"
                v-if="isVueComponent(block)"
                v-bind="getUserComponentProps(block)"
              />
              <div v-else :class="CSS_CLASSES.BLOCK_CONTENT_FALLBACK">
                <strong>{{ getBlockTitle(block) }}</strong>
                <pre>{{ JSON.stringify(getUserComponentProps(block), null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div v-if="props.isEdit" :class="CSS_CLASSES.ADD_BLOCK_SEPARATOR">
            <button
              :class="CSS_CLASSES.ADD_BLOCK_BTN"
              title="Добавить блок"
              @click="openBlockTypeSelectionModal(index + 1)"
            >
              <span :class="CSS_CLASSES.ADD_BLOCK_BTN_ICON">+</span>
              <span :class="CSS_CLASSES.ADD_BLOCK_BTN_TEXT">Добавить блок</span>
            </button>
          </div>
        </template>
      </template>
    </div>

    <div v-if="showTypeSelectionModal" :class="CSS_CLASSES.MODAL" @mousedown="closeTypeSelectionModal">
      <div :class="CSS_CLASSES.MODAL_CONTENT" @mousedown.stop>
        <div :class="CSS_CLASSES.MODAL_HEADER">
          <h3>Выберите тип блока</h3>
          <button :class="CSS_CLASSES.MODAL_CLOSE" @click="closeTypeSelectionModal">
            <Icon name="close" :width="20" :height="20" />
          </button>
        </div>

        <div :class="CSS_CLASSES.MODAL_BODY">
          <div :class="CSS_CLASSES.BLOCK_TYPE_SELECTION">
            <button
              v-for="blockType in availableBlockTypes"
              :key="blockType.type"
              :class="CSS_CLASSES.BLOCK_TYPE_CARD"
              @click="selectBlockType(blockType.type)"
            >
              <span :class="CSS_CLASSES.BLOCK_TYPE_CARD_ICON">
                <img
                  v-if="getBlockConfig(blockType.type)?.icon"
                  :src="getBlockConfig(blockType.type)?.icon"
                  :alt="blockType.label"
                  :class="CSS_CLASSES.BLOCK_TYPE_CARD_ICON_IMG"
                />
                <span v-else>📦</span>
              </span>
              <span :class="CSS_CLASSES.BLOCK_TYPE_CARD_TITLE">
                {{ blockType.label }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" :class="CSS_CLASSES.MODAL" @mousedown="handleOverlayClick">
      <div :class="CSS_CLASSES.MODAL_CONTENT" @mousedown.stop>
        <div :class="CSS_CLASSES.MODAL_HEADER">
          <h3>
            {{ modalMode === 'create' ? 'Создать' : 'Редактировать' }} {{ currentBlockType?.label }}
          </h3>
          <button :class="CSS_CLASSES.MODAL_CLOSE" @click="closeModal">
            <Icon name="close" :width="20" :height="20" />
          </button>
        </div>

        <div :class="CSS_CLASSES.MODAL_BODY">
          <div v-if="isFormHydrating" class="bb-modal-hydrating">Загрузка…</div>
          <form v-show="!isFormHydrating" :class="CSS_CLASSES.FORM" @submit.prevent="handleSubmit">
            <template v-for="fieldGroup in groupedFields" :key="fieldGroup.key">
              <!-- Группа полей с ToggleControl (checkbox + зависимые поля) -->
              <ToggleControl
                v-if="fieldGroup.type === 'toggle-group'"
                :model-value="formData[fieldGroup.toggleField.field] || false"
                :field-name="fieldGroup.toggleField.field"
                @update:model-value="updateFormField(fieldGroup.toggleField.field, $event)"
              >
                <template #label>{{ fieldGroup.toggleField.label }}</template>
                <template #body>
                  <FormField
                    v-for="dependentField in fieldGroup.dependentFields"
                    :key="dependentField.field"
                    :field="dependentField"
                    :field-id="'field-' + dependentField.field"
                    :model-value="formData[dependentField.field]"
                    :required="isFieldRequired(dependentField)"
                    :error="getFieldError(dependentField)"
                    :container-class="
                      formErrors[dependentField.field]
                        ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                        : CSS_CLASSES.FORM_GROUP
                    "
                    :form-data="formData"
                    @update:model-value="updateFormField(dependentField.field, $event)"
                  >
                    <template
                      #default="{
                        field: slotField,
                        fieldId: slotFieldId,
                        modelValue: slotModelValue,
                        error: slotError,
                      }"
                    >
                      <SpacingControl
                        v-if="slotField.type === 'spacing'"
                        :model-value="slotModelValue"
                        :label="slotField.label"
                        :field-name="slotField.field"
                        :spacing-types="slotField.spacingConfig?.spacingTypes"
                        :min="slotField.spacingConfig?.min"
                        :max="slotField.spacingConfig?.max"
                        :step="slotField.spacingConfig?.step"
                        :breakpoints="getSpacingBreakpoints(slotField)"
                        :required="isFieldRequired(slotField)"
                        :show-preview="true"
                        @update:model-value="updateFormField(slotField.field, $event)"
                      />

                      <RepeaterControl
                        v-else-if="slotField.type === 'repeater'"
                        :ref="createRepeaterRefCallback(slotField.field)"
                        :model-value="slotModelValue"
                        :field-name="slotField.field"
                        :label="slotField.label"
                        :fields="slotField.repeaterConfig?.fields || []"
                        :rules="slotField.rules || []"
                        :errors="formErrors"
                        :add-button-text="slotField.repeaterConfig?.addButtonText"
                        :remove-button-text="slotField.repeaterConfig?.removeButtonText"
                        :item-title="slotField.repeaterConfig?.itemTitle"
                        :count-label-variants="slotField.repeaterConfig?.countLabelVariants"
                        :min="slotField.repeaterConfig?.min"
                        :max="slotField.repeaterConfig?.max"
                        :default-item-value="slotField.repeaterConfig?.defaultItemValue"
                        :max-nesting-depth="slotField.repeaterConfig?.maxNestingDepth ?? 2"
                        :api-select-use-case="props.apiSelectUseCase"
                        :is-api-select-available="isApiSelectAvailable"
                        :get-api-select-restriction-message="getApiSelectRestrictionMessage"
                        :custom-field-renderer-registry="props.customFieldRendererRegistry"
                        :is-custom-field-available="isCustomFieldAvailable"
                        :get-custom-field-restriction-message="getCustomFieldsRestrictionMessage"
                        :block-form-data="formData"
                        :set-block-field="setBlockField"
                        @update:model-value="updateFormField(slotField.field, $event)"
                      />

                      <MatrixTableControl
                        v-else-if="slotField.type === 'matrix-table'"
                        :model-value="slotModelValue"
                        :field-name="slotField.field"
                        :label="slotField.label"
                        :matrix-table-config="slotField.matrixTableConfig"
                        :required="isFieldRequired(slotField)"
                        :error="slotError"
                        @update:model-value="updateFormField(slotField.field, $event)"
                      />

                      <div v-else-if="slotField.type === 'api-select'" :class="CSS_CLASSES.FORM_GROUP">
                        <ApiSelectField
                          v-if="isApiSelectAvailable(slotField) && props.apiSelectUseCase"
                          :model-value="slotModelValue"
                          :config="slotField"
                          :validation-error="slotError"
                          :api-select-use-case="props.apiSelectUseCase"
                          @update:model-value="updateFormField(slotField.field, $event)"
                        />

                        <div v-else :class="CSS_CLASSES.BB_WARNING_BOX">
                          ⚠️ {{ getApiSelectRestrictionMessage() }}
                        </div>
                      </div>

                      <div v-else-if="slotField.type === 'custom'" :class="CSS_CLASSES.FORM_GROUP">
                        <label :for="slotFieldId" :class="CSS_CLASSES.FORM_LABEL">
                          {{ slotField.label }}
                          <span v-if="isFieldRequired(slotField)" :class="CSS_CLASSES.REQUIRED">*</span>
                        </label>
                        <CustomField
                          v-if="
                            isCustomFieldAvailable(slotField) &&
                            props.customFieldRendererRegistry?.get(
                              slotField.customFieldConfig?.rendererId
                            )
                          "
                          :model-value="slotModelValue"
                          :field="slotField"
                          :form-errors="formErrors"
                          :custom-field-renderer-registry="props.customFieldRendererRegistry"
                          :is-field-required="isFieldRequired"
                          :form-scope="topLevelFormScope"
                          @update:model-value="updateFormField(slotField.field, $event)"
                        />
                        <div v-else :class="CSS_CLASSES.BB_WARNING_BOX">
                          ⚠️ {{ getCustomFieldsRestrictionMessage() }}
                        </div>
                      </div>

                      <FileImportField
                        v-else-if="slotField.type === 'file-import' && slotField.fileImportConfig"
                        :label="slotField.label"
                        :error="slotError"
                        :file-import-config="slotField.fileImportConfig"
                        :form-scope="topLevelFormScope"
                      />
                    </template>
                  </FormField>
                </template>
              </ToggleControl>

              <!-- Обычное поле (не входит в toggle-group) -->
              <FormField
                v-else-if="fieldGroup.type === 'single'"
                v-show="isFieldVisible(fieldGroup.field)"
                :field="fieldGroup.field"
                :field-id="'field-' + fieldGroup.field.field"
                :model-value="formData[fieldGroup.field.field]"
                :required="isFieldRequired(fieldGroup.field)"
                :error="getFieldError(fieldGroup.field)"
                :container-class="
                  formErrors[fieldGroup.field.field]
                    ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                    : CSS_CLASSES.FORM_GROUP
                "
                :form-data="formData"
                @update:model-value="updateFormField(fieldGroup.field.field, $event)"
              >
                <!-- Специальные поля, которые не обрабатываются FormField -->
                <template
                  #default="{
                    field: slotField,
                    fieldId: slotFieldId,
                    modelValue: slotModelValue,
                    error: slotError,
                  }"
                >
                  <SpacingControl
                    v-if="slotField.type === 'spacing'"
                    :model-value="slotModelValue"
                    :label="slotField.label"
                    :field-name="slotField.field"
                    :spacing-types="slotField.spacingConfig?.spacingTypes"
                    :min="slotField.spacingConfig?.min"
                    :max="slotField.spacingConfig?.max"
                    :step="slotField.spacingConfig?.step"
                    :breakpoints="getSpacingBreakpoints(slotField)"
                    :required="isFieldRequired(slotField)"
                    :show-preview="true"
                    @update:model-value="updateFormField(slotField.field, $event)"
                  />

                  <!-- eslint-disable-next-line vue/valid-v-bind -->
                  <RepeaterControl
                    v-else-if="slotField.type === 'repeater'"
                    :ref="createRepeaterRefCallback(slotField.field)"
                    :model-value="slotModelValue"
                    :field-name="slotField.field"
                    :label="slotField.label"
                    :fields="slotField.repeaterConfig?.fields || []"
                    :rules="slotField.rules || []"
                    :errors="formErrors"
                    :add-button-text="slotField.repeaterConfig?.addButtonText"
                    :remove-button-text="slotField.repeaterConfig?.removeButtonText"
                    :item-title="slotField.repeaterConfig?.itemTitle"
                    :count-label-variants="slotField.repeaterConfig?.countLabelVariants"
                    :min="slotField.repeaterConfig?.min"
                    :max="slotField.repeaterConfig?.max"
                    :default-item-value="slotField.repeaterConfig?.defaultItemValue"
                    :max-nesting-depth="slotField.repeaterConfig?.maxNestingDepth ?? 2"
                    :api-select-use-case="props.apiSelectUseCase"
                    :is-api-select-available="isApiSelectAvailable"
                    :get-api-select-restriction-message="getApiSelectRestrictionMessage"
                    :custom-field-renderer-registry="props.customFieldRendererRegistry"
                    :is-custom-field-available="isCustomFieldAvailable"
                    :get-custom-field-restriction-message="getCustomFieldsRestrictionMessage"
                    :block-form-data="formData"
                    :set-block-field="setBlockField"
                    @update:model-value="updateFormField(slotField.field, $event)"
                  />

                  <MatrixTableControl
                    v-else-if="slotField.type === 'matrix-table'"
                    :model-value="slotModelValue"
                    :field-name="slotField.field"
                    :label="slotField.label"
                    :matrix-table-config="slotField.matrixTableConfig"
                    :required="isFieldRequired(slotField)"
                    :error="slotError"
                    @update:model-value="updateFormField(slotField.field, $event)"
                  />

                  <div v-else-if="slotField.type === 'api-select'" :class="CSS_CLASSES.FORM_GROUP">
                    <ApiSelectField
                      v-if="isApiSelectAvailable(slotField) && props.apiSelectUseCase"
                      :model-value="slotModelValue"
                      :config="slotField"
                      :validation-error="slotError"
                      :api-select-use-case="props.apiSelectUseCase"
                      @update:model-value="updateFormField(slotField.field, $event)"
                    />

                    <div v-else :class="CSS_CLASSES.BB_WARNING_BOX">
                      ⚠️ {{ getApiSelectRestrictionMessage() }}
                    </div>
                  </div>

                  <div v-else-if="slotField.type === 'custom'" :class="CSS_CLASSES.FORM_GROUP">
                    <label :for="slotFieldId" :class="CSS_CLASSES.FORM_LABEL">
                      {{ slotField.label }}
                      <span v-if="isFieldRequired(slotField)" :class="CSS_CLASSES.REQUIRED">*</span>
                    </label>
                    <CustomField
                      v-if="
                        isCustomFieldAvailable(slotField) &&
                        props.customFieldRendererRegistry?.get(
                          slotField.customFieldConfig?.rendererId
                        )
                      "
                      :model-value="slotModelValue"
                      :field="slotField"
                      :form-errors="formErrors"
                      :custom-field-renderer-registry="props.customFieldRendererRegistry"
                      :is-field-required="isFieldRequired"
                      :form-scope="topLevelFormScope"
                      @update:model-value="updateFormField(slotField.field, $event)"
                    />
                    <div v-else :class="CSS_CLASSES.BB_WARNING_BOX">
                      ⚠️ {{ getCustomFieldsRestrictionMessage() }}
                    </div>
                  </div>

                  <FileImportField
                    v-else-if="slotField.type === 'file-import' && slotField.fileImportConfig"
                    :label="slotField.label"
                    :error="slotError"
                    :file-import-config="slotField.fileImportConfig"
                    :form-scope="topLevelFormScope"
                  />
                </template>
              </FormField>
            </template>
          </form>
        </div>

        <div :class="CSS_CLASSES.MODAL_FOOTER">
          <button
            type="button"
            :class="[CSS_CLASSES.BTN, CSS_CLASSES.BTN_SECONDARY]"
            @click="closeModal"
          >
            Отмена
          </button>
          <button
            type="submit"
            :class="[CSS_CLASSES.BTN, CSS_CLASSES.BTN_PRIMARY]"
            :disabled="isFormHydrating"
            @click="handleSubmit"
          >
            {{ modalMode === 'create' ? 'Создать' : 'Сохранить' }}
          </button>
          <button
            v-if="validationErrorCount > 0"
            type="button"
            :class="CSS_CLASSES.VALIDATION_ERROR_INDICATOR"
            :aria-label="`Ошибки валидации: ${validationErrorCount}`"
            @click="navigateToValidationError"
          >
            {{ validationErrorCount }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';

import { IBlock, TBlockId } from '../../core/types';
import type { IBlockFormHooks, IBlockTypeConfig } from '../../core/types/formHooks';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import {
  canRenderVueBlock,
  prepareBlocksForDisplay,
  resolveVueComponentForBlock,
} from '../../utils/blockDisplayHelpers';
import { seedRepositoryFromBlocks } from '../../utils/blockRepositorySync';
import { filterBlocksForDisplay } from '../../utils/blockHelpers';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import { enableViewportBreakpointDetection, isClient } from '../../utils/ssr';
import {
  CSS_CLASSES,
  ERROR_MESSAGES,
  getControlsFixedClass,
} from '../../utils/constants';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { countValidationErrors } from '../../utils/formErrorHelpers';
import { createCustomFieldFormScope } from '../../utils/formScopeHelpers';
import { stripNonPersistedFields } from '../../utils/stripNonPersistedFields';
import { pruneOptionsFromDependents } from '../../utils/pruneOptionsFromDependents';
import { resolveFormFieldDefaultValue } from '../../utils/formFieldDefaults';
import {
  applyFormErrors,
  ReactiveFormValidationTracker,
} from '../../utils/reactiveFormValidation';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock';
import { getBlockScrollMargins } from '../../utils/scrollHelpers';
import { ISpacingData } from '../../utils/spacingHelpers';
import { UniversalValidator } from '../../utils/universalValidation';
import Icon from '../../shared/icons/Icon.vue';
import { deleteIconHTML, saveIconHTML } from '../../shared/icons/iconHelpers';
import { initIcons } from '../../shared/icons/index';
import { notificationService } from '../../shared/services/NotificationService';
import { blockScrollService } from '../../shared/services/BlockScrollService';
import { ValidationErrorHandler } from '../../shared/services/ValidationErrorHandler';
import { updateBodyEditModeClass } from '../../shared/dom/domClassHelpers';
import ApiSelectField from './ApiSelectField.vue';
import CustomField from './CustomField.vue';
import FileImportField from './FileImportField.vue';
import { FormField } from './form-fields';
import RepeaterControl from './RepeaterControl.vue';
import SpacingControl from './SpacingControl.vue';
import MatrixTableControl from './MatrixTableControl.vue';
import ToggleControl from './ToggleControl.vue';
import { usePageLeaveWarning } from '../composables/usePageLeaveWarning';
import { BLOCK_ANCHOR_CONTEXT_KEY } from '../composables/blockAnchorContext';

interface IBlockType extends IBlockTypeConfig {
  type: string;
  label: string;
  /** formHooks — только Vue/React BlockBuilder; Pure JS не поддерживает */
}

interface IProps {
  config?: {
    availableBlockTypes?: IBlockType[];
  };
  blockManagementUseCase: BlockManagementUseCase;
  apiSelectUseCase?: ApiSelectUseCase;
  customFieldRendererRegistry?: import('../../core/ports/CustomFieldRenderer').ICustomFieldRendererRegistry;
  onSave?: (blocks: IBlock[]) => Promise<boolean> | boolean;
  initialBlocks?: IBlock[];
  controlsContainerClass?: string; // Кастомный CSS класс для контейнера контролов
  controlsFixedPosition?: 'top' | 'bottom'; // Фиксированная позиция для контролов (сверху или снизу)
  controlsOffset?: number; // Отступ от края в пикселях
  controlsOffsetVar?: string; // CSS переменная для учета высоты шапки/футера
  isEdit?: boolean; // Режим редактирования (по умолчанию true)
  warnOnPageLeave?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  config: () => ({ availableBlockTypes: [] }),
  isEdit: true, // По умолчанию режим редактирования включен
});

const emit = defineEmits<{
  'block-added': [block: IBlock];
  'block-updated': [block: IBlock];
  'block-deleted': [blockId: TBlockId];
}>() as any;

const blockService = props.blockManagementUseCase;
const componentRegistry = blockService.getComponentRegistry();

const getBlockTypeConfig = (type: string) => {
  return (props.config?.availableBlockTypes || []).find((bt: IBlockType) => bt.type === type);
};

const blocks = ref<IBlock[]>(prepareBlocksForDisplay(props.initialBlocks, getBlockTypeConfig));
/** Пересчёт spacing после гидрации (см. enableViewportBreakpointDetection). */
const spacingLayoutEpoch = ref(0);
const showModal = ref(false);
const showTypeSelectionModal = ref(false);
const isAnyModalOpen = computed(() => showModal.value || showTypeSelectionModal.value);
const modalMode = ref<'create' | 'edit'>('create');
const currentType = ref<string | null>(null);
const currentBlockId = ref<TBlockId | null>(null);
const selectedPosition = ref<number | undefined>(undefined);
const formData = reactive<Record<string, any>>({});
const formErrors = reactive<Record<string, string[]>>({});
const isFormHydrating = ref(false);
const validationTracker = new ReactiveFormValidationTracker();
const repeaterRefs = new Map<string, any>();
const validationErrorHandler = new ValidationErrorHandler(repeaterRefs);
const originalInitialBlocks = ref(
  props.initialBlocks ? prepareBlocksForDisplay(props.initialBlocks, getBlockTypeConfig) : []
);

const { markAsSaved: markBlocksAsSaved } = usePageLeaveWarning({
  enabled: computed(() => props.warnOnPageLeave),
  isEdit: computed(() => props.isEdit),
  baselineBlocks: originalInitialBlocks,
  currentBlocks: blocks,
});

watch(
  () => props.initialBlocks,
  nextInitialBlocks => {
    if (!nextInitialBlocks?.length) {
      return;
    }

    const prepared = prepareBlocksForDisplay(nextInitialBlocks, getBlockTypeConfig);
    blocks.value = prepared;
    originalInitialBlocks.value = [...prepared];
  }
);

const setRepeaterRef = (fieldName: string, el: any): void => {
  if (el) {
    repeaterRefs.set(fieldName, el);
  } else {
    repeaterRefs.delete(fieldName);
  }
};

const createRepeaterRefCallback = (fieldName: string) => {
  return (el: any) => setRepeaterRef(fieldName, el);
};

const availableBlockTypes = computed(() => props.config?.availableBlockTypes || []);

const currentBlockType = computed(() => {
  if (!currentType.value) {
    return null;
  }
  return availableBlockTypes.value.find((bt: IBlockType) => bt.type === currentType.value) || null;
});

const controlsFixedClass = computed(() => {
  if (!props.controlsFixedPosition) {
    return '';
  }
  return getControlsFixedClass(props.controlsFixedPosition);
});

const controlsInlineStyles = computed(() => {
  if (!props.controlsFixedPosition) {
    return {};
  }

  const offset = props.controlsOffset || 0;
  const offsetVar = props.controlsOffsetVar;

  if (props.controlsFixedPosition === 'top') {
    return offsetVar ? { top: `calc(var(${offsetVar}) + ${offset}px)` } : { top: `${offset}px` };
  } else if (props.controlsFixedPosition === 'bottom') {
    return offsetVar
      ? { bottom: `calc(var(${offsetVar}) + ${offset}px)` }
      : { bottom: `${offset}px` };
  }

  return {};
});

const appClass = computed(() => {
  return {
    [CSS_CLASSES.APP]: true,
    [CSS_CLASSES.BLOCK_BUILDER_ROOT]: true,
    [CSS_CLASSES.HAS_FIXED_CONTROLS]: !!props.controlsFixedPosition,
    [CSS_CLASSES.HAS_TOP_CONTROLS]: props.controlsFixedPosition === 'top',
    [CSS_CLASSES.HAS_BOTTOM_CONTROLS]: props.controlsFixedPosition === 'bottom',
  };
});

const currentBlockFields = computed(() => {
  if (!currentBlockType.value) {
    return [];
  }
  const blockType = currentBlockType.value;
  return addSpacingFieldToFields(
    blockType.fields || [],
    (blockType as any).spacingOptions
  );
});

/**
 * Группирует поля для автоматического использования ToggleControl.
 * Если поле типа checkbox имеет зависимые поля (через dependsOn), создает toggle-group.
 */
const groupedFields = computed(() => {
  const fields = currentBlockFields.value;
  const groups: Array<{
    type: 'toggle-group' | 'single';
    key: string;
    toggleField?: any;
    dependentFields?: any[];
    field?: any;
  }> = [];
  const processedFields = new Set<string>();

  // Находим checkbox поля, которые имеют зависимые поля
  for (const field of fields) {
    if (processedFields.has(field.field)) {
      continue;
    }

    // Если это checkbox поле, проверяем, есть ли поля, зависящие от него
    if (field.type === 'checkbox') {
      const dependentFields = fields.filter(
        f =>
          f.dependsOn?.field === field.field &&
          f.dependsOn?.value === true &&
          f.dependsOn?.operator !== 'notEquals' &&
          !processedFields.has(f.field)
      );

      if (dependentFields.length > 0) {
        // Создаем toggle-group
        groups.push({
          type: 'toggle-group',
          key: `toggle-${field.field}`,
          toggleField: field,
          dependentFields: dependentFields,
        });
        processedFields.add(field.field);
        dependentFields.forEach(f => processedFields.add(f.field));
        continue;
      }
    }

    // Обычное поле
    if (!processedFields.has(field.field)) {
      groups.push({
        type: 'single',
        key: `field-${field.field}`,
        field: field,
      });
      processedFields.add(field.field);
    }
  }

  return groups;
});

const visibleBlocks = computed(() => filterBlocksForDisplay(blocks.value, props.isEdit));

const blockTypeLabels = computed(() => {
  const labels: Record<string, string> = {};
  (props.config?.availableBlockTypes || []).forEach(blockType => {
    labels[blockType.type] = blockType.label || blockType.title || blockType.type;
  });
  return labels;
});

const blockAnchorContext = computed(() => ({
  blocks: blocks.value.map(block => ({
    id: block.id,
    type: block.type,
    props: block.props,
    settings: block.settings,
    visible: block.visible,
  })),
  editingBlockId: currentBlockId.value,
  blockTypeLabels: blockTypeLabels.value,
}));

provide(BLOCK_ANCHOR_CONTEXT_KEY, blockAnchorContext);

const getBlockTitle = (block: IBlock): string => {
  return getBlockConfig(block.type)?.title || block.type;
};

const getBlockVisibilityTooltip = (block: IBlock): string => {
  return block.visible ? 'Скрыть' : 'Показать';
};

const getApiSelectRestrictionMessage = (): string => {
  return 'Передайте apiSelectUseCase для использования API Select полей.';
};

const getCustomFieldsRestrictionMessage = (): string => {
  return 'Зарегистрируйте customFieldRendererRegistry для использования кастомных полей.';
};

const isApiSelectAvailable = (_field: any): boolean => {
  return !!props.apiSelectUseCase;
};

const isCustomFieldAvailable = (_field: any): boolean => {
  return !!props.customFieldRendererRegistry;
};

const getSpacingBreakpoints = (field: any): any[] | undefined => {
  let breakpoints = field.spacingConfig?.breakpoints;
  if ((!breakpoints || breakpoints.length === 0) && currentBlockType.value) {
    const blockConfig = currentBlockType.value as any;
    breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;
  }
  if (!breakpoints || !Array.isArray(breakpoints) || breakpoints.length === 0) {
    return undefined;
  }
  return breakpoints;
};

const getFieldError = (field: any): string => {
  const errors = formErrors[field.field];
  if (!errors || errors.length === 0) {
    return '';
  }
  return errors[0] || '';
};

const revalidateIfTouched = (): void => {
  const nextErrors = validationTracker.revalidateIfTouched(
    formData,
    currentBlockFields.value,
    isFieldVisible
  );

  if (nextErrors) {
    applyFormErrors(formErrors, nextErrors);
  }
};

const updateFormField = (fieldName: string, value: unknown): void => {
  formData[fieldName] = value;
  if (currentBlockFields.value.length > 0) {
    pruneOptionsFromDependents(formData, currentBlockFields.value, fieldName);
  }
  revalidateIfTouched();
};

const setBlockField = (name: string, value: unknown): void => {
  formData[name] = value;
  if (currentBlockFields.value.length > 0) {
    pruneOptionsFromDependents(formData, currentBlockFields.value, name);
  }
  revalidateIfTouched();
};

const topLevelFormScope = computed(() => createCustomFieldFormScope(formData, setBlockField));

const isFieldRequired = (field: any): boolean => {
  return field.rules?.some((rule: any) => rule.type === 'required') ?? false;
};

/**
 * Проверяет, должно ли поле быть видимым на основе dependsOn условия
 */
const isFieldVisible = (
  field: any,
  itemData?: any
): boolean => {
  if (!field.dependsOn) {
    return true; // Поле всегда видимо, если нет зависимости
  }

  const dependsOn = field.dependsOn;
  // Для полей внутри репитера используем itemData, иначе formData
  const dataSource = itemData || formData;
  const dependentValue = dataSource[dependsOn.field];

  // По умолчанию используем оператор 'equals'
  const operator = dependsOn.operator || 'equals';

  switch (operator) {
    case 'equals':
      return dependentValue === dependsOn.value;
    case 'notEquals':
      return dependentValue !== dependsOn.value;
    case 'in':
      return Array.isArray(dependsOn.value) && dependsOn.value.includes(dependentValue);
    case 'notIn':
      return Array.isArray(dependsOn.value) && !dependsOn.value.includes(dependentValue);
    default:
      return dependentValue === dependsOn.value;
  }
};

const loadBlocks = async () => {
  try {
    blocks.value = prepareBlocksForDisplay(
      (await blockService.getAllBlocks()) as IBlock[],
      getBlockTypeConfig
    );
  } catch (error) {
    alert(`Ошибка загрузки блоков: ${error}`);
  }
};

const scrollToBlock = async (blockId: TBlockId, behavior: ScrollBehavior = 'smooth') => {
  await nextTick();
  const session = blockScrollService.beginSession();
  await blockScrollService.scrollToBlockWhenReady(
    blockId,
    {
      ...getBlockScrollMargins({ controlsFixedPosition: props.controlsFixedPosition }),
      behavior,
    },
    session
  );
};

const syncBlocksWithRepository = async () => {
  try {
    await seedRepositoryFromBlocks(blockService, blocks.value, getBlockTypeConfig);

    if (blocks.value.length === 0) {
      const repositoryBlocks = await blockService.getAllBlocks();
      if (repositoryBlocks.length > 0) {
        blocks.value = prepareBlocksForDisplay(repositoryBlocks as IBlock[], getBlockTypeConfig);
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
};

const isVueComponent = (block: IBlock) => {
  return canRenderVueBlock(block, componentRegistry);
};

const getVueComponent = (block: IBlock) => {
  return resolveVueComponentForBlock(block, componentRegistry);
};

const openBlockTypeSelectionModal = (position?: number) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  selectedPosition.value = position;
  showTypeSelectionModal.value = true;
};

const closeTypeSelectionModal = () => {
  showTypeSelectionModal.value = false;
  selectedPosition.value = undefined;
};

const selectBlockType = (type: string) => {
  const position = selectedPosition.value;
  closeTypeSelectionModal();
  void openCreateModal(type, position);
};

const getCurrentFormHooks = (): IBlockFormHooks | undefined => currentBlockType.value?.formHooks;

const buildFormOpenContext = (mode: 'create' | 'edit', blockProps: Record<string, unknown>) => ({
  mode,
  blockId: currentBlockId.value ?? undefined,
  props: blockProps,
  formData,
  setField: (name: string, value: unknown) => {
    formData[name] = value;
  },
});

const runFormOpenHook = async (mode: 'create' | 'edit', blockProps: Record<string, unknown>) => {
  const hooks = getCurrentFormHooks();
  if (!hooks?.onFormOpen) {
    return;
  }

  isFormHydrating.value = true;
  try {
    await hooks.onFormOpen(buildFormOpenContext(mode, blockProps));
  } catch (error) {
    alert(
      `Ошибка загрузки формы: ${error instanceof Error ? error.message : String(error)}`
    );
    closeModal();
  } finally {
    isFormHydrating.value = false;
  }
};

const resolvePropsToSave = async (): Promise<Record<string, unknown> | null> => {
  const hooks = getCurrentFormHooks();
  const fields = currentBlockFields.value;

  if (!hooks?.onBeforeSave) {
    return stripNonPersistedFields({ ...formData }, fields);
  }

  try {
    const result = await hooks.onBeforeSave({
      mode: modalMode.value,
      blockId: currentBlockId.value ?? undefined,
      formData: { ...formData },
    });

    if (result?.cancel) {
      return null;
    }

    return stripNonPersistedFields(result?.props ?? { ...formData }, fields);
  } catch (error) {
    alert(
      `Ошибка сохранения: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
};

const openCreateModal = async (type: string, position?: number) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  modalMode.value = 'create';
  currentType.value = type;
  currentBlockId.value = null;
  selectedPosition.value = position;

  Object.keys(formData).forEach(key => delete formData[key]);
  currentBlockFields.value.forEach((field: any) => {
    formData[field.field] = resolveFormFieldDefaultValue(field);
  });

  showModal.value = true;

  if (getCurrentFormHooks()?.onFormOpen) {
    await runFormOpenHook('create', {});
  }
};

const openEditModal = async (block: IBlock) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  modalMode.value = 'edit';
  currentType.value = block.type;
  currentBlockId.value = block.id;

  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, { ...block.props });

  showModal.value = true;

  if (getCurrentFormHooks()?.onFormOpen) {
    await runFormOpenHook('edit', { ...block.props });
  }
};

const handleOverlayClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (target.classList.contains(CSS_CLASSES.MODAL)) {
    closeModal();
  }
};

const closeModal = () => {
  showModal.value = false;
  isFormHydrating.value = false;
  currentType.value = null;
  currentBlockId.value = null;
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  validationTracker.reset();
  repeaterRefs.clear();
};

const handleSubmit = async () => {
  let success = false;

  success = await (modalMode.value === 'create' ? createBlock() : updateBlock());

  if (success) {
    closeModal();
  }
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
  const validation = UniversalValidator.validateForm(formData, fields, isFieldVisible);

  if (!validation.isValid) {
    validationTracker.touch();
    applyFormErrors(formErrors, validation.errors);

    await nextTick();
    await handleValidationErrors();

    return false;
  }

  const propsToSave = await resolvePropsToSave();
  if (!propsToSave) {
    return false;
  }

  try {
    const newBlock = await blockService.createBlock({
      type: currentType.value,
      props: propsToSave,
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

    await loadBlocks();

    await setupBreakpointWatchers();

    await scrollToBlock(newBlock.id, 'smooth');

    (emit as any)('block-added', newBlock as any);
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
  const validation = UniversalValidator.validateForm(formData, fields, isFieldVisible);

  if (!validation.isValid) {
    validationTracker.touch();
    applyFormErrors(formErrors, validation.errors);

    await nextTick();
    await handleValidationErrors();

    return false;
  }

  const propsToSave = await resolvePropsToSave();
  if (!propsToSave) {
    return false;
  }

  try {
    const updated = await blockService.updateBlock(currentBlockId.value, {
      props: propsToSave,
    } as any);

    const index = blocks.value.findIndex((b: IBlock) => b.id === currentBlockId.value);
    if (index !== -1) {
      blocks.value[index] = updated as any;
    }

    await setupBreakpointWatchers();

    (emit as any)('block-updated', updated as any);
    return true;
  } catch (error) {
    alert('Ошибка обновления блока: ' + (error as Error).message);
    return false;
  }
};

const handleDuplicateBlock = async (id: TBlockId) => {
  if (!props.isEdit) {
    return;
  }
  try {
    const duplicated = await blockService.duplicateBlock(id);
    blocks.value.push(duplicated as any);

    await setupBreakpointWatchers();

    await scrollToBlock(duplicated.id, 'smooth');

    (emit as any)('block-added', duplicated as any);
  } catch (error) {
    alert(
      'Ошибка дублирования блока: ' +
        (error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR)
    );
  }
};

const handleDeleteBlock = async (id: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  if (confirm('Удалить блок?')) {
    try {
      const unsubscribe = breakpointUnsubscribers.get(id);
      if (unsubscribe) {
        unsubscribe();
        breakpointUnsubscribers.delete(id);
      }

      await blockService.deleteBlock(id);
      blocks.value = blocks.value.filter((b: IBlock) => b.id !== id);
      (emit as any)('block-deleted', id);
    } catch (error) {
      alert(
        'Ошибка удаления блока: ' +
          (error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR)
      );
    }
  }
};

const handleMoveUp = async (id: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  const index = blocks.value.findIndex((b: IBlock) => b.id === id);
  if (index > 0) {
    const newBlocks = [...blocks.value];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;

    const blockIds = newBlocks.map((b: IBlock) => b.id);

    await blockService.reorderBlocks(blockIds);

    await loadBlocks();
    await setupBreakpointWatchers();
    await scrollToBlock(id, 'auto');
  }
};

const handleMoveDown = async (id: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  const index = blocks.value.findIndex((b: IBlock) => b.id === id);
  if (index < blocks.value.length - 1) {
    const newBlocks = [...blocks.value];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;

    const blockIds = newBlocks.map((b: IBlock) => b.id);

    await blockService.reorderBlocks(blockIds);

    await loadBlocks();
    await setupBreakpointWatchers();
    await scrollToBlock(id, 'auto');
  }
};

const handleToggleVisibility = async (blockId: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  const block = blocks.value.find((b: IBlock) => b.id === blockId);
  if (!block) {
    return;
  }

  await blockService.setBlockVisible(blockId, !block.visible);
  await loadBlocks();
  await setupBreakpointWatchers();
};

const getBlockConfig = getBlockTypeConfig;

const handleCopyId = async (blockId: TBlockId) => {
  try {
    const success = await copyToClipboard(blockId as string);
    if (success !== false) {
      notificationService.success(`ID скопирован: ${blockId}`);
    }
  } catch {
    notificationService.error('Ошибка копирования ID');
  }
};

const handleSave = async () => {
  if (!props.onSave) {
    notificationService.error(
      'Функция сохранения не настроена. Передайте onSave в пропсы компонента.'
    );
    return;
  }

  try {
    const result = await Promise.resolve(props.onSave(blocks.value));

    if (result === true) {
      markBlocksAsSaved();
      notificationService.success('Данные успешно сохранены');
    } else {
      notificationService.error('Произошла ошибка при сохранении');
    }
  } catch {
    notificationService.error('Произошла ошибка при сохранении');
  }
};

const handleClearAll = async () => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  if (confirm('Удалить все блоки?')) {
    try {
      await blockService.clearAllBlocks();
      blocks.value = [];
    } catch (error) {
      alert(
        `Ошибка очистки блоков: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
      );
    }
  }
};

const getBlockSpacingStyles = (block: IBlock): Record<string, string> => {
  void spacingLayoutEpoch.value;

  const spacing = block.props?.spacing as ISpacingData | undefined;

  if (!spacing || Object.keys(spacing).length === 0) {
    return {};
  }

  const blockConfig = getBlockConfig(block.type) as any;
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

const breakpointUnsubscribers = new Map<TBlockId, () => void>();

const setupBreakpointWatchers = async () => {
  await nextTick();

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
    const blockConfig = getBlockConfig(block.type) as any;
    const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;
    const unsubscribe = watchBreakpointChanges(element, spacing, 'spacing', breakpoints);
    breakpointUnsubscribers.set(block.id, unsubscribe);
  });
};

const cleanupBreakpointWatchers = () => {
  breakpointUnsubscribers.forEach(unsubscribe => unsubscribe());
  breakpointUnsubscribers.clear();
};

const handleValidationErrors = async () => {
  await validationErrorHandler.handleValidationErrors(formErrors, 350);
};

const validationErrorCount = computed(() => countValidationErrors(formErrors));

const navigateToValidationError = async () => {
  await validationErrorHandler.navigateToValidationError(formErrors);
};

watch(
  () => props.isEdit,
  (newValue: boolean | undefined) => {
    if (isClient()) {
      updateBodyEditModeClass(newValue);
    }
  }
);

watch(isAnyModalOpen, (isOpen: boolean) => {
  if (!isClient()) {
    return;
  }

  if (isOpen) {
    lockBodyScroll();
  } else {
    unlockBodyScroll();
  }
});

onMounted(async () => {
  if (isClient()) {
    initIcons();
    updateBodyEditModeClass(props.isEdit);
  }

  await syncBlocksWithRepository();

  if (isClient()) {
    enableViewportBreakpointDetection();
    spacingLayoutEpoch.value += 1;
    await setupBreakpointWatchers();
  }
});

onBeforeUnmount(() => {
  validationErrorHandler.cancelPending();
  cleanupBreakpointWatchers();
  updateBodyEditModeClass(false);
  unlockBodyScroll();
});
</script>
