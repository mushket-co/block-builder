import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { cleanupReactTestHost, renderBlockBuilder } from '../helpers/renderBlockBuilder';

describe('BlockBuilder (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('opens block type selection modal', async () => {
    const { host } = renderBlockBuilder();

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);

    await waitFor(() => {
      expect(host.querySelector('.bb-block-type-selection')).toBeTruthy();
      expect(host.querySelector('.bb-block-type-card')?.textContent).toContain('Text block');
    });
  });

  it('creates a text block from the modal form', async () => {
    const { host } = renderBlockBuilder();

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => {
      expect(host.querySelector('.bb-block-type-card')).toBeTruthy();
    });

    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => {
      expect(host.querySelector('#field-content')).toBeTruthy();
    });

    const textarea = host.querySelector('#field-content') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello from component test' } });

    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(() => {
      expect(host.querySelectorAll('.bb-block')).toHaveLength(1);
    });
  });
});
