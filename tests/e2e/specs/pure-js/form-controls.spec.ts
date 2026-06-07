import { getBlockLabel } from '../../../fixtures/block-types';
import { expect, test } from '../../fixtures';

test.describe('E03 form controls — card list repeater', () => {
  test('adds repeater item and collapses accordion', async ({ blockForm }, testInfo) => {
    const blockTitle = getBlockLabel('cardList', testInfo.project.name as 'vue3' | 'pure-js');

    await blockForm.prepareCleanEditor();
    await blockForm.openBlockTypeSelection();
    await blockForm.selectBlockType(blockTitle);

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
      /bb-repeater-control__item--collapsed/
    );

    await blockForm.submitCreateForm();
    await blockForm.waitForModalClosed();

    await expect.poll(() => blockForm.getBlockCount()).toBe(1);
  });
});
