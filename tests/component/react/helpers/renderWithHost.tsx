import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

import { cleanupReactTestHost } from './cleanupReactTestHost';

export type TRenderWithHostResult = RenderResult & { host: HTMLElement };

export function renderWithHost(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'container'>
): TRenderWithHostResult {
  const host = document.createElement('div');
  document.body.appendChild(host);

  const result = render(ui, { ...options, container: host });
  return { ...result, host };
}

export { cleanupReactTestHost };
