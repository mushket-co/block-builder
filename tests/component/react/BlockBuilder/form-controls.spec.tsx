import { CSS_CLASSES } from '../../../../src/utils/constants';
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

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`));

    expect(host.querySelector('#field-backgroundColor')).toBeNull();

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`)!);

    await waitFor(() => {
      expect(host.querySelector('#field-backgroundColor')).toBeTruthy();
    });
  });

  it('creates link block with required fields', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [linkBlockType] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => host.querySelector('#field-url'));

    fireEvent.change(host.querySelector('#field-url') as HTMLInputElement, {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(1);
    });
  });
});

describe('BlockBuilder repeater (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('adds repeater item and validates nested required fields', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [repeaterBlockType] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => host.querySelector('[data-field-name="cards"]'));

    const repeater = host.querySelector('[data-field-name="cards"]')!;
    fireEvent.click(repeater.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`)!);

    await waitFor(() => {
      expect(repeater.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)).toHaveLength(2);
    });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelector(`.${CSS_CLASSES.FORM_ERRORS}`)).toBeTruthy();
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);
    });
  });

  it('validates toggle-dependent field inside repeater item', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [repeaterToggleBlockType] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => host.querySelector('[data-field-name="slides"]'));

    const repeater = host.querySelector('[data-field-name="slides"]')!;
    fireEvent.click(repeater.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`)!);

    await waitFor(() => {
      expect(repeater.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BODY}`)).toBeTruthy();
    });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelector(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`)).toBeTruthy();
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);
    });
  });
});
