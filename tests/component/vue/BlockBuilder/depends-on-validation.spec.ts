import { CSS_CLASSES } from '../../../../src/utils/constants';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import { mountBlockBuilder, toggleGroupBlockType, toggleRepeaterBlockType, dualRepeaterCheckboxBlockType } from '../helpers/mountBlockBuilder';

describe('BlockBuilder dependsOn', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does not require hidden dependent field when toggle is off', async () => {
    const wrapper = mountBlockBuilder({
      blockTypes: [toggleGroupBlockType],
    });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.findAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(1);
    expect(wrapper.find(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`).exists()).toBe(false);

    wrapper.unmount();
  });

  it('validates dependent field when toggle is on', async () => {
    const wrapper = mountBlockBuilder({
      blockTypes: [toggleGroupBlockType],
    });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`).exists()).toBe(true);
    expect(wrapper.findAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);

    wrapper.unmount();
  });

  it('renders repeater inside toggle group when toggle is on', async () => {
    const wrapper = mountBlockBuilder({
      blockTypes: [toggleRepeaterBlockType],
    });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL}`).exists()).toBe(false);

    await wrapper.find(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL}`).exists()).toBe(true);

    wrapper.unmount();
  });

  it('uses unique field ids across repeaters with the same inner fields', async () => {
    const wrapper = mountBlockBuilder({
      blockTypes: [dualRepeaterCheckboxBlockType],
    });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const toggles = wrapper.findAll(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`);
    await toggles[0].trigger('click');
    await flushPromises();
    await toggles[1].trigger('click');
    await flushPromises();

    const backingInputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][id*="backing"]')
    );
    const backingIds = backingInputs.map(input => input.id);

    expect(backingInputs.length).toBeGreaterThanOrEqual(2);
    expect(new Set(backingIds).size).toBe(backingIds.length);
    expect(backingIds.some(id => id.includes('mainLogoList'))).toBe(true);
    expect(backingIds.some(id => id.includes('otherLogoList'))).toBe(true);

    wrapper.unmount();
  });
});
