<template>
  <div :class="appClass">
  <!-- Баннер о бесплатной версии -->
  <div v-if="!licenseInfoComputed.isPro" class="block-builder-license-banner">
    <div class="block-builder-license-banner__content">
      <span class="block-builder-license-banner__icon">⚠️</span>
      <span class="block-builder-license-banner__text">
        Вы используете бесплатную версию <a href="https://block-builder.ru/" target="_blank" rel="noopener noreferrer" class="bb-link-inherit">Block Builder</a>.
        Доступно {{ limitedBlockTypes.length }} из {{ licenseInfoComputed.maxBlockTypes }} типов блоков.
      </span>
    </div>
  </div>

  <!-- Панель управления -->
  <div
    v-if="props.isEdit"
    :class="[
      'block-builder-controls',
      controlsFixedClass
    ]"
    :style="controlsInlineStyles"
  >
    <div :class="['block-builder-controls-container', props.controlsContainerClass].filter(Boolean)">
      <div class="block-builder-controls-inner">
        <button
          v-if="props.isEdit"
          @click="handleSave"
          class="block-builder-btn block-builder-btn--success"
        >
          <span v-html="saveIconHTML" class="bb-icon-wrapper"></span> Сохранить
        </button>
        <button
          v-if="props.isEdit"
          @click="handleClearAll"
          class="block-builder-btn block-builder-btn--danger"
        >
          <span v-html="deleteIconHTML" class="bb-icon-wrapper"></span> Очистить все
        </button>

        <!-- Статистика -->
        <div class="block-builder-stats">
          <p>Всего блоков: <span>{{ props.isEdit ? blocks.length : visibleBlocks.length }}</span></p>
        </div>

        <!-- Badge лицензии -->
        <div
          v-if="licenseInfoComputed"
          :class="[
            'block-builder-license-badge',
            licenseInfoComputed.isPro ? 'block-builder-license-badge--pro' : 'block-builder-license-badge--free'
          ]"
          :title="licenseInfoComputed.isPro ? 'PRO лицензия - Без ограничений' : `FREE лицензия - Ограничено ${licenseInfoComputed.maxBlockTypes} типами блоков`"
        >
          <span class="block-builder-license-badge__icon">
            {{ licenseInfoComputed.isPro ? '✓' : 'ℹ' }}
          </span>
          <span class="block-builder-license-badge__text">
            {{ licenseInfoComputed.isPro ? 'PRO' : 'FREE' }}
          </span>
        </div>
      </div>
    </div>
  </div>

    <!-- Список блоков -->
    <div class="block-builder-blocks">
      <!-- Пустое состояние -->
      <div v-if="visibleBlocks.length === 0" class="block-builder-empty-state">
        <div v-if="props.isEdit" class="block-builder-add-block-separator">
          <button
            @click="openBlockTypeSelectionModal(0)"
            class="block-builder-add-block-btn"
            title="Добавить блок"
          >
            <span class="block-builder-add-block-btn__icon">+</span>
            <span class="block-builder-add-block-btn__text">Добавить блок</span>
          </button>
        </div>
      </div>

      <!-- Блоки с кнопками добавления -->
      <template v-else>
        <!-- Кнопка перед первым блоком -->
        <div v-if="props.isEdit" class="block-builder-add-block-separator">
          <button
            @click="openBlockTypeSelectionModal(0)"
            class="block-builder-add-block-btn"
            title="Добавить блок"
          >
            <span class="block-builder-add-block-btn__icon">+</span>
            <span class="block-builder-add-block-btn__text">Добавить блок</span>
          </button>
        </div>

        <template v-for="(block, index) in visibleBlocks" :key="block.id">
          <div
            class="block-builder-block"
            :class="{ [CSS_CLASSES.HIDDEN]: !block.visible }"
            :data-block-id="block.id"
            :style="getBlockSpacingStyles(block)"
          >
            <!-- Поп-апчик с контролами -->
            <div v-if="props.isEdit" class="block-builder-block-controls">
              <div
                class="block-builder-block-controls-container"
                :class="props.controlsContainerClass"
              >
                <div class="block-builder-block-controls-inner">
                  <button
                    @click="handleCopyId(block.id)"
                    class="block-builder-control-btn"
                    title="Копировать ID: {{ block.id }}"
                  >
                    <Icon.default name="copy" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    @click="handleMoveUp(block.id)"
                    class="block-builder-control-btn"
                    title="Переместить вверх"
                    :disabled="index === 0"
                  >
                    <Icon.default name="arrowUp" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    @click="handleMoveDown(block.id)"
                    class="block-builder-control-btn"
                    title="Переместить вниз"
                    :disabled="index === visibleBlocks.length - 1"
                  >
                    <Icon.default name="arrowDown" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    @click="openEditModal(block)"
                    class="block-builder-control-btn"
                    title="Редактировать"
                  >
                    <Icon.default name="edit" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    @click="handleDuplicateBlock(block.id)"
                    class="block-builder-control-btn"
                    title="Дублировать"
                  >
                    <Icon.default name="duplicate" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    @click="handleToggleVisibility(block.id)"
                    class="block-builder-control-btn"
                    :title="getBlockVisibilityTooltip(block)"
                  >
                    <Icon.default :name="block.visible ? 'eye' : 'eyeOff'" />
                  </button>
                  <button
                    v-if="props.isEdit"
                    @click="handleDeleteBlock(block.id)"
                    class="block-builder-control-btn"
                    title="Удалить"
                  >
                    <Icon.default name="delete" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Содержимое блока -->
            <div class="block-builder-block-content">
              <component
                v-if="isVueComponent(block)"
                :is="getVueComponent(block)"
                v-bind="getUserComponentProps(block)"
              />
              <div v-else class="block-content-fallback">
                <strong>{{ getBlockTitle(block) }}</strong>
                <pre>{{ JSON.stringify(getUserComponentProps(block), null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- Кнопка после каждого блока -->
          <div v-if="props.isEdit" class="block-builder-add-block-separator">
            <button
              @click="openBlockTypeSelectionModal(index + 1)"
              class="block-builder-add-block-btn"
              title="Добавить блок"
            >
              <span class="block-builder-add-block-btn__icon">+</span>
              <span class="block-builder-add-block-btn__text">Добавить блок</span>
            </button>
          </div>
        </template>
      </template>
    </div>

    <!-- Модальное окно выбора типа блока -->
    <div v-if="showTypeSelectionModal" class="block-builder-modal" @mousedown="closeTypeSelectionModal">
      <div class="block-builder-modal-content" @mousedown.stop>
        <div class="block-builder-modal-header">
          <h3>Выберите тип блока</h3>
          <button @click="closeTypeSelectionModal" class="block-builder-modal-close">×</button>
        </div>

        <div class="block-builder-modal-body">
          <!-- Предупреждение о бесплатной версии -->
          <div v-if="!licenseInfoComputed.isPro" class="block-builder-license-warning">
            <div class="block-builder-license-warning__header">
              <span class="block-builder-license-warning__icon">⚠️</span>
              <strong class="block-builder-license-warning__title">Бесплатная версия <a href="https://block-builder.ru/" target="_blank" rel="noopener noreferrer" class="bb-link-inherit">Block Builder</a></strong>
            </div>
            <p class="block-builder-license-warning__text">
              Вы используете ограниченную бесплатную версию.<br>
              Доступно <strong>{{ limitedBlockTypes.length }} из {{ licenseInfoComputed.maxBlockTypes }}</strong> типов блоков.
            </p>
          </div>

          <div class="block-builder-block-type-selection">
            <button
              v-for="blockType in limitedBlockTypes"
              :key="blockType.type"
              @click="selectBlockType(blockType.type)"
              class="block-builder-block-type-card"
            >
              <span class="block-builder-block-type-card__icon">
                {{ getBlockConfig(blockType.type)?.icon || '📦' }}
              </span>
              <span class="block-builder-block-type-card__title">
                {{ blockType.label }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showModal" class="block-builder-modal" @mousedown="handleOverlayClick">
      <div class="block-builder-modal-content" @mousedown.stop>
        <div class="block-builder-modal-header">
          <h3>{{ modalMode === 'create' ? 'Создать' : 'Редактировать' }} {{ currentBlockType?.label }}</h3>
          <button @click="closeModal" class="block-builder-modal-close">×</button>
        </div>

        <div class="block-builder-modal-body">
          <form @submit.prevent="handleSubmit" class="block-builder-form">
            <div
              v-for="field in currentBlockFields"
              :key="field.field"
              class="block-builder-form-group"
              :data-field-name="field.field"
              :class="{ [CSS_CLASSES.ERROR]: formErrors[field.field] && field.type !== 'image' }"
            >
              <!-- Лейбл только для полей без собственного лейбла (spacing, repeater и image имеют свой) -->
              <label
                v-if="isRegularInputField(field)"
                :for="'field-' + field.field"
                class="block-builder-form-label"
              >
                {{ field.label }}
                <span v-if="isFieldRequired(field)" class="required">*</span>
              </label>

              <!-- Text input -->
              <input
                v-if="field.type === 'text'"
                v-model="formData[field.field]"
                type="text"
                :id="'field-' + field.field"
                :placeholder="field.placeholder"
                class="block-builder-form-control"
                :class="{ [CSS_CLASSES.ERROR]: formErrors[field.field] }"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="formData[field.field]"
                :id="'field-' + field.field"
                :placeholder="field.placeholder"
                rows="4"
                class="block-builder-form-control"
                :class="{ [CSS_CLASSES.ERROR]: formErrors[field.field] }"
              ></textarea>

              <!-- Number -->
              <input
                v-else-if="field.type === 'number'"
                v-model.number="formData[field.field]"
                type="number"
                :id="'field-' + field.field"
                :placeholder="field.placeholder"
                class="block-builder-form-control"
                :class="{ [CSS_CLASSES.ERROR]: formErrors[field.field] }"
              />

              <!-- Color -->
              <input
                v-else-if="field.type === 'color'"
                v-model="formData[field.field]"
                type="color"
                :id="'field-' + field.field"
                class="block-builder-form-control"
                :class="{ [CSS_CLASSES.ERROR]: formErrors[field.field] }"
              />

              <!-- URL -->
              <input
                v-else-if="field.type === 'url'"
                v-model="formData[field.field]"
                type="url"
                :id="'field-' + field.field"
                :placeholder="field.placeholder"
                class="block-builder-form-control"
                :class="{ [CSS_CLASSES.ERROR]: formErrors[field.field] }"
              />

              <!-- Image Upload -->
              <ImageUploadField
                v-else-if="field.type === 'image'"
                v-model="formData[field.field]"
                :label="field.label"
                :required="isFieldRequired(field)"
                :placeholder="field.placeholder"
                :error="formErrors[field.field]?.[0]"
                :image-upload-config="field.imageUploadConfig"
              />

              <!-- Select -->
              <select
                v-else-if="field.type === 'select'"
                v-model="formData[field.field]"
                :id="'field-' + field.field"
                class="block-builder-form-control"
                :class="{ [CSS_CLASSES.ERROR]: formErrors[field.field] }"
              >
                <option value="">Выберите...</option>
                <option
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>

              <!-- Checkbox -->
              <label v-else-if="field.type === 'checkbox'" class="block-builder-form-checkbox">
                <input
                  v-model="formData[field.field]"
                  type="checkbox"
                  :id="'field-' + field.field"
                  class="block-builder-form-checkbox-input"
                />
                <span class="block-builder-form-checkbox-label">{{ field.label }}</span>
              </label>

              <!-- Radio -->
              <div v-else-if="field.type === 'radio'" class="block-builder-form-group">
                <label class="block-builder-form-label">
                  {{ field.label }}
                  <span v-if="isFieldRequired(field)" class="required">*</span>
                </label>
                <div class="block-builder-form-radio-group">
                  <label
                    v-for="option in field.options"
                    :key="option.value"
                    class="block-builder-form-radio"
                  >
                    <input
                      v-model="formData[field.field]"
                      type="radio"
                      :name="'field-' + field.field"
                      :value="option.value"
                      :id="'field-' + field.field + '-' + option.value"
                      class="block-builder-form-radio-input"
                    />
                    <span class="block-builder-form-radio-label">{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Spacing Control -->
              <SpacingControl
                v-else-if="field.type === 'spacing'"
                :label="field.label"
                :field-name="field.field"
                v-model="formData[field.field]"
                :spacing-types="field.spacingConfig?.spacingTypes"
                :min="field.spacingConfig?.min"
                :max="field.spacingConfig?.max"
                :step="field.spacingConfig?.step"
                :breakpoints="getSpacingBreakpoints(field)"
                :required="isFieldRequired(field)"
                :show-preview="true"
                :license-feature-checker="getLicenseFeatureChecker"
              />

              <!-- Repeater Control -->
              <RepeaterControl
                v-else-if="field.type === 'repeater'"
                :ref="createRepeaterRefCallback(field.field)"
                :field-name="field.field"
                :label="field.label"
                v-model="formData[field.field]"
                :fields="field.repeaterConfig?.fields || []"
                :rules="field.rules || []"
                :errors="formErrors"
                :add-button-text="field.repeaterConfig?.addButtonText"
                :remove-button-text="field.repeaterConfig?.removeButtonText"
                :item-title="field.repeaterConfig?.itemTitle"
                :min="field.repeaterConfig?.min"
                :max="field.repeaterConfig?.max"
                :default-item-value="field.repeaterConfig?.defaultItemValue"
              />

              <!-- API Select Field -->
              <div v-else-if="field.type === 'api-select'" class="block-builder-form-group">
                <!-- Лейбл и ошибки рендерятся внутри ApiSelectField компонента -->
                <!-- API Select поле - показываем только если PRO и есть apiSelectUseCase -->
                <ApiSelectField
                  v-if="isApiSelectAvailable(field) && props.apiSelectUseCase"
                  :config="field"
                  v-model="formData[field.field]"
                  :validation-error="formErrors[field.field]?.[0]"
                  :api-select-use-case="props.apiSelectUseCase"
                />
                <!-- Заглушка для FREE версии -->
                <div v-else class="bb-warning-box">
                  ⚠️ {{ getApiSelectRestrictionMessage() }}
                </div>
              </div>

              <!-- Custom Field -->
              <div
                v-else-if="field.type === 'custom'"
                class="block-builder-form-group"
              >
                <label
                  :for="'field-' + field.field"
                  class="block-builder-form-label"
                >
                  {{ field.label }}
                  <span v-if="isFieldRequired(field)" class="required">*</span>
                </label>
                <CustomField
                  v-if="isCustomFieldAvailable(field) && props.customFieldRendererRegistry?.get(field.customFieldConfig?.rendererId)"
                  :field="field"
                  v-model="formData[field.field]"
                  :form-errors="formErrors"
                  :custom-field-renderer-registry="props.customFieldRendererRegistry"
                  :is-field-required="isFieldRequired"
                />
                <div v-else class="bb-warning-box">
                  ⚠️ {{ getCustomFieldsRestrictionMessage() }}
                </div>
              </div>

              <!-- Ошибки валидации -->
              <div
                v-if="formErrors[field.field] && field.type !== 'image' && field.type !== 'api-select' && field.type !== 'custom' && field.type !== 'repeater' && field.type !== 'spacing'"
                class="block-builder-form-errors"
              >
                <span v-for="error in formErrors[field.field]" :key="error" :class="CSS_CLASSES.ERROR">{{ error }}</span>
              </div>
            </div>
          </form>
        </div>

        <div class="block-builder-modal-footer">
          <button type="button" @click="closeModal" class="block-builder-btn block-builder-btn--secondary">
            Отмена
          </button>
          <button type="submit" @click="handleSubmit" class="block-builder-btn block-builder-btn--primary">
            {{ modalMode === 'create' ? 'Создать' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, toRaw, watch } from 'vue';
import { IBlock, TBlockId } from '../../core/types';
import { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { UniversalValidator } from '../../utils/universalValidation';
import { addSpacingFieldToFields } from '../../utils/blockSpacingHelpers';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import { ISpacingData } from '../../utils/spacingHelpers';
import { scrollToFirstError, parseErrorKey, findFieldElement, scrollToElement, focusElement } from '../../utils/formErrorHelpers';
import { LicenseService } from '../../core/services/LicenseService';
import type { LicenseFeatureChecker } from '../../core/services/LicenseFeatureChecker';
import { LicenseFeature } from '../../core/services/LicenseFeatureChecker';
import SpacingControl from './SpacingControl.vue';
import RepeaterControl from './RepeaterControl.vue';
// @ts-ignore - Vue SFC components with <script setup> are properly handled by build tools
import ApiSelectField from './ApiSelectField.vue';
import ImageUploadField from './ImageUploadField.vue';
import CustomField from './CustomField.vue';

import * as Icon from '../icons/Icon.vue';
import { initIcons } from '../icons/index';
import { NOTIFICATION_DISPLAY_DURATION_MS, REPEATER_ACCORDION_ANIMATION_DELAY_MS, CSS_CLASSES } from '../../utils/constants';
import {
  copyIconHTML,
  arrowUpIconHTML,
  arrowDownIconHTML,
  editIconHTML,
  duplicateIconHTML,
  eyeIconHTML,
  eyeOffIconHTML,
  deleteIconHTML,
  saveIconHTML
} from '../icons/iconHelpers';

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
  isEdit: true // По умолчанию режим редактирования включен
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
const modalMode = ref<'create' | 'edit'>('create');
const currentType = ref<string | null>(null);
const currentBlockId = ref<TBlockId | null>(null);
const selectedPosition = ref<number | undefined>(undefined);
const formData = reactive<Record<string, any>>({});
const formErrors = reactive<Record<string, string[]>>({});
const repeaterRefs = new Map<string, any>();
const originalInitialBlocks = ref(props.initialBlocks ? [...props.initialBlocks] : []);

const internalLicenseService = ref<LicenseService | null>(null);
const licenseState = ref<{ isPro: boolean; maxBlockTypes: number; currentTypesCount: number } | null>(null);

if (props.licenseKey && !props.licenseService) {
  const service = new LicenseService({ key: props.licenseKey });
  internalLicenseService.value = service;
  licenseState.value = service.getLicenseInfo(0);
  service.onLicenseChange(async (info) => {
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
  if (!currentType.value) return null;
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
      currentTypesCount: availableBlockTypes.value.length
    };
  }
  const internalService = internalLicenseService.value;
  if (internalService) {
    return internalService.getLicenseInfo(availableBlockTypes.value.length);
  }
  return {
    isPro: false,
    maxBlockTypes: 5,
    currentTypesCount: availableBlockTypes.value.length
  };
});

const controlsFixedClass = computed(() => {
  if (!props.controlsFixedPosition) return '';
  return `block-builder-controls--fixed-${props.controlsFixedPosition}`;
});

const controlsInlineStyles = computed(() => {
  if (!props.controlsFixedPosition) return {};

  const offset = props.controlsOffset || 0;
  const offsetVar = props.controlsOffsetVar;

  if (props.controlsFixedPosition === 'top') {
    if (offsetVar) {
      return { top: `calc(var(${offsetVar}) + ${offset}px)` };
    } else {
      return { top: `${offset}px` };
    }
  } else if (props.controlsFixedPosition === 'bottom') {
    if (offsetVar) {
      return { bottom: `calc(var(${offsetVar}) + ${offset}px)` };
    } else {
      return { bottom: `${offset}px` };
    }
  }

  return {};
});

const appClass = computed(() => {
  return {
    'block-builder-app': true,
    'has-fixed-controls': !!props.controlsFixedPosition,
    'has-top-controls': props.controlsFixedPosition === 'top',
    'has-bottom-controls': props.controlsFixedPosition === 'bottom'
  };
});

const currentBlockFields = computed(() => {
  if (!currentBlockType.value) return [];
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

const isApiSelectAvailable = (field: any): boolean => {
  const checker = getLicenseFeatureChecker.value;
  if (!checker || !checker.canUseApiSelect()) {
    return false;
  }
  return !!props.apiSelectUseCase;
};

const isCustomFieldAvailable = (field: any): boolean => {
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

const isRegularInputField = (field: any): boolean => {
  return field.type !== 'spacing' &&
         field.type !== 'repeater' &&
         field.type !== 'checkbox' &&
         field.type !== 'radio' &&
         field.type !== 'api-select' &&
         field.type !== 'custom' &&
         field.type !== 'image';
};

const isFieldRequired = (field: any): boolean => {
  return field.rules?.some((rule: any) => rule.type === 'required') ?? false;
};

const loadBlocks = async () => {
  try {
    blocks.value = await blockService.getAllBlocks() as any;
  } catch (error) {
    alert(`Ошибка загрузки блоков: ${error}`)
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
    console.error('Ошибка загрузки начальных блоков:', error);
    alert(`Ошибка загрузки начальных блоков: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Перезагружает блоки при изменении лицензии (PRO↔FREE)
const reloadBlocksAfterLicenseChange = async () => {
  try {
    const licenseService = props.licenseService || internalLicenseService.value;

    // Получаем все блоки из репозитория ДО очистки (чтобы сохранить их)
    const currentBlocks = await blockService.getAllBlocks() as any[];

    // Также берем блоки из originalInitialBlocks (которые были в props)
    const initialBlocksFromProps = originalInitialBlocks.value || [];

    // Объединяем все блоки, избегая дубликатов по ID
    const allBlocksMap = new Map<string, any>();
    currentBlocks.forEach(block => allBlocksMap.set(block.id, block));
    initialBlocksFromProps.forEach(block => allBlocksMap.set(block.id, block));
    const allBlocksToReload = Array.from(allBlocksMap.values());

    // Очищаем все блоки из репозитория
    await blockService.clearAllBlocks();

    // Фильтруем блоки с учетом новой лицензии
    if (licenseService && allBlocksToReload.length > 0) {
      // Получаем список типов блоков из конфигурации пользователя (props.config.availableBlockTypes)
      // Это основной источник типов блоков - конфигурация пользователя
      let allBlockTypes: string[] = [];

      // Приоритет 1: типы из конфигурации пользователя (props.config.availableBlockTypes)
      if (props.config?.availableBlockTypes && props.config.availableBlockTypes.length > 0) {
        allBlockTypes = props.config.availableBlockTypes.map(bt => bt.type);
      }
      // Приоритет 2: типы из componentRegistry (зарегистрированные компоненты)
      else if (componentRegistry) {
        const registeredComponents = componentRegistry.getAll();
        allBlockTypes = Object.keys(registeredComponents);
      }
      // Приоритет 3: fallback - уникальные типы из самих блоков
      else {
        allBlockTypes = [...new Set(allBlocksToReload.map(block => block.type))];
      }

      const allowedTypes = licenseService.getAllowedBlockTypes(allBlockTypes);
      const filteredBlocks = licenseService.filterBlocksByLicense(allBlocksToReload, allowedTypes);

      // Загружаем только разрешенные блоки
      for (const block of filteredBlocks) {
        try {
          await blockService.createBlock(block as any);
        } catch (error) {
          console.warn(`⚠️ Не удалось создать блок ${block.id}:`, error);
        }
      }
    } else if (allBlocksToReload.length > 0) {
      // Fallback: фильтрация вручную если нет licenseService
      const licenseInfo = licenseInfoComputed.value;

      // Получаем список типов блоков из конфигурации пользователя
      let allBlockTypes: string[] = [];

      // Приоритет 1: типы из конфигурации пользователя
      if (props.config?.availableBlockTypes && props.config.availableBlockTypes.length > 0) {
        allBlockTypes = props.config.availableBlockTypes.map(bt => bt.type);
      }
      // Приоритет 2: типы из componentRegistry
      else if (componentRegistry) {
        const registeredComponents = componentRegistry.getAll();
        allBlockTypes = Object.keys(registeredComponents);
      }
      // Приоритет 3: fallback - уникальные типы из блоков
      else {
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
          console.warn(`⚠️ Не удалось создать блок ${block.id}:`, error);
        }
      }
    }

    // Перезагружаем отображение всех блоков
    await loadBlocks();

    // Обновляем watchers для новых блоков
    await setupBreakpointWatchers();
  } catch (error) {
    console.error('Ошибка перезагрузки блоков:', error);
  }
};

const isVueComponent = (block: IBlock) => {
  return block.render?.kind === 'component' && block.render?.framework === 'vue';
};

const getVueComponent = (block: IBlock) => {
  if (!componentRegistry) return null;
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
    // Для api-select полей правильно инициализируем значение по умолчанию
    if (field.type === 'api-select') {
      const isMultiple = field.apiSelectConfig?.multiple ?? false;
      formData[field.field] = field.defaultValue ?? (isMultiple ? [] : null);
    } else {
      formData[field.field] = field.defaultValue;
    }
  });

  showModal.value = true;

  nextTick(() => {
    // initializeCustomFields(); // Удалено
  });
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

  nextTick(() => {
    // initializeCustomFields(); // Удалено
  });
};

// Удалить функции initializeCustomFields, cleanupCustomFields, вызовы document.querySelectorAll,
// Удалить ручную работу с data-атрибутами и добавление кастомных полей в DOM.
// В шаблоне формы (там, где выводятся поля), добавить:
// <template v-for="field in currentBlockFields" :key="field.field">
//   <component
//     v-if="field.type === 'custom'"
//     :is="props.customFieldRendererRegistry?.get(field.customFieldConfig?.rendererId)?.vueComponent || 'input'"
//     v-model="formData[field.field]"
//     :label="field.label"
//     :options="field.customFieldConfig?.options"
//     :required="field.rules?.some(r => r.type === 'required')"
//     :error="formErrors[field.field]?.[0]"
//   />
//   <!-- Аналогичный паттерн подготовить для spacing/repeater/api-select -->
// </template>
// Все изменения состояния формы — только через formData, ошибки через formErrors, никаких дом-атрибутов и querySelector.

// isJoditElement - Удалено

// Обработчик клика по оверлею модалки
const handleOverlayClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  // Если клик был на элементе Jodit, не закрываем модалку
  // if (isJoditElement(target)) { // Удалено
  //   return; // Удалено
  // } // Удалено

  // Если клик был на оверлей (а не на content внутри), закрываем модалку
  if (target.classList.contains('block-builder-modal')) {
    closeModal();
  }
};

// Закрыть модалку
const closeModal = () => {
  showModal.value = false;
  currentType.value = null;
  currentBlockId.value = null;
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  // Очищаем refs к repeater компонентам
  repeaterRefs.clear();
  // Очищаем кастомные поля
  // cleanupCustomFields(); // Удалено
};

// Отправка формы
const handleSubmit = async () => {
  let success = false;

  if (modalMode.value === 'create') {
    success = await createBlock();
  } else {
    success = await updateBlock();
  }

  // Закрываем модалку только если успешно
  if (success) {
    closeModal();
  }
};

// Получить значения из кастомных полей
// const collectCustomFieldValues = () => { // Удалено
//   customFieldInstances.forEach((instance, fieldName) => { // Удалено
//     if (instance.getValue) { // Удалено
//       formData[fieldName] = instance.getValue(); // Удалено
//     } // Удалено
//   }); // Удалено
// }; // Удалено

// Создание блока
const createBlock = async (): Promise<boolean> => {
  if (!currentType.value) return false;

  const blockType = currentBlockType.value;
  if (!blockType) return false;

  // Собираем значения из кастомных полей
  // collectCustomFieldValues(); // Удалено

  // Валидация формы с помощью UniversalValidator
  const fields = currentBlockFields.value;
  const validation = UniversalValidator.validateForm(formData, fields);

  // Очищаем старые ошибки
  Object.keys(formErrors).forEach(key => delete formErrors[key]);

  if (!validation.isValid) {
    // Копируем ошибки в reactive объект
    Object.assign(formErrors, validation.errors);

    // Скроллим к первой ошибке и открываем аккордеон, если нужно
    await handleValidationErrors();

    return false;
  }

  try {
    const newBlock = await blockService.createBlock({
      type: currentType.value,
      props: { ...formData },
      settings: blockType.defaultSettings || {},
      render: blockType.render
    } as any);


    // Если указана позиция, вставляем блок в нужное место
    if (selectedPosition.value !== undefined) {
      // Получаем все блоки и перемещаем новый блок на нужную позицию
      const allBlocks = await blockService.getAllBlocks() as any[];

      const blockIds = allBlocks.map((b: any) => b.id);

      // Удаляем новый блок из конца
      const newBlockIndex = blockIds.indexOf(newBlock.id);
      if (newBlockIndex !== -1) {
        blockIds.splice(newBlockIndex, 1);
      }

      // Вставляем на нужную позицию
      blockIds.splice(selectedPosition.value, 0, newBlock.id);

      // Обновляем порядок
      const reorderResult = await blockService.reorderBlocks(blockIds);
    }

    // Перезагружаем блоки
    await loadBlocks();

    // Перенастраиваем watchers для новых блоков
    await setupBreakpointWatchers();

    (emit as any)('block-added', newBlock as any);
    return true;
  } catch (error) {
    alert('Ошибка создания блока: ' + (error as Error).message);
    return false;
  }
};

// Обновление блока
const updateBlock = async (): Promise<boolean> => {
  if (!currentBlockId.value) return false;

  // Собираем значения из кастомных полей
  // collectCustomFieldValues(); // Удалено

  // Валидация формы с помощью UniversalValidator
  const fields = currentBlockFields.value;
  const validation = UniversalValidator.validateForm(formData, fields);

  // Очищаем старые ошибки
  Object.keys(formErrors).forEach(key => delete formErrors[key]);

  if (!validation.isValid) {
    // Копируем ошибки в reactive объект
    Object.assign(formErrors, validation.errors);

    // Скроллим к первой ошибке и открываем аккордеон, если нужно
    await handleValidationErrors();

    return false;
  }

  try {
    const updated = await blockService.updateBlock(currentBlockId.value, {
      props: { ...formData }
    } as any);

    const index = blocks.value.findIndex((b: IBlock) => b.id === currentBlockId.value);
    if (index !== -1) {
      blocks.value[index] = updated as any;
    }

    // Перенастраиваем watchers после обновления блока
    await setupBreakpointWatchers();

    (emit as any)('block-updated', updated as any);
    return true;
  } catch (error) {
    alert('Ошибка обновления блока: ' + (error as Error).message);
    return false;
  }
};

// Дублирование блока
const handleDuplicateBlock = async (id: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  try {
    const duplicated = await blockService.duplicateBlock(id);
    blocks.value.push(duplicated as any);

    // Перенастраиваем watchers после дублирования
    await setupBreakpointWatchers();

    (emit as any)('block-added', duplicated as any);
  } catch (error) {
    console.error('Ошибка дублирования блока:', error);
    alert('Ошибка дублирования блока: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Удаление блока
const handleDeleteBlock = async (id: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  if (confirm('Удалить блок?')) {
    try {
      // Очищаем watcher для удаляемого блока
      const unsubscribe = breakpointUnsubscribers.get(id);
      if (unsubscribe) {
        unsubscribe();
        breakpointUnsubscribers.delete(id);
      }

      await blockService.deleteBlock(id);
      blocks.value = blocks.value.filter((b: IBlock) => b.id !== id);
      (emit as any)('block-deleted', id);
    } catch (error) {
      console.error('Ошибка удаления блока:', error);
      alert('Ошибка удаления блока: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
};

// Перемещение блоков
const handleMoveUp = async (id: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  const index = blocks.value.findIndex((b: IBlock) => b.id === id);
  if (index > 0) {
    // Создаем новый массив с измененным порядком
    const newBlocks = [...blocks.value];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;

    // Получаем новые ID в правильном порядке
    const blockIds = newBlocks.map((b: IBlock) => b.id);

    // Сохраняем новый порядок в репозитории
    await blockService.reorderBlocks(blockIds);

    // Перезагружаем блоки из репозитория и обновляем watchers
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
    // Создаем новый массив с измененным порядком
    const newBlocks = [...blocks.value];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;

    // Получаем новые ID в правильном порядке
    const blockIds = newBlocks.map((b: IBlock) => b.id);

    // Сохраняем новый порядок в репозитории
    await blockService.reorderBlocks(blockIds);

    // Перезагружаем блоки из репозитория и обновляем watchers
    await loadBlocks();
    await setupBreakpointWatchers();
  }
};

// Переключить видимость блока
const handleToggleVisibility = async (blockId: TBlockId) => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  const block = blocks.value.find((b: IBlock) => b.id === blockId);
  if (!block) return;

  await blockService.setBlockVisible(blockId, !block.visible);
  await loadBlocks();
  await setupBreakpointWatchers();
};

// Получить конфигурацию блока по типу
const getBlockConfig = (type: string) => {
  return availableBlockTypes.value.find((bt: IBlockType) => bt.type === type);
};

// Копирование ID блока
const handleCopyId = async (blockId: TBlockId) => {
  try {
    const success = await copyToClipboard(blockId as string);
    if (success !== false) {
      showNotification(`ID скопирован: ${blockId}`, 'success');
    }
  } catch (e) {
    showNotification('Ошибка копирования ID', 'error');
  }
};

// Показать уведомление
const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const notification = document.createElement('div');
  notification.className = 'block-builder-notification';
  notification.textContent = message;

  const colors = {
    success: '#4caf50',
    error: '#dc3545',
    info: '#007bff'
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
  document.body.appendChild(notification);

  // Удаляем уведомление через указанное время
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => notification.remove(), 300);
  }, NOTIFICATION_DISPLAY_DURATION_MS);
};

// Сохранение всех блоков
const handleSave = async () => {
  // Если колбэк сохранения не указан, показываем предупреждение
  if (!props.onSave) {
    showNotification('Функция сохранения не настроена. Передайте onSave в пропсы компонента.', 'error');
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
    console.error('Ошибка сохранения блоков:', error);
    showNotification('Произошла ошибка при сохранении', 'error');
  }
};

// Очистка всех блоков
const handleClearAll = async () => {
  if (!props.isEdit) {
    return; // Блокируем если режим редактирования выключен
  }
  if (confirm('Удалить все блоки?')) {
    try {
      await blockService.clearAllBlocks();
      blocks.value = [];
    } catch (error) {
      console.error('Ошибка очистки блоков:', error);
      alert(`Ошибка очистки блоков: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// ===== Spacing Utilities =====

// Получение inline стилей для блока (margin + CSS переменные для padding)
const getBlockSpacingStyles = (block: IBlock): Record<string, string> => {
  // Проверяем, есть ли spacing в props блока
  const spacing = block.props?.spacing as ISpacingData | undefined;

  if (!spacing || Object.keys(spacing).length === 0) {
    return {};
  }

  // Получаем конфиг блока для определения breakpoints
  const blockConfig = getBlockConfig(block.type) as any;
  const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;

  return getBlockInlineStyles(spacing, 'spacing', breakpoints);
};

const getUserComponentProps = (block: IBlock): Record<string, any> => {
  if (!block.props) return {};
  const { spacing, ...userProps } = block.props;
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

  const modalContent = document.querySelector('.block-builder-modal-body') as HTMLElement;

  if (!modalContent) {
    return;
  }

  // Добавляем небольшую задержку перед скроллом для стабильной позиции
  setTimeout(async () => {
    // Находим первую ошибку
    const firstErrorKey = Object.keys(formErrors)[0];
    if (!firstErrorKey) return;

    const errorInfo = parseErrorKey(firstErrorKey);

    // Если ошибка в repeater - СНАЧАЛА открываем аккордеон, ПОТОМ скроллим
    if (errorInfo.isRepeaterField && errorInfo.repeaterFieldName) {
      await openRepeaterAccordion(errorInfo.repeaterFieldName, errorInfo.repeaterIndex || 0);
      // Скролл произойдет автоматически внутри openRepeaterAccordion после раскрытия
    } else {
      // Для обычных полей скроллим сразу
      scrollToFirstError(modalContent, formErrors, {
        offset: 40,
        behavior: 'smooth',
        autoFocus: true
      });
    }
  }, 50); // Небольшая задержка для завершения отрисовки ошибок
};

/**
 * Открытие аккордеона в repeater для конкретного элемента
 */
const openRepeaterAccordion = async (repeaterFieldName: string, itemIndex: number): Promise<void> => {
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
          return errorInfo.isRepeaterField &&
                 errorInfo.repeaterFieldName === repeaterFieldName &&
                 errorInfo.repeaterIndex === itemIndex;
        });

        if (errorKey) {
          const errorInfo = parseErrorKey(errorKey);

          const fieldElement = findFieldElement(modalContent, errorInfo);

          if (fieldElement) {
            scrollToElement(fieldElement, {
              offset: 40,
              behavior: 'smooth'
            });
            focusElement(fieldElement);
          } else {
            scrollToFirstError(modalContent, formErrors, {
              offset: 40,
              behavior: 'smooth',
              autoFocus: true
            });
          }
        } else {
          scrollToFirstError(modalContent, formErrors, {
            offset: 40,
            behavior: 'smooth',
            autoFocus: true
          });
        }
      }
    }
  } else {
    const modalContent = document.querySelector('.block-builder-modal-body') as HTMLElement;
    if (modalContent) {
      const errorKey = Object.keys(formErrors).find(key => {
        const errorInfo = parseErrorKey(key);
        return errorInfo.isRepeaterField &&
               errorInfo.repeaterFieldName === repeaterFieldName &&
               errorInfo.repeaterIndex === itemIndex;
      });

      if (errorKey) {
        const errorInfo = parseErrorKey(errorKey);

        const fieldElement = findFieldElement(modalContent, errorInfo);

        if (fieldElement) {
          scrollToElement(fieldElement, {
            offset: 40,
            behavior: 'smooth'
          });
          focusElement(fieldElement);
        } else {
          scrollToFirstError(modalContent, formErrors, {
            offset: 40,
            behavior: 'smooth',
            autoFocus: true
          });
        }
      } else {
        scrollToFirstError(modalContent, formErrors, {
          offset: 40,
          behavior: 'smooth',
          autoFocus: true
        });
      }
    }
  }
};

const updateBodyEditModeClass = (isEdit: boolean) => {
  if (isEdit) {
    document.body.classList.add('bb-is-edit-mode');
  } else {
    document.body.classList.remove('bb-is-edit-mode');
  }
};

watch(() => props.isEdit, (newValue) => {
  updateBodyEditModeClass(newValue);
}, { immediate: true });

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
  document.body.classList.remove('bb-is-edit-mode');
});
</script>
