import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import ElementUILocale from 'element-ui/lib/locale/lang/zh-CN'
import { FaFormDialog, FaImage, FaImageUpload, FaMessageBox, FaPopButton, FaPopSwitch, FaRichText, FaSelect, FaUpload } from 'faim'
import FaimLocale from 'faim/dist/locale/zh-cn'
import globalConfigForFaUpload from './useUpload/globalConfig'
import globalConfigForFaImageUpload from './useImageUpload/globalConfig'
import globalConfigForFaRichText from './useRichText/globalConfig'
import App from './App.vue'

Vue.use(ElementUI, { locale: ElementUILocale })
Vue.use(FaFormDialog, {
  locale: FaimLocale.FaFormDialog,
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
