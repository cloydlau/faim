import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import {
  FormDialog,
  Select,
  PopButton,
  PopSwitch,
} from '../src/index'

[
  {
    component: FormDialog,
    config: {
      '@closed'(e) {
        console.log('@closed')
        console.log(e)
        console.log(this)
      },
    }
  },
  {
    component: Select,
  },
  {
    component: PopButton,
  },
  {
    component: PopSwitch,
  },
].map(({ component, config }) => Vue.use(component, config))

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
