// Flat config for ESLint v9+
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'artifacts/**', 'artifacts-compile/**', 'cache/**'],
  },
  {
    files: ['src/**/*.{ts,js}', 'test/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        node: true,
        es2022: true,
        browser: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['test/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]


