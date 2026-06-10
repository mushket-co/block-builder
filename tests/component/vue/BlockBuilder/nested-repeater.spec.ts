import { CSS_CLASSES } from '../../../../src/utils/constants';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountBlockBuilder, nestedRepeaterBlockType } from '../helpers/mountBlockBuilder';

function getTopLevelRepeaterItems(wrapper: ReturnType<typeof mountBlockBuilder>, fieldName: string) {
  return wrapper.findAll(
    `.${CSS_CLASSES.REPEATER_CONTROL}[data-field-name="${fieldName}"] > .${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
  );
}

function clickRepeaterAddButton(wrapper: ReturnType<typeof mountBlockBuilder>, fieldName: string) {
  const buttons = wrapper.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`);
  const addButton = buttons.find(button => {
    const parent = button.element.parentElement;
    return parent?.getAttribute('data-field-name') === fieldName;
  });

  if (!addButton) {
    throw new Error(`Add button for repeater "${fieldName}" not found`);
  }

  return addButton.trigger('click');
}

describe('BlockBuilder nested repeater', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders nested products repeater inside category item', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    expect(products.exists()).toBe(true);
    expect(products.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)).toHaveLength(
      1
    );

    wrapper.unmount();
  });

  it('adds product inside nested repeater', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    await products.find(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`).trigger('click');
    await flushPromises();

    expect(products.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)).toHaveLength(
      2
    );

    wrapper.unmount();
  });

  it('validates required fields in nested repeater on submit', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    await products.find(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.FORM_ERRORS}`).exists()).toBe(true);
    expect(wrapper.findAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);

    wrapper.unmount();
  });

  it('adds top-level category with nested products repeater', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    await clickRepeaterAddButton(wrapper, 'categories');
    await flushPromises();

    expect(getTopLevelRepeaterItems(wrapper, 'categories')).toHaveLength(2);

    const newCategory = getTopLevelRepeaterItems(wrapper, 'categories')[1];
    expect(newCategory.find('[data-field-name="products"]').exists()).toBe(true);

    wrapper.unmount();
  });

  it('expands collapsed nested product after validation error', async () => {
    vi.useFakeTimers();

    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    await products.find(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`).trigger('click');
    await flushPromises();

    const productItems = products.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`);
    expect(productItems).toHaveLength(2);

    await productItems[1].find(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`).trigger('click');
    await flushPromises();
    expect(productItems[1].classes()).toContain(CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED);

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();

    await vi.advanceTimersByTimeAsync(800);
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`).exists()).toBe(true);
    expect(wrapper.findAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED}`).length).toBe(0);

    wrapper.unmount();
  });
});
