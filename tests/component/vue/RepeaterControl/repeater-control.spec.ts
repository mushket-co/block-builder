import { CSS_CLASSES } from '../../../../src/utils/constants';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import RepeaterControl from '../../../../src/vue/components/RepeaterControl.vue';

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

    expect(wrapper.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)).toHaveLength(1);

    await wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`).trigger('click');
    await flushPromises();

    expect(wrapper.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)).toHaveLength(2);
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

    expect(wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}`).exists()).toBe(true);

    await wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED}`).exists()).toBe(true);
    expect(wrapper.find(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}`).exists()).toBe(false);

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

    expect(wrapper.find(`.${CSS_CLASSES.TOGGLE_CONTROL}`).exists()).toBe(true);
    expect(wrapper.find(`.${CSS_CLASSES.TOGGLE_CONTROL_BODY}`).exists()).toBe(false);

    await wrapper.find(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.TOGGLE_CONTROL_BODY}`).exists()).toBe(true);

    wrapper.unmount();
  });
});
