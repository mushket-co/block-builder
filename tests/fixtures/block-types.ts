/** Shared block type labels for cross-framework E2E tests. */

export const BLOCK_TYPE_LABELS = {
  text: {
    vue3: 'Текстовый блок (простой)',
    react: 'Текстовый блок (простой)',
    pureJs: 'Текстовый блок',
  },
  link: {
    vue3: 'Блок ссылки',
    react: 'Блок ссылки',
    pureJs: 'Блок ссылки',
  },
  cardList: {
    vue3: 'Список карточек',
    react: 'Список карточек',
    pureJs: 'Список карточек',
  },
  nestedRepeater: {
    vue3: 'Каталог с вложенными репитерами',
    react: 'Каталог с вложенными репитерами',
    pureJs: 'Каталог с вложенными репитерами',
  },
} as const;

export const TEXT_BLOCK_FIELD = {
  content: 'content',
  fontSize: 'fontSize',
} as const;

export const LOCAL_STORAGE_KEY = 'saved-blocks';

export type TE2EProject = 'vue3' | 'react' | 'pure-js';
export type TBlockTypeKey = keyof typeof BLOCK_TYPE_LABELS;

export function getBlockLabel(block: TBlockTypeKey, project: TE2EProject): string {
  if (project === 'pure-js') {
    return BLOCK_TYPE_LABELS[block].pureJs;
  }
  if (project === 'react') {
    return BLOCK_TYPE_LABELS[block].react;
  }
  return BLOCK_TYPE_LABELS[block].vue3;
}

/** @deprecated Use getBlockLabel('text', project) */
export function getTextBlockLabel(project: TE2EProject): string {
  return getBlockLabel('text', project);
}
