import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import { linkBlockType, mountBlockBuilder, repeaterBlockType, repeaterToggleBlockType } from '../helpers/mountBlockBuilder';

describe('BlockBuilder link toggle', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reveals background color field when toggle is on', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [linkBlockType] });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    expect(wrapper.find('#field-backgroundColor').exists()).toBe(false);

    await wrapper.find('.bb-toggle-control__button').trigger('click');
    await flushPromises();

    expect(wrapper.find('#field-backgroundColor').exists()).toBe(true);

    wrapper.unmount();
  });

  it('creates link block with required fields', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [linkBlockType] });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    await wrapper.find('#field-url').setValue('https://example.com');
    await flushPromises();

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.findAll('.bb-block')).toHaveLength(1);

    wrapper.unmount();
  });
});

describe('BlockBuilder repeater', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds repeater item and validates nested required fields', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [repeaterBlockType] });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    const repeater = wrapper.find('[data-field-name="cards"]');
    await repeater.find('.bb-repeater-control__add-btn').trigger('click');
    await flushPromises();

    expect(repeater.findAll('.bb-repeater-control__item')).toHaveLength(2);

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();

    expect(wrapper.find('.bb-form-errors').exists()).toBe(true);
    expect(wrapper.findAll('.bb-block')).toHaveLength(0);

    wrapper.unmount();
  });

  it('validates toggle-dependent field inside repeater item', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [repeaterToggleBlockType] });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    const repeater = wrapper.find('[data-field-name="slides"]');
    await repeater.find('.bb-toggle-control__button').trigger('click');
    await flushPromises();

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();

    expect(wrapper.find('.bb-form-errors').exists()).toBe(true);

    wrapper.unmount();
  });
});
