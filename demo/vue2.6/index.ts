import Vue from 'vue'
// import { h } from 'vue-demi'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import { KiFormDialog, KiPopButton, KiPopSwitch, KiSelect } from '../../src'
import App from './App.vue'

Vue.use(ElementUI)
Vue.use(KiFormDialog, {
  'confirmButtonText': '确 认',
  'resetButtonText': '重 置',
  'cancelButtonText': '取 消',
  'denyButtonText': '拒 绝',
  '@closed': function (e) {
    console.log('@closed')
    console.log(e)
    console.log(this)
  },
  /* '#title': h(
    'h1',
    '123',
  ), */
})
Vue.use(KiPopButton)
Vue.use(KiPopSwitch, {
  inlinePrompt: true,
})
Vue.use(KiSelect)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
