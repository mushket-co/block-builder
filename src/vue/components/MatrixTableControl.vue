<template>
  <div :class="CSS_CLASSES.MATRIX_TABLE_CONTROL" :data-field-name="fieldName">
    <div :class="CSS_CLASSES.REPEATER_CONTROL_HEADER">
      <label :class="CSS_CLASSES.REPEATER_CONTROL_LABEL">
        {{ label }}
        <span v-if="required" :class="CSS_CLASSES.REQUIRED">*</span>
      </label>
    </div>

    <div :class="CSS_CLASSES.MATRIX_TABLE_CONTROL_TABS">
      <button
        type="button"
        :class="[
          CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB,
          { [CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB_ACTIVE]: activeTab === 'structure' },
        ]"
        @click="activeTab = 'structure'"
      >
        {{ structureTabLabel }}
      </button>
      <button
        type="button"
        :class="[
          CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB,
          { [CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB_ACTIVE]: activeTab === 'content' },
        ]"
        @click="activeTab = 'content'"
      >
        {{ contentTabLabel }}
      </button>
    </div>

    <div v-if="activeTab === 'structure'" :class="CSS_CLASSES.MATRIX_TABLE_CONTROL_PANEL">
      <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEMS">
        <div
          v-for="(column, index) in tableValue.tableHead"
          :key="column.id"
          :class="CSS_CLASSES.REPEATER_CONTROL_ITEM"
        >
          <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER">
            <span :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_TITLE">
              {{ columnItemTitle }} {{ index + 1 }}
            </span>
            <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS">
              <button
                type="button"
                :class="[CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN, CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE]"
                :disabled="index === 0"
                :title="uiStrings.moveUp"
                @click="moveColumn(index, index - 1)"
              >
                <Icon name="arrowUp" />
              </button>
              <button
                type="button"
                :class="[CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN, CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE]"
                :disabled="index >= tableValue.tableHead.length - 1"
                :title="uiStrings.moveDown"
                @click="moveColumn(index, index + 1)"
              >
                <Icon name="arrowDown" />
              </button>
              <button
                type="button"
                :class="[CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN, CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_REMOVE]"
                :disabled="tableValue.tableHead.length <= 1"
                :title="uiStrings.matrixDeleteColumn"
                @click="removeColumn(index)"
              >
                <Icon name="delete" />
              </button>
            </div>
          </div>

          <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS">
            <div :class="CSS_CLASSES.FORM_GROUP">
              <span :class="CSS_CLASSES.FORM_LABEL">Тип</span>
              <div :class="CSS_CLASSES.FORM_RADIO_GROUP">
                <label
                  v-for="option in columnTypeOptions"
                  :key="`${column.id}-${option.value}`"
                  :class="CSS_CLASSES.FORM_RADIO_LABEL"
                >
                  <input
                    type="radio"
                    :name="`${fieldName}-column-type-${column.id}`"
                    :value="option.value"
                    :checked="column.type === option.value"
                    @change="updateColumn(index, { type: option.value })"
                  />
                  {{ option.label }}
                </label>
              </div>
            </div>

            <div :class="CSS_CLASSES.FORM_GROUP">
              <label :class="CSS_CLASSES.FORM_LABEL">Заголовок</label>
              <input
                type="text"
                :class="CSS_CLASSES.FORM_CONTROL"
                :value="column.name"
                @input="updateColumn(index, { name: ($event.target as HTMLInputElement).value })"
              />
            </div>

            <div :class="CSS_CLASSES.FORM_GROUP">
              <label :class="CSS_CLASSES.FORM_LABEL">
                <input
                  type="checkbox"
                  :checked="column.nowrap"
                  @change="updateColumn(index, { nowrap: ($event.target as HTMLInputElement).checked })"
                />
                Не переносить строки
              </label>
            </div>

            <div v-if="column.type !== 'image'" :class="CSS_CLASSES.FORM_GROUP">
              <span :class="CSS_CLASSES.FORM_LABEL">Размер текстовой ячейки</span>
              <CustomDropdown
                :model-value="column.size"
                :options="sizeOptions"
                :placeholder="uiStrings.selectPlaceholder"
                :clearable="false"
                @update:model-value="
                  updateColumn(index, { size: String($event ?? '') })
                "
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        :class="[
          CSS_CLASSES.REPEATER_CONTROL_ADD_BTN,
          CSS_CLASSES.BTN,
          CSS_CLASSES.BTN_OUTLINE,
          CSS_CLASSES.BTN_BLOCK,
        ]"
        :disabled="maxColumns !== undefined && tableValue.tableHead.length >= maxColumns"
        @click="addColumn"
      >
        Добавить столбец
      </button>
    </div>

    <div v-else :class="CSS_CLASSES.MATRIX_TABLE_CONTROL_PANEL">
      <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEMS">
        <div
          v-for="(row, rowIndex) in tableValue.tableBody"
          :key="row.id"
          :class="CSS_CLASSES.REPEATER_CONTROL_ITEM"
        >
          <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER">
            <span :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_TITLE">
              {{ rowItemTitle }} {{ rowIndex + 1 }}
            </span>
            <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS">
              <button
                type="button"
                :class="[CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN, CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE]"
                :disabled="rowIndex === 0"
                :title="uiStrings.moveUp"
                @click="moveRow(rowIndex, rowIndex - 1)"
              >
                <Icon name="arrowUp" />
              </button>
              <button
                type="button"
                :class="[CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN, CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE]"
                :disabled="rowIndex >= tableValue.tableBody.length - 1"
                :title="uiStrings.moveDown"
                @click="moveRow(rowIndex, rowIndex + 1)"
              >
                <Icon name="arrowDown" />
              </button>
              <button
                type="button"
                :class="[CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN, CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_REMOVE]"
                :title="uiStrings.matrixDeleteRow"
                @click="removeRow(rowIndex)"
              >
                <Icon name="delete" />
              </button>
            </div>
          </div>

          <div :class="CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS">
            <div
              v-for="(cell, cellIndex) in row.fields"
              :key="cell.id"
              :class="CSS_CLASSES.FORM_GROUP"
            >
              <label :class="CSS_CLASSES.FORM_LABEL">
                {{ tableValue.tableHead[cellIndex]?.name || `Колонка ${cellIndex + 1}` }}
              </label>

              <input
                v-if="getColumnType(cellIndex) === 'default'"
                type="text"
                :class="CSS_CLASSES.FORM_CONTROL"
                :value="cell.value"
                @input="
                  updateCell(rowIndex, cellIndex, { value: ($event.target as HTMLInputElement).value })
                "
              />

              <textarea
                v-else-if="getColumnType(cellIndex) === 'wyz'"
                :class="CSS_CLASSES.FORM_CONTROL"
                rows="4"
                :value="cell.value"
                @input="
                  updateCell(rowIndex, cellIndex, { value: ($event.target as HTMLTextAreaElement).value })
                "
              />

              <ImageUploadField
                v-else-if="getColumnType(cellIndex) === 'image'"
                :model-value="cell.image"
                label=""
                :file-upload-config="imageUploadConfig"
                :field-name-path="`${fieldName}[${rowIndex}][${cellIndex}]`"
                @update:model-value="updateCell(rowIndex, cellIndex, { image: $event as string })"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        :class="[
          CSS_CLASSES.REPEATER_CONTROL_ADD_BTN,
          CSS_CLASSES.BTN,
          CSS_CLASSES.BTN_OUTLINE,
          CSS_CLASSES.BTN_BLOCK,
        ]"
        :disabled="maxRows !== undefined && tableValue.tableBody.length >= maxRows"
        @click="addRow"
      >
        Добавить строку
      </button>
    </div>

    <div v-if="error" :class="CSS_CLASSES.FORM_ERRORS">
      <div :class="CSS_CLASSES.ERROR">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IFileUploadConfig, IMatrixTableFieldConfig, IMatrixTableValue } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import {
  DEFAULT_MATRIX_TABLE_COLUMN_TYPES,
  DEFAULT_MATRIX_TABLE_SIZE_OPTIONS,
  addMatrixTableColumn,
  addMatrixTableRow,
  moveMatrixTableColumn,
  moveMatrixTableRow,
  normalizeMatrixTableValue,
  removeMatrixTableColumn,
  removeMatrixTableRow,
  updateMatrixTableCell,
  updateMatrixTableColumn,
} from '../../utils/matrixTableHelpers';
import Icon from '../../shared/icons/Icon.vue';
import { useUiStrings } from '../composables/useUiStrings';
import CustomDropdown from './CustomDropdown.vue';
import ImageUploadField from './ImageUploadField.vue';
import { computed, onMounted, ref } from 'vue';

