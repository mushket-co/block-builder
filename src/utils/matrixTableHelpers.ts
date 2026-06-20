import type {
  IMatrixTableCell,
  IMatrixTableColumn,
  IMatrixTableFieldConfig,
  IMatrixTableRow,
  IMatrixTableValue,
  TMatrixTableColumnType,
} from '../core/types/form';
import { generateRepeaterItemId } from './repeaterItemId';

export type {
  IMatrixTableCell,
  IMatrixTableColumn,
  IMatrixTableFieldConfig,
  IMatrixTableRow,
  IMatrixTableValue,
  TMatrixTableColumnType,
};

export const DEFAULT_MATRIX_TABLE_COLUMN_TYPES = [
  { value: 'default', label: 'Короткий текст' },
  { value: 'wyz', label: 'Большой текст' },
  { value: 'image', label: 'Изображение' },
] as const;

export const DEFAULT_MATRIX_TABLE_SIZE_OPTIONS = [
  { value: '', label: 'Автоматический' },
  { value: 'small', label: 'Маленький' },
  { value: 'normal', label: 'Средний' },
  { value: 'large', label: 'Большой' },
] as const;

export function createDefaultMatrixTableColumn(
  config?: IMatrixTableFieldConfig
): IMatrixTableColumn {
  return {
    id: generateRepeaterItemId(),
    type: (config?.defaultColumn?.type as TMatrixTableColumnType) || 'default',
    name: config?.defaultColumn?.name ?? '',
    nowrap: config?.defaultColumn?.nowrap ?? false,
    size: config?.defaultColumn?.size ?? '',
  };
}

export function createDefaultMatrixTableCell(): IMatrixTableCell {
  return {
    id: generateRepeaterItemId(),
    value: '',
    image: '',
  };
}

export function createDefaultMatrixTableRow(tableHead: IMatrixTableColumn[]): IMatrixTableRow {
  return {
    id: generateRepeaterItemId(),
    fields: tableHead.map(() => createDefaultMatrixTableCell()),
  };
}

export function createDefaultMatrixTableValue(
  config?: IMatrixTableFieldConfig
): IMatrixTableValue {
  const tableHead = [createDefaultMatrixTableColumn(config)];
  return {
    tableHead,
    tableBody: [],
  };
}

function isMatrixTableColumn(value: unknown): value is IMatrixTableColumn {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as IMatrixTableColumn).id === 'string' &&
    typeof (value as IMatrixTableColumn).type === 'string'
  );
}

function isMatrixTableCell(value: unknown): value is IMatrixTableCell {
  return typeof value === 'object' && value !== null && typeof (value as IMatrixTableCell).id === 'string';
}

function isMatrixTableRow(value: unknown): value is IMatrixTableRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as IMatrixTableRow).fields)
  );
}

export function syncBodyFieldsWithHead(value: IMatrixTableValue): IMatrixTableValue {
  const tableHead = value.tableHead;
  const targetLength = tableHead.length;

  const tableBody = value.tableBody.map(row => {
    const fields = [...row.fields];

    while (fields.length < targetLength) {
      fields.push(createDefaultMatrixTableCell());
    }

    if (fields.length > targetLength) {
      fields.length = targetLength;
    }

    return {
      ...row,
      fields: fields.map(cell => ({
        id: cell.id || generateRepeaterItemId(),
        value: cell.value ?? '',
        image: cell.image ?? '',
      })),
    };
  });

  return {
    tableHead: tableHead.map(column => ({
      id: column.id || generateRepeaterItemId(),
      type: column.type || 'default',
      name: column.name ?? '',
      nowrap: Boolean(column.nowrap),
      size: column.size ?? '',
    })),
    tableBody,
  };
}

