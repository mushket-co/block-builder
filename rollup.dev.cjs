const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');
const path = require('path');

module.exports = [
  {
    input: {
      index: 'src/index.ts',
      core: 'src/core.ts',
    },
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        entryFileNames: '[name].js',
        sourcemap: true,
      },
      {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].esm.js',
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
