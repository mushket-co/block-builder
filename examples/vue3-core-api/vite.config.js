import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'block-builder/core': path.resolve(__dirname, '../../src/core.ts'),
      'block-builder': path.resolve(__dirname, '../../src/index.ts')
    }
  },
  server: {
    port: 3005,
    open: true
  }
})

