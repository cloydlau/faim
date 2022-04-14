import { conclude, getLocalListeners } from 'vue-global-config'

export function hasScrollbar (el: HTMLElement) {
  return el.scrollHeight > el.clientHeight
}

export function getCharCount (text: string): number {
  let count = 0
  if (text) {
    for (let v of text) {
      count += v.charCodeAt(0) > 255 ? 2 : 1
    }
  }
  return count
}

export function getListeners (globalListeners: { [key: string]: any }) {
  for (const k in globalListeners) {
    globalListeners[k] = globalListeners[k].bind(this)
  }

  return conclude([getLocalListeners(this.$listeners)], {
    default: globalListeners,
    mergeFunction: (localEventListener: Function, globalEventListener: any) => (...args: any) => {
      localEventListener(args)
      globalEventListener?.(args)
    },
  })
}
