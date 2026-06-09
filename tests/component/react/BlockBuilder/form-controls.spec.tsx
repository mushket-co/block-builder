import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  cleanupReactTestHost,
  linkBlockType,
  renderBlockBuilder,
  repeaterBlockType,
  repeaterToggleBlockType,
} from '../helpers/renderBlockBuilder';

describe('BlockBuilder link toggle (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('reveals background color field when toggle is on', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [linkBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => host.querySelector('.bb-toggle-control__button'));

    expect(host.querySelector('#field-backgroundColor')).toBeNull();

    fireEvent.click(host.querySelector('.bb-toggle-control__button')!);

    await waitFor(() => {
      expect(host.querySelector('#field-backgroundColor')).toBeTruthy();
    });
  });

  it('creates link block with required fields', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [linkBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => host.querySelector('#field-url'));

    fireEvent.change(host.querySelector('#field-url') as HTMLInputElement, {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(() => {
      expect(host.querySelectorAll('.bb-block')).toHaveLength(1);
    });
  });
});

describe('BlockBuilder repeater (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('adds repeater item and validates nested required fields', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [repeaterBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => host.querySelector('[data-field-name="cards"]'));

    const repeater = host.querySelector('[data-field-name="cards"]')!;
    fireEvent.click(repeater.querySelector('.bb-repeater-control__add-btn')!);

    await waitFor(() => {
      expect(repeater.querySelectorAll('.bb-repeater-control__item')).toHaveLength(2);
    });

    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(() => {
      expect(host.querySelector('.bb-form-errors')).toBeTruthy();
      expect(host.querySelectorAll('.bb-block')).toHaveLength(0);
    });
  });

  it('validates toggle-dependent field inside repeater item', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [repeaterToggleBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => host.querySelector('[data-field-name="slides"]'));

    const repeater = host.querySelector('[data-field-name="slides"]')!;
    fireEvent.click(repeater.querySelector('.bb-toggle-control__button')!);

    await waitFor(() => {
      expect(repeater.querySelector('.bb-toggle-control__body')).toBeTruthy();
    });

    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(() => {
      expect(host.querySelector('.bb-form-errors, .bb-error')).toBeTruthy();
      expect(host.querySelectorAll('.bb-block')).toHaveLength(0);
    });
  });
});
