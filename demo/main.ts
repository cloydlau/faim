import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

/*import { SvgIcon } from '../src/main'
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(require.context('@/assets/svg-sprite', false, /\.svg$/))
Vue.component('SvgIcon', SvgIcon)*/

import { SvgIcon } from '../src/main'
// @ts-ignore
const modules = import.meta.globEager('./assets/svg-sprite/*.svg')
Vue.component('SvgIcon', SvgIcon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
