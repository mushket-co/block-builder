import { getBlockLabel } from '../../../fixtures/block-types';
import { expect, test } from '../../fixtures';

test.describe('E05 validation UX — collapsed repeater', () => {
  test('expands collapsed card item and keeps modal open on invalid submit', async ({ blockForm }) => {
    await blockForm.prepareCleanEditor();
    await blockForm.openBlockTypeSelection();
    await blockForm.selectBlockType(getBlockLabel('cardList', 'vue3'));

    const repeater = blockForm.repeater('cards');
    await expect(blockForm.repeaterItems('cards')).toHaveCount(3);

    await blockForm.addRepeaterItem(repeater, 'Добавить карточку');
    await expect(blockForm.repeaterItems('cards')).toHaveCount(4);

    const invalidItemIndex = 3;
    const invalidItem = blockForm.repeaterItem('cards', invalidItemIndex);
    await blockForm.collapseRepeaterItem('cards', invalidItemIndex);
    await expect(invalidItem).toHaveClass(/bb-repeater-control__item--collapsed/);

    await blockForm.submitCreateForm();

    await expect(blockForm.modal()).toBeVisible();
    await expect(blockForm.formErrors().first()).toBeVisible();
    await blockForm.page.waitForTimeout(600);
    await expect(invalidItem).not.toHaveClass(/bb-repeater-control__item--collapsed/);
    await expect.poll(() => blockForm.getBlockCount()).toBe(0);
  });
});

test.describe('E05 validation UX — collapsed nested repeater', () => {
  test('expands collapsed nested product on invalid submit', async ({ blockForm }) => {
    await blockForm.prepareCleanEditor();
    await blockForm.openBlockTypeSelection();
    await blockForm.selectBlockType(getBlockLabel('nestedRepeater', 'vue3'));

    const categoryItem = blockForm.repeaterItem('categories', 0);
    const products = blockForm.nestedRepeater(categoryItem, 'products', 'categories[0]');

    await expect(blockForm.nestedRepeaterItems(products)).toHaveCount(2);

    await blockForm.addRepeaterItem(products, 'Добавить товар');
    await expect(blockForm.nestedRepeaterItems(products)).toHaveCount(3);

    const invalidProduct = blockForm.nestedRepeaterItems(products).nth(2);
    await blockForm.collapseRepeaterItemLocator(invalidProduct);
    await expect(invalidProduct).toHaveClass(/bb-repeater-control__item--collapsed/);

    await blockForm.submitCreateForm();

    await expect(blockForm.modal()).toBeVisible();
    await expect(blockForm.formErrors().first()).toBeVisible();
    await blockForm.page.waitForTimeout(800);
    await expect(invalidProduct).not.toHaveClass(/bb-repeater-control__item--collapsed/);
    await expect.poll(() => blockForm.getBlockCount()).toBe(0);
  });
});
