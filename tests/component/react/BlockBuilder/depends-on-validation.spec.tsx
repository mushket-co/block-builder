import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  cleanupReactTestHost,
  renderBlockBuilder,
  toggleGroupBlockType,
} from '../helpers/renderBlockBuilder';

describe('BlockBuilder dependsOn (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('does not require hidden dependent field when toggle is off', async () => {
    const { host } = renderBlockBuilder({
      blockTypes: [toggleGroupBlockType],
    });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => host.querySelector('.bb-modal-footer'));

    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(() => {
      expect(host.querySelectorAll('.bb-block')).toHaveLength(1);
      expect(host.querySelector('.bb-form-errors, .bb-error')).toBeNull();
    });
  });

  it('validates dependent field when toggle is on', async () => {
    const { host } = renderBlockBuilder({
      blockTypes: [toggleGroupBlockType],
    });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => host.querySelector('.bb-toggle-control__button'));

    fireEvent.click(host.querySelector('.bb-toggle-control__button')!);
    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(() => {
      expect(host.querySelector('.bb-form-errors, .bb-error')).toBeTruthy();
      expect(host.querySelectorAll('.bb-block')).toHaveLength(0);
    });
  });
});