const uiStrings = useUiStrings();

interface Props {
  modelValue?: IMatrixTableValue | null;
  fieldName: string;
  label: string;
  matrixTableConfig?: IMatrixTableFieldConfig;
  required?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  matrixTableConfig: undefined,
  required: false,
  error: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: IMatrixTableValue];
}>();

const activeTab = ref<'structure' | 'content'>('structure');

const tableValue = computed(() =>
  normalizeMatrixTableValue(props.modelValue, props.matrixTableConfig)
);

const columnTypeOptions = computed(
  () => props.matrixTableConfig?.columnTypes ?? [...DEFAULT_MATRIX_TABLE_COLUMN_TYPES]
);

const sizeOptions = computed(
  () => props.matrixTableConfig?.sizeOptions ?? [...DEFAULT_MATRIX_TABLE_SIZE_OPTIONS]
);

const structureTabLabel = computed(
  () => props.matrixTableConfig?.structureTabLabel ?? uiStrings.value.matrixStructureTab
);

const contentTabLabel = computed(
  () => props.matrixTableConfig?.contentTabLabel ?? uiStrings.value.matrixContentTab
);

const columnItemTitle = computed(
  () => props.matrixTableConfig?.columnItemTitle ?? uiStrings.value.matrixColumn
);

const rowItemTitle = computed(() => props.matrixTableConfig?.rowItemTitle ?? uiStrings.value.matrixRow);

