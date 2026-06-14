import type { IFormFieldConfig } from '../../src/core/types/form';

export interface ITestBlockTypeConfig {
  type: string;
  label: string;
  fields: IFormFieldConfig[];
  defaultSettings: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
}

export const minimalTextBlockType: ITestBlockTypeConfig = {
  type: 'text',
  label: 'Text block',
  fields: [
    {
      field: 'content',
      label: 'Content',
      type: 'textarea',
      defaultValue: '',
      rules: [{ type: 'required', message: 'Content is required' }],
    },
  ],
  defaultSettings: {},
  defaultProps: { content: '' },
};

export const toggleGroupBlockType: ITestBlockTypeConfig = {
  type: 'toggle-demo',
  label: 'Toggle demo',
  fields: [
    {
      field: 'enabled',
      label: 'Enable section',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      field: 'title',
      label: 'Title',
      type: 'text',
      defaultValue: '',
      dependsOn: { field: 'enabled', value: true },
      rules: [{ type: 'required', message: 'Title is required' }],
    },
  ],
  defaultSettings: {},
  defaultProps: { enabled: false, title: '' },
};

export const toggleRepeaterBlockType: ITestBlockTypeConfig = {
  type: 'toggle-repeater-demo',
  label: 'Toggle repeater demo',
  fields: [
    {
      field: 'showItems',
      label: 'Show items',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      field: 'items',
      label: 'Items',
      type: 'repeater',
      dependsOn: { field: 'showItems', value: true },
      defaultValue: [{ name: '' }],
      repeaterConfig: {
        itemTitle: 'Item',
        min: 1,
        fields: [
          {
            field: 'name',
            label: 'Name',
            type: 'text',
            defaultValue: '',
          },
        ],
        defaultItemValue: { name: '' },
      },
    },
  ],
  defaultSettings: {},
  defaultProps: { showItems: false, items: [{ name: '' }] },
};

/** Regression: два repeater с одинаковыми полями (как mainLogoList / otherLogoList в head-banner). */
export const dualRepeaterCheckboxBlockType: ITestBlockTypeConfig = {
  type: 'dual-repeater-demo',
  label: 'Dual repeater demo',
  fields: [
    {
      field: 'showMainLogo',
      label: 'Main logos',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      field: 'mainLogoList',
      label: 'Main list',
      type: 'repeater',
      dependsOn: { field: 'showMainLogo', value: true },
      defaultValue: [{ backing: false }],
      repeaterConfig: {
        itemTitle: 'Main logo',
        min: 1,
        fields: [
          {
            field: 'backing',
            label: 'Backing',
            type: 'checkbox',
            defaultValue: false,
          },
        ],
        defaultItemValue: { backing: false },
      },
    },
    {
      field: 'showOtherLogo',
      label: 'Other logos',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      field: 'otherLogoList',
      label: 'Other list',
      type: 'repeater',
      dependsOn: { field: 'showOtherLogo', value: true },
      defaultValue: [{ backing: false }],
      repeaterConfig: {
        itemTitle: 'Other logo',
        min: 1,
        fields: [
          {
            field: 'backing',
            label: 'Backing',
            type: 'checkbox',
            defaultValue: false,
          },
        ],
        defaultItemValue: { backing: false },
      },
    },
  ],
  defaultSettings: {},
  defaultProps: {
    showMainLogo: false,
    mainLogoList: [{ backing: false }],
    showOtherLogo: false,
    otherLogoList: [{ backing: false }],
  },
};

export const linkBlockType: ITestBlockTypeConfig = {
  type: 'link',
  label: 'Link block',
  fields: [
    {
      field: 'text',
      label: 'Link text',
      type: 'text',
      defaultValue: 'Go',
      rules: [{ type: 'required', message: 'Link text is required' }],
    },
    {
      field: 'url',
      label: 'URL',
      type: 'text',
      defaultValue: '',
      rules: [{ type: 'required', message: 'URL is required' }],
    },
    {
      field: 'hasBackground',
      label: 'Add background',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      field: 'backgroundColor',
      label: 'Background color',
      type: 'color',
      defaultValue: '#f0f0f0',
      dependsOn: { field: 'hasBackground', value: true },
    },
  ],
  defaultSettings: {},
  defaultProps: { text: 'Go', url: '', hasBackground: false, backgroundColor: '#f0f0f0' },
};

