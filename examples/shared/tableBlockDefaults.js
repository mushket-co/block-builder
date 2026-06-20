export const TABLE_MATRIX_UPLOAD_CONFIG = {
  uploadUrl: '/api/upload',
  fileParamName: 'file',
  maxFileSize: 5 * 1024 * 1024,
  responseMapper: response => response.data?.url || response.url || '',
};

export const DEFAULT_TABLE_MATRIX = {
  tableHead: [
    { id: 'col-name', type: 'default', name: 'Название', nowrap: false, size: '' },
    { id: 'col-desc', type: 'wyz', name: 'Описание', nowrap: false, size: 'normal' },
    { id: 'col-status', type: 'default', name: 'Статус', nowrap: true, size: 'small' },
  ],
  tableBody: [
    {
      id: 'row-1',
      fields: [
        { id: 'c-1-1', value: 'Block Builder', image: '' },
        { id: 'c-1-2', value: '<p>Демо поля <strong>matrix-table</strong></p>', image: '' },
        { id: 'c-1-3', value: 'Demo', image: '' },
      ],
    },
    {
      id: 'row-2',
      fields: [
        { id: 'c-2-1', value: 'Vue / React', image: '' },
        { id: 'c-2-2', value: '<p>Тип ячейки задаётся колонкой, не строкой</p>', image: '' },
        { id: 'c-2-3', value: 'OK', image: '' },
      ],
    },
  ],
};

export function createTableBlockFields() {
  return [
    {
      field: 'title',
      label: 'Заголовок блока',
      type: 'text',
      defaultValue: 'Таблица (matrix-table)',
    },
    {
      field: 'showTableHead',
      label: 'Показать шапку таблицы',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      field: 'gapSize',
      label: 'Отступы ячеек',
      type: 'radio',
      options: [
        { value: 'small', label: 'Маленькие' },
        { value: 'big', label: 'Большие' },
      ],
      defaultValue: 'small',
    },
    {
      field: 'tableMatrix',
      label: 'Таблица',
      type: 'matrix-table',
      rules: [{ type: 'required', message: 'Заполните структуру таблицы' }],
      defaultValue: DEFAULT_TABLE_MATRIX,
      matrixTableConfig: {
        imageUploadConfig: TABLE_MATRIX_UPLOAD_CONFIG,
      },
    },
  ];
}

export function createTableBlockConfig({ component, framework }) {
  return {
    title: 'Таблица (matrix-table)',
    icon: '/icons/table.svg',
    description: 'Таблица: колонки и строки редактируются через поле matrix-table',
    render: {
      kind: 'component',
      framework,
      component,
    },
    fields: createTableBlockFields(),
  };
}
