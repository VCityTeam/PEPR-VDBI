import globals from 'globals'
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  // Generated or vendored code: build output, Framework cache, Python venv, JSDoc output
  globalIgnores(['dist/', 'src/.observablehq/', '.venv/', 'jsdoc/']),
  {
    files: ['**/*.js'],
    plugins: {
      js,
    },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  // Data loaders and their helpers run in Node at build/preview time
  {
    files: ['src/data/**/*.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
  // Web Worker: d3 is loaded as a global through importScripts()
  {
    files: ['src/components/force-layout-simulation-worker.js'],
    languageOptions: {
      globals: { ...globals.worker, d3: 'readonly' },
    },
  },
])
