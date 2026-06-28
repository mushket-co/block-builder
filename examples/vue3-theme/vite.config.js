import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupMockApi } from '../vue3/mock-api-server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'mock-api',
      configureServer(server) {
        setupMockApi(server.middlewares)
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mushket-co/block-builder/vue': path.resolve(__dirname, '../../src/vue.ts'),
      '@mushket-co/block-builder/index.esm.css': path.resolve(__dirname, '../../dist/index.esm.css'),
      '@mushket-co/block-builder/index.css': path.resolve(__dirname, '../../dist/index.esm.css'),
      '@mushket-co/block-builder': path.resolve(__dirname, '../../dist/index.esm.js'),
    },
  },
  publicDir: path.resolve(__dirname, '../static'),
  server: {
    host: 'localhost',
    port: 3007,
    strictPort: true,
    open: true,
  },
  preview: {
    host: 'localhost',
    port: 3007,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['@mushket-co/block-builder'],
  },
})
