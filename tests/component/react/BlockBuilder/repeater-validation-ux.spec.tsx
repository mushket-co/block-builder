import { CSS_CLASSES } from '../../../../src/utils/constants';
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

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`));

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`)!);

    const items = host.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`);
    expect(items).toHaveLength(2);

    fireEvent.click(items[1].querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`)!);
    expect(items[1].classList.contains(CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED)).toBe(true);

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(
      () => {
        expect(
          host.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)[1].classList.contains(
            CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED
          )
        ).toBe(false);
      },
      { timeout: 1500 }
    );

    await waitFor(
      () => {
        expect(host.querySelector(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`)).toBeTruthy();
      },
      { timeout: 1500 }
    );
  });
});