export function normalizeMatrixTableValue(
  value: unknown,
  config?: IMatrixTableFieldConfig
): IMatrixTableValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return createDefaultMatrixTableValue(config);
  }

  const raw = value as Partial<IMatrixTableValue>;
  const tableHead = Array.isArray(raw.tableHead)
    ? raw.tableHead.filter(isMatrixTableColumn).map(column => ({
        id: column.id || generateRepeaterItemId(),
        type: (column.type || 'default') as TMatrixTableColumnType,
        name: column.name ?? '',
        nowrap: Boolean(column.nowrap),
        size: column.size ?? '',
      }))
    : [createDefaultMatrixTableColumn(config)];

  const tableBody = Array.isArray(raw.tableBody)
    ? raw.tableBody.filter(isMatrixTableRow).map(row => ({
        id: row.id || generateRepeaterItemId(),
        fields: Array.isArray(row.fields)
          ? row.fields.filter(isMatrixTableCell).map(cell => ({
              id: cell.id || generateRepeaterItemId(),
              value: cell.value ?? '',
              image: cell.image ?? '',
            }))
          : [],
      }))
    : [];

  return syncBodyFieldsWithHead({ tableHead, tableBody });
}

export function addMatrixTableColumn(
  value: IMatrixTableValue,
  config?: IMatrixTableFieldConfig
): IMatrixTableValue {
  const tableHead = [...value.tableHead, createDefaultMatrixTableColumn(config)];
  return syncBodyFieldsWithHead({ ...value, tableHead });
}

export function removeMatrixTableColumn(value: IMatrixTableValue, index: number): IMatrixTableValue {
  if (value.tableHead.length <= 1) {
    return value;
  }

  const tableHead = value.tableHead.filter((_, i) => i !== index);
  const tableBody = value.tableBody.map(row => ({
    ...row,
    fields: row.fields.filter((_, i) => i !== index),
  }));

  return { tableHead, tableBody };
}

export function moveMatrixTableColumn(
  value: IMatrixTableValue,
  fromIndex: number,
  toIndex: number
): IMatrixTableValue {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= value.tableHead.length ||
    toIndex >= value.tableHead.length
  ) {
    return value;
  }

  const tableHead = [...value.tableHead];
  const [moved] = tableHead.splice(fromIndex, 1);
  tableHead.splice(toIndex, 0, moved);

  const tableBody = value.tableBody.map(row => {
    const fields = [...row.fields];
    const [movedCell] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, movedCell ?? createDefaultMatrixTableCell());
    return { ...row, fields };
  });

  return { tableHead, tableBody };
}

export function updateMatrixTableColumn(
  value: IMatrixTableValue,
  index: number,
  patch: Partial<IMatrixTableColumn>
): IMatrixTableValue {
  const tableHead = value.tableHead.map((column, i) =>
    i === index ? { ...column, ...patch } : column
  );
  return { ...value, tableHead };
}

export function addMatrixTableRow(value: IMatrixTableValue): IMatrixTableValue {
  return {
    ...value,
    tableBody: [...value.tableBody, createDefaultMatrixTableRow(value.tableHead)],
  };
}

export function removeMatrixTableRow(value: IMatrixTableValue, index: number): IMatrixTableValue {
  return {
    ...value,
    tableBody: value.tableBody.filter((_, i) => i !== index),
  };
}

export function moveMatrixTableRow(
  value: IMatrixTableValue,
  fromIndex: number,
  toIndex: number
): IMatrixTableValue {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= value.tableBody.length ||
    toIndex >= value.tableBody.length
  ) {
    return value;
  }

  const tableBody = [...value.tableBody];
  const [moved] = tableBody.splice(fromIndex, 1);
  tableBody.splice(toIndex, 0, moved);

  return { ...value, tableBody };
}

export function updateMatrixTableCell(
  value: IMatrixTableValue,
  rowIndex: number,
  cellIndex: number,
  patch: Partial<IMatrixTableCell>
): IMatrixTableValue {
  const tableBody = value.tableBody.map((row, i) => {
    if (i !== rowIndex) {
      return row;
    }

    const fields = row.fields.map((cell, j) => (j === cellIndex ? { ...cell, ...patch } : cell));
    return { ...row, fields };
  });

  return { ...value, tableBody };
}

export function isMatrixTableStoredValue(value: unknown): value is IMatrixTableValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Partial<IMatrixTableValue>;
  return Array.isArray(record.tableHead) && Array.isArray(record.tableBody);
}
