import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { cleanupReactTestHost, renderBlockBuilder, repeaterBlockType } from '../helpers/renderBlockBuilder';

describe('BlockBuilder repeater validation UX (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('expands collapsed repeater item after validation error', async () => {
    const { host } = renderBlockBuilder({
      blockTypes: [repeaterBlockType],
    });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => host.querySelector('.bb-repeater-control__add-btn'));

    fireEvent.click(host.querySelector('.bb-repeater-control__add-btn')!);

    const items = host.querySelectorAll('.bb-repeater-control__item');
    expect(items).toHaveLength(2);

    fireEvent.click(items[1].querySelector('.bb-repeater-control__item-btn--collapse')!);
    expect(items[1].classList.contains('bb-repeater-control__item--collapsed')).toBe(true);

    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(
      () => {
        expect(
          host.querySelectorAll('.bb-repeater-control__item')[1].classList.contains(
            'bb-repeater-control__item--collapsed'
          )
        ).toBe(false);
      },
      { timeout: 1500 }
    );

    await waitFor(
      () => {
        expect(host.querySelector('.bb-form-errors, .bb-error')).toBeTruthy();
      },
      { timeout: 1500 }
    );
  });
});
