import { getBlockLabel, type TE2EProject } from '../../../fixtures/block-types';
import { expect, test } from '../../fixtures';

test.describe('E01 smoke', () => {
  test('loads editor and shows add block control', async ({ blockForm }) => {
    await blockForm.prepareCleanEditor();
    await expect(blockForm.addBlockButton()).toBeVisible();
  });

  test('creates text block and saves to localStorage', async ({ blockForm }, testInfo) => {
    const blockTitle = getBlockLabel('text', testInfo.project.name as TE2EProject);
    const content = `E2E smoke ${Date.now()}`;

    await blockForm.prepareCleanEditor();
    await blockForm.createTextBlock(blockTitle, content);

    await expect.poll(() => blockForm.getBlockCount()).toBe(1);

    await blockForm.saveAllBlocks();

    const saved = await blockForm.readSavedBlocksFromStorage();
    expect(Array.isArray(saved)).toBe(true);
    expect((saved as Array<{ props: { content: string } }>).length).toBeGreaterThanOrEqual(1);
    expect((saved as Array<{ props: { content: string } }>)[0].props.content).toBe(content);
  });
});
