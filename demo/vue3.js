import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlusLocale from 'element-plus/dist/locale/zh-cn.mjs'
import { FaFormDialog, FaImage, FaImageUpload, FaMessageBox, FaPopButton, FaPopSwitch, FaRichText, FaSelect, FaUpload } from '../src/index'
import FaimLocale from '../src/locale/zh-cn'
import globalConfigForFaUpload from './Upload/globalConfig'
import globalConfigForFaImageUpload from './ImageUpload/globalConfig'
import globalConfigForFaRichText from './RichText/globalConfig'
import App from './App.vue'

const app = createApp(App)
  .use(ElementPlus, { locale: ElementPlusLocale })
  .use(FaFormDialog, {
    locale: FaimLocale.FaFormDialog,
  })
  .use(FaImage)
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
