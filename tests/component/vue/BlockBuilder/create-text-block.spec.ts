import { CSS_CLASSES } from '../../../../src/utils/constants';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import { mountBlockBuilder } from '../helpers/mountBlockBuilder';

describe('BlockBuilder', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens block type selection modal', async () => {
    const wrapper = mountBlockBuilder();
    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_SELECTION}`).exists()).toBe(true);
    expect(wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).text()).toContain('Text block');

    wrapper.unmount();
  });

  it('creates a text block from the modal form', async () => {
    const wrapper = mountBlockBuilder();

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const textarea = wrapper.find('#field-content');
    await textarea.setValue('Hello from component test');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.findAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(1);

    wrapper.unmount();
  });
});
