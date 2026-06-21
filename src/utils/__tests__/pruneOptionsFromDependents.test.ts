import type { IFormFieldConfig } from '../../core/types/form';
import {
  areSelectValuesEqual,
  fieldTreeHasOptionsFromSource,
  pruneOptionsFromDependents,
  pruneSelectValueByOptions,
} from '../pruneOptionsFromDependents';

const formFeaturesFields: IFormFieldConfig[] = [
  {
    field: 'filterOptions',
    label: 'Filters',
    type: 'repeater',
    repeaterConfig: {
      fields: [
        { field: 'name', label: 'Name', type: 'text' },
        {
          field: 'options',
          label: 'Options',
          type: 'repeater',
          repeaterConfig: {
            fields: [{ field: 'name', label: 'Name', type: 'text' }],
          },
        },
      ],
    },
  },
  {
    field: 'items',
    label: 'Items',
    type: 'repeater',
    repeaterConfig: {
      fields: [
        { field: 'title', label: 'Title', type: 'text' },
        {
          field: 'filters',
          label: 'Filters',
          type: 'select',
          multiple: true,
          optionsFrom: {
            source: 'filterOptions',
            map: (filter: { name: string; options: { name: string }[] }) => ({
              group: filter.name,
              options: filter.options.map(option => ({
                value: option.name,
                label: option.name,
              })),
            }),
          },
        },
      ],
    },
  },
];

describe('pruneSelectValueByOptions', () => {
  it('removes stale values from multiple select', () => {
    const options = [
      { value: 'A', label: 'A' },
      { value: 'B', label: 'B' },
    ];

    expect(pruneSelectValueByOptions(['A', 'C'], options, true)).toEqual(['A']);
  });

  it('clears invalid single select value', () => {
    const options = [{ value: 'A', label: 'A' }];
    expect(pruneSelectValueByOptions('C', options, false)).toBe('');
  });
});

describe('areSelectValuesEqual', () => {
  it('compares multiple arrays by value', () => {
    expect(areSelectValuesEqual(['A', 'B'], ['A', 'B'], true)).toBe(true);
    expect(areSelectValuesEqual(['A', 'B'], ['A'], true)).toBe(false);
  });
});

describe('fieldTreeHasOptionsFromSource', () => {
  it('detects nested optionsFrom source', () => {
    expect(fieldTreeHasOptionsFromSource(formFeaturesFields, 'filterOptions')).toBe(true);
    expect(fieldTreeHasOptionsFromSource(formFeaturesFields, 'items')).toBe(false);
  });
});

describe('pruneOptionsFromDependents', () => {
  it('removes deleted filter option from card bindings', () => {
    const formData = {
      filterOptions: [
        {
          name: 'Category',
          options: [{ name: 'Electronics' }],
        },
      ],
      items: [
        { title: 'Card 1', filters: ['Electronics', 'Books'] },
        { title: 'Card 2', filters: ['Books'] },
      ],
    };

    const changed = pruneOptionsFromDependents(formData, formFeaturesFields, 'filterOptions');

    expect(changed).toBe(true);
    expect(formData.items).toEqual([
      { title: 'Card 1', filters: ['Electronics'] },
      { title: 'Card 2', filters: [] },
    ]);
  });

  it('removes all values from deleted filter group', () => {
    const formData = {
      filterOptions: [],
      items: [{ title: 'Card 1', filters: ['Electronics', 'Books'] }],
    };

    const changed = pruneOptionsFromDependents(formData, formFeaturesFields, 'filterOptions');

    expect(changed).toBe(true);
    expect(formData.items).toEqual([{ title: 'Card 1', filters: [] }]);
  });

  it('does nothing when source field is unrelated', () => {
    const formData = {
      filterOptions: [{ name: 'Category', options: [{ name: 'Electronics' }] }],
      items: [{ title: 'Card 1', filters: ['Electronics'] }],
    };

    const changed = pruneOptionsFromDependents(formData, formFeaturesFields, 'title');

    expect(changed).toBe(false);
    expect(formData.items).toEqual([{ title: 'Card 1', filters: ['Electronics'] }]);
  });
});
