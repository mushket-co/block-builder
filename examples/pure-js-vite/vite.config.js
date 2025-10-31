import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupMockApi } from './mock-api-server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      'block-builder/index.esm.css': path.resolve(__dirname, '../../dist/index.esm.css'),
      'block-builder/index.css': path.resolve(__dirname, '../../dist/index.esm.css'),
      'block-builder/core': path.resolve(__dirname, '../../dist/core.esm.js'),
      'block-builder': path.resolve(__dirname, '../../dist/index.esm.js')
    }
  },
  publicDir: path.resolve(__dirname, '../static'),
  server: {
    host: 'localhost',
    port: 3002,
    strictPort: true,
    open: true
  },
  optimizeDeps: {
    exclude: ['block-builder']
  },
  plugins: [
    {
      name: 'mock-api-server',
      configureServer(server) {
        setupMockApi(server.middlewares, 3002)
      }
    }
  ]
})

