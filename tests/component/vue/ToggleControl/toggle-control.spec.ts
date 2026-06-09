import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ToggleControl from '../../../../src/vue/components/ToggleControl.vue';

describe('ToggleControl', () => {
  it('renders body slot when modelValue is true', () => {
    const wrapper = mount(ToggleControl, {
      props: {
        modelValue: true,
        label: 'Enable section',
      },
      slots: {
        body: '<div class="dependent-field">Dependent</div>',
      },
    });

    expect(wrapper.find('.bb-toggle-control__body').exists()).toBe(true);
    expect(wrapper.find('.dependent-field').exists()).toBe(true);
  });

  it('hides body slot when modelValue is false', () => {
    const wrapper = mount(ToggleControl, {
      props: {
        modelValue: false,
        label: 'Enable section',
      },
      slots: {
        body: '<div class="dependent-field">Dependent</div>',
      },
    });

    expect(wrapper.find('.bb-toggle-control__body').exists()).toBe(false);
  });

  it('emits update when toggled', async () => {
    const wrapper = mount(ToggleControl, {
      props: {
        modelValue: false,
        label: 'Enable section',
      },
    });

    await wrapper.find('.bb-toggle-control__button').trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
  });
});