const maxColumns = computed(() => props.matrixTableConfig?.maxColumns);
const maxRows = computed(() => props.matrixTableConfig?.maxRows);

const imageUploadConfig = computed<IFileUploadConfig | undefined>(
  () => props.matrixTableConfig?.imageUploadConfig
);

const emitValue = (nextValue: IMatrixTableValue) => {
  emit('update:modelValue', nextValue);
};

const addColumn = () => {
  emitValue(addMatrixTableColumn(tableValue.value, props.matrixTableConfig));
};

const removeColumn = (index: number) => {
  emitValue(removeMatrixTableColumn(tableValue.value, index));
};

const moveColumn = (fromIndex: number, toIndex: number) => {
  emitValue(moveMatrixTableColumn(tableValue.value, fromIndex, toIndex));
};

const updateColumn = (index: number, patch: Parameters<typeof updateMatrixTableColumn>[2]) => {
  emitValue(updateMatrixTableColumn(tableValue.value, index, patch));
};

const addRow = () => {
  emitValue(addMatrixTableRow(tableValue.value));
};

const removeRow = (index: number) => {
  emitValue(removeMatrixTableRow(tableValue.value, index));
};

const moveRow = (fromIndex: number, toIndex: number) => {
  emitValue(moveMatrixTableRow(tableValue.value, fromIndex, toIndex));
};

const updateCell = (rowIndex: number, cellIndex: number, patch: Parameters<typeof updateMatrixTableCell>[3]) => {
  emitValue(updateMatrixTableCell(tableValue.value, rowIndex, cellIndex, patch));
};

const getColumnType = (cellIndex: number) => tableValue.value.tableHead[cellIndex]?.type ?? 'default';

onMounted(() => {
  const normalized = normalizeMatrixTableValue(props.modelValue, props.matrixTableConfig);
  if (JSON.stringify(normalized) !== JSON.stringify(props.modelValue ?? null)) {
    emitValue(normalized);
  }
});
</script>
