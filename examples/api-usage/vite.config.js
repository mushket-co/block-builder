import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      'block-builder/core': path.resolve(__dirname, '../../dist/core.esm.js'),
      'block-builder': path.resolve(__dirname, '../../dist/index.esm.js')
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
    exclude: ['block-builder']
  }
})

