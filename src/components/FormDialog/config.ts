let globalProps = {}, globalAttrs = {}, globalEvents = {}, globalHooks = {}
import { classifyGlobalConfig } from './vue-global-config'

const localProps = {
  show: {
    type: Boolean,
    required: true
  },
  value: {
    default: () => ({}),
  },
  elFormProps: {},
  retrieve: {},
  submit: {},
  readonly: {},
  loading: {
    type: Boolean,
    default: undefined,
  },
}

export const init = (globalConfig = {}) => {
  const { props, attrs, events, hooks } = classifyGlobalConfig(globalConfig, localProps)
  globalProps = props
  globalAttrs = attrs
  globalEvents = events
  globalHooks = hooks
}

export { localProps, globalProps, globalAttrs, globalEvents, globalHooks }
