import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import {
  KiFormDialog,
  // KiImage,
  // KiMap,
  KiPopButton,
  KiPopSwitch,
  KiSelect,
  // KiUpload,
} from '../../src/index'

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
})
/* Vue.use(KiImage)
window._AMapSecurityConfig = { securityJsCode: import.meta.env.VITE_APP_SCURITY_JS_CODE }
Vue.use(KiMap, {
  loadOptions: {
    key: import.meta.env.VITE_APP_AMAP_JS_API_KEY,
  },
}) */
Vue.use(KiPopButton)
Vue.use(KiPopSwitch, {
  inlinePrompt: true,
})
Vue.use(KiSelect)
// Vue.use(KiUpload)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
