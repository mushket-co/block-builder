import {
  DEFAULT_TABLE_MATRIX,
  TABLE_MATRIX_UPLOAD_CONFIG,
} from './tableBlockDefaults.js'

const PRODUCT_IMAGE_UPLOAD = {
  uploadUrl: '/api/upload',
  fileParamName: 'file',
  maxFileSize: 5 * 1024 * 1024,
  uploadHeaders: {
    Authorization: 'Bearer token',
  },
  responseMapper: response => response.data?.url || response.url || '',
  onUploadError: error => {
    console.error('Ошибка загрузки изображения:', error)
  },
}

const COMPACT_TABLE_MATRIX = {
  tableHead: DEFAULT_TABLE_MATRIX.tableHead.slice(0, 2),
  tableBody: DEFAULT_TABLE_MATRIX.tableBody.map(row => ({
    ...row,
    fields: row.fields.slice(0, 2),
  })),
}

const DEFAULT_PRODUCT_SPACING = {
  desktop: {
    'padding-top': 8,
    'padding-bottom': 8,
    'margin-top': 0,
    'margin-bottom': 0,
  },
  tablet: {
    'padding-top': 6,
    'padding-bottom': 6,
    'margin-top': 0,
    'margin-bottom': 0,
  },
  mobile: {
    'padding-top': 4,
    'padding-bottom': 4,
    'margin-top': 0,
    'margin-bottom': 0,
  },
}

/** Все типы полей BlockBuilder для демо во вложенном репитере «Товары». */
export function createNestedRepeaterProductFields() {
  return [
    {
      field: 'name',
      label: 'Название товара',
      type: 'text',
      placeholder: 'Название товара',
      rules: [
        { type: 'required', message: 'Название товара обязательно' },
        { type: 'minLength', value: 2, message: 'Минимум 2 символа' },
      ],
      defaultValue: '',
    },
    {
      field: 'description',
      label: 'Описание товара',
      type: 'textarea',
      placeholder: 'Описание товара',
      rules: [],
      defaultValue: '',
    },
    {
      field: 'price',
      label: 'Цена',
      type: 'number',
      placeholder: '0',
      rules: [
        { type: 'required', message: 'Цена обязательна' },
        { type: 'min', value: 0, message: 'Цена не может быть отрицательной' },
      ],
      defaultValue: 0,
    },
    {
      field: 'contactEmail',
      label: 'Email для заказа',
      type: 'email',
      placeholder: 'shop@example.com',
      rules: [{ type: 'email', message: 'Некорректный email' }],
      defaultValue: '',
    },
    {
      field: 'productUrl',
      label: 'Страница товара',
      type: 'url',
      placeholder: 'https://example.com/product',
      rules: [],
      defaultValue: '',
    },
    {
      field: 'status',
      label: 'Статус',
      type: 'select',
      options: [
        { value: 'draft', label: 'Черновик' },
        { value: 'published', label: 'Опубликован' },
        { value: 'archived', label: 'В архиве' },
      ],
      rules: [],
      defaultValue: 'published',
    },
    {
      field: 'zones',
      label: 'Зоны доставки (select, multiple)',
      type: 'select',
      multiple: true,
      options: [
        { value: 'msk', label: 'Москва' },
        { value: 'spb', label: 'Санкт-Петербург' },
        { value: 'remote', label: 'Удалённые регионы' },
      ],
      defaultValue: ['msk'],
    },
    {
      field: 'inStock',
      label: 'В наличии',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      field: 'hasDiscount',
      label: 'Скидка',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      field: 'discountPrice',
      label: 'Цена со скидкой',
      type: 'number',
      dependsOn: { field: 'hasDiscount', value: true },
      rules: [{ type: 'min', value: 0, message: 'Минимум: 0' }],
      defaultValue: 0,
    },
    {
      field: 'deliveryType',
      label: 'Доставка',
      type: 'radio',
      options: [
        { value: 'pickup', label: 'Самовывоз' },
        { value: 'courier', label: 'Курьер' },
        { value: 'post', label: 'Почта' },
      ],
      defaultValue: 'courier',
    },
    {
      field: 'accentColor',
      label: 'Акцентный цвет карточки',
      type: 'color',
      defaultValue: '#007bff',
    },
    {
      field: 'image',
      label: 'Изображение товара',
      type: 'image',
      rules: [],
      defaultValue: '',
    },
    {
      field: 'thumbnail',
      label: 'Миниатюра (image + upload)',
      type: 'image',
      rules: [],
      defaultValue: '',
      fileUploadConfig: PRODUCT_IMAGE_UPLOAD,
    },
    {
      field: 'datasheet',
      label: 'Инструкция (file)',
      type: 'file',
      rules: [],
      defaultValue: '',
      fileUploadConfig: {
        ...PRODUCT_IMAGE_UPLOAD,
        accept: ['.pdf', '.doc', '.docx'],
      },
    },
    {
      field: 'detailAnchor',
      label: 'Якорь / URL (block-anchor)',
      type: 'block-anchor',
      blockAnchorConfig: {
        placeholder: 'Блок на странице или URL',
        allowCustomUrl: true,
      },
      defaultValue: '',
    },
    {
      field: 'featuredNews',
      label: 'Связанная новость (api-select)',
      type: 'api-select',
      rules: [],
      defaultValue: null,
      apiSelectConfig: {
        url: '/api/news',
        searchParam: 'search',
        pageParam: 'page',
        limitParam: 'limit',
        placeholder: 'Выберите новость',
        noResultsText: 'Ничего не найдено',
        loadingText: 'Загрузка...',
        errorText: 'Ошибка загрузки новостей',
        limit: 10,
      },
    },
    {
      field: 'customContent',
      label: 'Доп. описание (custom / WYSIWYG)',
      type: 'custom',
      rules: [],
      defaultValue: '',
      customFieldConfig: {
        rendererId: 'wysiwyg-editor',
        options: { mode: 'simple' },
      },
    },
    {
      field: 'specsTable',
      label: 'Характеристики (matrix-table)',
      type: 'matrix-table',
      defaultValue: COMPACT_TABLE_MATRIX,
      matrixTableConfig: {
        imageUploadConfig: TABLE_MATRIX_UPLOAD_CONFIG,
      },
    },
    {
      field: 'productSpacing',
      label: 'Отступы карточки (spacing)',
      type: 'spacing',
      spacingConfig: {
        spacingTypes: ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom'],
        min: 0,
        max: 48,
        step: 4,
      },
      defaultValue: DEFAULT_PRODUCT_SPACING,
    },
    {
      field: 'tags',
      label: 'Теги (repeater)',
      type: 'repeater',
      repeaterConfig: {
        itemTitle: 'Тег',
        addButtonText: 'Добавить тег',
        removeButtonText: 'Удалить тег',
        min: 0,
        max: 10,
        fields: [
          {
            field: 'name',
            label: 'Название тега',
            type: 'text',
            rules: [{ type: 'required', message: 'Название обязательно' }],
            defaultValue: '',
          },
        ],
        defaultItemValue: { name: '' },
      },
      defaultValue: [{ name: 'Новинка' }],
    },
    {
      field: '_importTags',
      label: 'Импорт тегов (file-import)',
      type: 'file-import',
      persist: false,
      fileImportConfig: {
        accept: ['.xlsx', '.xls'],
        uploadUrl: '/api/demo/parse-xlsx',
        formDataKey: 'file',
        maxSizeMb: 5,
        responseMapper: response => response,
        merge: [
          {
            targetField: 'tags',
            sourceKey: 'data.cards',
            mode: 'append',
            dedupeBy: 'name',
            mapItem: card => ({ name: card.title || 'Импорт' }),
          },
        ],
        onImport: ({ mergeStats }) => {
          if (mergeStats?.length) {
            console.info('[nestedRepeater] import tags', mergeStats)
          }
        },
      },
    },
  ]
}

