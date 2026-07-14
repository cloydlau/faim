import type { SemVer } from 'semver'
import { resolve } from 'node:path'
// import process from 'node:process'
// import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
// import browserslistToEsbuild from 'browserslist-to-esbuild'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { parse } from 'semver'
import { presetAttributify, presetUno } from 'unocss'
import UnoCSS from 'unocss/vite'
import UnpluginUnused from 'unplugin-unused/vite'
import { defineConfig } from 'vite'
import { version } from 'vue'
import { name, PascalCasedName } from './package.json'

const { major, minor } = parse(version) as SemVer

// 路径查找
function pathResolve(dir: string): string {
  return resolve(__dirname, '.', dir)
}

// 设置别名
const alias: Record<string, string> = {
  '@': pathResolve('demo'),
}

export default defineConfig({
  resolve: {
    alias,
  },
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
      launchType: 'open',
      showSwitch: true,
    }),
    {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/\{\{ NAME \}\}/, name).replace(/\{\{ VUE_VERSION \}\}/g, String(major === 3 ? major : `${major}.${minor}`))
      },
    },
    UnpluginUnused(),
    UnoCSS({
      presets: [
        presetAttributify(),
        presetUno(),
      ],
    }),
    vue(),
    // legacy(),
  ],
  build: {
    lib: {
      name,
      entry: 'src/index.ts',
      fileName: 'index',
    },

    cssCodeSplit: true,
    sourcemap: true,

    rollupOptions: {
      external: [
        'vue',
        'vue-demi',
        'element-ui',
        'element-plus',
      ],
      output: {
        globals: {
          [name]: PascalCasedName,
          'vue': 'Vue',
          'vue-demi': 'VueDemi',
          'element-ui': 'ElementUI',
          'element-plus': 'ElementPlus',
        },

        // sourcemapExcludeSources: process.env.NODE_ENV === 'prod',
      },
    },

    // https://github.com/vitejs/vite/issues/11489
    // target: browserslistToEsbuild(),
  },
})
