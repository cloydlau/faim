import { conclude, getLocalListeners } from 'vue-global-config'
import { at, isPlainObject } from 'lodash-es'
import isBase64 from 'validator/es/lib/isBase64'
import { isVue3 } from 'vue-demi'
import type { ComponentPublicInstance } from 'vue-demi'
import isURL from 'validator/es/lib/isURL'
import FaMessageBox from './components/MessageBox'

export const MB = 1024 ** 2
export const KB = 1024

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

export function binaryToBase64(binary: File | Blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onerror = (e) => {
      reject(e)
    }
    fileReader.onload = (e) => {
      resolve(e.target?.result)
    }
    // readAsDataURL 支持 File 和 Blob
    fileReader.readAsDataURL(binary)
  })
}

// 任意类型 转 File 或 Blob
export async function toBinary(source: File | Blob | string) {
  if (typeof source === 'string') {
    if (isURL(source) || isBase64WithScheme(source, 'image/') || source.startsWith('blob:')) {
      return await (await fetch(source)).blob()
    }
    return Promise.reject(new Error('Error parsing image'))
  }
  return Promise.resolve(source)
}

// 任意类型 转 Base64 或 object URL
export async function toLocalURL(source: File | Blob | string) {
  if (typeof source === 'string') {
    if (source.startsWith('blob:')) {
      return Promise.resolve(source)
    }
    if (isURL(source)) {
      return binaryToBase64(await toBinary(source))
    }
    // isBase64 的参数为 URL 或 object URL 时会报错
    if (isBase64WithScheme(source, 'image/')) {
      return Promise.resolve(source)
    }
    return Promise.reject(new Error('Error parsing image'))
  }
  return binaryToBase64(source)
}

export async function toImageTag(src: string) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onerror = (e) => {
      reject(e)
    }
    image.onload = () => {
      resolve(image)
    }
    image.src = src
  })
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

const isPositiveNumber = (number: any) => typeof number === 'number' && !Number.isNaN(number) && number > 0

export function handleNumericalProp({
  config,
  labelTip,
  createTitleTextOfNotMatched,
  createTitleTextOfMinExceeded,
  createTitleTextOfMaxExceeded,
  withUnit = value => value.toLocaleString(),
  getValue = value => value,
}: {
  config: any[]
  labelTip: string
  createTitleTextOfNotMatched: (replacement: string) => string
  createTitleTextOfMinExceeded: (replacement: string) => string
  createTitleTextOfMaxExceeded: (replacement: string) => string
  withUnit: (value: number) => string
  getValue: (value: any) => number
}) {
  const value = conclude(config, {
    validator: (value: any) => {
      if (isPlainObject(value)) {
        const min = getValue(value.min)
        const max = getValue(value.max)
        const minIsValid = isPositiveNumber(min)
        const maxIsValid = isPositiveNumber(max)
        return (
          (minIsValid && maxIsValid && (min as number) < (max as number))
          || (minIsValid && max === undefined)
          || (min === undefined && maxIsValid)
          || (min === undefined && max === undefined)
        )
      } else if (Array.isArray(value)) {
        for (const v of value) {
          if (!isPositiveNumber(getValue(v))) {
            return false
          }
        }
        return value.length > 0
      } else {
        return isPositiveNumber(getValue(value))
      }
    },
  })

  let tip: string | undefined
  let titleTextOfNotMatched: string | undefined
  let titleTextOfMinExceeded: string | undefined
  let titleTextOfMaxExceeded: string | undefined
  let min: number | undefined
  let minLabel: string | undefined
  let max: number | undefined
  let maxLabel: string | undefined
  let options: number[] | undefined
  let optionsLabel: string | undefined
  let target: number | undefined
  let targetLabel: string | undefined
  if (isPlainObject(value)) {
    min = getValue(value.min)
    max = getValue(value.max)
    if (min && max) {
      minLabel = withUnit(value.min)
      maxLabel = withUnit(value.max)
      tip = `${labelTip} ${minLabel} ~ ${maxLabel}`
      titleTextOfMinExceeded = createTitleTextOfMinExceeded(minLabel)
      titleTextOfMaxExceeded = createTitleTextOfMaxExceeded(maxLabel)
    } else if (max) {
      maxLabel = withUnit(value.max)
      tip = `${labelTip} ≤ ${maxLabel}`
      titleTextOfMaxExceeded = createTitleTextOfMaxExceeded(maxLabel)
    } else if (min) {
      minLabel = withUnit(value.min)
      tip = `${labelTip} ≥ ${minLabel}`
      titleTextOfMinExceeded = createTitleTextOfMinExceeded(minLabel)
    }
  } else if (Array.isArray(value)) {
    options = value.map(getValue)
    optionsLabel = value.map(withUnit).join(' / ')
    tip = `${labelTip} ${optionsLabel}`
    titleTextOfNotMatched = createTitleTextOfNotMatched(optionsLabel)
  } else if (value !== undefined) {
    target = getValue(value)
    targetLabel = withUnit(value)
    tip = `${labelTip} ${targetLabel}`
    titleTextOfNotMatched = createTitleTextOfNotMatched(targetLabel)
  }

  function validate(v: any) {
    let titleText
    if (max && v > max) {
      titleText = titleTextOfMaxExceeded
    } else if (min && v < min) {
      titleText = titleTextOfMinExceeded
    } else if (options && !options.includes(v)) {
      titleText = titleTextOfNotMatched
    } else if (target && v !== target) {
      titleText = titleTextOfNotMatched
    }
    if (titleText) {
      FaMessageBox.warning({
        titleText,
        timer: 5000,
      })
    }
    return !titleText
  }

  return { tip, validate, min, minLabel, max, maxLabel, options, optionsLabel, target, targetLabel }
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

export function sizeToLabel(bytes: number): string {
  if (bytes >= MB) {
    return `${(bytes / MB).toFixed(1)}M`
  } else if (bytes >= KB) {
    return `${(bytes / KB).toFixed(0)}K`
  } else {
    return `${(bytes).toFixed(0)}B`
  }
}

export function getOrigin(url: string) {
  if (url.startsWith('//')) {
    return `//${new URL(window.location.protocol + url).host}`
  } else if (!url.startsWith('http')) {
    return new URL(`${window.location.protocol}//${url}`).host
  }
  const urlObj = new URL(url)
  return `${urlObj.protocol}//${urlObj.host}`
}

export async function fileToBlob(file: File | Blob) {
  return file instanceof File
    ? new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onerror = (e) => {
        reject(e)
      }
      fileReader.onload = (e) => {
        resolve(e.target?.result ? new Blob([e.target.result], { type: file.type }) : null)
      }
      // readAsArrayBuffer 支持 File 和 Blob
      fileReader.readAsArrayBuffer(file)
    })
    : Promise.resolve(file)
}

export async function binaryToArrayBuffer(file: File | Blob) {
  return file instanceof File
    ? new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onerror = (e) => {
        reject(e)
      }
      fileReader.onload = (e) => {
        resolve(e.target?.result)
      }
      // readAsArrayBuffer 支持 File 和 Blob
      fileReader.readAsArrayBuffer(file)
    })
    : Promise.resolve(file)
}

export function blobToFile(blob: File | Blob, fileName?: string, fileType?: string) {
  if (!fileName) {
    const extension = blob.type.split('/')[1]
    fileName = `${new Date().getTime().toString()}.${extension}`
  }
  return blob instanceof File ? blob : new File([blob], fileName, { type: fileType || blob.type })
}
