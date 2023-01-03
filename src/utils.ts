import { conclude, getLocalListeners } from 'vue-global-config'
import { at, isPlainObject } from 'lodash-es'

export function hasScrollbar(el: HTMLElement) {
  return el.scrollHeight > el.clientHeight
}

export function getCharCount(text: string): number {
  let count = 0
  if (text) {
    for (const v of text) {
      count += v.charCodeAt(0) > 255 ? 2 : 1
    }
  }
  return count
}

export function getListeners(globalListeners: { [key: string]: any }) {
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
