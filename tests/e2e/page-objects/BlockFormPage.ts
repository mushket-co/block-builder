import type { Locator, Page } from '@playwright/test';

import { BlockBuilderPage } from './BlockBuilderPage';

export type TUiMode = 'vue' | 'pure-js';

export class BlockFormPage extends BlockBuilderPage {
  constructor(
    page: Page,
    private readonly uiMode: TUiMode
  ) {
    super(page);
  }

  textareaField(fieldName: string) {
    if (this.uiMode === 'vue') {
      return this.page.locator(`#field-${fieldName}`);
    }
    return this.page.locator(`textarea[name="${fieldName}"]`);
  }

  textField(fieldName: string) {
    if (this.uiMode === 'vue') {
      return this.page.locator(`#field-${fieldName}`);
    }
    return this.page.locator(`input[name="${fieldName}"]`);
  }

  numberField(fieldName: string) {
    if (this.uiMode === 'vue') {
      return this.page.locator(`#field-${fieldName}`);
    }
    return this.page.locator(`input[type="number"][name="${fieldName}"]`);
  }

  async fillTextarea(fieldName: string, value: string): Promise<void> {
    await this.textareaField(fieldName).fill(value);
  }

  async fillText(fieldName: string, value: string): Promise<void> {
    await this.textField(fieldName).fill(value);
  }

  async submitCreateForm(): Promise<void> {
    if (this.uiMode === 'vue') {
      await this.page.locator('.bb-modal-footer .bb-btn--primary').click();
      return;
    }
    await this.page.locator('button[data-action="submitModal"]').click();
  }

  async submitEditForm(): Promise<void> {
    if (this.uiMode === 'vue') {
      await this.page.locator('.bb-modal-footer .bb-btn--primary').click();
      return;
    }
    await this.page.locator('button[data-action="submitModal"]').click();
  }

  async waitForModalClosed(): Promise<void> {
    await this.page.locator('.bb-modal').waitFor({ state: 'hidden', timeout: 10_000 });
  }

  async createTextBlock(blockTypeTitle: string, content: string): Promise<void> {
    await this.openBlockTypeSelection();
    await this.selectBlockType(blockTypeTitle);
    await this.fillTextarea('content', content);

    const fontSize = this.numberField('fontSize');
    if (await fontSize.isVisible({ timeout: 1000 }).catch(() => false)) {
      await fontSize.fill('16');
    }

    await this.submitCreateForm();
    await this.waitForModalClosed();
  }

  repeater(fieldName: string) {
    return this.page
      .locator(
        `.bb-repeater-control[data-field-name="${fieldName}"], .bb-repeater-control-container[data-field-name="${fieldName}"]`
      )
      .first();
  }

  repeaterItems(repeaterFieldName: string) {
    const root = this.repeater(repeaterFieldName);

    if (this.uiMode === 'pure-js') {
      return root.locator('.bb-repeater-control__items').first().locator('> .bb-repeater-control__item');
    }

    return root.locator(':scope > .bb-repeater-control__items > .bb-repeater-control__item');
  }

  nestedRepeaterItems(repeater: Locator) {
    if (this.uiMode === 'pure-js') {
      return repeater.locator('.bb-repeater-control__items').first().locator('> .bb-repeater-control__item');
    }

    return repeater.locator(':scope > .bb-repeater-control__items > .bb-repeater-control__item');
  }

  repeaterItem(repeaterFieldName: string, itemIndex: number) {
    return this.repeaterItems(repeaterFieldName).nth(itemIndex);
  }

  nestedRepeater(parentItem: Locator, fieldName: string, parentFieldPath?: string) {
    if (this.uiMode === 'vue') {
      return parentItem.locator(`[data-field-name="${fieldName}"]`).first();
    }

    if (parentFieldPath) {
      return parentItem.locator(`[data-field-name="${parentFieldPath}.${fieldName}"]`).first();
    }

    return parentItem.locator(`[data-field-name$=".${fieldName}"]`).first();
  }

  fieldInRepeaterItem(item: Locator, subField: string) {
    const fieldsContainer = item.locator(':scope > .bb-repeater-control__item-fields').first();

    if (this.uiMode === 'vue') {
      return fieldsContainer.locator(`input[id$="-${subField}"], textarea[id$="-${subField}"]`).first();
    }

    return fieldsContainer.locator(
      `input[data-field-name="${subField}"], textarea[data-field-name="${subField}"]`
    ).first();
  }

  numberInRepeaterItem(item: Locator, subField: string) {
    const fieldsContainer = item.locator(':scope > .bb-repeater-control__item-fields').first();

    if (this.uiMode === 'vue') {
      return fieldsContainer
        .locator(`input[id$="-${subField}"][type="number"], input[id$="-${subField}"]`)
        .first();
    }

    return fieldsContainer.locator(`input[type="number"][data-field-name="${subField}"]`).first();
  }

  async addRepeaterItem(repeater: Locator, buttonText: string): Promise<void> {
    await repeater.getByRole('button', { name: buttonText }).click();
  }

  async clickToggleByLabel(label: string): Promise<void> {
    const toggle = this.page.locator('.bb-toggle-control').filter({ hasText: label });
    await toggle.locator('.bb-toggle-control__button').click();
  }

  colorField(fieldName: string) {
    if (this.uiMode === 'vue') {
      return this.page.locator(`#field-${fieldName}`);
    }
    return this.page.locator(`input[type="color"][name="${fieldName}"]`);
  }

  repeaterItemField(fieldName: string, itemIndex: number, subField: string) {
    const repeater = this.repeater(fieldName);
    const item = repeater.locator('.bb-repeater-control__item').nth(itemIndex);

    if (this.uiMode === 'vue') {
      return item.locator(
        `input[id^="repeater-"][id$="-${subField}"], textarea[id^="repeater-"][id$="-${subField}"]`
      );
    }

    return item.locator(
      `[data-item-index="${itemIndex}"][data-field-name="${subField}"], input[data-item-index="${itemIndex}"][name$="[${subField}]"]`
    );
  }

  async collapseRepeaterItem(fieldName: string, itemIndex: number): Promise<void> {
    const item = this.repeaterItem(fieldName, itemIndex);
    await item.locator('.bb-repeater-control__item-btn--collapse').click();
    await item.waitFor({ state: 'attached' });
  }

  async collapseRepeaterItemLocator(item: Locator): Promise<void> {
    await item.locator('.bb-repeater-control__item-btn--collapse').click();
    await item.waitFor({ state: 'attached' });
  }

  modal() {
    return this.page.locator('.bb-modal');
  }

  formErrors() {
    return this.page.locator('.bb-form-errors, .bb-error');
  }
}
