import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import ElementPlusLocale from 'element-plus/dist/locale/zh-cn.mjs'
import { createApp } from 'vue'
import { FaFormDialog, FaImage, FaImageUpload, FaMessageBox, FaPopButton, FaPopSwitch, FaRichText, FaSelect, FaUpload } from '../src/index'
import FaimLocale from '../src/locale/zh-cn'
import App from './App.vue'
import globalConfigForFaImageUpload from './ImageUpload/globalConfig'
import globalConfigForFaRichText from './RichText/globalConfig'
import globalConfigForFaUpload from './Upload/globalConfig'
import 'element-plus/dist/index.css'
import 'uno.css'

const app = createApp(App)
  .use(ElementPlus, { locale: ElementPlusLocale })
  .use(FaFormDialog, {
    locale: FaimLocale.FaFormDialog,
    width: `${window.outerWidth / 2}px`,
  })
  .use(FaImage, {
    referrerpolicy: 'no-referrer',
  })
  .use(FaImageUpload, globalConfigForFaImageUpload)
  .use(FaPopButton)
  .use(FaPopSwitch)
  .use(FaRichText, globalConfigForFaRichText)
  .use(FaSelect, {
    locale: FaimLocale.FaSelect,
  })
  .use(FaUpload, globalConfigForFaUpload)

app.config.globalProperties.$swal = FaMessageBox

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')

export default app
