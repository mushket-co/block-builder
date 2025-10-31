import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupMockApi } from './mock-api-server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    vue(),
    // Плагин для Mock API
    {
      name: 'mock-api',
      configureServer(server) {
        setupMockApi(server.middlewares)
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mushket-co/block-builder/vue': path.resolve(__dirname, '../../src/vue.ts'),
      '@mushket-co/block-builder/index.esm.css': path.resolve(__dirname, '../../dist/index.esm.css'),
      '@mushket-co/block-builder/index.css': path.resolve(__dirname, '../../dist/index.esm.css'),
      '@mushket-co/block-builder': path.resolve(__dirname, '../../dist/index.esm.js')
    }
  },
  publicDir: path.resolve(__dirname, '../static'),
  server: {
    host: 'localhost',
    port: 3001,
    strictPort: true,
    open: true
  },
  optimizeDeps: {
    exclude: ['@mushket-co/block-builder']
  }
})

