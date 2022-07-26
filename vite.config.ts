import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'
import { name } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unocss({
      presets: [
        presetAttributify({ /* options */ }),
        presetUno(),
        // ...other presets
      ]
    }),
  ],
  build: {
    lib: {
      name,
      entry: 'src/index.ts'
    },
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ['element-ui', 'vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'element-ui': 'ElementUI',
          vue: 'Vue',
        }
      },
    }
  }
})
