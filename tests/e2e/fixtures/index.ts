import { test as base } from '@playwright/test';

import type { TE2EProject } from '../../fixtures/block-types';
import { BlockFormPage, type TUiMode } from '../page-objects/BlockFormPage';

type TFixtures = {
  blockForm: BlockFormPage;
};

function resolveUiMode(projectName: string): TUiMode {
  if (projectName === 'react') {
    return 'react';
  }
  return 'vue';
}

export const test = base.extend<TFixtures>({
  blockForm: async ({ page }, use, testInfo) => {
    const uiMode = resolveUiMode(testInfo.project.name);
    void (testInfo.project.name as TE2EProject);
    await use(new BlockFormPage(page, uiMode));
  },
});

export { expect } from '@playwright/test';
