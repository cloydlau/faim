import type { SemVer } from 'semver'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
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
      },
    },
  },
})