export function createNestedRepeaterDefaultProduct(overrides = {}) {
  return {
    name: 'Смартфон',
    description: 'Современный смартфон с отличной камерой',
    price: 29999,
    contactEmail: 'orders@example.com',
    productUrl: 'https://example.com/smartphone',
    status: 'published',
    zones: ['msk', 'spb'],
    inStock: true,
    hasDiscount: false,
    discountPrice: 0,
    deliveryType: 'courier',
    accentColor: '#007bff',
    image: '',
    thumbnail: '',
    datasheet: '',
    detailAnchor: '',
    featuredNews: null,
    customContent: '',
    specsTable: COMPACT_TABLE_MATRIX,
    productSpacing: DEFAULT_PRODUCT_SPACING,
    tags: [{ name: 'Новинка' }, { name: 'Хит' }],
    ...overrides,
  }
}

export function createNestedRepeaterDefaultCategory(overrides = {}) {
  return {
    name: 'Электроника',
    description: 'Современные гаджеты и устройства',
    products: [
      createNestedRepeaterDefaultProduct(),
      createNestedRepeaterDefaultProduct({
        name: 'Ноутбук',
        description: 'Мощный ноутбук для работы и игр',
        price: 59999,
        tags: [{ name: 'Работа' }],
      }),
    ],
    ...overrides,
  }
}

export function createNestedRepeaterBlockConfig({ component, framework }) {
  return {
    title: 'Каталог с вложенными репитерами',
    icon: '/icons/card.svg',
    description:
      'Вложенные репитеры: категории → товары. Во вложенном репитере — все типы полей BlockBuilder.',
    render: {
      kind: 'component',
      framework,
      component,
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок каталога',
        type: 'text',
        placeholder: 'Каталог товаров',
        rules: [],
        defaultValue: 'Каталог товаров',
      },
      {
        field: 'description',
        label: 'Описание каталога',
        type: 'textarea',
        placeholder: 'Описание каталога товаров',
        rules: [],
        defaultValue: '',
      },
      {
        field: 'categories',
        label: 'Категории',
        type: 'repeater',
        rules: [{ type: 'required', message: 'Необходима хотя бы одна категория' }],
        defaultValue: [createNestedRepeaterDefaultCategory()],
        repeaterConfig: {
          itemTitle: 'Категория',
          addButtonText: 'Добавить категорию',
          removeButtonText: 'Удалить категорию',
          min: 1,
          max: 10,
          maxNestingDepth: 3,
          fields: [
            {
              field: 'name',
              label: 'Название категории',
              type: 'text',
              placeholder: 'Название категории',
              rules: [
                { type: 'required', message: 'Название категории обязательно' },
                { type: 'minLength', value: 2, message: 'Минимум 2 символа' },
              ],
              defaultValue: '',
            },
            {
              field: 'description',
              label: 'Описание категории',
              type: 'textarea',
              placeholder: 'Описание категории',
              rules: [],
              defaultValue: '',
            },
            {
              field: 'products',
              label: 'Товары',
              type: 'repeater',
              rules: [{ type: 'required', message: 'Необходим хотя бы один товар' }],
              defaultValue: [],
              repeaterConfig: {
                itemTitle: 'Товар',
                addButtonText: 'Добавить товар',
                removeButtonText: 'Удалить товар',
                min: 1,
                max: 20,
                maxNestingDepth: 3,
                fields: createNestedRepeaterProductFields(),
                defaultItemValue: createNestedRepeaterDefaultProduct({
                  name: '',
                  description: '',
                  price: 0,
                  tags: [],
                }),
              },
            },
          ],
        },
      },
    ],
  }
}
