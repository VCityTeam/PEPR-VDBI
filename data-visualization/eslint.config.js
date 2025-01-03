import globals from "globals";
import pluginJs from "@eslint/js";
import js from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];
