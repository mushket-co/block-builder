<template>
  <div :class="appClass">
    <div v-if="!licenseInfoComputed.isPro" class="bb-license-banner">
      <div class="bb-license-banner__content">
        <span class="bb-license-banner__icon">⚠️</span>
        <span class="bb-license-banner__text">
          Вы используете бесплатную версию
          <a
            href="https://block-builder.ru/"
            target="_blank"
            rel="noopener noreferrer"
            class="bb-link-inherit"
            >Block Builder</a
          >. Доступно {{ limitedBlockTypes.length }} из
          {{ licenseInfoComputed.maxBlockTypes }} типов блоков.
        </span>
      </div>
    </div>

    <div
      v-if="props.isEdit"
      :class="['bb-controls', controlsFixedClass]"
      :style="controlsInlineStyles"
    >
      <div :class="['bb-controls-container', props.controlsContainerClass].filter(Boolean)">
        <div class="bb-controls-inner">
          <button v-if="props.isEdit" class="bb-btn bb-btn--success" @click="handleSave">
            <span class="bb-icon-wrapper" v-html="saveIconHTML" /> Сохранить
          </button>
          <button v-if="props.isEdit" class="bb-btn bb-btn--danger" @click="handleClearAll">
            <span class="bb-icon-wrapper" v-html="deleteIconHTML" /> Очистить все
          </button>

          <div class="bb-stats">
            <p>
              Всего блоков: <span>{{ props.isEdit ? blocks.length : visibleBlocks.length }}</span>
            </p>
          </div>

          <div
            v-if="licenseInfoComputed"
            :class="[
              'bb-license-badge',
              licenseInfoComputed.isPro ? 'bb-license-badge--pro' : 'bb-license-badge--free',
            ]"
            :title="
              licenseInfoComputed.isPro
                ? 'PRO лицензия - Без ограничений'
                : `FREE лицензия - Ограничено ${licenseInfoComputed.maxBlockTypes} типами блоков`
            "
          >
            <span class="bb-license-badge__icon">
              {{ licenseInfoComputed.isPro ? '✓' : 'ℹ' }}
            </span>
            <span class="bb-license-badge__text">
              {{ licenseInfoComputed.isPro ? 'PRO' : 'FREE' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="bb-blocks">
      <div v-if="visibleBlocks.length === 0" class="bb-empty-state">
        <div v-if="props.isEdit" class="bb-add-block-separator">
          <button
            class="bb-add-block-btn"
            title="Добавить блок"
            @click="openBlockTypeSelectionModal(0)"
          >
            <span class="bb-add-block-btn__icon">+</span>
            <span class="bb-add-block-btn__text">Добавить блок</span>
          </button>
        </div>
      </div>

      <template v-else>
        <div v-if="props.isEdit" class="bb-add-block-separator">
          <button
            class="bb-add-block-btn"
            title="Добавить блок"
            @click="openBlockTypeSelectionModal(0)"
          >
            <span class="bb-add-block-btn__icon">+</span>
            <span class="bb-add-block-btn__text">Добавить блок</span>
          </button>
        </div>

        <template v-for="(block, index) in visibleBlocks" :key="block.id">
          <div
            class="bb-block"
            :class="{ [CSS_CLASSES.HIDDEN]: !block.visible }"
            :data-block-id="block.id"
            :style="getBlockSpacingStyles(block)"
          >
            <div v-if="props.isEdit" class="bb-block-controls">
              <div class="bb-block-controls-container" :class="props.controlsContainerClass">
                <div class="bb-block-controls-inner">
                  <button
                    class="bb-control-btn"
                    title="Копировать ID: {{ block.id }}"
                    @click="handleCopyId(block.id)"
                  >
                    <Icon name="copy" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    class="bb-control-btn"
                    title="Переместить вверх"
                    :disabled="index === 0"
                    @click="handleMoveUp(block.id)"
                  >
                    <Icon name="arrowUp" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    class="bb-control-btn"
                    title="Переместить вниз"
                    :disabled="index === visibleBlocks.length - 1"
                    @click="handleMoveDown(block.id)"
                  >
                    <Icon name="arrowDown" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    class="bb-control-btn"
                    title="Редактировать"
                    @click="openEditModal(block)"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    class="bb-control-btn"
                    title="Дублировать"
                    @click="handleDuplicateBlock(block.id)"
                  >
                    <Icon name="duplicate" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    class="bb-control-btn"
                    :title="getBlockVisibilityTooltip(block)"
                    @click="handleToggleVisibility(block.id)"
                  >
                    <Icon :name="block.visible ? 'eye' : 'eyeOff'" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    class="bb-control-btn"
                    title="Удалить"
                    @click="handleDeleteBlock(block.id)"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </div>
            </div>

            <div class="bb-block-content">
              <component
                :is="getVueComponent(block)"
                v-if="isVueComponent(block)"
                v-bind="getUserComponentProps(block)"
              />
              <div v-else class="bb-block-content-fallback">
                <strong>{{ getBlockTitle(block) }}</strong>
                <pre>{{ JSON.stringify(getUserComponentProps(block), null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div v-if="props.isEdit" class="bb-add-block-separator">
            <button
              class="bb-add-block-btn"
              title="Добавить блок"
              @click="openBlockTypeSelectionModal(index + 1)"
            >
              <span class="bb-add-block-btn__icon">+</span>
              <span class="bb-add-block-btn__text">Добавить блок</span>
            </button>
          </div>
        </template>
      </template>
    </div>

    <div v-if="showTypeSelectionModal" class="bb-modal" @mousedown="closeTypeSelectionModal">
      <div class="bb-modal-content" @mousedown.stop>
        <div class="bb-modal-header">
          <h3>Выберите тип блока</h3>
          <button class="bb-modal-close" @click="closeTypeSelectionModal">×</button>
        </div>

        <div class="bb-modal-body">
          <div v-if="!licenseInfoComputed.isPro" class="bb-license-warning">
            <div class="bb-license-warning__header">
              <span class="bb-license-warning__icon">⚠️</span>
              <strong class="bb-license-warning__title"
                >Бесплатная версия
                <a
                  href="https://block-builder.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bb-link-inherit"
                  >Block Builder</a
                ></strong
              >
            </div>
            <p class="bb-license-warning__text">
              Вы используете ограниченную бесплатную версию.<br />
              Доступно
              <strong
                >{{ limitedBlockTypes.length }} из {{ licenseInfoComputed.maxBlockTypes }}</strong
              >
              типов блоков.
            </p>
          </div>

          <div class="bb-block-type-selection">
            <button
              v-for="blockType in limitedBlockTypes"
              :key="blockType.type"
              class="bb-block-type-card"
              @click="selectBlockType(blockType.type)"
            >
              <span class="bb-block-type-card__icon">
                <img
                  v-if="getBlockConfig(blockType.type)?.icon"
                  :src="getBlockConfig(blockType.type)?.icon"
                  :alt="blockType.label"
                  class="bb-block-type-card__icon-img"
                />
                <span v-else>📦</span>
              </span>
              <span class="bb-block-type-card__title">
                {{ blockType.label }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="bb-modal" @mousedown="handleOverlayClick">
      <div class="bb-modal-content" @mousedown.stop>
        <div class="bb-modal-header">
          <h3>
            {{ modalMode === 'create' ? 'Создать' : 'Редактировать' }} {{ currentBlockType?.label }}
          </h3>
          <button class="bb-modal-close" @click="closeModal">×</button>
        </div>

        <div class="bb-modal-body">
          <form class="bb-form" @submit.prevent="handleSubmit">
            <FormField
              v-for="field in currentBlockFields"
              :key="field.field"
              :field="field"
              :field-id="'field-' + field.field"
              :model-value="formData[field.field]"
              :required="isFieldRequired(field)"
              :error="getFieldError(field)"
              :container-class="
                formErrors[field.field] && shouldShowErrorContainer(field)
                  ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                  : CSS_CLASSES.FORM_GROUP
              "
              @update:model-value="formData[field.field] = $event"
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
                  :license-feature-checker="getLicenseFeatureChecker"
                  @update:model-value="formData[slotField.field] = $event"
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
                  :api-select-use-case="props.apiSelectUseCase"
                  :is-api-select-available="isApiSelectAvailable"
                  :get-api-select-restriction-message="getApiSelectRestrictionMessage"
                  :custom-field-renderer-registry="props.customFieldRendererRegistry"
                  :is-custom-field-available="isCustomFieldAvailable"
                  :get-custom-field-restriction-message="getCustomFieldsRestrictionMessage"
                  @update:model-value="formData[slotField.field] = $event"
                />

                <div v-else-if="slotField.type === 'api-select'" class="bb-form-group">
                  <ApiSelectField
                    v-if="isApiSelectAvailable(slotField) && props.apiSelectUseCase"
                    :model-value="slotModelValue"
                    :config="slotField"
                    :validation-error="slotError"
                    :api-select-use-case="props.apiSelectUseCase"
                    @update:model-value="formData[slotField.field] = $event"
                  />

                  <div v-else class="bb-warning-box">⚠️ {{ getApiSelectRestrictionMessage() }}</div>
                </div>

                <div v-else-if="slotField.type === 'custom'" class="bb-form-group">
                  <label :for="slotFieldId" class="bb-form-label">
                    {{ slotField.label }}
                    <span v-if="isFieldRequired(slotField)" class="bb-required">*</span>
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
                    @update:model-value="formData[slotField.field] = $event"
                  />
                  <div v-else class="bb-warning-box">
                    ⚠️ {{ getCustomFieldsRestrictionMessage() }}
                  </div>
                </div>
              </template>
            </FormField>
          </form>
        </div>

        <div class="bb-modal-footer">
          <button type="button" class="bb-btn bb-btn--secondary" @click="closeModal">Отмена</button>
          <button type="submit" class="bb-btn bb-btn--primary" @click="handleSubmit">
            {{ modalMode === 'create' ? 'Создать' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue';

import type { LicenseFeatureChecker } from '../../core/services/LicenseFeatureChecker';
import { LicenseFeature } from '../../core/services/LicenseFeatureChecker';
import { LicenseService } from '../../core/services/LicenseService';
import { IBlock, TBlockId } from '../../core/types';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import {
  CSS_CLASSES,
  ERROR_MESSAGES,
  NOTIFICATION_DISPLAY_DURATION_MS,
  REPEATER_ACCORDION_ANIMATION_DELAY_MS,
} from '../../utils/constants';
import { copyToClipboard } from '../../utils/copyToClipboard';
import {
  findFieldElement,
  focusElement,
  parseErrorKey,
  scrollToElement,
  scrollToFirstError,
} from '../../utils/formErrorHelpers';
import { logger } from '../../utils/logger';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock';
import { ISpacingData } from '../../utils/spacingHelpers';
import { UniversalValidator } from '../../utils/universalValidation';
import Icon from '../icons/Icon.vue';
import { deleteIconHTML, saveIconHTML } from '../icons/iconHelpers';
import { initIcons } from '../icons/index';
import ApiSelectField from './ApiSelectField.vue';
import CustomField from './CustomField.vue';
import { FormField } from './form-fields';
import RepeaterControl from './RepeaterControl.vue';
import SpacingControl from './SpacingControl.vue';

interface IBlockType {
  type: string;
  label: string;
  title?: string;
  icon?: string;
  render?: any;
  defaultSettings?: any;
  defaultProps?: any;
  fields?: any[];
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
  licenseKey?: string; // Лицензионный ключ для проверки (для обратной совместимости)
  licenseService?: import('../../core/services/LicenseService').LicenseService; // Сервис лицензии
  licenseInfo?: {
    isPro: boolean;
    maxBlockTypes: number;
    currentTypesCount: number;
  };
  isEdit?: boolean; // Режим редактирования (по умолчанию true)
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

const blocks = ref<IBlock[]>([]);
const showModal = ref(false);
const showTypeSelectionModal = ref(false);
const isAnyModalOpen = computed(() => showModal.value || showTypeSelectionModal.value);
const modalMode = ref<'create' | 'edit'>('create');
const currentType = ref<string | null>(null);
const currentBlockId = ref<TBlockId | null>(null);
const selectedPosition = ref<number | undefined>(undefined);
const formData = reactive<Record<string, any>>({});
const formErrors = reactive<Record<string, string[]>>({});
const repeaterRefs = new Map<string, any>();
const originalInitialBlocks = ref(props.initialBlocks ? [...props.initialBlocks] : []);

const internalLicenseService = ref<LicenseService | null>(null);
const licenseState = ref<{
  isPro: boolean;
  maxBlockTypes: number;
  currentTypesCount: number;
} | null>(null);

if (props.licenseKey && !props.licenseService) {
  const service = new LicenseService({ key: props.licenseKey });
  internalLicenseService.value = service;
  licenseState.value = service.getLicenseInfo(0);
  service.onLicenseChange(async info => {
    licenseState.value = info;
    await reloadBlocksAfterLicenseChange();
  });
}

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

const limitedBlockTypes = computed(() => {
  const licenseInfo = licenseInfoComputed.value;
  if (licenseInfo.isPro) {
    return availableBlockTypes.value;
  }
  return availableBlockTypes.value.slice(0, licenseInfo.maxBlockTypes);
});

const currentBlockType = computed(() => {
  if (!currentType.value) {
    return null;
  }
  return limitedBlockTypes.value.find((bt: IBlockType) => bt.type === currentType.value) || null;
});

const licenseInfoComputed = computed(() => {
  if (props.licenseInfo) {
    return props.licenseInfo;
  }
  if (props.licenseService) {
    return props.licenseService.getLicenseInfo(availableBlockTypes.value.length);
  }
  if (licenseState.value) {
    return {
      ...licenseState.value,
      currentTypesCount: availableBlockTypes.value.length,
    };
  }
  const internalService = internalLicenseService.value;
  if (internalService) {
    return internalService.getLicenseInfo(availableBlockTypes.value.length);
  }
  return {
    isPro: false,
    maxBlockTypes: 5,
    currentTypesCount: availableBlockTypes.value.length,
  };
});

const controlsFixedClass = computed(() => {
  if (!props.controlsFixedPosition) {
    return '';
  }
  return `bb-controls--fixed-${props.controlsFixedPosition}`;
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
    'bb-app': true,
    'block-builder': true,
    'bb-has-fixed-controls': !!props.controlsFixedPosition,
    'bb-has-top-controls': props.controlsFixedPosition === 'top',
    'bb-has-bottom-controls': props.controlsFixedPosition === 'bottom',
  };
});

const currentBlockFields = computed(() => {
  if (!currentBlockType.value) {
    return [];
  }
  const blockType = currentBlockType.value;
  const licenseService = props.licenseService || internalLicenseService.value;
  let fields = addSpacingFieldToFields(
    blockType.fields || [],
    (blockType as any).spacingOptions,
    licenseService?.getFeatureChecker()
  );
  return fields;
});

const visibleBlocks = computed(() => {
  if (props.isEdit) {
    return blocks.value;
  }
  return blocks.value.filter((block: IBlock) => block.visible !== false);
});

const getBlockTitle = (block: IBlock): string => {
  return getBlockConfig(block.type)?.title || block.type;
};

const getBlockVisibilityTooltip = (block: IBlock): string => {
  return block.visible ? 'Скрыть' : 'Показать';
};

const getLicenseFeatureChecker = computed((): LicenseFeatureChecker | null => {
  const licenseService = props.licenseService || internalLicenseService.value;
  return licenseService ? licenseService.getFeatureChecker() : null;
});

const getApiSelectRestrictionMessage = (): string => {
  const checker = getLicenseFeatureChecker.value;
  if (checker) {
    return checker.getFeatureRestrictionMessage(LicenseFeature.API_SELECT);
  }
  return 'API Select поля доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.';
};

const getCustomFieldsRestrictionMessage = (): string => {
  const checker = getLicenseFeatureChecker.value;
  if (checker) {
    return checker.getFeatureRestrictionMessage(LicenseFeature.CUSTOM_FIELDS);
  }
  return 'Кастомные поля доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.';
};

const isApiSelectAvailable = (_field: any): boolean => {
  const checker = getLicenseFeatureChecker.value;
  if (!checker || !checker.canUseApiSelect()) {
    return false;
  }
  return !!props.apiSelectUseCase;
};

const isCustomFieldAvailable = (_field: any): boolean => {
  const checker = getLicenseFeatureChecker.value;
  if (!checker || !checker.canUseCustomFields()) {
    return false;
  }
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
  const checker = getLicenseFeatureChecker.value;
  if (!checker || !checker.hasAdvancedSpacing()) {
    return undefined;
  }
  return Array.isArray(breakpoints) ? toRaw(breakpoints) : breakpoints;
};

const getFieldError = (field: any): string => {
  const errors = formErrors[field.field];
  if (!errors || errors.length === 0) {
    return '';
  }
  if (
    field.type === 'image' ||
    field.type === 'api-select' ||
    field.type === 'custom' ||
    field.type === 'repeater' ||
    field.type === 'spacing'
  ) {
    return '';
  }
  return errors[0] || '';
};

const shouldShowErrorContainer = (field: any): boolean => {
  return !!(
    formErrors[field.field] &&
    field.type !== 'image' &&
    field.type !== 'api-select' &&
    field.type !== 'custom' &&
    field.type !== 'repeater' &&
    field.type !== 'spacing'
  );
};

const isFieldRequired = (field: any): boolean => {
  return field.rules?.some((rule: any) => rule.type === 'required') ?? false;
};

const loadBlocks = async () => {
  try {
    blocks.value = (await blockService.getAllBlocks()) as any;
  } catch (error) {
    alert(`Ошибка загрузки блоков: ${error}`);
  }
};

const loadInitialBlocks = async () => {
  if (!props.initialBlocks || props.initialBlocks.length === 0) {
    return;
  }

  try {
    if (!originalInitialBlocks.value || originalInitialBlocks.value.length === 0) {
      originalInitialBlocks.value = [...props.initialBlocks];
    }

    let filteredBlocks = props.initialBlocks;
    const licenseService = props.licenseService || internalLicenseService.value || null;

    if (licenseService) {
      const allBlockTypes = availableBlockTypes.value.map(bt => bt.type);
      const allowedTypes = licenseService.getAllowedBlockTypes(allBlockTypes);
      filteredBlocks = licenseService.filterBlocksByLicense(props.initialBlocks, allowedTypes);
    } else {
      const licenseInfo = licenseInfoComputed.value;
      const allowedTypes = licenseInfo.isPro
        ? availableBlockTypes.value.map(bt => bt.type)
        : availableBlockTypes.value.slice(0, licenseInfo.maxBlockTypes).map(bt => bt.type);

      filteredBlocks = props.initialBlocks.filter(block => allowedTypes.includes(block.type));
    }

    for (const block of filteredBlocks) {
      await blockService.createBlock(block as any);
    }
  } catch (error) {
    logger.error('Ошибка загрузки начальных блоков:', error);
    alert(
      `Ошибка загрузки начальных блоков: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
    );
  }
};

const reloadBlocksAfterLicenseChange = async () => {
  try {
    const licenseService = props.licenseService || internalLicenseService.value;

    const currentBlocks = (await blockService.getAllBlocks()) as any[];

    const initialBlocksFromProps = originalInitialBlocks.value || [];

    const allBlocksMap = new Map<string, any>();
    currentBlocks.forEach(block => allBlocksMap.set(block.id, block));
    initialBlocksFromProps.forEach(block => allBlocksMap.set(block.id, block));
    const allBlocksToReload = Array.from(allBlocksMap.values());

    await blockService.clearAllBlocks();

    if (licenseService && allBlocksToReload.length > 0) {
      let allBlockTypes: string[] = [];

      if (props.config?.availableBlockTypes && props.config.availableBlockTypes.length > 0) {
        allBlockTypes = props.config.availableBlockTypes.map(bt => bt.type);
      } else if (componentRegistry) {
        const registeredComponents = componentRegistry.getAll();
        allBlockTypes = Object.keys(registeredComponents);
      } else {
        allBlockTypes = [...new Set(allBlocksToReload.map(block => block.type))];
      }

      const allowedTypes = licenseService.getAllowedBlockTypes(allBlockTypes);
      const filteredBlocks = licenseService.filterBlocksByLicense(allBlocksToReload, allowedTypes);

      for (const block of filteredBlocks) {
        try {
          await blockService.createBlock(block as any);
        } catch (error) {
          logger.warn(`⚠️ Не удалось создать блок ${block.id}:`, error);
        }
      }
    } else if (allBlocksToReload.length > 0) {
      const licenseInfo = licenseInfoComputed.value;

      let allBlockTypes: string[] = [];

      if (props.config?.availableBlockTypes && props.config.availableBlockTypes.length > 0) {
        allBlockTypes = props.config.availableBlockTypes.map(bt => bt.type);
      } else if (componentRegistry) {
        const registeredComponents = componentRegistry.getAll();
        allBlockTypes = Object.keys(registeredComponents);
      } else {
        allBlockTypes = [...new Set(allBlocksToReload.map(block => block.type))];
      }

      const allowedTypes = licenseInfo.isPro
        ? allBlockTypes
        : allBlockTypes.slice(0, licenseInfo.maxBlockTypes);

      const filteredBlocks = allBlocksToReload.filter(block => allowedTypes.includes(block.type));

      for (const block of filteredBlocks) {
        try {
          await blockService.createBlock(block as any);
        } catch (error) {
          logger.warn(`⚠️ Не удалось создать блок ${block.id}:`, error);
        }
      }
    }

    await loadBlocks();

    await setupBreakpointWatchers();
  } catch (error) {
    logger.error('Ошибка перезагрузки блоков:', error);
  }
};

const isVueComponent = (block: IBlock) => {
  return block.render?.kind === 'component' && block.render?.framework === 'vue';
};

const getVueComponent = (block: IBlock) => {
  if (!componentRegistry) {
    return null;
  }
  return componentRegistry.get(block.type);
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
  openCreateModal(type, position);
};

const openCreateModal = (type: string, position?: number) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
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
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  modalMode.value = 'edit';
  currentType.value = block.type;
  currentBlockId.value = block.id;

  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, { ...block.props });

  showModal.value = true;
};

const handleOverlayClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (target.classList.contains('bb-modal')) {
    closeModal();
  }
};

const closeModal = () => {
  showModal.value = false;
  currentType.value = null;
  currentBlockId.value = null;
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
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
  const validation = UniversalValidator.validateForm(formData, fields);

  Object.keys(formErrors).forEach(key => delete formErrors[key]);

  if (!validation.isValid) {
    Object.assign(formErrors, validation.errors);

    await handleValidationErrors();

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

    await loadBlocks();

    await setupBreakpointWatchers();

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
  const validation = UniversalValidator.validateForm(formData, fields);

  Object.keys(formErrors).forEach(key => delete formErrors[key]);

  if (!validation.isValid) {
    Object.assign(formErrors, validation.errors);

    await handleValidationErrors();

    return false;
  }

  try {
    const updated = await blockService.updateBlock(currentBlockId.value, {
      props: { ...formData },
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

    (emit as any)('block-added', duplicated as any);
  } catch (error) {
    logger.error('Ошибка дублирования блока:', error);
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
      logger.error('Ошибка удаления блока:', error);
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

const getBlockConfig = (type: string) => {
  return availableBlockTypes.value.find((bt: IBlockType) => bt.type === type);
};

const handleCopyId = async (blockId: TBlockId) => {
  try {
    const success = await copyToClipboard(blockId as string);
    if (success !== false) {
      showNotification(`ID скопирован: ${blockId}`, 'success');
    }
  } catch {
    showNotification('Ошибка копирования ID', 'error');
  }
};

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const notification = document.createElement('div');
  notification.className = 'bb-notification';
  notification.textContent = message;

  const colors = {
    success: '#4caf50',
    error: '#dc3545',
    info: '#007bff',
  };

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s ease-in-out;
  `;
  document.body.append(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => notification.remove(), 300);
  }, NOTIFICATION_DISPLAY_DURATION_MS);
};

const handleSave = async () => {
  if (!props.onSave) {
    showNotification(
      'Функция сохранения не настроена. Передайте onSave в пропсы компонента.',
      'error'
    );
    return;
  }

  try {
    const result = await Promise.resolve(props.onSave(blocks.value));

    if (result === true) {
      showNotification('Данные успешно сохранены', 'success');
    } else {
      showNotification('Произошла ошибка при сохранении', 'error');
    }
  } catch (error) {
    logger.error('Ошибка сохранения блоков:', error);
    showNotification('Произошла ошибка при сохранении', 'error');
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
      logger.error('Ошибка очистки блоков:', error);
      alert(
        `Ошибка очистки блоков: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
      );
    }
  }
};

const getBlockSpacingStyles = (block: IBlock): Record<string, string> => {
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
  await nextTick();

  const modalContent = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;

  if (!modalContent) {
    return;
  }

  setTimeout(async () => {
    const firstErrorKey = Object.keys(formErrors)[0];
    if (!firstErrorKey) {
      return;
    }

    const errorInfo = parseErrorKey(firstErrorKey);

    if (errorInfo.isRepeaterField && errorInfo.repeaterFieldName) {
      await openRepeaterAccordion(errorInfo.repeaterFieldName, errorInfo.repeaterIndex || 0);
    } else {
      scrollToFirstError(modalContent, formErrors, {
        offset: 40,
        behavior: 'smooth',
        autoFocus: true,
      });
    }
  }, 50); // Небольшая задержка для завершения отрисовки ошибок
};

/**
 * Открытие аккордеона в repeater для конкретного элемента
 */
const openRepeaterAccordion = async (
  repeaterFieldName: string,
  itemIndex: number
): Promise<void> => {
  await nextTick();

  const repeaterComponent = repeaterRefs.get(repeaterFieldName);

  if (!repeaterComponent) {
    return;
  }

  if (repeaterComponent.isItemCollapsed && repeaterComponent.isItemCollapsed(itemIndex)) {
    if (repeaterComponent.expandItem) {
      repeaterComponent.expandItem(itemIndex);

      await nextTick();

      await new Promise(resolve => setTimeout(resolve, REPEATER_ACCORDION_ANIMATION_DELAY_MS));

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));

      const modalContent = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
      if (modalContent) {
        const errorKey = Object.keys(formErrors).find(key => {
          const errorInfo = parseErrorKey(key);
          return (
            errorInfo.isRepeaterField &&
            errorInfo.repeaterFieldName === repeaterFieldName &&
            errorInfo.repeaterIndex === itemIndex
          );
        });

        if (errorKey) {
          const errorInfo = parseErrorKey(errorKey);

          const fieldElement = findFieldElement(modalContent, errorInfo);

          if (fieldElement) {
            scrollToElement(fieldElement, {
              offset: 40,
              behavior: 'smooth',
            });
            focusElement(fieldElement);
          } else {
            scrollToFirstError(modalContent, formErrors, {
              offset: 40,
              behavior: 'smooth',
              autoFocus: true,
            });
          }
        } else {
          scrollToFirstError(modalContent, formErrors, {
            offset: 40,
            behavior: 'smooth',
            autoFocus: true,
          });
        }
      }
    }
  } else {
    const modalContent = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    if (modalContent) {
      const errorKey = Object.keys(formErrors).find(key => {
        const errorInfo = parseErrorKey(key);
        return (
          errorInfo.isRepeaterField &&
          errorInfo.repeaterFieldName === repeaterFieldName &&
          errorInfo.repeaterIndex === itemIndex
        );
      });

      if (errorKey) {
        const errorInfo = parseErrorKey(errorKey);

        const fieldElement = findFieldElement(modalContent, errorInfo);

        if (fieldElement) {
          scrollToElement(fieldElement, {
            offset: 40,
            behavior: 'smooth',
          });
          focusElement(fieldElement);
        } else {
          scrollToFirstError(modalContent, formErrors, {
            offset: 40,
            behavior: 'smooth',
            autoFocus: true,
          });
        }
      } else {
        scrollToFirstError(modalContent, formErrors, {
          offset: 40,
          behavior: 'smooth',
          autoFocus: true,
        });
      }
    }
  }
};

const updateBodyEditModeClass = (isEdit: boolean | undefined) => {
  if (isEdit) {
    document.body.classList.add(CSS_CLASSES.BB_IS_EDIT_MODE);
  } else {
    document.body.classList.remove(CSS_CLASSES.BB_IS_EDIT_MODE);
  }
};

watch(
  () => props.isEdit,
  (newValue: boolean | undefined) => {
    updateBodyEditModeClass(newValue);
  },
  { immediate: true }
);

watch(
  isAnyModalOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  initIcons();

  updateBodyEditModeClass(props.isEdit);

  if (props.licenseService && !internalLicenseService.value) {
    props.licenseService.onLicenseChange(async () => {
      await reloadBlocksAfterLicenseChange();
    });
  }

  await loadInitialBlocks();
  await loadBlocks();
  await setupBreakpointWatchers();
});

onBeforeUnmount(() => {
  cleanupBreakpointWatchers();
  document.body.classList.remove(CSS_CLASSES.BB_IS_EDIT_MODE);
  unlockBodyScroll();
});
</script>
