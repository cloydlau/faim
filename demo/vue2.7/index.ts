import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import {
  KiFormDialog,
  KiPopButton,
  KiPopSwitch,
  KiSelect,
} from '../../src/index'

Vue.use(ElementUI)
Vue.use(KiFormDialog, {
  'confirmButtonText': '确 认',
  'resetButtonText': '重 置',
  'cancelButtonText': '取 消',
  'denyButtonText': '拒 绝',
  '@closed': function (e) {
    console.log('Global Closed Event')
  },
  '#title': () => ({
    render: h => h('b', undefined, 'Global Title')
  }),
})
Vue.use(KiPopButton)
Vue.use(KiPopSwitch, {
  inlinePrompt: true,
})
Vue.use(KiSelect, {
  '#prefix': () => ({
    render: h => h('span', undefined, 'Global Slot'),
  }),
  '#default': ({ option, index }) => ({
    render: h => h('span', undefined, `${option.name} (From Global Scoped Slot)`),
  }),
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
