import { createApp, h } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { KiFormDialog, KiImage, KiImageUpload, KiMessageBox, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'
import App from './App.vue'

const app = createApp(App)
  .use(ElementPlus)
  .use(KiFormDialog, {
    'confirmButtonText': '确 认',
    'resetButtonText': '重 置',
    'cancelButtonText': '取 消',
    'denyButtonText': '拒 绝',
    '@closed': function (e) {
      console.log('Global Closed Event')
    },
    // '#header': () => h('b', undefined, 'Kikimore'),
    'title': 'Kikimore',
  })
  .use(KiImage)
  .use(KiImageUpload)
  .use(KiPopButton, {})
  .use(KiPopSwitch, {
    inlinePrompt: true,
  })
  .use(KiSelect, {
    '#prefix': () => h('span', undefined, 'Global Slot'),
    '#default': ({ option, index }) => h('span', undefined, `${option.name} (From Global Scoped Slot)`),
  })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
