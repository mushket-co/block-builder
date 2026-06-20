import {
  addMatrixTableColumn,
  addMatrixTableRow,
  createDefaultMatrixTableValue,
  moveMatrixTableColumn,
  normalizeMatrixTableValue,
  removeMatrixTableColumn,
  syncBodyFieldsWithHead,
} from '../matrixTableHelpers';

describe('matrixTableHelpers', () => {
  test('createDefaultMatrixTableValue creates one column and empty body', () => {
    const value = createDefaultMatrixTableValue();
    expect(value.tableHead).toHaveLength(1);
    expect(value.tableBody).toHaveLength(0);
  });

  test('addMatrixTableColumn appends cells to existing rows', () => {
    const initial = addMatrixTableRow(createDefaultMatrixTableValue());
    const next = addMatrixTableColumn(initial);

    expect(next.tableHead).toHaveLength(2);
    expect(next.tableBody[0].fields).toHaveLength(2);
  });

  test('removeMatrixTableColumn keeps at least one column', () => {
    const value = createDefaultMatrixTableValue();
    const next = removeMatrixTableColumn(value, 0);
    expect(next.tableHead).toHaveLength(1);
  });

  test('moveMatrixTableColumn reorders head and row cells', () => {
    let value = createDefaultMatrixTableValue();
    value = addMatrixTableColumn(value);
    value = addMatrixTableRow(value);
    value.tableHead[0].name = 'A';
    value.tableHead[1].name = 'B';
    value.tableBody[0].fields[0].value = 'cell-A';
    value.tableBody[0].fields[1].value = 'cell-B';

    const moved = moveMatrixTableColumn(value, 0, 1);

    expect(moved.tableHead.map(column => column.name)).toEqual(['B', 'A']);
    expect(moved.tableBody[0].fields.map(cell => cell.value)).toEqual(['cell-B', 'cell-A']);
  });

  test('syncBodyFieldsWithHead aligns row field count with columns', () => {
    const value = syncBodyFieldsWithHead({
      tableHead: [
        { id: '1', type: 'default', name: 'Col 1', nowrap: false, size: '' },
        { id: '2', type: 'default', name: 'Col 2', nowrap: false, size: '' },
      ],
      tableBody: [
        {
          id: 'row-1',
          fields: [{ id: 'c1', value: 'x', image: '' }],
        },
      ],
    });

    expect(value.tableBody[0].fields).toHaveLength(2);
  });

  test('normalizeMatrixTableValue restores invalid payload', () => {
    const value = normalizeMatrixTableValue(null);
    expect(value.tableHead).toHaveLength(1);
    expect(Array.isArray(value.tableBody)).toBe(true);
  });
});
