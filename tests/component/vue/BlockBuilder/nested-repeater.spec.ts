import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountBlockBuilder, nestedRepeaterBlockType } from '../helpers/mountBlockBuilder';

function getTopLevelRepeaterItems(wrapper: ReturnType<typeof mountBlockBuilder>, fieldName: string) {
  return wrapper.findAll(
    `.bb-repeater-control[data-field-name="${fieldName}"] > .bb-repeater-control__items > .bb-repeater-control__item`
  );
}

function clickRepeaterAddButton(wrapper: ReturnType<typeof mountBlockBuilder>, fieldName: string) {
  const buttons = wrapper.findAll('.bb-repeater-control__add-btn');
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

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    expect(products.exists()).toBe(true);
    expect(products.findAll('.bb-repeater-control__items > .bb-repeater-control__item')).toHaveLength(
      1
    );

    wrapper.unmount();
  });

  it('adds product inside nested repeater', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    await products.find('.bb-repeater-control__add-btn').trigger('click');
    await flushPromises();

    expect(products.findAll('.bb-repeater-control__items > .bb-repeater-control__item')).toHaveLength(
      2
    );

    wrapper.unmount();
  });

  it('validates required fields in nested repeater on submit', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    await products.find('.bb-repeater-control__add-btn').trigger('click');
    await flushPromises();

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();

    expect(wrapper.find('.bb-form-errors').exists()).toBe(true);
    expect(wrapper.findAll('.bb-block')).toHaveLength(0);

    wrapper.unmount();
  });

  it('adds top-level category with nested products repeater', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
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

    await wrapper.find('.bb-add-block-btn').trigger('click');
    await flushPromises();
    await wrapper.find('.bb-block-type-card').trigger('click');
    await flushPromises();

    const categoryItem = getTopLevelRepeaterItems(wrapper, 'categories')[0];
    const products = categoryItem.find('[data-field-name="products"]');

    await products.find('.bb-repeater-control__add-btn').trigger('click');
    await flushPromises();

    const productItems = products.findAll('.bb-repeater-control__items > .bb-repeater-control__item');
    expect(productItems).toHaveLength(2);

    await productItems[1].find('.bb-repeater-control__item-btn--collapse').trigger('click');
    await flushPromises();
    expect(productItems[1].classes()).toContain('bb-repeater-control__item--collapsed');

    await wrapper.find('.bb-modal-footer .bb-btn--primary').trigger('click');
    await flushPromises();

    await vi.advanceTimersByTimeAsync(800);
    await flushPromises();

    expect(wrapper.find('.bb-form-errors, .bb-error').exists()).toBe(true);
    expect(wrapper.findAll('.bb-repeater-control__item--collapsed').length).toBe(0);

    wrapper.unmount();
  });
});
