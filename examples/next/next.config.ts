import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { NextConfig } from 'next'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(rootDir, '../..')

const blockBuilderAliases = {
  '@mushket-co/block-builder/react': path.join(packageRoot, 'src/react.ts'),
  '@mushket-co/block-builder/index.esm.css': path.join(packageRoot, 'dist/index.esm.css'),
  '@mushket-co/block-builder/index.css': path.join(packageRoot, 'dist/index.esm.css'),
  '@mushket-co/block-builder': path.join(packageRoot, 'dist/index.esm.js'),
  '@react-example': path.resolve(rootDir, '../react/src'),
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@mushket-co/block-builder'],
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...blockBuilderAliases,
    }

    return config
  },
  turbopack: {
    resolveAlias: blockBuilderAliases,
  },
}

export default nextConfig
