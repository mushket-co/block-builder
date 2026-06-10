import { CSS_CLASSES } from '../../../../src/utils/constants';
import { fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RepeaterControl } from '../../../../src/react/components/RepeaterControl';
import { cleanupReactTestHost, renderWithHost } from '../helpers/renderWithHost';

function ControlledRepeater() {
  const [value, setValue] = useState([
    { title: 'Slide 1', hasLink: false, linkUrl: '' },
  ]);

  return (
    <div>
      <RepeaterControl
        fieldName="slides"
        label="Slides"
        modelValue={value}
        fields={[
          { field: 'title', label: 'Title', type: 'text', rules: [{ type: 'required' }] },
          { field: 'hasLink', label: 'Add link', type: 'checkbox', defaultValue: false },
          {
            field: 'linkUrl',
            label: 'Link URL',
            type: 'text',
            dependsOn: { field: 'hasLink', value: true },
            rules: [{ type: 'required' }],
          },
        ]}
        itemTitle="Slide"
        onChange={setValue}
      />
      <span data-testid="has-link">{String(value[0]?.hasLink)}</span>
    </div>
  );
}

describe('RepeaterControl sync (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('syncs add item to parent modelValue', async () => {
    const fields = [
      { field: 'title', label: 'Title', type: 'text', rules: [{ type: 'required' }] },
      { field: 'text', label: 'Description', type: 'textarea', rules: [{ type: 'required' }] },
    ];

    function ControlledCardsRepeater() {
      const [value, setValue] = useState([{ title: 'One', text: 'Desc' }]);
      return (
        <div>
          <RepeaterControl
            fieldName="cards"
            label="Cards"
            modelValue={value}
            fields={fields}
            itemTitle="Card"
            onChange={setValue}
          />
          <span data-testid="count">{String(value.length)}</span>
        </div>
      );
    }

    const { host } = renderWithHost(<ControlledCardsRepeater />);

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`)!);

    await waitFor(() => {
      expect(host.querySelector('[data-testid="count"]')?.textContent).toBe('2');
    });
  });

  it('calls onChange with hasLink true when toggle is clicked', async () => {
    const onChange = vi.fn();

    const { host } = renderWithHost(
      <RepeaterControl
        fieldName="slides"
        label="Slides"
        modelValue={[{ title: 'Slide 1', hasLink: false, linkUrl: '' }]}
        fields={[
          { field: 'title', label: 'Title', type: 'text', rules: [{ type: 'required' }] },
          { field: 'hasLink', label: 'Add link', type: 'checkbox', defaultValue: false },
          {
            field: 'linkUrl',
            label: 'Link URL',
            type: 'text',
            dependsOn: { field: 'hasLink', value: true },
            rules: [{ type: 'required' }],
          },
        ]}
        itemTitle="Slide"
        onChange={onChange}
      />
    );

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`)!);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.at(-1)?.[0]).toEqual([
        { title: 'Slide 1', hasLink: true, linkUrl: '' },
      ]);
    });
  });

  it('syncs toggle change to parent modelValue', async () => {
    const { host } = renderWithHost(<ControlledRepeater />);

    expect(host.querySelector('[data-testid="has-link"]')?.textContent).toBe('false');

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`)!);

    await waitFor(() => {
      expect(host.querySelector('[data-testid="has-link"]')?.textContent).toBe('true');
    });
  });
});
