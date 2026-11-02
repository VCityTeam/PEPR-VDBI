import globals from 'globals'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  {
    files: ['**/*.js'],
    ignores: ['**/.**', 'dist/**', 'jsdoc/**', 'node_modules/**'],
    plugins: {
      js,
    },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
])
