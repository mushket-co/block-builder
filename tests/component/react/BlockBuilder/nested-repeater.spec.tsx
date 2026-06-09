import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  cleanupReactTestHost,
  nestedRepeaterBlockType,
  renderBlockBuilder,
} from '../helpers/renderBlockBuilder';

function getTopLevelRepeaterItems(host: HTMLElement, fieldName: string) {
  return host.querySelectorAll(
    `.bb-repeater-control[data-field-name="${fieldName}"] > .bb-repeater-control__items > .bb-repeater-control__item`
  );
}

function clickRepeaterAddButton(host: HTMLElement, fieldName: string) {
  const buttons = host.querySelectorAll('.bb-repeater-control__add-btn');
  const addButton = Array.from(buttons).find(button => {
    const parent = button.parentElement;
    return parent?.getAttribute('data-field-name') === fieldName;
  });

  if (!addButton) {
    throw new Error(`Add button for repeater "${fieldName}" not found`);
  }

  fireEvent.click(addButton);
}

describe('BlockBuilder nested repeater (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('renders nested products repeater inside category item', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => getTopLevelRepeaterItems(host, 'categories').length > 0);

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]');

    expect(products).toBeTruthy();
    expect(
      products!.querySelectorAll('.bb-repeater-control__items > .bb-repeater-control__item')
    ).toHaveLength(1);
  });

  it('adds product inside nested repeater', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => getTopLevelRepeaterItems(host, 'categories').length > 0);

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]')!;

    fireEvent.click(products.querySelector('.bb-repeater-control__add-btn')!);

    await waitFor(() => {
      expect(
        products.querySelectorAll('.bb-repeater-control__items > .bb-repeater-control__item')
      ).toHaveLength(2);
    });
  });

  it('validates required fields in nested repeater on submit', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => getTopLevelRepeaterItems(host, 'categories').length > 0);

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]')!;

    fireEvent.click(products.querySelector('.bb-repeater-control__add-btn')!);
    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(() => {
      expect(host.querySelector('.bb-form-errors')).toBeTruthy();
      expect(host.querySelectorAll('.bb-block')).toHaveLength(0);
    });
  });

  it('adds top-level category with nested products repeater', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => getTopLevelRepeaterItems(host, 'categories').length > 0);

    clickRepeaterAddButton(host, 'categories');

    await waitFor(() => {
      expect(getTopLevelRepeaterItems(host, 'categories')).toHaveLength(2);
    });

    const newCategory = getTopLevelRepeaterItems(host, 'categories')[1];
    expect(newCategory.querySelector('[data-field-name="products"]')).toBeTruthy();
  });

  it('expands collapsed nested product after validation error', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector('.bb-add-block-btn')!);
    await waitFor(() => host.querySelector('.bb-block-type-card'));
    fireEvent.click(host.querySelector('.bb-block-type-card')!);
    await waitFor(() => getTopLevelRepeaterItems(host, 'categories').length > 0);

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]')!;

    fireEvent.click(products.querySelector('.bb-repeater-control__add-btn')!);

    await waitFor(() => {
      expect(
        products.querySelectorAll('.bb-repeater-control__items > .bb-repeater-control__item')
      ).toHaveLength(2);
    });

    const productItems = products.querySelectorAll(
      '.bb-repeater-control__items > .bb-repeater-control__item'
    );

    fireEvent.click(productItems[1].querySelector('.bb-repeater-control__item-btn--collapse')!);
    expect(productItems[1].classList.contains('bb-repeater-control__item--collapsed')).toBe(true);

    fireEvent.click(host.querySelector('.bb-modal-footer .bb-btn--primary')!);

    await waitFor(
      () => {
        expect(host.querySelectorAll('.bb-repeater-control__item--collapsed').length).toBe(0);
      },
      { timeout: 1500 }
    );

    await waitFor(
      () => {
        expect(host.querySelector('.bb-form-errors, .bb-error')).toBeTruthy();
      },
      { timeout: 1500 }
    );
  });
});
