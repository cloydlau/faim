import isBase64 from 'validator/es/lib/isBase64'
import { at, isPlainObject } from 'lodash-es'

export function isBase64WithScheme(str?: string, mediaType?: string) {
  if (typeof str === 'string' && str) {
    if (mediaType && !str.startsWith(`data:${mediaType}`)) {
      return false
    } else {
      return isBase64(str.split(',')[1] || '')
    }
  }
  return false
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
