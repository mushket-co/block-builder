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

const DEMO_PRODUCT_MEDIA = {
  image: 'https://picsum.photos/seed/bb-product/800/600',
  thumbnail: 'https://picsum.photos/seed/bb-thumb/200/200',
  datasheet: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  detailAnchor: 'https://example.com/catalog/smartphone',
  featuredNews: { id: 1, name: 'Новость 1: Запуск нового продукта' },
  customContent: '<p>Дополнительное описание для карточки товара.</p>',
}

const NESTED_REPEATER_I18N = {
  ru: {
    blockTitle: 'Каталог с вложенными репитерами',
    blockDescription:
      'Вложенные репитеры: категории → товары. Во вложенном репитере — все типы полей BlockBuilder.',
    catalogTitle: 'Заголовок каталога',
    catalogDescription: 'Описание каталога',
    categories: 'Категории',
    categoryItem: 'Категория',
    addCategory: 'Добавить категорию',
    removeCategory: 'Удалить категорию',
    categoryName: 'Название категории',
    categoryDescription: 'Описание категории',
    products: 'Товары',
    productItem: 'Товар',
    addProduct: 'Добавить товар',
    removeProduct: 'Удалить товар',
    tagItem: 'Тег',
    addTag: 'Добавить тег',
    removeTag: 'Удалить тег',
    tagName: 'Название тега',
    msg: {
      catalogTitleRequired: 'Заголовок каталога обязателен',
      catalogTitleMin: 'Минимум 3 символа',
      catalogTitleMax: 'Максимум 80 символов',
      catalogDescriptionRequired: 'Описание каталога обязательно',
      catalogDescriptionMin: 'Минимум 10 символов',
      catalogDescriptionMax: 'Максимум 1000 символов',
      categoriesRequired: 'Необходима хотя бы одна категория',
      categoryNameRequired: 'Название категории обязательно',
      categoryNameMin: 'Минимум 2 символа',
      categoryNameMax: 'Максимум 80 символов',
      categoryDescriptionRequired: 'Описание категории обязательно',
      categoryDescriptionMin: 'Минимум 10 символов',
      categoryDescriptionMax: 'Максимум 500 символов',
      productsRequired: 'Необходим хотя бы один товар',
      productNameRequired: 'Название товара обязательно',
      productNameMin: 'Минимум 2 символа',
      productNameMax: 'Максимум 120 символов',
      productDescriptionRequired: 'Описание товара обязательно',
      productDescriptionMin: 'Минимум 10 символов',
      productDescriptionMax: 'Максимум 2000 символов',
      priceRequired: 'Цена обязательна',
      priceMin: 'Цена не может быть отрицательной',
      priceMax: 'Максимальная цена: 99 999 999',
      emailRequired: 'Email обязателен',
      emailInvalid: 'Некорректный email',
      urlRequired: 'URL страницы товара обязателен',
      urlInvalid: 'Некорректный URL',
      statusRequired: 'Выберите статус',
      zonesRequired: 'Выберите хотя бы одну зону доставки',
      deliveryRequired: 'Выберите способ доставки',
      colorRequired: 'Выберите цвет',
      imageRequired: 'Загрузите изображение товара',
      thumbnailRequired: 'Загрузите миниатюру',
      fileRequired: 'Загрузите файл инструкции',
      anchorRequired: 'Укажите якорь или URL',
      anchorMin: 'Минимум 3 символа',
      newsRequired: 'Выберите связанную новость',
      customContentRequired: 'Заполните доп. описание',
      customContentMin: 'Минимум 5 символов',
      specsRequired: 'Заполните таблицу характеристик',
      spacingRequired: 'Настройте отступы карточки',
      tagsRequired: 'Добавьте хотя бы один тег',
      tagNameRequired: 'Название тега обязательно',
      tagNameMin: 'Минимум 2 символа',
      tagNameMax: 'Максимум 40 символов',
      discountPriceRequired: 'Укажите цену со скидкой',
      discountPriceMin: 'Минимум: 0',
    },
    defaults: {
      catalogTitle: 'Каталог товаров',
      catalogDescription: 'Демонстрационный каталог с вложенными репитерами и полной валидацией полей.',
      featuredNewsName: 'Новость 1: Запуск нового продукта',
      customContent: '<p>Дополнительное описание для карточки товара.</p>',
    },
  },
  en: {
    blockTitle: 'Catalog with nested repeaters',
    blockDescription:
      'Nested repeaters: categories → products. The nested repeater includes all BlockBuilder field types.',
    catalogTitle: 'Catalog title',
    catalogDescription: 'Catalog description',
    categories: 'Categories',
    categoryItem: 'Category',
    addCategory: 'Add category',
    removeCategory: 'Remove category',
    categoryName: 'Category name',
    categoryDescription: 'Category description',
    products: 'Products',
    productItem: 'Product',
    addProduct: 'Add product',
    removeProduct: 'Remove product',
    tagItem: 'Tag',
    addTag: 'Add tag',
    removeTag: 'Remove tag',
    tagName: 'Tag name',
    msg: {
      catalogTitleRequired: 'Catalog title is required',
      catalogTitleMin: 'Minimum 3 characters',
      catalogTitleMax: 'Maximum 80 characters',
      catalogDescriptionRequired: 'Catalog description is required',
      catalogDescriptionMin: 'Minimum 10 characters',
      catalogDescriptionMax: 'Maximum 1000 characters',
      categoriesRequired: 'At least one category is required',
      categoryNameRequired: 'Category name is required',
      categoryNameMin: 'Minimum 2 characters',
      categoryNameMax: 'Maximum 80 characters',
      categoryDescriptionRequired: 'Category description is required',
      categoryDescriptionMin: 'Minimum 10 characters',
      categoryDescriptionMax: 'Maximum 500 characters',
      productsRequired: 'At least one product is required',
      productNameRequired: 'Product name is required',
      productNameMin: 'Minimum 2 characters',
      productNameMax: 'Maximum 120 characters',
      productDescriptionRequired: 'Product description is required',
      productDescriptionMin: 'Minimum 10 characters',
      productDescriptionMax: 'Maximum 2000 characters',
      priceRequired: 'Price is required',
      priceMin: 'Price cannot be negative',
      priceMax: 'Maximum price: 99,999,999',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email',
      urlRequired: 'Product page URL is required',
      urlInvalid: 'Invalid URL',
      statusRequired: 'Select a status',
      zonesRequired: 'Select at least one delivery zone',
      deliveryRequired: 'Select a delivery method',
      colorRequired: 'Select a color',
      imageRequired: 'Upload a product image',
      thumbnailRequired: 'Upload a thumbnail',
      fileRequired: 'Upload a manual file',
      anchorRequired: 'Specify an anchor or URL',
      anchorMin: 'Minimum 3 characters',
      newsRequired: 'Select related news',
      customContentRequired: 'Fill in additional description',
      customContentMin: 'Minimum 5 characters',
      specsRequired: 'Fill in the specifications table',
      spacingRequired: 'Configure card spacing',
      tagsRequired: 'Add at least one tag',
      tagNameRequired: 'Tag name is required',
      tagNameMin: 'Minimum 2 characters',
      tagNameMax: 'Maximum 40 characters',
      discountPriceRequired: 'Discount price is required',
      discountPriceMin: 'Minimum: 0',
    },
    defaults: {
      catalogTitle: 'Product catalog',
      catalogDescription: 'Demo catalog with nested repeaters and full field validation.',
      featuredNewsName: 'News 1: New product launch',
      customContent: '<p>Additional description for the product card.</p>',
    },
  },
}

