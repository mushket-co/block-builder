import { CSS_CLASSES } from '../../../../src/utils/constants';
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

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER}`));

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(1);
      expect(host.querySelector(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`)).toBeNull();
    });
  });

  it('validates dependent field when toggle is on', async () => {
    const { host } = renderBlockBuilder({
      blockTypes: [toggleGroupBlockType],
    });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`));

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`)!);
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelector(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`)).toBeTruthy();
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);
    });
  });
});
