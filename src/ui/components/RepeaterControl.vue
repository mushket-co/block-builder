<template>
  <div class="bb-repeater-control" :data-field-name="fieldName">
    <div class="bb-repeater-control__header">
      <label class="bb-repeater-control__label">
        {{ label }}
        <span v-if="isRequired" class="bb-required">*</span>
      </label>
      <span v-if="itemCount > 0" class="bb-repeater-control__count">
        {{ getCountText(itemCount) }}
      </span>
    </div>

    <div class="bb-repeater-control__items">
      <div
        v-for="(item, index) in items"
        :key="item._id"
        class="bb-repeater-control__item"
        :class="{ 'bb-repeater-control__item--collapsed': collapsedItems[item._id] }"
      >
        <div class="bb-repeater-control__item-header">
          <span class="bb-repeater-control__item-title"> {{ itemTitle }} #{{ index + 1 }} </span>
          <div class="bb-repeater-control__item-actions">
            <button
              type="button"
              class="bb-repeater-control__item-btn bb-repeater-control__item-btn--collapse"
              :title="collapsedItems[item._id] ? 'Развернуть' : 'Свернуть'"
              @click="toggleCollapse(item._id)"
            >
              {{ collapsedItems[item._id] ? '▼' : '▲' }}
            </button>
            <button
              v-if="index > 0"
              type="button"
              class="bb-repeater-control__item-btn bb-repeater-control__item-btn--move"
              title="Переместить вверх"
              @click="moveItem(index, index - 1)"
            >
              ↑
            </button>
            <button
              v-if="index < items.length - 1"
              type="button"
              class="bb-repeater-control__item-btn bb-repeater-control__item-btn--move"
              title="Переместить вниз"
              @click="moveItem(index, index + 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="bb-repeater-control__item-btn bb-repeater-control__item-btn--remove"
              :disabled="!canRemove"
              :title="removeButtonText"
              @click="removeItem(index)"
            >
              ✕
            </button>
          </div>
        </div>

        <div v-if="!collapsedItems[item._id]" class="bb-repeater-control__item-fields">
          <FormField
            v-for="field in fields"
            :key="field.field"
            :field="field"
            :field-id="getFieldId(item._id, field.field)"
            :model-value="item[field.field]"
            :required="isFieldRequired(field)"
            :error="hasFieldError(index, field.field) ? getFieldErrors(index, field.field)[0] : ''"
            :container-class="
              hasFieldError(index, field.field)
                ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
                : CSS_CLASSES.FORM_GROUP
            "
            @update:model-value="updateItemField(index, field.field, $event)"
          >
            <template #default="{ field: slotField, modelValue: slotModelValue, error: slotError }">
              <template v-if="slotField.type === 'api-select'">
                <ApiSelectField
                  v-if="isApiSelectFieldAllowed(slotField) && apiSelectUseCaseValue"
                  :model-value="slotModelValue"
                  :config="toFormFieldConfig(slotField)"
                  :validation-error="slotError"
                  :api-select-use-case="apiSelectUseCaseValue"
                  @update:model-value="updateItemField(index, slotField.field, $event)"
                />
                <div v-else class="bb-warning-box">⚠️ {{ apiSelectRestrictionMessage }}</div>
              </template>

              <template v-else-if="slotField.type === 'custom'">
                <label :for="getFieldId(item._id, slotField.field)" class="bb-form-label">
                  {{ slotField.label }}
                  <span v-if="isFieldRequired(slotField)" class="bb-required">*</span>
                </label>
                <CustomField
                  v-if="
                    isCustomFieldAllowed(slotField) &&
                    customFieldRendererRegistryValue?.get(slotField.customFieldConfig?.rendererId)
                  "
                  :field="toFormFieldConfig(slotField)"
                  :model-value="slotModelValue"
                  :form-errors="formErrors"
                  :custom-field-renderer-registry="customFieldRendererRegistryValue"
                  :is-field-required="isFieldRequired"
                  @update:model-value="updateItemField(index, slotField.field, $event)"
                />
                <div v-else class="bb-warning-box">⚠️ {{ customFieldRestrictionMessage }}</div>
              </template>

              <ImageUploadField
                v-else-if="slotField.type === 'image'"
                :model-value="slotModelValue"
                :label="''"
                :required="isFieldRequired(slotField)"
                :error="slotError"
                :image-upload-config="slotField.imageUploadConfig"
                :data-repeater-field="fieldName"
                :data-repeater-index="index"
                :data-repeater-item-field="slotField.field"
                @update:model-value="updateItemField(index, slotField.field, $event)"
              />
            </template>
          </FormField>
        </div>
      </div>
    </div>

    <button type="button" class="bb-repeater-control__add-btn" :disabled="!canAdd" @click="addItem">
      + {{ addButtonText }}
    </button>

    <div v-if="effectiveMin || max" class="bb-repeater-control__hint">
      <span
        v-if="effectiveMin && itemCount < effectiveMin"
        class="bb-repeater-control__hint--error"
      >
        {{ repeaterMinText }} {{ effectiveMin }}
      </span>
      <span v-else-if="max && itemCount >= max" class="bb-repeater-control__hint--warning">
        {{ repeaterMaxText }} {{ max }}
      </span>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';