function resolveNestedRepeaterI18n(locale = 'ru') {
  return NESTED_REPEATER_I18N[locale] ?? NESTED_REPEATER_I18N.ru
}

/** Все типы полей BlockBuilder для демо во вложенном репитере «Товары». */
export function createNestedRepeaterProductFields(locale = 'ru') {
  const t = resolveNestedRepeaterI18n(locale)
  const m = t.msg

  return [
    {
      field: 'name',
      label: locale === 'en' ? 'Product name' : 'Название товара',
      type: 'text',
      placeholder: locale === 'en' ? 'Product name' : 'Название товара',
      rules: [
        { type: 'required', message: m.productNameRequired },
        { type: 'minLength', value: 2, message: m.productNameMin },
        { type: 'maxLength', value: 120, message: m.productNameMax },
      ],
      defaultValue: '',
    },
    {
      field: 'description',
      label: locale === 'en' ? 'Product description' : 'Описание товара',
      type: 'textarea',
      placeholder: locale === 'en' ? 'Product description' : 'Описание товара',
      rules: [
        { type: 'required', message: m.productDescriptionRequired },
        { type: 'minLength', value: 10, message: m.productDescriptionMin },
        { type: 'maxLength', value: 2000, message: m.productDescriptionMax },
      ],
      defaultValue: '',
    },
    {
      field: 'price',
      label: locale === 'en' ? 'Price' : 'Цена',
      type: 'number',
      placeholder: '0',
      rules: [
        { type: 'required', message: m.priceRequired },
        { type: 'min', value: 0, message: m.priceMin },
        { type: 'max', value: 99999999, message: m.priceMax },
      ],
      defaultValue: 0,
    },
    {
      field: 'contactEmail',
      label: locale === 'en' ? 'Order email' : 'Email для заказа',
      type: 'email',
      placeholder: 'shop@example.com',
      rules: [
        { type: 'required', message: m.emailRequired },
        { type: 'email', message: m.emailInvalid },
      ],
      defaultValue: '',
    },
    {
      field: 'productUrl',
      label: locale === 'en' ? 'Product page' : 'Страница товара',
      type: 'url',
      placeholder: 'https://example.com/product',
      rules: [
        { type: 'required', message: m.urlRequired },
        { type: 'url', message: m.urlInvalid },
      ],
      defaultValue: '',
    },
    {
      field: 'status',
      label: locale === 'en' ? 'Status' : 'Статус',
      type: 'select',
      options: [
        { value: 'draft', label: locale === 'en' ? 'Draft' : 'Черновик' },
        { value: 'published', label: locale === 'en' ? 'Published' : 'Опубликован' },
        { value: 'archived', label: locale === 'en' ? 'Archived' : 'В архиве' },
      ],
      rules: [{ type: 'required', message: m.statusRequired }],
      defaultValue: 'published',
    },
    {
      field: 'zones',
      label:
        locale === 'en' ? 'Delivery zones (select, multiple)' : 'Зоны доставки (select, multiple)',
      type: 'select',
      multiple: true,
      options: [
        { value: 'msk', label: locale === 'en' ? 'Moscow' : 'Москва' },
        { value: 'spb', label: locale === 'en' ? 'Saint Petersburg' : 'Санкт-Петербург' },
        { value: 'remote', label: locale === 'en' ? 'Remote regions' : 'Удалённые регионы' },
      ],
      rules: [{ type: 'required', message: m.zonesRequired }],
      defaultValue: ['msk'],
    },
    {
      field: 'inStock',
      label: locale === 'en' ? 'In stock' : 'В наличии',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      field: 'hasDiscount',
      label: locale === 'en' ? 'Discount' : 'Скидка',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      field: 'discountPrice',
      label: locale === 'en' ? 'Discounted price' : 'Цена со скидкой',
      type: 'number',
      dependsOn: { field: 'hasDiscount', value: true },
      rules: [
        { type: 'required', message: m.discountPriceRequired },
        { type: 'min', value: 0, message: m.discountPriceMin },
      ],
      defaultValue: 0,
    },
    {
      field: 'deliveryType',
      label: locale === 'en' ? 'Delivery' : 'Доставка',
      type: 'radio',
      options: [
        { value: 'pickup', label: locale === 'en' ? 'Pickup' : 'Самовывоз' },
        { value: 'courier', label: locale === 'en' ? 'Courier' : 'Курьер' },
        { value: 'post', label: locale === 'en' ? 'Mail' : 'Почта' },
      ],
      rules: [{ type: 'required', message: m.deliveryRequired }],
      defaultValue: 'courier',
    },
    {
      field: 'accentColor',
      label: locale === 'en' ? 'Card accent color' : 'Акцентный цвет карточки',
      type: 'color',
      rules: [{ type: 'required', message: m.colorRequired }],
      defaultValue: '#007bff',
    },
    {
      field: 'image',
      label: locale === 'en' ? 'Product image' : 'Изображение товара',
      type: 'image',
      rules: [{ type: 'required', message: m.imageRequired }],
      defaultValue: '',
    },
    {
      field: 'thumbnail',
      label: locale === 'en' ? 'Thumbnail (image + upload)' : 'Миниатюра (image + upload)',
      type: 'image',
      rules: [{ type: 'required', message: m.thumbnailRequired }],
      defaultValue: '',
      fileUploadConfig: PRODUCT_IMAGE_UPLOAD,
    },
    {
      field: 'datasheet',
      label: locale === 'en' ? 'Manual (file)' : 'Инструкция (file)',
      type: 'file',
      rules: [{ type: 'required', message: m.fileRequired }],
      defaultValue: '',
      fileUploadConfig: {
        ...PRODUCT_IMAGE_UPLOAD,
        accept: ['.pdf', '.doc', '.docx'],
      },
    },
    {
      field: 'detailAnchor',
      label: locale === 'en' ? 'Anchor / URL (block-anchor)' : 'Якорь / URL (block-anchor)',
      type: 'block-anchor',
      blockAnchorConfig: {
        placeholder: locale === 'en' ? 'Block on page or URL' : 'Блок на странице или URL',
        allowCustomUrl: true,
      },
      rules: [
        { type: 'required', message: m.anchorRequired },
        { type: 'minLength', value: 3, message: m.anchorMin },
      ],
      defaultValue: '',
    },
    {
      field: 'featuredNews',
      label: locale === 'en' ? 'Related news (api-select)' : 'Связанная новость (api-select)',
      type: 'api-select',
      rules: [{ type: 'required', message: m.newsRequired }],
      defaultValue: null,
      apiSelectConfig: {
        url: '/api/news',
        searchParam: 'search',
        pageParam: 'page',
        limitParam: 'limit',
        placeholder: locale === 'en' ? 'Select news' : 'Выберите новость',
        noResultsText: locale === 'en' ? 'Nothing found' : 'Ничего не найдено',
        loadingText: locale === 'en' ? 'Loading...' : 'Загрузка...',
        errorText: locale === 'en' ? 'Failed to load news' : 'Ошибка загрузки новостей',
        limit: 10,
      },
    },
    {
      field: 'customContent',
      label:
        locale === 'en'
          ? 'Additional description (custom / WYSIWYG)'
          : 'Доп. описание (custom / WYSIWYG)',
      type: 'custom',
      rules: [
        { type: 'required', message: m.customContentRequired },
        { type: 'minLength', value: 5, message: m.customContentMin },
      ],
      defaultValue: '',
      customFieldConfig: {
        rendererId: 'wysiwyg-editor',
        options: { mode: 'simple' },
      },
    },
    {
      field: 'specsTable',
      label: locale === 'en' ? 'Specifications (matrix-table)' : 'Характеристики (matrix-table)',
      type: 'matrix-table',
      rules: [{ type: 'required', message: m.specsRequired }],
      defaultValue: COMPACT_TABLE_MATRIX,
      matrixTableConfig: {
        imageUploadConfig: TABLE_MATRIX_UPLOAD_CONFIG,
      },
    },
    {
      field: 'productSpacing',
      label: locale === 'en' ? 'Card spacing' : 'Отступы карточки (spacing)',
      type: 'spacing',
      rules: [{ type: 'required', message: m.spacingRequired }],
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
      label: locale === 'en' ? 'Tags (repeater)' : 'Теги (repeater)',
      type: 'repeater',
      rules: [{ type: 'required', message: m.tagsRequired }],
      repeaterConfig: {
        itemTitle: t.tagItem,
        addButtonText: t.addTag,
        removeButtonText: t.removeTag,
        min: 1,
        max: 10,
        fields: [
          {
            field: 'name',
            label: t.tagName,
            type: 'text',
            rules: [
              { type: 'required', message: m.tagNameRequired },
              { type: 'minLength', value: 2, message: m.tagNameMin },
              { type: 'maxLength', value: 40, message: m.tagNameMax },
            ],
            defaultValue: '',
          },
        ],
        defaultItemValue: { name: '' },
      },
      defaultValue: [{ name: locale === 'en' ? 'New' : 'Новинка' }],
    },
    {
      field: '_importTags',
      label: locale === 'en' ? 'Import tags (file-import)' : 'Импорт тегов (file-import)',
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
            mapItem: card => ({ name: card.title || (locale === 'en' ? 'Import' : 'Импорт') }),
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

export function createNestedRepeaterDefaultProduct(locale = 'ru', overrides = {}) {
  const t = resolveNestedRepeaterI18n(locale)

  return {
    name: locale === 'en' ? 'Smartphone' : 'Смартфон',
    description:
      locale === 'en'
        ? 'Modern smartphone with an excellent camera'
        : 'Современный смартфон с отличной камерой',
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
    image: DEMO_PRODUCT_MEDIA.image,
    thumbnail: DEMO_PRODUCT_MEDIA.thumbnail,
    datasheet: DEMO_PRODUCT_MEDIA.datasheet,
    detailAnchor: DEMO_PRODUCT_MEDIA.detailAnchor,
    featuredNews: { id: 1, name: t.defaults.featuredNewsName },
    customContent: t.defaults.customContent,
    specsTable: COMPACT_TABLE_MATRIX,
    productSpacing: DEFAULT_PRODUCT_SPACING,
    tags: [
      { name: locale === 'en' ? 'New' : 'Новинка' },
      { name: locale === 'en' ? 'Best seller' : 'Хит' },
    ],
    ...overrides,
  }
}

export function createNestedRepeaterDefaultCategory(locale = 'ru', overrides = {}) {
  return {
    name: locale === 'en' ? 'Electronics' : 'Электроника',
    description:
      locale === 'en'
        ? 'Modern gadgets and devices'
        : 'Современные гаджеты и устройства',
    products: [
      createNestedRepeaterDefaultProduct(locale),
      createNestedRepeaterDefaultProduct(locale, {
        name: locale === 'en' ? 'Laptop' : 'Ноутбук',
        description:
          locale === 'en'
            ? 'Powerful laptop for work and gaming'
            : 'Мощный ноутбук для работы и игр',
        price: 59999,
        tags: [{ name: locale === 'en' ? 'Work' : 'Работа' }],
      }),
    ],
    ...overrides,
  }
}

export function createNestedRepeaterBlockConfig({ component, framework, locale = 'ru' }) {
  const t = resolveNestedRepeaterI18n(locale)
  const m = t.msg

  return {
    title: t.blockTitle,
    icon: '/icons/card.svg',
    description: t.blockDescription,
    render: {
      kind: 'component',
      framework,
      component,
    },
    fields: [
      {
        field: 'title',
        label: t.catalogTitle,
        type: 'text',
        placeholder: t.defaults.catalogTitle,
        rules: [
          { type: 'required', message: m.catalogTitleRequired },
          { type: 'minLength', value: 3, message: m.catalogTitleMin },
          { type: 'maxLength', value: 80, message: m.catalogTitleMax },
        ],
        defaultValue: t.defaults.catalogTitle,
      },
      {
        field: 'description',
        label: t.catalogDescription,
        type: 'textarea',
        placeholder: t.defaults.catalogDescription,
        rules: [
          { type: 'required', message: m.catalogDescriptionRequired },
          { type: 'minLength', value: 10, message: m.catalogDescriptionMin },
          { type: 'maxLength', value: 1000, message: m.catalogDescriptionMax },
        ],
        defaultValue: t.defaults.catalogDescription,
      },
      {
        field: 'categories',
        label: t.categories,
        type: 'repeater',
        rules: [{ type: 'required', message: m.categoriesRequired }],
        defaultValue: [createNestedRepeaterDefaultCategory(locale)],
        repeaterConfig: {
          itemTitle: t.categoryItem,
          addButtonText: t.addCategory,
          removeButtonText: t.removeCategory,
          min: 1,
          max: 10,
          maxNestingDepth: 3,
          fields: [
            {
              field: 'name',
              label: t.categoryName,
              type: 'text',
              placeholder: t.categoryName,
              rules: [
                { type: 'required', message: m.categoryNameRequired },
                { type: 'minLength', value: 2, message: m.categoryNameMin },
                { type: 'maxLength', value: 80, message: m.categoryNameMax },
              ],
              defaultValue: '',
            },
            {
              field: 'description',
              label: t.categoryDescription,
              type: 'textarea',
              placeholder: t.categoryDescription,
              rules: [
                { type: 'required', message: m.categoryDescriptionRequired },
                { type: 'minLength', value: 10, message: m.categoryDescriptionMin },
                { type: 'maxLength', value: 500, message: m.categoryDescriptionMax },
              ],
              defaultValue: '',
            },
            {
              field: 'products',
              label: t.products,
              type: 'repeater',
              rules: [{ type: 'required', message: m.productsRequired }],
              defaultValue: [],
              repeaterConfig: {
                itemTitle: t.productItem,
                addButtonText: t.addProduct,
                removeButtonText: t.removeProduct,
                min: 1,
                max: 20,
                maxNestingDepth: 3,
                fields: createNestedRepeaterProductFields(locale),
                defaultItemValue: createNestedRepeaterDefaultProduct(locale, {
                  name: '',
                  price: 0,
                }),
              },
            },
          ],
        },
      },
    ],
  }
}
