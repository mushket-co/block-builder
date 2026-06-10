import { CSS_CLASSES } from '../../../../src/utils/constants';
import { getBlockLabel } from '../../../fixtures/block-types';
import { expect, test } from '../../fixtures';

test.describe('E02 block CRUD', () => {
  test('edits existing text block content', async ({ blockForm, page }, testInfo) => {
    const blockTitle = getBlockLabel('text', testInfo.project.name as 'vue3' | 'pure-js');
    const initialContent = `Initial ${Date.now()}`;
    const updatedContent = `Updated ${Date.now()}`;

    await blockForm.prepareCleanEditor();
    await blockForm.createTextBlock(blockTitle, initialContent);
    await expect.poll(() => blockForm.getBlockCount()).toBe(1);

    const editButton = page.locator(`.${CSS_CLASSES.BLOCK}`).first().getByRole('button', { name: 'Редактировать' });
    await editButton.click();

    await blockForm.fillTextarea('content', updatedContent);
    await blockForm.submitEditForm();
    await blockForm.waitForModalClosed();

    await expect(page.locator(`.${CSS_CLASSES.BLOCK}`).first()).toContainText(updatedContent);
  });

  test('duplicates and deletes block', async ({ blockForm, page }, testInfo) => {
    const blockTitle = getBlockLabel('text', testInfo.project.name as 'vue3' | 'pure-js');
    const content = `CRUD ${Date.now()}`;

    await blockForm.prepareCleanEditor();
    await blockForm.createTextBlock(blockTitle, content);
    await expect.poll(() => blockForm.getBlockCount()).toBe(1);

    const block = page.locator(`.${CSS_CLASSES.BLOCK}`).first();
    await block.getByRole('button', { name: 'Дублировать' }).click();
    await expect.poll(() => blockForm.getBlockCount()).toBe(2);

    page.once('dialog', dialog => dialog.accept());
    await block.getByRole('button', { name: 'Удалить' }).click();
    const confirmButton = page.getByRole('button', { name: 'Подтвердить' });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    await expect.poll(() => blockForm.getBlockCount()).toBe(1);
  });
});
