import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import RepeaterControl from '../../../src/ui/components/RepeaterControl.vue';

const repeaterFields = [
  {
    field: 'title',
    label: 'Title',
    type: 'text',
    defaultValue: '',
    rules: [{ type: 'required', message: 'Title is required' }],
  },
  {
    field: 'text',
    label: 'Description',
    type: 'textarea',
    defaultValue: '',
    rules: [{ type: 'required', message: 'Description is required' }],
  },
];

describe('RepeaterControl', () => {
  it('adds a new repeater item', async () => {
    const wrapper = mount(RepeaterControl, {
      props: {
        fieldName: 'cards',
        label: 'Cards',
        modelValue: [{ title: 'One', text: 'Desc' }],
        fields: repeaterFields,
        addButtonText: 'Add card',
        itemTitle: 'Card',
      },
      attachTo: document.body,
    });
    await flushPromises();

    expect(wrapper.findAll('.bb-repeater-control__item')).toHaveLength(1);

    await wrapper.find('.bb-repeater-control__add-btn').trigger('click');
    await flushPromises();

    expect(wrapper.findAll('.bb-repeater-control__item')).toHaveLength(2);
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toHaveLength(2);

    wrapper.unmount();
  });

  it('collapses item accordion and hides fields', async () => {
    const wrapper = mount(RepeaterControl, {
      props: {
        fieldName: 'cards',
        label: 'Cards',
        modelValue: [{ title: 'One', text: 'Desc' }],
        fields: repeaterFields,
        itemTitle: 'Card',
      },
      attachTo: document.body,
    });
    await flushPromises();

    expect(wrapper.find('.bb-repeater-control__item-fields').exists()).toBe(true);

    await wrapper.find('.bb-repeater-control__item-btn--collapse').trigger('click');
    await flushPromises();

    expect(wrapper.find('.bb-repeater-control__item--collapsed').exists()).toBe(true);
    expect(wrapper.find('.bb-repeater-control__item-fields').exists()).toBe(false);

    wrapper.unmount();
  });

  it('shows toggle-group inside repeater item', async () => {
    const wrapper = mount(RepeaterControl, {
      props: {
        fieldName: 'slides',
        label: 'Slides',
        modelValue: [{ title: 'Slide', hasLink: false, linkUrl: '' }],
        fields: [
          {
            field: 'hasLink',
            label: 'Add link',
            type: 'checkbox',
            defaultValue: false,
          },
          {
            field: 'linkUrl',
            label: 'Link URL',
            type: 'text',
            dependsOn: { field: 'hasLink', value: true },
            rules: [{ type: 'required', message: 'Required' }],
          },
          {
            field: 'title',
            label: 'Title',
            type: 'text',
            rules: [{ type: 'required', message: 'Required' }],
          },
        ],
        itemTitle: 'Slide',
      },
      attachTo: document.body,
    });
    await flushPromises();

    expect(wrapper.find('.bb-toggle-control').exists()).toBe(true);
    expect(wrapper.find('.bb-toggle-control__body').exists()).toBe(false);

    await wrapper.find('.bb-toggle-control__button').trigger('click');
    await flushPromises();

    expect(wrapper.find('.bb-toggle-control__body').exists()).toBe(true);

    wrapper.unmount();
  });
});
