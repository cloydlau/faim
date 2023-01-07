import isBase64 from 'validator/es/lib/isBase64'

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
  if (typeof str == 'string' && str.startsWith('[') && str.endsWith(']')) {
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
