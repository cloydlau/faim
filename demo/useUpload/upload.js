import { FaMessageBox } from 'faim'
import { POST } from '../request'

// const GB = 1024 ** 3
const MB = 1024 ** 2
const RETRY_TIMES = 3
const CHUNK_SIZE = 10 * MB

// 切割文件
function sliceFile(file, CHUNK_SIZE = 10 * MB) {
  const chunks = []
  if (file instanceof Blob) {
    if (file.size > CHUNK_SIZE) {
      let start = 0
      let end = 0
      while (true) {
        if (end + CHUNK_SIZE >= file.size) {
          chunks.push(file.slice(start))
          break
        } else {
          end += CHUNK_SIZE
          const blob = file.slice(start, end)
          chunks.push(blob)
          start += CHUNK_SIZE
        }
      }
    } else {
      chunks.push(file.slice(0))
    }
  }
  return chunks
}

// 分片上传文件
export default function upload(file, progress, abortController) {
  let failTimes = 0

  const chunks = sliceFile(file, CHUNK_SIZE)
  let count = 0

  const formData = {
    chunkTotal: chunks.length.toString(),
    fileName: file.name,
    domainId: '1',
    dir: 'img',
    ...this.$attrs.requestParam,
  }

  return new Promise((resolve, reject) => {
    const recursion = () => {
      formData.file = chunks[count]
      formData.chunk = count.toString()
      POST.upload(`${import.meta.env.VITE_APP_UPLOAD_API}/upload-api-noauth/chunkUpload`, formData, {
        baseURL: '', // 针对 baseAPI 为相对路径的情况
        timeout: 0,
        onUploadProgress({ event }) {
          if (event.lengthComputable) {
            progress(((CHUNK_SIZE * count + event.loaded) / file.size) * 100)
          }
        },
        signal: abortController?.signal,
      })
        .then((res) => {
          const data = 'data' in res ? ('data' in res.data ? res.data.data : res.data) : res
          if (data?.status === '200') {
            resolve(data.url)
          } else if (count++ < chunks.length - 1) {
            formData.taskId = data.url
            recursion()
          } else {
            FaMessageBox.error('上传失败')
            reject(Error('上传失败'))
          }
        })
        .catch((e) => {
          // 手动中止，重置断点续传次数
          if (e.code === 'ERR_CANCELED') {
            failTimes = Number.MAX_VALUE
            reject(Error('上传取消'))
          // 断点续传
          } else if (failTimes++ < RETRY_TIMES) {
            recursion()
          } else {
            FaMessageBox.error('上传失败')
            reject(Error('上传失败'))
          }
        })
    }

    recursion()
  })
}
