import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import Kikimore from '../src/main'
Vue.use(Kikimore)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
