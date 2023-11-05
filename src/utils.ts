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
export function getVideoMetadata(source: File | Blob | string) {
  const url = source instanceof Blob ? URL.createObjectURL(source) : source

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')

    video.addEventListener('error', (e) => {
      reject(e)
    })

    video.addEventListener('loadedmetadata', () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(url)
      }
      resolve(video)
    })

    video.src = url
  })
}

export function getAudioMetadata(source: File | Blob | string) {
  const url = source instanceof Blob ? URL.createObjectURL(source) : source

  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')

    audio.addEventListener('error', (e) => {
      reject(e)
    })

    audio.addEventListener('loadedmetadata', () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(url)
      }
      resolve(audio)
    })

    audio.src = url
  })
}

export function secondsToHHMMSS(seconds: number): string {
  let Seconds = Number.parseInt(String(seconds), 10)
  const Hours = Math.floor(Seconds / 3600)
  const Minutes = Math.floor(Seconds / 60) % 60
  Seconds %= 60
  return [Hours, Minutes, Seconds]
    .map(v => v < 10 ? `0${v}` : v)
    .filter((v, i) => v !== '00' || i > 0)
    .join(':')
}

export function sizeToLabel(size: number, unit: 'B' | 'KB' | 'MB' = 'B'): string {
  // 转 B
  if (unit === 'KB') {
    size *= KB
  } else if (unit === 'MB') {
    size *= MB
  }
  if (size >= MB) {
    return `${(size / MB).toFixed(1)}M`
  } else if (size >= KB) {
    return `${(size / KB).toFixed(0)}K`
  } else {
    return `${(size).toFixed(0)}B`
  }
}
