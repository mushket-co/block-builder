const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');
const fs = require('fs');
const path = require('path');

function generateIndexReexports() {
  return {
    name: 'generate-index-reexports',
    writeBundle() {
      const distDir = path.resolve('dist');
      fs.writeFileSync(
        path.join(distDir, 'index.js'),
        '"use strict";module.exports=require("./core.js");\n'
      );
      fs.writeFileSync(path.join(distDir, 'index.esm.js'), 'export * from "./core.esm.js";\n');
      fs.writeFileSync(path.join(distDir, 'index.d.ts'), 'export * from "./core";\n');
    },
  };
}

module.exports = [
  {
    input: 'src/core.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        entryFileNames: 'core.js',
        sourcemap: true,
      },
      {
        dir: 'dist',
        format: 'es',
        entryFileNames: 'core.esm.js',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
        extensions: ['.js', '.ts'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        declarationMap: true,
      }),
      generateIndexReexports(),
    ],
    external: ['vue', 'react', 'react-dom'],
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**',
    },
  },
  {
    input: 'src/styles-bundle.ts',
    output: [
      {
        file: 'dist/_styles.js',
        format: 'esm',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      postcss({
        extensions: ['.css', '.scss'],
        inject: false,
        extract: path.resolve('dist/index.esm.css'),
        minimize: false,
        modules: false,
        use: {
          sass: {
            api: 'modern-compiler',
            silenceDeprecations: ['legacy-js-api'],
          },
        },
        plugins: [postcssImport()],
      }),
      resolve({
        browser: true,
        extensions: ['.js', '.ts', '.css', '.scss'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    watch: {
      include: 'src/shared/styles/**',
      exclude: 'node_modules/**',
    },
  },
];
