import type { SemVer } from 'semver'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
// import browserslistToEsbuild from 'browserslist-to-esbuild'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import dayjs from 'dayjs'
import { parse } from 'semver'
import { presetAttributify, presetUno } from 'unocss'
import UnoCSS from 'unocss/vite'
import UnpluginUnused from 'unplugin-unused/vite'
import { defineConfig } from 'vite'
import { version } from 'vue'
import { name, PascalCasedName } from './package.json'

const { major, minor } = parse(version) as SemVer
// 使用时间戳目录替代文件名 hash，使静态资源缓存随每次构建失效
const lastBuildTime = dayjs().format('YYYY-MM-DD_HH-mm-ss')

// 创建无 hash 的演示站点资源输出配置。
function createDemoOutputOptions() {
  return {
    entryFileNames: `${lastBuildTime}/[name].js`,
    chunkFileNames: `${lastBuildTime}/[name].js`,
    assetFileNames: `${lastBuildTime}/[name].[ext]`,
  }
}

// 路径查找
function pathResolve(dir: string): string {
  return resolve(__dirname, '.', dir)
}

// 设置别名
const alias: Record<string, string> = {
  '@': pathResolve('demo'),
}

export default defineConfig(({ mode }) => ({
  base: mode === 'demo' ? './' : undefined,
  server: {
    // Node may bind localhost to IPv6-only (::1); force IPv4 so http://localhost:5173 works in browsers that prefer 127.0.0.1.
    host: '127.0.0.1',
  },
  resolve: {
    alias,
  },
  worker: mode === 'demo'
    ? {
        rolldownOptions: {
          output: createDemoOutputOptions(),
        },
      }
    : undefined,
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
      launchType: 'open',
      showSwitch: true,
    }),
    {
      name: 'html-transform',
      transformIndexHtml: {
        order: 'pre',
        handler(html: string) {
          return html.replace(/\{\{ NAME \}\}/, name).replace(/\{\{ VUE_VERSION \}\}/g, String(major === 3 ? major : `${major}.${minor}`))
        },
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
  build: mode === 'demo'
    ? {
        outDir: 'dist.demo',
        emptyOutDir: true,
        rolldownOptions: {
          output: createDemoOutputOptions(),
        },
      }
    : {
        lib: {
          name,
          entry: 'src/index.ts',
          fileName: 'index',
        },

        cssCodeSplit: true,
        sourcemap: true,

        rolldownOptions: {
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
}))
