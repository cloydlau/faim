export function getCharCount(text: string): number {
  let count = 0
  if (text) {
    for (const v of text) {
      count += v.charCodeAt(0) > 255 ? 2 : 1
    }
  }
  return count
}
