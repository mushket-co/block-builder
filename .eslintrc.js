/**
 * ESLint конфигурация для проекта Block Builder
 *
 * Основные принципы:
 * - Строгие правила для ошибок (errors)
 * - Предупреждения (warnings) для типов any, console и т.д.
 * - Переменные/параметры, начинающиеся с _, игнорируются (для неиспользуемых)
 * - Поддержка Vue 3 компонентов
 * - Интеграция с Prettier для форматирования
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.js', 'node_modules', 'rollup.config.cjs', 'rollup.dev.cjs', 'dev-server.js'],
  plugins: ['@typescript-eslint', 'vue', 'unicorn', 'simple-import-sort', 'import', 'prettier'],
  rules: {
    'no-console': 'warn',
    'no-empty': ['error', { allowEmptyCatch: true }],
    curly: 'error',
    'no-unused-vars': 'off',
    // Игнорируем неиспользуемые переменные/параметры, начинающиеся с _
    // Это полезно для методов, которые переопределяют родительские или соответствуют интерфейсам
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_', // Для деструктуризации массивов: { _id, ...rest }
        ignoreRestSiblings: true, // Игнорируем переменные в деструктуризации при использовании rest
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-this-alias': ['warn', { allowedNames: ['self'] }],
    'vue/v-for-delimiter-style': ['error', 'in'],
    'vue/v-on-function-call': ['error', 'never'],
    'vue/no-useless-mustaches': ['error', { ignoreStringEscape: true }],
    'vue/no-v-html': 'off',
    'vue/padding-line-between-blocks': 'error',
    'vue/next-tick-style': ['error', 'promise'],
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      { registeredComponentsOnly: false },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/new-line-between-multi-line-property': [
      'error',
      { minLineOfMultilineProperty: 2 },
    ],
    // Unicorn правила - отключаем слишком строгие, оставляем полезные как warnings
    'unicorn/prevent-abbreviations': 'off', // Позволяем сокращения для читаемости
    'unicorn/filename-case': 'off', // Разрешаем разные стили имен файлов
    'unicorn/prefer-module': 'off', // Поддерживаем CommonJS для совместимости
    'unicorn/no-null': 'off', // null часто используется в TypeScript
    'unicorn/no-useless-undefined': 'off',
    'unicorn/no-array-reduce': 'off', // reduce иногда необходим
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-negated-condition': 'off',
    'unicorn/no-object-as-default-parameter': 'off',
    'unicorn/prefer-spread': 'off',
    'unicorn/no-useless-fallback-in-spread': 'off',
    'unicorn/switch-case-braces': 'off',
    'unicorn/no-this-assignment': 'off', // Разрешаем присваивание this в self для замыканий
    'unicorn/consistent-function-scoping': 'off', // Позволяем функции внутри функций
    'unicorn/prefer-query-selector': 'warn', // Рекомендуем querySelector вместо getElementById
    'unicorn/prefer-number-properties': 'warn', // Рекомендуем Number.isNaN вместо isNaN
    'unicorn/prefer-add-event-listener': 'warn', // Рекомендуем addEventListener вместо onerror
    'unicorn/no-array-push-push': 'warn', // Предупреждаем о множественных push, но не блокируем
    'import/order': 'off',
    'simple-import-sort/imports': 'error',
    'import/newline-after-import': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      files: ['*.test.ts', '*.spec.ts', '**/__tests__/**'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['**/form-renderers/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            // Разрешаем неиспользуемые параметры в методах, которые переопределяют родительские
            ignoreRestSiblings: true,
          },
        ],
      },
    },
  ],
};
