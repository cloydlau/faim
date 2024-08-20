import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import ElementUILocale from 'element-ui/lib/locale/lang/zh-CN'
import { FaFormDialog, FaImage, FaImageUpload, FaMessageBox, FaPopButton, FaPopSwitch, FaRichText, FaSelect, FaUpload } from '../src/index'
import FaimLocale from '../src/locale/zh-cn'
import globalConfigForFaUpload from './Upload/globalConfig'
import globalConfigForFaImageUpload from './ImageUpload/globalConfig'
import globalConfigForFaRichText from './RichText/globalConfig'
import App from './App.vue'

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
