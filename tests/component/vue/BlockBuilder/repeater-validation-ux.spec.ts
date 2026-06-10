import { CSS_CLASSES } from '../../../../src/utils/constants';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountBlockBuilder, repeaterBlockType } from '../helpers/mountBlockBuilder';

describe('BlockBuilder repeater validation UX', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('expands collapsed repeater item after validation error', async () => {
    vi.useFakeTimers();

    const wrapper = mountBlockBuilder({
      blockTypes: [repeaterBlockType],
    });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`).trigger('click');
    await flushPromises();

    const items = wrapper.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`);
    expect(items).toHaveLength(2);

    await items[1].find(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`).trigger('click');
    await flushPromises();
    expect(items[1].classes()).toContain(CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED);

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();

    await vi.advanceTimersByTimeAsync(500);
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`).exists()).toBe(true);
    expect(wrapper.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)[1].classes()).not.toContain(
      CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED
    );

    wrapper.unmount();
  });
});
