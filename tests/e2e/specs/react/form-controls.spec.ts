import { CSS_CLASSES } from '../../../../src/utils/constants';
import { getBlockLabel } from '../../../fixtures/block-types';
import { expect, test } from '../../fixtures';

test.describe('E03 form controls — link toggle', () => {
  test('shows background color only when toggle is enabled', async ({ blockForm, page }) => {
    await blockForm.prepareCleanEditor();
    await blockForm.openBlockTypeSelection();
    await blockForm.selectBlockType(getBlockLabel('link', 'react'));

    await expect(blockForm.colorField('backgroundColor')).toHaveCount(0);

    await blockForm.clickToggleByLabel('Добавить фон блока');
    await expect(blockForm.colorField('backgroundColor')).toBeVisible();

    await blockForm.fillText('url', 'https://example.com');
    await blockForm.submitCreateForm();
    await blockForm.waitForModalClosed();

    await expect.poll(() => blockForm.getBlockCount()).toBe(1);
    await expect(page.locator(`.${CSS_CLASSES.BLOCK}`).first()).toContainText('Перейти');
  });
});

test.describe('E03 form controls — card list repeater', () => {
  test('adds repeater item and collapses accordion', async ({ blockForm }) => {
    await blockForm.prepareCleanEditor();
    await blockForm.openBlockTypeSelection();
    await blockForm.selectBlockType(getBlockLabel('cardList', 'react'));

    const repeater = blockForm.repeater('cards');
    await expect(blockForm.repeaterItems('cards')).toHaveCount(3);

    await blockForm.addRepeaterItem(repeater, 'Добавить карточку');
    await expect(blockForm.repeaterItems('cards')).toHaveCount(4);

    const newItemIndex = 3;
    await blockForm
      .repeaterItemField('cards', newItemIndex, 'title')
      .fill(`Card ${Date.now()}`);
    await blockForm
      .repeaterItemField('cards', newItemIndex, 'text')
      .fill('E2E repeater description');
    await blockForm
      .repeaterItemField('cards', newItemIndex, 'link')
      .fill('https://example.com');

    await blockForm.collapseRepeaterItem('cards', 0);
    await expect(blockForm.repeaterItems('cards').first()).toHaveClass(
      new RegExp(CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED)
    );

    await blockForm.submitCreateForm();
    await blockForm.waitForModalClosed();

    await expect.poll(() => blockForm.getBlockCount()).toBe(1);
  });
});
