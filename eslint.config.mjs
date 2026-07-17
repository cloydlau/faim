import path from 'node:path'
import { fileURLToPath } from 'node:url'
import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import nounsanitized from 'eslint-plugin-no-unsanitized'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default antfu(
  {
    formatters: true,
    lessOpinionated: true,
  },
  {
    rules: {
      'brace-style': ['error', 'stroustrup', { allowSingleLine: false }],
      'curly': ['error', 'all'],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
    languageOptions: {
      globals: {
        tinymce: 'readonly',
      },
    },
  },
  {
    // vue/* 规则仅作用于 .vue；未限定 files 时会应用到所有文件并因缺少 vue 插件报错
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': ['error', { singleline: 3 }],
      'vue/max-len': ['error', {
        code: 160,
        ignoreComments: true,
        ignoreHTMLAttributeValues: true,
        ignoreHTMLTextContents: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      }],
      'vue/no-deprecated-v-bind-sync': 'off',
      'vue/no-deprecated-v-on-native-modifier': 'off',
      'vue/no-deprecated-destroyed-lifecycle': 'off',
      'vue/no-deprecated-dollar-listeners-api': 'off',
      'vue/no-deprecated-dollar-scopedslots-api': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
  [nounsanitized.configs.recommended], // Code Security Check
  /**
   * mimic ESLintRC-style extends
   *
   * This rule is used to avoid financial calculations
   * For non-financial calculation cases, you can add the comments below to ignore:
   *   // Reason for ignoring: Not related to finance, calculating xxx
   *   // eslint-disable-next-line financial/no-division (or financial/no-float-calculation)
   */
  ...compat.extends('plugin:financial/recommended'),
  {
    // Project arithmetic concerns media processing, UI geometry, progress, and byte sizing rather than financial calculations.
    rules: {
      'financial/no-division': 'off',
      'financial/no-float-calculation': 'off',
    },
  },
)