import { CSS_CLASSES, UI_STRINGS } from '../../utils/constants';
import { getRepeaterCountText } from '../../utils/repeaterCountText';
import ApiSelectField from './ApiSelectField.vue';
import CustomField from './CustomField.vue';
import { FormField } from './form-fields';
import ImageUploadField from './ImageUploadField.vue';

export default {
  name: 'RepeaterControl',
  components: {
    FormField,
    ApiSelectField,
    CustomField,
    ImageUploadField,
  },

  props: {
    fieldName: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    modelValue: {
      type: Array,
      default: () => [],
    },

    fields: {
      type: Array,
      required: true,
    },

    rules: {
      type: Array,
      default: () => [],
    },

    errors: {
      type: Object,
      default: () => ({}),
    },

    addButtonText: {
      type: String,
      default: UI_STRINGS.repeaterAdd,
    },

    removeButtonText: {
      type: String,
      default: UI_STRINGS.repeaterRemove,
    },

    itemTitle: {
      type: String,
      default: UI_STRINGS.repeaterItem,
    },

    countLabelVariants: {
      type: Object,
      default: null,
    },

    min: {
      type: Number,
      default: undefined, // undefined значит - определяется автоматически
    },

    max: {
      type: Number,
      default: undefined,
    },

    defaultItemValue: {
      type: Object,
      default: () => ({}),
    },

    apiSelectUseCase: {
      type: Object,
      default: null,
    },

    isApiSelectAvailable: {
      type: Function,
      default: () => false,
    },

    getApiSelectRestrictionMessage: {
      type: Function,
      default: () => 'API Select поля недоступны.',
    },

    customFieldRendererRegistry: {
      type: Object,
      default: null,
    },

    isCustomFieldAvailable: {
      type: Function,
      default: () => false,
    },

    getCustomFieldRestrictionMessage: {
      type: Function,
      default: () => 'Кастомные поля недоступны.',
    },
  },

  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const items = ref([]);
    const collapsedItems = ref({});
    let idCounter = 0;

    const apiSelectRestrictionMessage = computed(() => {
      const message = props.getApiSelectRestrictionMessage();
      return typeof message === 'string' && message.trim().length > 0
        ? message
        : 'API Select поля недоступны.';
    });

    const customFieldRestrictionMessage = computed(() => {
      const message = props.getCustomFieldRestrictionMessage();
      return typeof message === 'string' && message.trim().length > 0
        ? message
        : 'Кастомные поля недоступны.';
    });

    const isRequired = computed(() => {
      return props.rules?.some(rule => rule.type === 'required') ?? false;
    });

    const effectiveMin = computed(() => {
      if (!isRequired.value) {
        return 0;
      }
      if (props.min !== undefined) {
        return props.min;
      }
      return 1;
    });

    const initializeItems = () => {
      if (props.modelValue && props.modelValue.length > 0) {
        items.value = props.modelValue.map(item => ({
          _id: `item-${idCounter++}`,
          ...item,
        }));
      } else if (effectiveMin.value > 0) {
        for (let i = 0; i < effectiveMin.value; i++) {
          items.value.push(createNewItem());
        }
        emitUpdate();
      }
    };

    const createNewItem = () => {
      const newItem = { _id: `item-${idCounter++}` };

      props.fields.forEach(field => {
        if (props.defaultItemValue && props.defaultItemValue[field.field] !== undefined) {
          newItem[field.field] = props.defaultItemValue[field.field];
        } else if (field.defaultValue !== undefined) {
          newItem[field.field] = field.defaultValue;
        } else {
          switch (field.type) {
            case 'checkbox':
              newItem[field.field] = false;
              break;
            case 'number':
              newItem[field.field] = 0;
              break;
            case 'api-select':
              newItem[field.field] = field.apiSelectConfig?.multiple ? [] : null;
              break;
            case 'custom':
              newItem[field.field] = '';
              break;
            default:
              newItem[field.field] = '';
          }
        }
      });

      return newItem;
    };

    const itemCount = computed(() => items.value.length);

    const canAdd = computed(() => {
      return !props.max || itemCount.value < props.max;
    });

    const canRemove = computed(() => {
      return itemCount.value > effectiveMin.value;
    });

    const addItem = () => {
      if (!canAdd.value) {
        return;
      }

      items.value.push(createNewItem());
      emitUpdate();
    };

    const removeItem = index => {
      if (!canRemove.value) {
        return;
      }

      const item = items.value[index];
      items.value.splice(index, 1);

      if (collapsedItems.value[item._id]) {
        delete collapsedItems.value[item._id];
      }

      emitUpdate();
    };

    const moveItem = (fromIndex, toIndex) => {
      const item = items.value[fromIndex];
      items.value.splice(fromIndex, 1);
      items.value.splice(toIndex, 0, item);
      emitUpdate();
    };

    const toggleCollapse = itemId => {
      if (collapsedItems.value[itemId]) {
        delete collapsedItems.value[itemId];
      } else {
        collapsedItems.value[itemId] = true;
      }
    };

    const updateItemField = (index, fieldName, value) => {
      items.value[index][fieldName] = value;
      emitUpdate();
    };

    const toFormFieldConfig = field => {
      return {
        field: field.field,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        defaultValue: field.defaultValue,
        options: field.options,
        rules: field.rules,
        apiSelectConfig: field.apiSelectConfig,
        customFieldConfig: field.customFieldConfig,
        imageUploadConfig: field.imageUploadConfig,
      };
    };

    const isApiSelectFieldAllowed = field => {
      return props.isApiSelectAvailable ? props.isApiSelectAvailable(field) : false;
    };

    const isCustomFieldAllowed = field => {
      return props.isCustomFieldAvailable ? props.isCustomFieldAvailable(field) : false;
    };

    const apiSelectUseCaseValue = computed(() => props.apiSelectUseCase);
    const customFieldRendererRegistryValue = computed(() => props.customFieldRendererRegistry);
    const formErrors = computed(() => props.errors);

    const emitUpdate = () => {
      const cleanItems = items.value.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });
      emit('update:modelValue', cleanItems);
    };

    const getFieldId = (itemId, fieldName) => {
      return `repeater-${itemId}-${fieldName}`;
    };

    const isFieldRequired = field => {
      return field.rules?.some(rule => rule.type === 'required');
    };

    const getFieldErrors = (index, fieldName) => {
      const errorKey = `${props.fieldName}[${index}].${fieldName}`;
      return props.errors[errorKey] || [];
    };

    const hasFieldError = (index, fieldName) => {
      return getFieldErrors(index, fieldName).length > 0;
    };

    const getCountText = count => {
      return getRepeaterCountText(count, props.countLabelVariants || undefined);
    };

    const repeaterMinText = computed(() => {
      return UI_STRINGS?.repeaterMin || 'Минимум:';
    });

    const repeaterMaxText = computed(() => {
      return UI_STRINGS?.repeaterMax || 'Максимум:';
    });

    watch(
      () => props.modelValue,
      newValue => {
        if (
          JSON.stringify(newValue) !== JSON.stringify(items.value.map(({ _id, ...rest }) => rest))
        ) {
          initializeItems();
        }
      },
      { deep: true }
    );

    onMounted(() => {
      initializeItems();
    });

    const expandItem = index => {
      const item = items.value[index];
      if (item && collapsedItems.value[item._id]) {
        delete collapsedItems.value[item._id];
      }
    };

    const isItemCollapsed = index => {
      const item = items.value[index];
      return item ? !!collapsedItems.value[item._id] : false;
    };

    return {
      items,
      collapsedItems,
      itemCount,
      canAdd,
      canRemove,
      effectiveMin,
      isRequired,
      addItem,
      removeItem,
      moveItem,
      toggleCollapse,
      getFieldId,
      isFieldRequired,
      getCountText,
      getFieldErrors,
      hasFieldError,
      expandItem,
      isItemCollapsed,
      updateItemField,
      repeaterMinText,
      repeaterMaxText,
      apiSelectRestrictionMessage,
      customFieldRestrictionMessage,
      toFormFieldConfig,
      isApiSelectFieldAllowed,
      isCustomFieldAllowed,
      apiSelectUseCaseValue,
      customFieldRendererRegistryValue,
      formErrors,
      CSS_CLASSES,
    };
  },
};
</script>

<style></style>
