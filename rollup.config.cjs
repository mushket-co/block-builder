const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const dts = require('rollup-plugin-dts').default;
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');
const path = require('path');

const fs = require('fs');

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

const jsPlugins = [
  resolve({
    browser: true,
    extensions: ['.js', '.ts'],
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist',
    declarationMap: false,
  }),
];

const postcssOptions = {
  extensions: ['.css', '.scss'],
  inject: false,
  minimize: true,
  modules: false,
  use: {
    sass: {
      api: 'modern-compiler',
      silenceDeprecations: ['legacy-js-api'],
    },
  },
  plugins: [postcssImport()],
};

module.exports = [
  {
    input: 'src/core.ts',
    output: [
      {
        file: 'dist/core.js',
        format: 'cjs',
        sourcemap: false,
        inlineDynamicImports: true,
      },
      {
        file: 'dist/core.esm.js',
        format: 'esm',
        sourcemap: false,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      ...jsPlugins,
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          unused: true,
          dead_code: true,
          passes: 3,
        },
        format: {
          comments: false,
        },
      }),
      generateIndexReexports(),
    ],
    external: ['vue', 'react', 'react-dom'],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
  {
    input: 'src/styles-bundle.ts',
    output: [
      {
        file: 'dist/_styles.js',
        format: 'esm',
        sourcemap: false,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      postcss({
        ...postcssOptions,
        extract: path.resolve('dist/index.esm.css'),
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
    treeshake: false,
  },
  {
    input: './dist/core.d.ts',
    output: [{ file: 'dist/core.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/, /\.scss$/],
  },
];
