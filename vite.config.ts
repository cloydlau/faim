import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import { name, pascalCasedName } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts(),
    vue(),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/, /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      // global imports to register
      imports: [
        // presets
        'vue',
        // '@vueuse/core',
      ],
    }),
    UnoCSS({
      presets: [
        presetAttributify({ /* options */ }),
        presetUno(),
        // ...other presets
      ],
    }),
  ],
  build: {
    lib: {
      name,
      entry: 'src/index.ts',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['element-ui', 'vue'],
      output: {
        globals: {
          [name]: pascalCasedName,
          'element-ui': 'ElementUI',
          'vue': 'Vue',
        },
      },
    },
  },
})
