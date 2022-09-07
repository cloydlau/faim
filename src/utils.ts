import { conclude, getLocalListeners } from 'vue-global-config'
import { isPlainObject } from 'lodash-es'

export function hasScrollbar(el: HTMLElement) {
  return el.scrollHeight > el.clientHeight
}

export function getCharCount(text: string): number {
  let count = 0
  if (text) {
    for (let v of text) {
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
      value === null ||
      Array.isArray(value) && value.length === 0 ||
      isPlainObject(value) && Object.getOwnPropertyNames(value).length === 0,
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
