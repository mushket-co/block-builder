import {
  DEMO_XLSX_CARD_MAP_ITEM,
  mergeDemoFiltersIntoForm,
} from './formFeaturesMockApi.js'

export const FORM_FEATURES_DEMO_DEFAULTS = {
  blockTitle: 'Form Features Demo (1.8.0)',
  showFilterOptions: true,
  filterOptions: [
    {
      name: 'Категория',
      options: [{ name: 'Electronics' }, { name: 'Books' }],
    },
  ],
  items: [
    { title: 'Карточка 1', filters: ['Electronics'] },
    { title: 'Карточка 2', filters: [] },
  ],
}

export function createFormFeaturesDemoFields() {
  return [
    {
      field: 'blockTitle',
      label: 'Заголовок блока',
      type: 'text',
      defaultValue: FORM_FEATURES_DEMO_DEFAULTS.blockTitle,
    },
    {
      field: '_demoHelper',
      label: 'Служебное поле (persist: false — не попадёт в JSON)',
      type: 'text',
      placeholder: 'Можно ввести что угодно — после save исчезнет из props',
      persist: false,
      defaultValue: '',
    },
    {
      field: '_xlsxImport',
      label: 'Импорт карточек и фильтров (file-import)',
      type: 'file-import',
      fileImportConfig: {
        accept: ['.xlsx', '.xls'],
        uploadUrl: '/api/demo/parse-xlsx',
        formDataKey: 'file',
        maxSizeMb: 5,
        responseMapper: response => response,
        merge: [
          {
            targetField: 'items',
            sourceKey: 'data.cards',
            mode: 'append',
            dedupeBy: 'title',
            mapItem: DEMO_XLSX_CARD_MAP_ITEM,
          },
        ],
        onImport: ({ data, formScope, mergeStats }) => {
          const filterStats = mergeDemoFiltersIntoForm(formScope, data)
          if (mergeStats) {
            mergeStats.push({
              targetField: 'filterOptions',
              mode: 'append',
              added: filterStats.added,
              skipped: filterStats.skipped,
              total: Array.isArray(formScope.formData.filterOptions)
                ? formScope.formData.filterOptions.length
                : 0,
            })
          }
        },
      },
    },
    {
      field: 'showFilterOptions',
      label: 'Показать фильтры блока',
      type: 'checkbox',
      defaultValue: FORM_FEATURES_DEMO_DEFAULTS.showFilterOptions,
    },
    {
      field: 'filterOptions',
      label: 'Фильтры блока',
      type: 'repeater',
      dependsOn: { field: 'showFilterOptions', value: true },
      defaultValue: FORM_FEATURES_DEMO_DEFAULTS.filterOptions,
      repeaterConfig: {
        itemTitle: 'Фильтр',
        addButtonText: 'Добавить фильтр',
        fields: [
          {
            field: 'name',
            label: 'Название',
            type: 'text',
            rules: [{ type: 'required', message: 'Обязательно' }],
            defaultValue: '',
          },
          {
            field: 'options',
            label: 'Варианты',
            type: 'repeater',
            repeaterConfig: {
              itemTitle: 'Вариант',
              addButtonText: 'Добавить вариант',
              fields: [
                {
                  field: 'name',
                  label: 'Название',
                  type: 'text',
                  rules: [{ type: 'required', message: 'Обязательно' }],
                  defaultValue: '',
                },
              ],
              defaultItemValue: { name: '' },
            },
            defaultValue: [{ name: '' }],
          },
        ],
        defaultItemValue: { name: '', options: [{ name: '' }] },
      },
    },
    {
      field: 'items',
      label: 'Карточки',
      type: 'repeater',
      defaultValue: FORM_FEATURES_DEMO_DEFAULTS.items,
      repeaterConfig: {
        itemTitle: 'Карточка',
        addButtonText: 'Добавить карточку',
        fields: [
          {
            field: 'title',
            label: 'Заголовок',
            type: 'text',
            rules: [{ type: 'required', message: 'Обязательно' }],
            defaultValue: '',
          },
          {
            field: 'filters',
            label: 'Привязка к фильтрам (optionsFrom + multiple)',
            type: 'select',
            multiple: true,
            defaultValue: [],
            optionsFrom: {
              source: 'filterOptions',
              when: { field: 'showFilterOptions', value: true },
              map: filter => ({
                group: filter.name,
                options: (filter.options || []).map(option => ({
                  value: option.name,
                  label: option.name,
                })),
              }),
            },
          },
          {
            field: 'formScopeProbe',
            label: 'formScope probe (custom field)',
            type: 'custom',
            customFieldConfig: {
              rendererId: 'form-scope-demo',
            },
            defaultValue: null,
          },
        ],
        defaultItemValue: { title: '', filters: [] },
      },
    },
  ]
}

export function createFormFeaturesDemoBlockConfig({ component, framework }) {
  return {
    title: 'Form Features (1.8.0)',
    icon: '/icons/form.svg',
    description:
      'Демо formScope, optionsFrom, file-import, persist:false — перед публикацией BB 1.8.0',
    render: {
      kind: 'component',
      framework,
      component,
    },
    fields: createFormFeaturesDemoFields(),
  }
}
