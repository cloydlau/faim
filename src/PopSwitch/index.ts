import { useGlobalConfig } from 'vue-global-config'
import Component from './index.vue'

const globalProps: Record<string, any> = {}
const globalAttrs: Record<string, any> = {}
const globalListeners: Record<string, any> = {}
const globalHooks: Record<string, any> = {}

Component.install = (app: any, options = {}) => {
  const { props, attrs, listeners, hooks } = useGlobalConfig(options, Component.props)
  Object.assign(globalProps, props)
  Object.assign(globalAttrs, attrs)
  Object.assign(globalListeners, listeners)
  Object.assign(globalHooks, hooks)
  app.component(Component.name, Component)
}

export { globalProps, globalAttrs, globalListeners, globalHooks }
export default Component
