import { conclude, getLocalListeners } from 'vue-global-config'
import { at, isPlainObject } from 'lodash-es'
import isBase64 from 'validator/es/lib/isBase64'
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
    mergeFunction:
      (localEventListener: (...args: any) => unknown, globalEventListener: (...args: any) => unknown) => (...args: any) => {
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

export function tryParsingJSONArray(str: any) {
  if (typeof str === 'string' && str.startsWith('[') && str.endsWith(']')) {
    try {
      const arr = JSON.parse(str)
      return Array.isArray(arr) && arr
    } catch (e) {
      console.error(e)
      return false
    }
  }
  return false
}

export function isBase64WithScheme(str: string, mediaType?: string) {
  if (!str || typeof str !== 'string') {
    return false
  }
  if (mediaType && !str.startsWith(`data:${mediaType}`)) {
    return false
  } else {
    const base64WithoutScheme = str.split(',')[1]
    return base64WithoutScheme ? isBase64(base64WithoutScheme) : false
  }
}

export function unwrap(value: any, srcAt: string | ((value: any) => unknown) | symbol) {
  if (!(value && srcAt)) {
    return value
  }
  switch (typeof srcAt) {
    case 'string':
      // srcAt 为 undefined 或 '' 时结果为 undefined
      return at(value, srcAt)[0]
    case 'function':
      return srcAt(value)
    case 'symbol':
      if (isPlainObject(value)) {
        return value[srcAt]
      }
  }
}
