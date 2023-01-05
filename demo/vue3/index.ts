import 'uno.css'

import { createApp } from 'vue'
import App from './App.vue'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import {
  KiFormDialog,
  KiPopButton,
  KiPopSwitch,
  KiSelect,
} from '../../src/index'

createApp(App)
  .use(ElementPlus)
  .use(KiFormDialog, {
    '@closed': function (e) {
      console.log('@closed')
      console.log(e)
      console.log(this)
    },
  })
  .use(KiPopButton, {})
  .use(KiPopSwitch, {})
  .use(KiSelect, {})
  .mount('#app')
