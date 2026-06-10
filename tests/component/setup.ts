import { cleanup } from '@testing-library/react';
import { config } from '@vue/test-utils';
import { afterEach } from 'vitest';

config.global.stubs = {
  transition: false,
  Transition: false,
};

afterEach(() => {
  cleanup();
});
