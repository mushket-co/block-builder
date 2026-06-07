import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import { mountBlockBuilder, toggleGroupBlockType } from '../helpers/mountBlockBuilder';

describe('BlockBuilder dependsOn', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does not require hidden dependent field when toggle is off', async () => {
    const wrapper = mountBlockBuilder({
      blockTypes: [toggleGroupBlockType],
    });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.findAll('.bb-block')).toHaveLength(1);
    expect(wrapper.find('.bb-form-errors, .bb-error').exists()).toBe(false);

    wrapper.unmount();
  });

  it('validates dependent field when toggle is on', async () => {
    const wrapper = mountBlockBuilder({
      blockTypes: [toggleGroupBlockType],
    });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    await wrapper.find('.bb-toggle-control__button').trigger('click');
    await flushPromises();

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();

    expect(wrapper.find('.bb-form-errors, .bb-error').exists()).toBe(true);
    expect(wrapper.findAll('.bb-block')).toHaveLength(0);

    wrapper.unmount();
  });
});
