import { createMD5 } from 'hash-wasm'
import { getChunkSize } from './presets'

const md5 = await createMD5()
const fileReader = new FileReader()

function readAsUint8Array(blob) {
  return new Promise((resolve, reject) => {
    fileReader.onerror = (e) => {
      reject(e)
    }

    fileReader.onload = (e) => {
      resolve(new Uint8Array(e.target.result))
    }

    fileReader.readAsArrayBuffer(blob)
  })
}

const readNextChunk = async ({ file, chunks = [], offset = 0, chunkSize }) => {
  const end = offset + chunkSize
  const blob = file.slice(offset, end)
  chunks.push({
    blob,
    uploadedSize: 0,
  })
  const unit8Array = await readAsUint8Array(blob)
  md5.update(unit8Array)
  if (end < file.size) {
    readNextChunk({ file, chunks, offset: end, chunkSize })
  }
  else {
    globalThis.postMessage({
      chunks,
      md5: md5.digest(),
      chunkSize,
    })
  }
}

globalThis.addEventListener('message', async (event) => {
  md5.init()
  const file = event.data
  const chunkSize = getChunkSize(file.size)
  readNextChunk({ file, chunkSize })
})
