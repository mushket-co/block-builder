import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

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

export function cleanupReactTestHost(): void {
  document.body.innerHTML = '';
}
