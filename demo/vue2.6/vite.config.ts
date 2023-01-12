import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
// 错误地自动导入了 h => h(App) 中的 h
// import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
  plugins: [
    createVuePlugin(),
    {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/\{\{VUE_VERSION\}\}/g, '2.6')
      },
    },
    /* AutoImport({
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
    }), */
    Components({ /* options */ }),
  ],
})
