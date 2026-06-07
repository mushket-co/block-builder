import { getBlockLabel } from '../../../fixtures/block-types';
import { expect, test } from '../../fixtures';

test.describe('E04 nested repeater catalog', () => {
  test('adds product inside category and creates block', async ({ blockForm, page }) => {
    const productName = `Product ${Date.now()}`;

    await blockForm.prepareCleanEditor();
    await blockForm.openBlockTypeSelection();
    await blockForm.selectBlockType(getBlockLabel('nestedRepeater', 'vue3'));

    await expect(blockForm.repeaterItems('categories')).toHaveCount(1);

    const categoryItem = blockForm.repeaterItem('categories', 0);
    const products = blockForm.nestedRepeater(categoryItem, 'products', 'categories[0]');

    await expect(blockForm.nestedRepeaterItems(products)).toHaveCount(2);

    await blockForm.addRepeaterItem(products, 'Добавить товар');
    await expect(blockForm.nestedRepeaterItems(products)).toHaveCount(3);

    const newProduct = blockForm.nestedRepeaterItems(products).nth(2);
    await blockForm.fieldInRepeaterItem(newProduct, 'name').fill(productName);
    await blockForm.numberInRepeaterItem(newProduct, 'price').fill('1999');

    await blockForm.submitCreateForm();
    await blockForm.waitForModalClosed();

    await expect.poll(() => blockForm.getBlockCount()).toBe(1);
    await expect(page.locator('.bb-block').first()).toContainText(productName);
  });

  test('adds new category with nested products repeater', async ({ blockForm }) => {
    await blockForm.prepareCleanEditor();
    await blockForm.openBlockTypeSelection();
    await blockForm.selectBlockType(getBlockLabel('nestedRepeater', 'vue3'));

    const categories = blockForm.repeater('categories');
    await blockForm.addRepeaterItem(categories, 'Добавить категорию');
    await expect(blockForm.repeaterItems('categories')).toHaveCount(2);

    const newCategory = blockForm.repeaterItem('categories', 1);
    const products = blockForm.nestedRepeater(newCategory, 'products', 'categories[1]');
    await expect(blockForm.nestedRepeaterItems(products)).toHaveCount(1);

    await blockForm.fieldInRepeaterItem(newCategory, 'name').fill('Одежда');
    await blockForm.fieldInRepeaterItem(blockForm.nestedRepeaterItems(products).first(), 'name').fill('Футболка');
    await blockForm
      .numberInRepeaterItem(blockForm.nestedRepeaterItems(products).first(), 'price')
      .fill('990');

    await blockForm.submitCreateForm();
    await blockForm.waitForModalClosed();

    await expect.poll(() => blockForm.getBlockCount()).toBe(1);
  });
});
