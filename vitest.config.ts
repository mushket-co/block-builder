import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue(), react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/component/setup.ts'],
    include: ['tests/component/**/*.spec.ts', 'tests/component/**/*.spec.tsx'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
