import { at, isPlainObject } from 'lodash-es'
import isBase64 from 'validator/es/lib/isBase64'
import isURL from 'validator/es/lib/isURL'

export const MB = 1024 ** 2
export const KB = 1024

export function equalOrWithin(value: any) {
  if (Array.isArray(value)) {
    if (value.length === 0 || value.length > 2) {
      return false
    }
    const [min, max] = value
    const minIsValid = typeof min === 'number' && !Number.isNaN(min) && min >= 0
    const maxIsValid = typeof max === 'number' && !Number.isNaN(max) && max >= 0
    return (
      (minIsValid && maxIsValid && min < max)
      || (minIsValid && max === undefined)
      || (min === undefined && maxIsValid)
    )
  } else {
    return typeof value === 'number' && !Number.isNaN(value) && value >= 0
  }
}

export function sizeToText(size: number): string {
  if (size >= MB) {
    return `${(size / MB).toFixed(2)}M`
  } else {
    return `${(size / KB).toFixed(0)}K`
  }
}

export function tryParsingJSONArray(str: any) {
  if (typeof str === 'string' && str.startsWith('[') && str.endsWith(']')) {
    try {
      const obj = JSON.parse(str)
      return typeof obj === 'object' && obj
    } catch (e) {
      console.error(e)
      return false
    }
  }
  return false
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

function isBase64WithScheme(str: string, mediaType: string) {
  if (!str) {
    return false
  }
  if (mediaType && !str.startsWith(`data:${mediaType}`)) {
    return false
  } else {
    return isBase64(str.split(',')[1] || '')
  }
}

export async function fileToBlob(file: File | Blob) {
  return file instanceof File
    ? new Promise((resolve) => {
      const fileReader = new FileReader()
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
    ? new Promise((resolve) => {
      const fileReader = new FileReader()
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

export function binaryToBase64(binary: File | Blob) {
  return new Promise((resolve) => {
    const fileReader = new FileReader()
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
    throw new Error('解析图片失败')
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
    throw new Error('解析图片失败')
  }
  return binaryToBase64(source)
}

export async function toImageTag(src: string) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.src = src
  })
}

export function isObject(value: any) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 在输入的 value 中获取图片链接用于回显
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
