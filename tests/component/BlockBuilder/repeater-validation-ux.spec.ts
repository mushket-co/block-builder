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

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    await wrapper.find('.bb-repeater-control__add-btn').trigger('click');
    await flushPromises();

    const items = wrapper.findAll('.bb-repeater-control__item');
    expect(items).toHaveLength(2);

    await items[1].find('.bb-repeater-control__item-btn--collapse').trigger('click');
    await flushPromises();
    expect(items[1].classes()).toContain('bb-repeater-control__item--collapsed');

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();

    await vi.advanceTimersByTimeAsync(500);
    await flushPromises();

    expect(wrapper.find('.bb-form-errors, .bb-error').exists()).toBe(true);
    expect(wrapper.findAll('.bb-repeater-control__item')[1].classes()).not.toContain(
      'bb-repeater-control__item--collapsed'
    );

    wrapper.unmount();
  });
});
