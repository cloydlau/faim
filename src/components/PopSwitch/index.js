import Component from './index.vue'
import { init } from './config'

Component.install = (Vue, opts) => {
  if (Component.install.installed) {
    console.warn(`请勿重复注册${Component.name}`)
    return
  }
  init(opts)
  Vue.component(Component.name, Component)
  Component.install.installed = true
}

export default Component
