import type { Locator, Page } from '@playwright/test';

import { LOCAL_STORAGE_KEY } from '../../fixtures/block-types';

export class BlockBuilderPage {
  constructor(protected readonly page: Page) {}

  async gotoApp(): Promise<void> {
    await this.page.goto('/');
    await this.page.locator('.bb-app, .block-builder, #block-builder-container').first().waitFor({
      state: 'visible',
    });
  }

  async clearSavedBlocks(): Promise<void> {
    await this.page.evaluate(key => localStorage.removeItem(key), LOCAL_STORAGE_KEY);
  }

  async clearAllBlocksIfNeeded(): Promise<void> {
    const blocks = this.page.locator('.bb-block');
    if ((await blocks.count()) === 0) {
      return;
    }

    const clearButton = this.page.getByRole('button', { name: 'Очистить все' });
    if (await clearButton.isVisible()) {
      await clearButton.click();
      const confirmButton = this.page.getByRole('button', { name: 'Подтвердить' });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }
    }
  }

  addBlockButton(): Locator {
    return this.page.locator('.bb-add-block-btn').first();
  }

  async openBlockTypeSelection(): Promise<void> {
    await this.addBlockButton().click();
    await this.page.locator('.bb-block-type-selection, .bb-modal-body').first().waitFor({
      state: 'visible',
    });
  }

  blockTypeCard(title: string): Locator {
    return this.page.locator('.bb-block-type-card').filter({ hasText: title });
  }

  async selectBlockType(title: string): Promise<void> {
    await this.blockTypeCard(title).click();
    await this.page.locator('.bb-modal-body .bb-form, form.bb-form').first().waitFor({
      state: 'visible',
    });
  }

  blockElements(): Locator {
    return this.page.locator('.bb-block');
  }

  async getBlockCount(): Promise<number> {
    return this.blockElements().count();
  }

  saveAllButton(): Locator {
    return this.page.getByRole('button', { name: 'Сохранить' }).first();
  }

  async saveAllBlocks(): Promise<void> {
    await this.saveAllButton().click();
  }

  async readSavedBlocksFromStorage(): Promise<unknown> {
    return this.page.evaluate(key => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, LOCAL_STORAGE_KEY);
  }

  async prepareCleanEditor(): Promise<void> {
    await this.gotoApp();
    await this.clearSavedBlocks();
    await this.clearAllBlocksIfNeeded();
  }
}
