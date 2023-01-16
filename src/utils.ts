import { conclude, getLocalListeners } from 'vue-global-config'
import { at, isPlainObject } from 'lodash-es'
import { isVue3 } from 'vue-demi'
import type { ComponentPublicInstance } from 'vue-demi'

export function getListeners(this: ComponentPublicInstance, globalListeners: Record<string, any>) {
  if (isVue3) {
    return {}
  }

  for (const k in globalListeners) {
    globalListeners[k] = globalListeners[k].bind(this)
  }

  return conclude([getLocalListeners(this.$listeners)], {
    default: globalListeners,
    mergeFunction: (localEventListener: Function, globalEventListener: Function) => (...args: any) => {
      localEventListener(...args)
      globalEventListener(...args)
    },
  })
}

export function isGlobalSlot(slot: any) {
  return typeof slot === 'function' && slot.name.startsWith('#')
}

export function isEmpty(value: any): boolean {
  return {
    object: () =>
      value === null
      || (Array.isArray(value) && value.length === 0)
      || (isPlainObject(value) && Object.getOwnPropertyNames(value).length === 0),
    number: () => Number.isNaN(value),
    string: () => value === '',
    undefined: () => true,
    boolean: () => value === false,
    symbol: () => false,
    bigint: () => false,
    function: () => true,
  }[typeof value]()
}

export function notEmpty(value: any): boolean {
  return !isEmpty(value)
}

export function isObject(value: any) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// value 是某个 option，path 是 Props.xxx
export function unwrap<V = any>(value: V, path?: string | ((value: V) => any) | symbol): any {
  if (!(value && path)) {
    return value
  }
  switch (typeof path) {
    case 'string':
      // paths 为 undefined 或 '' 时结果为 undefined
      return at(value, path)[0]
    case 'function':
      return path(value)
    case 'symbol':
      if (isPlainObject(value)) {
        return value[path as keyof typeof value]
      }
  }
}

// 将 value 包装为符合 files 要求的格式
export function wrap(value: any, url: string) {
  if (url && typeof url === 'string') {
    if (isObject(value)) {
      value.url = url
      return value
    }
    return { url }
  }
}
