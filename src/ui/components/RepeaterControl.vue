
<template>
  <div class="repeater-control" :data-field-name="fieldName">
    <div class="repeater-control__header">
      <label class="repeater-control__label">
        {{ label }}
        <span v-if="isRequired" class="required">*</span>
      </label>
      <span v-if="itemCount > 0" class="repeater-control__count">
        {{ itemCount }} {{ getItemCountLabel(itemCount) }}
      </span>
    </div>

    
    <div class="repeater-control__items">
      <div
        v-for="(item, index) in items"
        :key="item._id"
        class="repeater-control__item"
        :class="{ 'repeater-control__item--collapsed': collapsedItems[item._id] }"
      >
        
        <div class="repeater-control__item-header">
          <span class="repeater-control__item-title">
            {{ itemTitle }} #{{ index + 1 }}
          </span>
          <div class="repeater-control__item-actions">
            <button
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--collapse"
              @click="toggleCollapse(item._id)"
              :title="collapsedItems[item._id] ? 'Развернуть' : 'Свернуть'"
            >
              {{ collapsedItems[item._id] ? '▼' : '▲' }}
            </button>
            <button
              v-if="index > 0"
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--move"
              @click="moveItem(index, index - 1)"
              title="Переместить вверх"
            >
              ↑
            </button>
            <button
              v-if="index < items.length - 1"
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--move"
              @click="moveItem(index, index + 1)"
              title="Переместить вниз"
            >
              ↓
            </button>
            <button
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--remove"
              @click="removeItem(index)"
              :disabled="!canRemove"
              :title="removeButtonText"
            >
              ✕
            </button>
          </div>
        </div>

        
        <div
          v-if="!collapsedItems[item._id]"
          class="repeater-control__item-fields"
        >
          <div
            v-for="field in fields"
            :key="field.field"
            class="repeater-control__field"
            :class="{ [CSS_CLASSES.ERROR]: hasFieldError(index, field.field) }"
          >
            <label
              :for="getFieldId(item._id, field.field)"
              class="repeater-control__field-label"
            >
              {{ field.label }}
              <span v-if="isFieldRequired(field)" class="required">*</span>
            </label>

            
            <input
              v-if="field.type === 'text' || field.type === 'url' || field.type === 'email'"
              :id="getFieldId(item._id, field.field)"
              :type="field.type"
              v-model="item[field.field]"
              :placeholder="field.placeholder || ''"
              class="repeater-control__field-input"
              :class="{ [CSS_CLASSES.ERROR]: hasFieldError(index, field.field) }"
              @input="onFieldChange"
              :data-field-name="field.field"
            />

            
            <input
              v-else-if="field.type === 'number'"
              :id="getFieldId(item._id, field.field)"
              type="number"
              v-model.number="item[field.field]"
              :placeholder="field.placeholder || ''"
              class="repeater-control__field-input"
              :class="{ [CSS_CLASSES.ERROR]: hasFieldError(index, field.field) }"
              @input="onFieldChange"
              :data-field-name="field.field"
            />

            
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="getFieldId(item._id, field.field)"
              v-model="item[field.field]"
              :placeholder="field.placeholder || ''"
              class="repeater-control__field-textarea"
              :class="{ [CSS_CLASSES.ERROR]: hasFieldError(index, field.field) }"
              rows="3"
              @input="onFieldChange"
              :data-field-name="field.field"
            />

            
            <select
              v-else-if="field.type === 'select'"
              :id="getFieldId(item._id, field.field)"
              v-model="item[field.field]"
              class="repeater-control__field-select"
              :class="{ [CSS_CLASSES.ERROR]: hasFieldError(index, field.field) }"
              @change="onFieldChange"
              :data-field-name="field.field"
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

            
            <label
              v-else-if="field.type === 'checkbox'"
              class="repeater-control__field-checkbox"
            >
              <input
                :id="getFieldId(item._id, field.field)"
                type="checkbox"
                v-model="item[field.field]"
                @change="onFieldChange"
                :data-field-name="field.field"
              />
              <span class="repeater-control__field-checkbox-label">{{ field.label }}</span>
            </label>

            
            <input
              v-else-if="field.type === 'color'"
              :id="getFieldId(item._id, field.field)"
              type="color"
              v-model="item[field.field]"
              class="repeater-control__field-color"
            />

            
            <ImageUploadField
              v-else-if="field.type === 'image'"
              :model-value="item[field.field]"
              @update:model-value="updateItemField(index, field.field, $event)"
              :label="''"
              :required="isFieldRequired(field)"
              :error="hasFieldError(index, field.field) ? getFieldErrors(index, field.field)[0] : ''"
              :image-upload-config="field.imageUploadConfig"
              :dataRepeaterField="fieldName"
              :dataRepeaterIndex="index"
              :dataRepeaterItemField="field.field"
            />

            
            <div v-if="field.type !== 'image' && hasFieldError(index, field.field)" class="repeater-control__field-error">
              {{ getFieldErrors(index, field.field)[0] }}
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <button
      type="button"
      class="repeater-control__add-btn"
      @click="addItem"
      :disabled="!canAdd"
    >
      + {{ addButtonText }}
    </button>

    
    <div v-if="effectiveMin || max" class="repeater-control__hint">
      <span v-if="effectiveMin && itemCount < effectiveMin" class="repeater-control__hint--error">
        {{ repeaterMinText }} {{ effectiveMin }}
      </span>
      <span v-else-if="max && itemCount >= max" class="repeater-control__hint--warning">
        {{ repeaterMaxText }} {{ max }}
      </span>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { UI_STRINGS, CSS_CLASSES } from '../../utils/constants';
