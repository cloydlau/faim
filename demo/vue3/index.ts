import { createApp } from 'vue'
import App from './App.vue'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import {
  KiFormDialog,
  KiPopButton,
  KiPopSwitch,
  KiSelect,
} from '../../src/index'

const app = createApp(App)
  .use(ElementPlus)
  .use(KiFormDialog, {
    'confirmButtonText': '确 认',
    'resetButtonText': '重 置',
    'cancelButtonText': '取 消',
    'denyButtonText': '拒 绝',
    '@closed': function (e) {
      console.log('@closed')
      console.log(e)
      console.log(this)
    },
  })
  .use(KiPopButton, {})
  .use(KiPopSwitch, {})
  .use(KiSelect, {})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
