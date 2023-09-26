import vue from '@vitejs/plugin-vue2'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
  plugins: [
    vue(),
    {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/\{\{VUE_VERSION\}\}/g, '2.7')
      },
    },
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      // global imports to register
      imports: [
        // presets
        'vue',
        // '@vueuse/core',
      ],
    }),
    Components({
      /* options */
    }),
    // checker({
    //   eslint: false,
    //   typescript: true,
    //   vls: true,
    //   //vueTsc: true,
    //   stylelint: {
    //     lintCommand: 'stylelint ./src/**/*.{scss,vue}',
    //   },
    // }),
  ],
})
