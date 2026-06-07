/** Shared block type labels for cross-framework E2E tests. */

export const BLOCK_TYPE_LABELS = {
  text: {
    vue3: 'Текстовый блок (простой)',
    pureJs: 'Текстовый блок',
  },
  link: {
    vue3: 'Блок ссылки',
    pureJs: 'Блок ссылки',
  },
  cardList: {
    vue3: 'Список карточек',
    pureJs: 'Список карточек',
  },
  nestedRepeater: {
    vue3: 'Каталог с вложенными репитерами',
    pureJs: 'Каталог с вложенными репитерами',
  },
} as const;

export const TEXT_BLOCK_FIELD = {
  content: 'content',
  fontSize: 'fontSize',
} as const;

export const LOCAL_STORAGE_KEY = 'saved-blocks';

export type TE2EProject = 'vue3' | 'pure-js';
export type TBlockTypeKey = keyof typeof BLOCK_TYPE_LABELS;

export function getBlockLabel(block: TBlockTypeKey, project: TE2EProject): string {
  return project === 'vue3' ? BLOCK_TYPE_LABELS[block].vue3 : BLOCK_TYPE_LABELS[block].pureJs;
}

/** @deprecated Use getBlockLabel('text', project) */
export function getTextBlockLabel(project: TE2EProject): string {
  return getBlockLabel('text', project);
}
