import { CSS_CLASSES } from '../../../../src/utils/constants';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import { linkBlockType, mountBlockBuilder, repeaterBlockType, repeaterToggleBlockType } from '../helpers/mountBlockBuilder';

describe('BlockBuilder link toggle', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reveals background color field when toggle is on', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [linkBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    expect(wrapper.find('#field-backgroundColor').exists()).toBe(false);

    await wrapper.find(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`).trigger('click');
    await flushPromises();

    expect(wrapper.find('#field-backgroundColor').exists()).toBe(true);

    wrapper.unmount();
  });

  it('creates link block with required fields', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [linkBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    await wrapper.find('#field-url').setValue('https://example.com');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.findAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(1);

    wrapper.unmount();
  });
});

describe('BlockBuilder repeater', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds repeater item and validates nested required fields', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [repeaterBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const repeater = wrapper.find('[data-field-name="cards"]');
    await repeater.find(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`).trigger('click');
    await flushPromises();

    expect(repeater.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)).toHaveLength(2);

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.FORM_ERRORS}`).exists()).toBe(true);
    expect(wrapper.findAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);

    wrapper.unmount();
  });

  it('validates toggle-dependent field inside repeater item', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [repeaterToggleBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const repeater = wrapper.find('[data-field-name="slides"]');
    await repeater.find(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.FORM_ERRORS}`).exists()).toBe(true);

    wrapper.unmount();
  });
});
