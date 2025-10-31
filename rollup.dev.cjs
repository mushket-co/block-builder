const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');

const packageJson = require('./package.json');

// В dev режиме убираем второй этап сборки типов (dts bundling),
// чтобы избежать ошибки "Cannot import the generated bundle" в watch mode
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
      // Обработка CSS/SCSS - инлайним в JS
      postcss({
        extensions: ['.css', '.scss'],
        inject: false,
        extract: false,
        minimize: false, // В dev режиме не минимизируем
        modules: false,
        use: {
          sass: {
            api: 'modern-compiler',
            silenceDeprecations: ['legacy-js-api'],
          }
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
        declaration: true,
        declarationDir: './dist',
        declarationMap: true,
      }),
    ],
    external: ['vue'],
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**'
    }
  },
];
