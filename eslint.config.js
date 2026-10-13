import js from '@eslint/js';
import globals from 'globals';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'coverage/**', 'lint-baseline.txt'],
  },
  js.configs.recommended,

  // Основной код — браузер
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
        __APP_VERSION__: 'readonly',
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Отключаем встроенное правило — его работу делает unused-imports
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'smart'],
    },
  },

  // Конфиг и вспомогательные файлы — Node
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },

  // Сам логгер — здесь console это его работа
  {
    files: ['src/utils/logger.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
