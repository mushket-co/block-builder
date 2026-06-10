import { cleanup } from '@testing-library/react';

export function cleanupReactTestHost(): void {
  cleanup();
  document.body.innerHTML = '';
}
