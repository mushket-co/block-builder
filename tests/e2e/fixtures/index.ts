import { test as base } from '@playwright/test';

import { BlockFormPage } from '../page-objects/BlockFormPage';

type TFixtures = {
  blockForm: BlockFormPage;
};

export const test = base.extend<TFixtures>({
  blockForm: async ({ page }, use, testInfo) => {
    const uiMode = testInfo.project.name === 'pure-js' ? 'pure-js' : 'vue';
    await use(new BlockFormPage(page, uiMode));
  },
});

export { expect } from '@playwright/test';
