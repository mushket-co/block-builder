import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(rootDir, '../..')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-16',
  future: {
    compatibilityVersion: 4,
  },
  // Nuxt 4: app/ — srcDir по умолчанию; server/, shared/, data/ — в корне проекта
  experimental: {
    appManifest: false,
  },
  devtools: { enabled: true },
  devServer: {
    port: 3007,
    strictPort: true,
  },
  build: {
    transpile: ['@mushket-co/block-builder'],
  },
  vite: {
    resolve: {
      alias: {
        '@mushket-co/block-builder/vue': resolve(packageRoot, 'src/vue.ts'),
        '@mushket-co/block-builder/index.esm.css': resolve(packageRoot, 'dist/index.esm.css'),
        '@mushket-co/block-builder/index.css': resolve(packageRoot, 'dist/index.esm.css'),
        '@mushket-co/block-builder': resolve(packageRoot, 'dist/index.esm.js'),
      },
    },
    optimizeDeps: {
      exclude: ['@mushket-co/block-builder'],
    },
  },
  nitro: {
    publicAssets: [
      {
        dir: resolve(rootDir, '../static'),
        baseURL: '/',
      },
    ],
  },
})
