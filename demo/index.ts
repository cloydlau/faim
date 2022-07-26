import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import {
  FormDialog,
  PopButton,
  PopSwitch,
  Select,
  CheckAllBox,
  UnivariateTable,
  Webcam,
  CountdownButton,
} from '../dist/kikimore.mjs'

[
  {
    component: PopButton,
  },
  {
    component: PopSwitch,
  },
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
    component: CheckAllBox
  },
  {
    component: Select,
  },
  {
    component: UnivariateTable
  },
  {
    component: Webcam
  },
  {
    component: CountdownButton
  },
].map(({ component, config }) => Vue.use(component, config))

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
