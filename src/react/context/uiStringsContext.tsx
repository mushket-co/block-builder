import { createContext, useContext, type ReactNode } from 'react';

import {
  resolveUiStrings,
  UI_STRINGS_RU,
  type IUiStrings,
  type TUiLocale,
} from '../../shared/i18n/uiStrings';

const UiStringsContext = createContext<IUiStrings>(UI_STRINGS_RU);

export function UiStringsProvider({
  locale,
  uiStrings,
  children,
}: {
  locale?: TUiLocale;
  uiStrings?: Partial<IUiStrings>;
  children: ReactNode;
}) {
  const resolved = resolveUiStrings(locale, uiStrings);
  return <UiStringsContext.Provider value={resolved}>{children}</UiStringsContext.Provider>;
}

export function useUiStrings(): IUiStrings {
  return useContext(UiStringsContext);
}
