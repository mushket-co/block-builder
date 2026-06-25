import { CSS_CLASSES } from '../../../../src/utils/constants';
import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  cleanupReactTestHost,
  nestedRepeaterBlockType,
  renderBlockBuilder,
} from '../helpers/renderBlockBuilder';

function getTopLevelRepeaterItems(host: HTMLElement, fieldName: string) {
  return host.querySelectorAll(
    `.${CSS_CLASSES.REPEATER_CONTROL}[data-field-name="${fieldName}"] > .${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
  );
}

function clickRepeaterAddButton(host: HTMLElement, fieldName: string) {
  const buttons = host.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`);
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

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => expect(getTopLevelRepeaterItems(host, 'categories').length).toBeGreaterThan(0));

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]');

    expect(products).toBeTruthy();
    await waitFor(() =>
      expect(
        products!.querySelectorAll(
          `.${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
        )
      ).toHaveLength(1)
    );
  });

  it('adds product inside nested repeater', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => expect(getTopLevelRepeaterItems(host, 'categories').length).toBeGreaterThan(0));

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]')!;

    fireEvent.click(products.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`)!);

    await waitFor(() => {
      expect(
        products.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)
      ).toHaveLength(2);
    });
  });

  it('validates required fields in nested repeater on submit', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => expect(getTopLevelRepeaterItems(host, 'categories').length).toBeGreaterThan(0));

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]')!;

    fireEvent.click(products.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`)!);
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelector(`.${CSS_CLASSES.FORM_ERRORS}`)).toBeTruthy();
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);
    });
  });

  it('adds top-level category with nested products repeater', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => expect(getTopLevelRepeaterItems(host, 'categories').length).toBeGreaterThan(0));

    clickRepeaterAddButton(host, 'categories');

    await waitFor(() => {
      expect(getTopLevelRepeaterItems(host, 'categories')).toHaveLength(2);
    });

    const newCategory = getTopLevelRepeaterItems(host, 'categories')[1];
    expect(newCategory.querySelector('[data-field-name="products"]')).toBeTruthy();
  });

  it('expands collapsed nested product after validation error', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [nestedRepeaterBlockType] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    await waitFor(() => host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`));
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);
    await waitFor(() => expect(getTopLevelRepeaterItems(host, 'categories').length).toBeGreaterThan(0));

    const categoryItem = getTopLevelRepeaterItems(host, 'categories')[0];
    const products = categoryItem.querySelector('[data-field-name="products"]')!;

    fireEvent.click(products.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}`)!);

    await waitFor(() => {
      expect(
        products.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`)
      ).toHaveLength(2);
    });

    const productItems = products.querySelectorAll(
      `.${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
    );

    fireEvent.click(productItems[1].querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`)!);
    expect(productItems[1].classList.contains(CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED)).toBe(true);

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(
      () => {
        expect(host.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED}`).length).toBe(0);
      },
      { timeout: 1500 }
    );

    await waitFor(
      () => {
        expect(host.querySelector(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`)).toBeTruthy();
      },
      { timeout: 1500 }
    );
  });
});