export const repeaterBlockType: ITestBlockTypeConfig = {
  type: 'cards-demo',
  label: 'Cards demo',
  fields: [
    {
      field: 'cards',
      label: 'Cards',
      type: 'repeater',
      defaultValue: [
        { title: 'First card', text: 'First description' },
      ],
      repeaterConfig: {
        itemTitle: 'Card',
        addButtonText: 'Add card',
        removeButtonText: 'Remove',
        min: 1,
        max: 5,
        fields: [
          {
            field: 'title',
            label: 'Title',
            type: 'text',
            defaultValue: '',
            rules: [{ type: 'required', message: 'Title is required' }],
          },
          {
            field: 'text',
            label: 'Description',
            type: 'textarea',
            defaultValue: '',
            rules: [{ type: 'required', message: 'Description is required' }],
          },
        ],
      },
    },
  ],
  defaultSettings: {},
  defaultProps: { cards: [] },
};

export const repeaterToggleBlockType: ITestBlockTypeConfig = {
  type: 'slides-demo',
  label: 'Slides demo',
  fields: [
    {
      field: 'slides',
      label: 'Slides',
      type: 'repeater',
      defaultValue: [{ title: 'Slide 1', hasLink: false, linkUrl: '' }],
      repeaterConfig: {
        itemTitle: 'Slide',
        addButtonText: 'Add slide',
        fields: [
          {
            field: 'title',
            label: 'Title',
            type: 'text',
            defaultValue: '',
            rules: [{ type: 'required', message: 'Title is required' }],
          },
          {
            field: 'hasLink',
            label: 'Add link',
            type: 'checkbox',
            defaultValue: false,
          },
          {
            field: 'linkUrl',
            label: 'Link URL',
            type: 'text',
            defaultValue: '',
            dependsOn: { field: 'hasLink', value: true },
            rules: [{ type: 'required', message: 'Link URL is required' }],
          },
        ],
      },
    },
  ],
  defaultSettings: {},
  defaultProps: { slides: [] },
};

export const nestedRepeaterBlockType: ITestBlockTypeConfig = {
  type: 'catalog-demo',
  label: 'Catalog demo',
  fields: [
    {
      field: 'categories',
      label: 'Categories',
      type: 'repeater',
      rules: [{ type: 'required', message: 'At least one category is required' }],
      defaultValue: [
        {
          name: 'Electronics',
          products: [{ name: 'Phone', price: 100 }],
        },
      ],
      repeaterConfig: {
        itemTitle: 'Category',
        addButtonText: 'Add category',
        removeButtonText: 'Remove category',
        min: 1,
        max: 5,
        maxNestingDepth: 2,
        fields: [
          {
            field: 'name',
            label: 'Category name',
            type: 'text',
            defaultValue: '',
            rules: [{ type: 'required', message: 'Category name is required' }],
          },
          {
            field: 'products',
            label: 'Products',
            type: 'repeater',
            rules: [{ type: 'required', message: 'At least one product is required' }],
            defaultValue: [],
            repeaterConfig: {
              itemTitle: 'Product',
              addButtonText: 'Add product',
              removeButtonText: 'Remove product',
              min: 1,
              max: 10,
              maxNestingDepth: 2,
              fields: [
                {
                  field: 'name',
                  label: 'Product name',
                  type: 'text',
                  defaultValue: '',
                  rules: [{ type: 'required', message: 'Product name is required' }],
                },
                {
                  field: 'price',
                  label: 'Price',
                  type: 'number',
                  defaultValue: 0,
                  rules: [{ type: 'required', message: 'Price is required' }],
                },
              ],
            },
          },
        ],
      },
    },
  ],
  defaultSettings: {},
  defaultProps: { categories: [] },
};
