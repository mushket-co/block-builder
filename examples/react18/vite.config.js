import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, mergeConfig } from 'vite'
import reactConfig from '../react19/vite.config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const reactRoot = path.resolve(__dirname, '../react19')

/** Same app as examples/react19, pinned to React 18 — port 3005 for parallel dev/e2e. */
export default mergeConfig(
  reactConfig,
  defineConfig({
    root: reactRoot,
    server: {
      host: 'localhost',
      port: 3005,
      strictPort: true,
      open: false,
    },
    preview: {
      host: 'localhost',
      port: 3005,
      strictPort: true,
    },
  })
)
