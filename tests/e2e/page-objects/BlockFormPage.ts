import { CSS_CLASSES } from '../../../src/utils/constants';
import type { Locator, Page } from '@playwright/test';

import { BlockBuilderPage } from './BlockBuilderPage';

export type TUiMode = 'vue' | 'react';

export class BlockFormPage extends BlockBuilderPage {
  constructor(
    page: Page,
    private readonly uiMode: TUiMode
  ) {
    super(page);
  }

  textareaField(fieldName: string) {
    return this.page.locator(`#field-${fieldName}`);
  }

  textField(fieldName: string) {
    return this.page.locator(`#field-${fieldName}`);
  }

  numberField(fieldName: string) {
    return this.page.locator(`#field-${fieldName}`);
  }

  async fillTextarea(fieldName: string, value: string): Promise<void> {
    await this.textareaField(fieldName).fill(value);
  }

  async fillText(fieldName: string, value: string): Promise<void> {
    await this.textField(fieldName).fill(value);
  }

  async submitCreateForm(): Promise<void> {
    await this.page.locator(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).click();
  }

  async submitEditForm(): Promise<void> {
    await this.page.locator(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).click();
  }

  async waitForModalClosed(): Promise<void> {
    await this.page.locator(`.${CSS_CLASSES.MODAL}`).waitFor({ state: 'hidden', timeout: 10_000 });
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
        `.${CSS_CLASSES.REPEATER_CONTROL}[data-field-name="${fieldName}"], .${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}[data-field-name="${fieldName}"]`
      )
      .first();
  }

  repeaterItems(repeaterFieldName: string) {
    const root = this.repeater(repeaterFieldName);
    return root.locator(
      `:scope > .${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
    );
  }

  nestedRepeaterItems(repeater: Locator) {
    return repeater.locator(
      `:scope > .${CSS_CLASSES.REPEATER_CONTROL_ITEMS} > .${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
    );
  }

  repeaterItem(repeaterFieldName: string, itemIndex: number) {
    return this.repeaterItems(repeaterFieldName).nth(itemIndex);
  }

  nestedRepeater(parentItem: Locator, fieldName: string, _parentFieldPath?: string) {
    return parentItem.locator(`[data-field-name="${fieldName}"]`).first();
  }

  fieldInRepeaterItem(item: Locator, subField: string) {
    const fieldsContainer = item
      .locator(`:scope > .${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}`)
      .first();

    return fieldsContainer.locator(`input[id$="-${subField}"], textarea[id$="-${subField}"]`).first();
  }

  numberInRepeaterItem(item: Locator, subField: string) {
    const fieldsContainer = item
      .locator(`:scope > .${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}`)
      .first();

    return fieldsContainer
      .locator(`input[id$="-${subField}"][type="number"], input[id$="-${subField}"]`)
      .first();
  }

  async addRepeaterItem(repeater: Locator, buttonText: string): Promise<void> {
    await repeater.getByRole('button', { name: buttonText }).click();
  }

  async clickToggleByLabel(label: string): Promise<void> {
    const toggle = this.page.locator(`.${CSS_CLASSES.TOGGLE_CONTROL}`).filter({ hasText: label });
    await toggle.locator(`.${CSS_CLASSES.TOGGLE_CONTROL_BUTTON}`).click();
  }

  colorField(fieldName: string) {
    return this.page.locator(`#field-${fieldName}`);
  }

  repeaterItemField(fieldName: string, itemIndex: number, subField: string) {
    const repeater = this.repeater(fieldName);
    const item = repeater.locator(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`).nth(itemIndex);

    return item.locator(
      `input[id^="repeater-"][id$="-${subField}"], textarea[id^="repeater-"][id$="-${subField}"]`
    );
  }

  async collapseRepeaterItem(fieldName: string, itemIndex: number): Promise<void> {
    const item = this.repeaterItem(fieldName, itemIndex);
    await item
      .locator(`:scope > .${CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER}`)
      .locator(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`)
      .click();
    await item.waitFor({ state: 'attached' });
  }

  async collapseRepeaterItemLocator(item: Locator): Promise<void> {
    await item
      .locator(`:scope > .${CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER}`)
      .locator(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`)
      .click();
    await item.waitFor({ state: 'attached' });
  }

  modal() {
    return this.page.locator(`.${CSS_CLASSES.MODAL}`);
  }

  formErrors() {
    return this.page.locator(`.${CSS_CLASSES.FORM_ERRORS}, .${CSS_CLASSES.ERROR}`);
  }
}