import ImageUploadField from './ImageUploadField.vue';

export default {
  name: 'RepeaterControl',
  props: {
    fieldName: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
    },
    fields: {
      type: Array,
      required: true
    },
    rules: {
      type: Array,
      default: () => []
    },
    errors: {
      type: Object,
      default: () => ({})
    },
    addButtonText: {
      type: String,
      default: UI_STRINGS.repeaterAdd
    },
    removeButtonText: {
      type: String,
      default: UI_STRINGS.repeaterRemove
    },
    itemTitle: {
      type: String,
      default: UI_STRINGS.repeaterItem
    },
    min: {
      type: Number,
      default: undefined // undefined значит - определяется автоматически
    },
    max: {
      type: Number,
      default: undefined
    },
    defaultItemValue: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const items = ref([]);
    const collapsedItems = ref({});
    let idCounter = 0;

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
          ...item
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
      if (!canAdd.value) return;

      items.value.push(createNewItem());
      emitUpdate();
    };

    const removeItem = (index) => {
      if (!canRemove.value) return;

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

    const toggleCollapse = (itemId) => {
      if (collapsedItems.value[itemId]) {
        delete collapsedItems.value[itemId];
      } else {
        collapsedItems.value[itemId] = true;
      }
    };

    const onFieldChange = () => {
      emitUpdate();
    };

    const updateItemField = (index, fieldName, value) => {
      items.value[index][fieldName] = value;
      emitUpdate();
    };

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

    const isFieldRequired = (field) => {
      return field.rules?.some(rule => rule.type === 'required');
    };

    const getFieldErrors = (index, fieldName) => {
      const errorKey = `${props.fieldName}[${index}].${fieldName}`;
      return props.errors[errorKey] || [];
    };

    const hasFieldError = (index, fieldName) => {
      return getFieldErrors(index, fieldName).length > 0;
    };

    const getItemCountLabel = (count) => {
      const mod10 = count % 10;
      const mod100 = count % 100;

      if (mod10 === 1 && mod100 !== 11) {
        return props.itemTitle.toLowerCase();
      } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return props.itemTitle.toLowerCase() + 'а';
      } else {
        return props.itemTitle.toLowerCase() + 'ов';
      }
    };

    const repeaterMinText = computed(() => {
      return UI_STRINGS?.repeaterMin || 'Минимум:';
    });

    const repeaterMaxText = computed(() => {
      return UI_STRINGS?.repeaterMax || 'Максимум:';
    });

    watch(() => props.modelValue, (newValue) => {
      if (JSON.stringify(newValue) !== JSON.stringify(items.value.map(({ _id, ...rest }) => rest))) {
        initializeItems();
      }
    }, { deep: true });

    onMounted(() => {
      initializeItems();
    });

    const expandItem = (index) => {
      const item = items.value[index];
      if (item && collapsedItems.value[item._id]) {
        delete collapsedItems.value[item._id];
      }
    };

    const isItemCollapsed = (index) => {
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
      onFieldChange,
      getFieldId,
      isFieldRequired,
      getItemCountLabel,
      getFieldErrors,
      hasFieldError,
      expandItem,
      isItemCollapsed,
      updateItemField,
      repeaterMinText,
      repeaterMaxText,
      CSS_CLASSES
    };
  },
  components: {
    ImageUploadField
  }
};
</script>

<style>
/* Стили будут в отдельном файле */
</style>

