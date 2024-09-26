import ElementUI from 'element-ui'
import ElementUILocale from 'element-ui/lib/locale/lang/zh-CN'
import Vue from 'vue'
import { FaFormDialog, FaImage, FaImageUpload, FaMessageBox, FaPopButton, FaPopSwitch, FaRichText, FaSelect, FaUpload } from '../src/index'
import FaimLocale from '../src/locale/zh-cn'
import App from './App.vue'
import globalConfigForFaImageUpload from './ImageUpload/globalConfig'
import globalConfigForFaRichText from './RichText/globalConfig'
import globalConfigForFaUpload from './Upload/globalConfig'
import 'element-ui/lib/theme-chalk/index.css'
import 'uno.css'

Vue.use(ElementUI, { locale: ElementUILocale })
Vue.use(FaFormDialog, {
  locale: FaimLocale.FaFormDialog,
  width: `${window.outerWidth / 2}px`,
})
Vue.use(FaImage)
Vue.use(FaImageUpload, globalConfigForFaImageUpload)
Vue.use(FaPopButton)
Vue.use(FaPopSwitch)
Vue.use(FaRichText, globalConfigForFaRichText)
Vue.use(FaSelect, {
  locale: FaimLocale.FaSelect,
})
Vue.use(FaUpload, globalConfigForFaUpload)

Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '$swal', {
  value: FaMessageBox,
})

new Vue({
  render: h => h(App),
}).$mount('#app')
