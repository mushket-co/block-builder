import type { IFormFieldConfig } from '../../core/types';
import { UniversalValidator } from '../universalValidation';

const toggleFields: IFormFieldConfig[] = [
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
];

const nestedRepeaterFields: IFormFieldConfig[] = [
  {
    field: 'categories',
    label: 'Categories',
    type: 'repeater',
    rules: [{ type: 'required', message: 'Category is required' }],
    repeaterConfig: {
      fields: [
        {
          field: 'name',
          label: 'Category name',
          type: 'text',
          rules: [{ type: 'required', message: 'Name is required' }],
        },
        {
          field: 'products',
          label: 'Products',
          type: 'repeater',
          rules: [{ type: 'required', message: 'Product is required' }],
          repeaterConfig: {
            fields: [
              {
                field: 'title',
                label: 'Product title',
                type: 'text',
                rules: [{ type: 'required', message: 'Product title is required' }],
              },
            ],
          },
        },
      ],
    },
  },
];

function isFieldVisible(field: IFormFieldConfig, formData: Record<string, unknown>): boolean {
  if (!field.dependsOn) {
    return true;
  }

  return formData[field.dependsOn.field] === field.dependsOn.value;
}

describe('UniversalValidator', () => {
  describe('validateForm with dependsOn visibility', () => {
    test('skips required validation for hidden dependent field', () => {
      const result = UniversalValidator.validateForm(
        { enabled: false, title: '' },
        toggleFields,
        field => isFieldVisible(field, { enabled: false, title: '' })
      );

      expect(result.isValid).toBe(true);
      expect(result.errors.title).toBeUndefined();
    });

    test('validates dependent field when toggle is enabled', () => {
      const result = UniversalValidator.validateForm(
        { enabled: true, title: '' },
        toggleFields,
        field => isFieldVisible(field, { enabled: true, title: '' })
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toContain('Title is required');
    });
  });

  describe('validateRepeaterRecursive', () => {
    test('returns nested field errors with full paths', () => {
      const formData = {
        categories: [
          {
            name: 'Electronics',
            products: [{ title: '' }, { title: 'Phone' }],
          },
        ],
      };

      const result = UniversalValidator.validateForm(formData, nestedRepeaterFields);

      expect(result.isValid).toBe(false);
      expect(result.errors['categories[0].products[0].title']).toContain('Product title is required');
      expect(result.errors['categories[0].products[1].title']).toBeUndefined();
    });

    test('skips nested dependent fields when visibility callback returns false', () => {
      const repeaterFields: IFormFieldConfig[] = [
        {
          field: 'slides',
          label: 'Slides',
          type: 'repeater',
          repeaterConfig: {
            fields: [
              {
                field: 'hasLink',
                label: 'Add link',
                type: 'checkbox',
                defaultValue: false,
              },
              {
                field: 'url',
                label: 'URL',
                type: 'text',
                dependsOn: { field: 'hasLink', value: true },
                rules: [{ type: 'required', message: 'URL is required' }],
              },
            ],
          },
        },
      ];

      const formData = {
        slides: [{ hasLink: false, url: '' }],
      };

      const result = UniversalValidator.validateForm(formData, repeaterFields, (field, itemData) => {
        if (!field.dependsOn || !itemData) {
          return true;
        }

        return itemData[field.dependsOn.field] === field.dependsOn.value;
      });

      expect(result.isValid).toBe(true);
    });
  });
});
