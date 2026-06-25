const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const dts = require('rollup-plugin-dts').default;
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');
const path = require('path');

const packageJson = require('./package.json');

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
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: false,
        inlineDynamicImports: true,
      },
      {
        file: packageJson.module,
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
    ],
    external: ['vue', 'react', 'react-dom'],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
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
    input: './dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/, /\.scss$/],
  },
  {
    input: './dist/core.d.ts',
    output: [{ file: 'dist/core.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/, /\.scss$/],
  },
];
