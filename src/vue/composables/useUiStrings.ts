import { computed, inject, unref } from 'vue';

import { BB_UI_STRINGS_KEY } from '../../shared/i18n/injectionKey';
import { UI_STRINGS_RU, type IUiStrings } from '../../shared/i18n/uiStrings';

export function useUiStrings() {
  const injected = inject<IUiStrings>(BB_UI_STRINGS_KEY, UI_STRINGS_RU);
  return computed(() => unref(injected as IUiStrings));
}
