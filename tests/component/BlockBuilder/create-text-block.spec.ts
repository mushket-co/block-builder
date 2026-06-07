import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import { mountBlockBuilder } from '../helpers/mountBlockBuilder';

describe('BlockBuilder', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens block type selection modal', async () => {
    const wrapper = mountBlockBuilder();
    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();

    expect(wrapper.find('.bb-block-type-selection').exists()).toBe(true);
    expect(wrapper.find('.bb-block-type-card').text()).toContain('Text block');

    wrapper.unmount();
  });

  it('creates a text block from the modal form', async () => {
    const wrapper = mountBlockBuilder();

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();

    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    const textarea = wrapper.find('#field-content');
    await textarea.setValue('Hello from component test');
    await flushPromises();

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.findAll('.bb-block')).toHaveLength(1);

    wrapper.unmount();
  });
});
