const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const dts = require('rollup-plugin-dts').default;
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');

const packageJson = require('./package.json');

module.exports = [
  // Full build (with UI) - основной entry point
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: false, // Отключаем sourcemaps для уменьшения размера
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
      // Обработка CSS/SCSS - извлекаем в отдельный файл для уменьшения JS бандла
      postcss({
        extensions: ['.css', '.scss'],
        inject: false, // Не инъектировать автоматически
        extract: true, // Создаем отдельный CSS файл
        minimize: true,
        modules: false,
        use: {
          sass: {
            api: 'modern-compiler', // Используем современный API
            silenceDeprecations: ['legacy-js-api'],
          }
        },
        plugins: [postcssImport()], // Обработка @import директив
      }),
      resolve({
        browser: true,
        extensions: ['.js', '.ts', '.css', '.scss'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true, // Генерируем .d.ts файлы
        declarationDir: './dist',
        declarationMap: false, // Отключаем sourcemaps для уменьшения
        // Генерируем только типы из корневых entry points
      }),
      terser({
        compress: {
          drop_console: true, // Убираем console.*
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          unused: true, // Удаляем неиспользуемые переменные
          dead_code: true, // Удаляем мертвый код
          passes: 3, // Несколько проходов оптимизации
        },
        format: {
          comments: false, // Убираем все комментарии
        },
      }),
    ],
    external: ['vue'],
    treeshake: {
      moduleSideEffects: false, // Агрессивный tree-shaking
      propertyReadSideEffects: false,
    },
  },
  // Core-only build (API without UI) - легковесная версия
  {
    input: 'src/core.ts',
    output: [
      {
        file: 'dist/core.js',
        format: 'cjs',
        sourcemap: false, // Отключаем sourcemaps
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
      postcss({
        extensions: ['.css', '.scss'],
        inject: false,
        extract: false, // В core version не нужно инлайнить стили
        minimize: true,
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
        declarationMap: false,
      }),
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
    external: ['vue'],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
  // Генерация типов
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
