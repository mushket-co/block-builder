import { stripNonPersistedFields } from '../stripNonPersistedFields';
import {
  resolveDynamicSelectOptions,
  isDynamicSelectFieldVisible,
} from '../resolveDynamicSelectOptions';
import type { IFormFieldConfig } from '../../core/types/form';

describe('stripNonPersistedFields', () => {
  it('removes top-level fields with persist: false', () => {
    const fields: IFormFieldConfig[] = [
      { field: 'title', label: 'Title', type: 'text' },
      { field: '_import', label: 'Import', type: 'file-import', persist: false },
    ];

    const result = stripNonPersistedFields(
      { title: 'Hello', _import: null },
      fields
    );

    expect(result).toEqual({ title: 'Hello' });
  });

  it('removes file-import fields implicitly', () => {
    const fields: IFormFieldConfig[] = [
      { field: '_xlsx', label: 'XLSX', type: 'file-import' },
    ];

    const result = stripNonPersistedFields({ _xlsx: null }, fields);
    expect(result).toEqual({});
  });

  it('strips nested repeater non-persisted fields', () => {
    const fields: IFormFieldConfig[] = [
      {
        field: 'items',
        label: 'Items',
        type: 'repeater',
        repeaterConfig: {
          fields: [
            { field: 'name', label: 'Name', type: 'text' },
            { field: '_tool', label: 'Tool', type: 'custom', persist: false },
          ],
        },
      },
    ];

    const result = stripNonPersistedFields(
      {
        items: [{ name: 'A', _tool: 'x' }, { name: 'B', _tool: 'y' }],
      },
      fields
    );

    expect(result).toEqual({ items: [{ name: 'A' }, { name: 'B' }] });
  });
});

describe('resolveDynamicSelectOptions', () => {
  const formData = {
    showFilterOptions: true,
    filterOptions: [
      {
        name: 'Category',
        options: [{ name: 'A' }, { name: 'B' }],
      },
    ],
  };

  it('returns static options when optionsFrom is absent', () => {
    const options = resolveDynamicSelectOptions(
      {
        field: 'color',
        label: 'Color',
        type: 'select',
        options: [{ value: 'red', label: 'Red' }],
      },
      formData
    );

    expect(options).toEqual([{ value: 'red', label: 'Red' }]);
  });

  it('maps grouped options from source field', () => {
    const options = resolveDynamicSelectOptions(
      {
        field: 'filters',
        label: 'Filters',
        type: 'select',
        multiple: true,
        optionsFrom: {
          source: 'filterOptions',
          when: { field: 'showFilterOptions', value: true },
          map: (filter: { name: string; options: { name: string }[] }) => ({
            group: filter.name,
            options: filter.options.map(o => ({ value: o.name, label: o.name })),
          }),
        },
      },
      formData
    );

    expect(options).toEqual([
      { value: 'A', label: 'A', group: 'Category' },
      { value: 'B', label: 'B', group: 'Category' },
    ]);
  });

  it('returns empty when when-condition fails', () => {
    const options = resolveDynamicSelectOptions(
      {
        field: 'filters',
        label: 'Filters',
        type: 'select',
        optionsFrom: {
          source: 'filterOptions',
          when: { field: 'showFilterOptions', value: false },
        },
      },
      { ...formData, showFilterOptions: true }
    );

    expect(options).toEqual([]);
  });
});

describe('isDynamicSelectFieldVisible', () => {
  it('respects dependsOn and optionsFrom.when', () => {
    const field: IFormFieldConfig = {
      field: 'filters',
      label: 'Filters',
      type: 'select',
      dependsOn: { field: 'enabled', value: true },
      optionsFrom: {
        source: 'filterOptions',
        when: { field: 'showFilterOptions', value: true },
      },
    };

    expect(
      isDynamicSelectFieldVisible(field, { enabled: true, showFilterOptions: true })
    ).toBe(true);
    expect(
      isDynamicSelectFieldVisible(field, { enabled: false, showFilterOptions: true })
    ).toBe(false);
  });
});
