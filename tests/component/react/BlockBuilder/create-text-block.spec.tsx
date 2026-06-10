import { CSS_CLASSES } from '../../../../src/utils/constants';
import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { cleanupReactTestHost, renderBlockBuilder } from '../helpers/renderBlockBuilder';

describe('BlockBuilder (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('opens block type selection modal', async () => {
    const { host } = renderBlockBuilder();

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);

    await waitFor(() => {
      expect(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_SELECTION}`)).toBeTruthy();
      expect(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)?.textContent).toContain('Text block');
    });
  });

  it('creates a text block from the modal form', async () => {
    const { host } = renderBlockBuilder();

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => {
      expect(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)).toBeTruthy();
    });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => {
      expect(host.querySelector('#field-content')).toBeTruthy();
    });

    const textarea = host.querySelector('#field-content') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello from component test' } });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(1);
    });
  });
});
