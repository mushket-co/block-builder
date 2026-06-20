import { useEffect, useMemo, useState } from 'react';

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
import { Icon } from './icons/Icon';
import { CustomDropdown } from './CustomDropdown';
import { ImageUploadField } from './ImageUploadField';

interface IMatrixTableControlProps {
  modelValue?: IMatrixTableValue | null;
  fieldName: string;
  label: string;
  matrixTableConfig?: IMatrixTableFieldConfig;
  required?: boolean;
  error?: string;
  onChange: (value: IMatrixTableValue) => void;
}

export function MatrixTableControl({
  modelValue,
  fieldName,
  label,
  matrixTableConfig,
  required = false,
  error = '',
  onChange,
}: IMatrixTableControlProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'content'>('structure');

  const tableValue = useMemo(
    () => normalizeMatrixTableValue(modelValue, matrixTableConfig),
    [modelValue, matrixTableConfig]
  );

  const columnTypeOptions = matrixTableConfig?.columnTypes ?? [...DEFAULT_MATRIX_TABLE_COLUMN_TYPES];
  const sizeOptions = matrixTableConfig?.sizeOptions ?? [...DEFAULT_MATRIX_TABLE_SIZE_OPTIONS];
  const structureTabLabel = matrixTableConfig?.structureTabLabel ?? 'Структура таблицы';
  const contentTabLabel = matrixTableConfig?.contentTabLabel ?? 'Контент';
  const columnItemTitle = matrixTableConfig?.columnItemTitle ?? 'Столбец';
  const rowItemTitle = matrixTableConfig?.rowItemTitle ?? 'Строка';
  const maxColumns = matrixTableConfig?.maxColumns;
  const maxRows = matrixTableConfig?.maxRows;
  const imageUploadConfig = matrixTableConfig?.imageUploadConfig as IFileUploadConfig | undefined;

  useEffect(() => {
    const normalized = normalizeMatrixTableValue(modelValue, matrixTableConfig);
    if (JSON.stringify(normalized) !== JSON.stringify(modelValue ?? null)) {
      onChange(normalized);
    }
  }, []);

  const getColumnType = (cellIndex: number) => tableValue.tableHead[cellIndex]?.type ?? 'default';

  return (
    <div className={CSS_CLASSES.MATRIX_TABLE_CONTROL} data-field-name={fieldName}>
      <div className={CSS_CLASSES.REPEATER_CONTROL_HEADER}>
        <label className={CSS_CLASSES.REPEATER_CONTROL_LABEL}>
          {label}
          {required ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
        </label>
      </div>

      <div className={CSS_CLASSES.MATRIX_TABLE_CONTROL_TABS}>
        <button
          type="button"
          className={`${CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB}${activeTab === 'structure' ? ` ${CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB_ACTIVE}` : ''}`}
          onClick={() => setActiveTab('structure')}
        >
          {structureTabLabel}
        </button>
        <button
          type="button"
          className={`${CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB}${activeTab === 'content' ? ` ${CSS_CLASSES.MATRIX_TABLE_CONTROL_TAB_ACTIVE}` : ''}`}
          onClick={() => setActiveTab('content')}
        >
          {contentTabLabel}
        </button>
      </div>

      {activeTab === 'structure' ? (
        <div className={CSS_CLASSES.MATRIX_TABLE_CONTROL_PANEL}>
          <div className={CSS_CLASSES.REPEATER_CONTROL_ITEMS}>
            {tableValue.tableHead.map((column, index) => (
              <div key={column.id} className={CSS_CLASSES.REPEATER_CONTROL_ITEM}>
                <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER}>
                  <span className={CSS_CLASSES.REPEATER_CONTROL_ITEM_TITLE}>
                    {columnItemTitle} {index + 1}
                  </span>
                  <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS}>
                    <button
                      type="button"
                      className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                      disabled={index === 0}
                      title="Переместить вверх"
                      onClick={() => onChange(moveMatrixTableColumn(tableValue, index, index - 1))}
                    >
                      <Icon name="arrowUp" />
                    </button>
                    <button
                      type="button"
                      className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                      disabled={index >= tableValue.tableHead.length - 1}
                      title="Переместить вниз"
                      onClick={() => onChange(moveMatrixTableColumn(tableValue, index, index + 1))}
                    >
                      <Icon name="arrowDown" />
                    </button>
                    <button
                      type="button"
                      className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_REMOVE}`}
                      disabled={tableValue.tableHead.length <= 1}
                      title="Удалить столбец"
                      onClick={() => onChange(removeMatrixTableColumn(tableValue, index))}
                    >
                      <Icon name="delete" />
                    </button>
                  </div>
                </div>

                <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}>
                  <div className={CSS_CLASSES.FORM_GROUP}>
                    <span className={CSS_CLASSES.FORM_LABEL}>Тип</span>
                    <div className={CSS_CLASSES.FORM_RADIO_GROUP}>
                      {columnTypeOptions.map(option => (
                        <label key={`${column.id}-${option.value}`} className={CSS_CLASSES.FORM_RADIO_LABEL}>
                          <input
                            type="radio"
                            name={`${fieldName}-column-type-${column.id}`}
                            value={option.value}
                            checked={column.type === option.value}
                            onChange={() =>
                              onChange(updateMatrixTableColumn(tableValue, index, { type: option.value }))
                            }
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={CSS_CLASSES.FORM_GROUP}>
                    <label className={CSS_CLASSES.FORM_LABEL}>Заголовок</label>
                    <input
                      type="text"
                      className={CSS_CLASSES.FORM_CONTROL}
                      value={column.name}
                      onChange={event =>
                        onChange(updateMatrixTableColumn(tableValue, index, { name: event.target.value }))
                      }
                    />
                  </div>

                  <div className={CSS_CLASSES.FORM_GROUP}>
                    <label className={CSS_CLASSES.FORM_LABEL}>
                      <input
                        type="checkbox"
                        checked={column.nowrap}
                        onChange={event =>
                          onChange(updateMatrixTableColumn(tableValue, index, { nowrap: event.target.checked }))
                        }
                      />
                      Не переносить строки
                    </label>
                  </div>

                  {column.type !== 'image' ? (
                    <div className={CSS_CLASSES.FORM_GROUP}>
                      <span className={CSS_CLASSES.FORM_LABEL}>
                        Размер текстовой ячейки
                      </span>
                      <CustomDropdown
                        modelValue={column.size}
                        options={sizeOptions}
                        placeholder="Выберите..."
                        clearable={false}
                        onChange={value =>
                          onChange(
                            updateMatrixTableColumn(tableValue, index, {
                              size: String(
                                Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
                              ),
                            })
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN} ${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_OUTLINE} ${CSS_CLASSES.BTN_BLOCK}`}
            disabled={maxColumns !== undefined && tableValue.tableHead.length >= maxColumns}
            onClick={() => onChange(addMatrixTableColumn(tableValue, matrixTableConfig))}
          >
            Добавить столбец
          </button>
        </div>
      ) : (
        <div className={CSS_CLASSES.MATRIX_TABLE_CONTROL_PANEL}>
          <div className={CSS_CLASSES.REPEATER_CONTROL_ITEMS}>
            {tableValue.tableBody.map((row, rowIndex) => (
              <div key={row.id} className={CSS_CLASSES.REPEATER_CONTROL_ITEM}>
                <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER}>
                  <span className={CSS_CLASSES.REPEATER_CONTROL_ITEM_TITLE}>
                    {rowItemTitle} {rowIndex + 1}
                  </span>
                  <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS}>
                    <button
                      type="button"
                      className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                      disabled={rowIndex === 0}
                      title="Переместить вверх"
                      onClick={() => onChange(moveMatrixTableRow(tableValue, rowIndex, rowIndex - 1))}
                    >
                      <Icon name="arrowUp" />
                    </button>
                    <button
                      type="button"
                      className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}`}
                      disabled={rowIndex >= tableValue.tableBody.length - 1}
                      title="Переместить вниз"
                      onClick={() => onChange(moveMatrixTableRow(tableValue, rowIndex, rowIndex + 1))}
                    >
                      <Icon name="arrowDown" />
                    </button>
                    <button
                      type="button"
                      className={`${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_REMOVE}`}
                      title="Удалить строку"
                      onClick={() => onChange(removeMatrixTableRow(tableValue, rowIndex))}
                    >
                      <Icon name="delete" />
                    </button>
                  </div>
                </div>

                <div className={CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}>
                  {row.fields.map((cell, cellIndex) => (
                    <div key={cell.id} className={CSS_CLASSES.FORM_GROUP}>
                      <label className={CSS_CLASSES.FORM_LABEL}>
                        {tableValue.tableHead[cellIndex]?.name || `Колонка ${cellIndex + 1}`}
                      </label>

                      {getColumnType(cellIndex) === 'default' ? (
                        <input
                          type="text"
                          className={CSS_CLASSES.FORM_CONTROL}
                          value={cell.value}
                          onChange={event =>
                            onChange(
                              updateMatrixTableCell(tableValue, rowIndex, cellIndex, {
                                value: event.target.value,
                              })
                            )
                          }
                        />
                      ) : null}

                      {getColumnType(cellIndex) === 'wyz' ? (
                        <textarea
                          className={CSS_CLASSES.FORM_CONTROL}
                          rows={4}
                          value={cell.value}
                          onChange={event =>
                            onChange(
                              updateMatrixTableCell(tableValue, rowIndex, cellIndex, {
                                value: event.target.value,
                              })
                            )
                          }
                        />
                      ) : null}

                      {getColumnType(cellIndex) === 'image' ? (
                        <ImageUploadField
                          modelValue={cell.image}
                          label=""
                          fileUploadConfig={imageUploadConfig}
                          fieldNamePath={`${fieldName}[${rowIndex}][${cellIndex}]`}
                          onChange={nextValue =>
                            onChange(
                              updateMatrixTableCell(tableValue, rowIndex, cellIndex, {
                                image: String(nextValue ?? ''),
                              })
                            )
                          }
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN} ${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_OUTLINE} ${CSS_CLASSES.BTN_BLOCK}`}
            disabled={maxRows !== undefined && tableValue.tableBody.length >= maxRows}
            onClick={() => onChange(addMatrixTableRow(tableValue))}
          >
            Добавить строку
          </button>
        </div>
      )}

      {error ? (
        <div className={CSS_CLASSES.FORM_ERRORS}>
          <div className={CSS_CLASSES.ERROR}>{error}</div>
        </div>
      ) : null}
    </div>
  );
}
