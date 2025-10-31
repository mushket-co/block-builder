<!--
  RepeaterControl - Компонент для управления массивами объектов
  Используется для динамического добавления/удаления элементов (карточек, слайдов и т.д.)
-->
<template>
  <div class="repeater-control">
    <div class="repeater-control__header">
      <label class="repeater-control__label">
        {{ label }}
        <span v-if="isRequired" class="required">*</span>
      </label>
      <span v-if="itemCount > 0" class="repeater-control__count">
        {{ itemCount }} {{ getItemCountLabel(itemCount) }}
      </span>
    </div>

    <!-- Список элементов -->
    <div class="repeater-control__items">
      <div
        v-for="(item, index) in items"
        :key="item._id"
        class="repeater-control__item"
        :class="{ 'repeater-control__item--collapsed': collapsible && collapsedItems[item._id] }"
      >
        <!-- Заголовок элемента -->
        <div class="repeater-control__item-header">
          <span class="repeater-control__item-title">
            {{ itemTitle }} #{{ index + 1 }}
          </span>
          <div class="repeater-control__item-actions">
            <button
              v-if="collapsible"
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

        <!-- Поля элемента -->
        <div
          v-if="!collapsible || !collapsedItems[item._id]"
          class="repeater-control__item-fields"
        >
          <div
            v-for="field in fields"
            :key="field.field"
            class="repeater-control__field"
            :class="{ 'error': hasFieldError(index, field.field) }"
          >
            <label
              :for="getFieldId(item._id, field.field)"
              class="repeater-control__field-label"
            >
              {{ field.label }}
              <span v-if="isFieldRequired(field)" class="required">*</span>
            </label>

            <!-- Text input -->
            <input
              v-if="field.type === 'text' || field.type === 'url' || field.type === 'email'"
              :id="getFieldId(item._id, field.field)"
              :type="field.type"
              v-model="item[field.field]"
              :placeholder="field.placeholder || ''"
              class="repeater-control__field-input"
              :class="{ 'error': hasFieldError(index, field.field) }"
              @input="onFieldChange"
              :data-field-name="field.field"
            />

            <!-- Number input -->
            <input
              v-else-if="field.type === 'number'"
              :id="getFieldId(item._id, field.field)"
              type="number"
              v-model.number="item[field.field]"
              :placeholder="field.placeholder || ''"
              class="repeater-control__field-input"
              :class="{ 'error': hasFieldError(index, field.field) }"
              @input="onFieldChange"
              :data-field-name="field.field"
            />

            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="getFieldId(item._id, field.field)"
              v-model="item[field.field]"
              :placeholder="field.placeholder || ''"
              class="repeater-control__field-textarea"
              :class="{ 'error': hasFieldError(index, field.field) }"
              rows="3"
              @input="onFieldChange"
              :data-field-name="field.field"
            />

            <!-- Select -->
            <select
              v-else-if="field.type === 'select'"
              :id="getFieldId(item._id, field.field)"
              v-model="item[field.field]"
              class="repeater-control__field-select"
              :class="{ 'error': hasFieldError(index, field.field) }"
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

            <!-- Checkbox -->
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

            <!-- Color -->
            <input
              v-else-if="field.type === 'color'"
              :id="getFieldId(item._id, field.field)"
              type="color"
              v-model="item[field.field]"
              class="repeater-control__field-color"
              @input="onFieldChange"
              :data-field-name="field.field"
            />

            <!-- Сообщение об ошибке (общее для всех типов полей) -->
            <div v-if="hasFieldError(index, field.field)" class="repeater-control__field-error">
              {{ getFieldErrors(index, field.field)[0] }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка добавления -->
    <button
      type="button"
      class="repeater-control__add-btn"
      @click="addItem"
      :disabled="!canAdd"
    >
      + {{ addButtonText }}
    </button>

    <!-- Подсказка о лимитах -->
    <div v-if="effectiveMin || max" class="repeater-control__hint">
      <span v-if="effectiveMin && itemCount < effectiveMin" class="repeater-control__hint--error">
        {{ (UI_STRINGS && UI_STRINGS.repeaterMin) ? UI_STRINGS.repeaterMin : 'Минимум:' }} {{ effectiveMin }}
      </span>
      <span v-else-if="max && itemCount >= max" class="repeater-control__hint--warning">
        {{ (UI_STRINGS && UI_STRINGS.repeaterMax) ? UI_STRINGS.repeaterMax : 'Максимум:' }} {{ max }}
      </span>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { UI_STRINGS } from '../../utils/constants';

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
    },
    collapsible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // Внутреннее состояние элементов (с уникальными _id для key)
    const items = ref([]);
    const collapsedItems = ref({});
    let idCounter = 0;

    // Проверяем, есть ли правило required
    const isRequired = computed(() => {
      return props.rules?.some(rule => rule.type === 'required') ?? false;
    });

    // Вычисляем эффективный минимум
    // Логика:
    // 1. Нет required в rules → всегда min = 0 (можно удалить все), min из config игнорируется
    // 2. Есть required + задан min в config → используем min из config (приоритет)
    // 3. Есть required, но min не задан → min = 1 (по умолчанию)
    const effectiveMin = computed(() => {
      // Если нет required → всегда можно удалить все
      if (!isRequired.value) {
        return 0;
      }
      // Если есть required и задан min явно → используем его
      if (props.min !== undefined) {
        return props.min;
      }
      // Если есть required, но min не задан → по умолчанию 1
      return 1;
    });

    // Инициализация элементов из modelValue
    const initializeItems = () => {
      if (props.modelValue && props.modelValue.length > 0) {
        items.value = props.modelValue.map(item => ({
          _id: `item-${idCounter++}`,
          ...item
        }));
      } else if (effectiveMin.value > 0) {
        // Создаем минимальное количество элементов
        for (let i = 0; i < effectiveMin.value; i++) {
          items.value.push(createNewItem());
        }
        emitUpdate();
      }
    };

    // Создание нового элемента
    const createNewItem = () => {
      const newItem = { _id: `item-${idCounter++}` };

      // Заполняем значениями по умолчанию
      props.fields.forEach(field => {
        if (props.defaultItemValue && props.defaultItemValue[field.field] !== undefined) {
          newItem[field.field] = props.defaultItemValue[field.field];
        } else if (field.defaultValue !== undefined) {
          newItem[field.field] = field.defaultValue;
        } else {
          // Значения по умолчанию по типу
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

    // Количество элементов
    const itemCount = computed(() => items.value.length);

    // Можно ли добавить элемент
    const canAdd = computed(() => {
      return !props.max || itemCount.value < props.max;
    });

    // Можно ли удалить элемент
    const canRemove = computed(() => {
      return itemCount.value > effectiveMin.value;
    });

    // Добавление элемента
    const addItem = () => {
      if (!canAdd.value) return;

      items.value.push(createNewItem());
      emitUpdate();
    };

    // Удаление элемента
    const removeItem = (index) => {
      if (!canRemove.value) return;

      const item = items.value[index];
      items.value.splice(index, 1);

      // Удаляем из collapsed если был
      if (collapsedItems.value[item._id]) {
        delete collapsedItems.value[item._id];
      }

      emitUpdate();
    };

    // Перемещение элемента
    const moveItem = (fromIndex, toIndex) => {
      const item = items.value[fromIndex];
      items.value.splice(fromIndex, 1);
      items.value.splice(toIndex, 0, item);
      emitUpdate();
    };

    // Сворачивание/разворачивание элемента
    const toggleCollapse = (itemId) => {
      if (collapsedItems.value[itemId]) {
        delete collapsedItems.value[itemId];
      } else {
        collapsedItems.value[itemId] = true;
      }
    };

    // Изменение поля
    const onFieldChange = () => {
      emitUpdate();
    };

    // Отправка обновлений
    const emitUpdate = () => {
      // Убираем внутренний _id перед отправкой
      const cleanItems = items.value.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });
      emit('update:modelValue', cleanItems);
    };

    // Получение ID поля
    const getFieldId = (itemId, fieldName) => {
      return `repeater-${itemId}-${fieldName}`;
    };

    // Проверка обязательности поля
    const isFieldRequired = (field) => {
      return field.rules?.some(rule => rule.type === 'required');
    };

    // Получение ошибок для конкретного поля конкретного элемента
    // Формат ключа ошибки: "cards[0].title", "slides[1].url" и т.д.
    const getFieldErrors = (index, fieldName) => {
      const errorKey = `${props.fieldName}[${index}].${fieldName}`;
      return props.errors[errorKey] || [];
    };

    // Проверка, есть ли ошибка у поля
    const hasFieldError = (index, fieldName) => {
      return getFieldErrors(index, fieldName).length > 0;
    };

    // Получение правильного склонения для счетчика
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

    // Следим за изменениями modelValue
    watch(() => props.modelValue, (newValue) => {
      if (JSON.stringify(newValue) !== JSON.stringify(items.value.map(({ _id, ...rest }) => rest))) {
        initializeItems();
      }
    }, { deep: true });

    onMounted(() => {
      initializeItems();
    });

    // Экспортируемый метод для программного раскрытия элемента (для скролла к ошибкам)
    const expandItem = (index) => {
      const item = items.value[index];
      if (item && collapsedItems.value[item._id]) {
        delete collapsedItems.value[item._id];
      }
    };

    // Экспортируемый метод для проверки, свернут ли элемент
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
      isItemCollapsed
    };
  }
};
</script>

<style>
/* Стили будут в отдельном файле */
</style>

