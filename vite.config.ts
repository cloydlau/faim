import vue from '@vitejs/plugin-vue2'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { parse } from 'semver'
import type { SemVer } from 'semver'
import { version } from 'vue'
import { PascalCasedName, name } from './package.json'

const { major, minor } = parse(version) as SemVer

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [{
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html.replace(/\{\{NAME\}\}/, name).replace(/\{\{VUE_VERSION\}\}/g, String(major === 3 ? major : `${major}.${minor}`))
    },
  }, dts({
    outDir: 'src',
  }), AutoImport({
    // targets to transform
    include: [
      /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      /\.vue$/, /\.vue\?vue/, // .vue
      /\.md$/, // .md
    ],
    // global imports to register
    imports: [
      // presets
      (major === 3 || (major === 2 && minor >= 7)) ? 'vue' : '@vue/composition-api',
    ],
  }), Components(), vue()],
  build: {
    lib: {
      name,
      entry: 'src/index.ts',
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
