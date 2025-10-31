import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      '@mushket-co/block-builder/core': path.resolve(__dirname, '../../dist/core.esm.js'),
      '@mushket-co/block-builder': path.resolve(__dirname, '../../dist/index.esm.js')
    }
  },
  publicDir: path.resolve(__dirname, '../static'),
  server: {
    host: 'localhost',
    port: 3003,
    strictPort: true,
    open: true
  },
  optimizeDeps: {
    exclude: ['@mushket-co/block-builder']
  }
})

