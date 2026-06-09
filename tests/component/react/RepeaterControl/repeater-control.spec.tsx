import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RepeaterControl } from '../../../../src/react/components/RepeaterControl';
import { cleanupReactTestHost, renderWithHost } from '../helpers/renderWithHost';

const repeaterFields = [
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
];

describe('RepeaterControl (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('adds a new repeater item', async () => {
    const onChange = vi.fn();

    const { host } = renderWithHost(
      <RepeaterControl
        fieldName="cards"
        label="Cards"
        modelValue={[{ title: 'One', text: 'Desc' }]}
        fields={repeaterFields}
        addButtonText="Add card"
        itemTitle="Card"
        onChange={onChange}
      />
    );

    await waitFor(() => {
      expect(host.querySelectorAll('.bb-repeater-control__item')).toHaveLength(1);
    });

    fireEvent.click(host.querySelector('.bb-repeater-control__add-btn')!);

    await waitFor(() => {
      expect(host.querySelectorAll('.bb-repeater-control__item')).toHaveLength(2);
    });
    expect(onChange.mock.calls.at(-1)?.[0]).toHaveLength(2);
  });

  it('collapses item accordion and hides fields', async () => {
    const { host } = renderWithHost(
      <RepeaterControl
        fieldName="cards"
        label="Cards"
        modelValue={[{ title: 'One', text: 'Desc' }]}
        fields={repeaterFields}
        itemTitle="Card"
        onChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(host.querySelector('.bb-repeater-control__item-fields')).toBeTruthy();
    });

    fireEvent.click(host.querySelector('.bb-repeater-control__item-btn--collapse')!);

    await waitFor(() => {
      expect(host.querySelector('.bb-repeater-control__item--collapsed')).toBeTruthy();
      expect(host.querySelector('.bb-repeater-control__item-fields')).toBeNull();
    });
  });

  it('shows toggle-group inside repeater item', async () => {
    const { host } = renderWithHost(
      <RepeaterControl
        fieldName="slides"
        label="Slides"
        modelValue={[{ title: 'Slide', hasLink: false, linkUrl: '' }]}
        fields={[
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
            dependsOn: { field: 'hasLink', value: true },
            rules: [{ type: 'required', message: 'Required' }],
          },
          {
            field: 'title',
            label: 'Title',
            type: 'text',
            rules: [{ type: 'required', message: 'Required' }],
          },
        ]}
        itemTitle="Slide"
        onChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(host.querySelector('.bb-toggle-control')).toBeTruthy();
      expect(host.querySelector('.bb-toggle-control__body')).toBeNull();
    });

    fireEvent.click(host.querySelector('.bb-toggle-control__button')!);

    await waitFor(() => {
      expect(host.querySelector('.bb-toggle-control__body')).toBeTruthy();
    });
  });
});
