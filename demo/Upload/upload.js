import to from 'await-to-js'
import { CONFIG_ID, RETRY_MAX } from './presets'
import { POST } from '@/utils/http'
import createMQ from '@/utils/mq'

// 初始化前端消息队列
const mq = createMQ()

// 初始化多线程
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})

// 切割文件
function sliceFile(file) {
  return new Promise((resolve, reject) => {
    worker.onerror = (e) => {
      reject(e)
    }

    worker.onmessage = (event) => {
      resolve(event.data)
    }

    worker.postMessage(file)
  })
}

// 分片上传
async function uploadPart({
  file,
  chunk,
  partNumber,
  path,
  uploadId,
  queue,
  progress,
  abortController,
  resolve,
  reject,
  retry = 0,
}) {
  const [err] = await to(
    mq.produce(() =>
      POST.upload(
        '/uploadPart',
        {
          file: chunk.blob,
          req: JSON.stringify({
            configId: CONFIG_ID,
            md5Digest: queue.md5,
            path,
            uploadId,
            partSize: chunk.blob.size,
            partNumber,
          }),
        },
        {
          timeout: 0,
          onUploadProgress({ event }) {
            if (event.lengthComputable) {
              const increment = event.loaded - chunk.uploadedSize
              chunk.uploadedSize
                = event.loaded >= event.total
                  ? chunk.blob.size
                  : chunk.blob.size * (event.loaded / event.total)
              queue.uploadedSize += increment
              const percentage = (queue.uploadedSize / file.size) * 100
              // 由于还要合并分片，因此上传完所有分片并不算上传完成
              progress(Math.min(percentage, 99))
            }
          },
          signal: abortController?.signal,
        },
      ),
    ),
  )
  if (err) {
    // 手动中止
    if (err.code === 'ERR_CANCELED') {
      reject(err)
    }
    // 失败重试
    else if (++retry < RETRY_MAX) {
      uploadPart({
        file,
        chunk,
        partNumber,
        path,
        uploadId,
        queue,
        progress,
        abortController,
        resolve,
        reject,
        retry: retry + 1,
      })
    }
    else {
      reject(err)
    }
  }
  else {
    const increment = chunk.blob.size - chunk.uploadedSize
    chunk.uploadedSize = chunk.blob.size
    queue.uploadedSize += increment
    if (++queue.uploadedCount >= queue.chunks.length) {
      mergeChunks({
        file,
        uploadId,
        queue,
        progress,
        resolve,
        reject,
      })
    }
  }
}

// 上传所有分片
function uploadAllPart({
  file,
  path,
  uploadId,
  partUploadList,
  queue,
  progress,
  abortController,
  resolve,
  reject,
}) {
  queue.uploadedSize = 0
  queue.uploadedCount = 0
  const isUploadedMap = partUploadList
    ? Object.fromEntries(Array.from(partUploadList, ({ partNumber }) => [partNumber, true]))
    : {}
  // 已经上传完所有分片，直接合并
  if (partUploadList?.length >= queue.chunks.length) {
    queue.uploadedSize = file.size
    queue.uploadedCount++
    mergeChunks({
      file,
      uploadId,
      queue,
      progress,
      resolve,
      reject,
    })
  }
  else {
    for (let partNumber = 1; partNumber <= queue.chunks.length; partNumber++) {
      const chunk = queue.chunks[partNumber - 1]
      if (isUploadedMap[partNumber]) {
        queue.uploadedSize += chunk.blob.size
        queue.uploadedCount++
      }
      else {
        uploadPart({
          file,
          chunk,
          partNumber,
          path,
          uploadId,
          queue,
          progress,
          abortController,
          resolve,
          reject,
        })
      }
    }
  }
}

// 合并分片
function mergeChunks({ file, uploadId, queue, progress, resolve, reject, abortController }) {
  progress(99)
  POST(
    '/complete',
    {
      configId: CONFIG_ID,
      uploadId,
      md5Digest: queue.md5,
      name: file.name,
      size: file.size,
      chunkNumber: queue.chunks.length,
      chunkSize: queue.chunkSize,
    },
    {
      signal: abortController?.signal,
    },
  )
    .then(({ data: { url } }) => {
      resolve(url)
    })
    .catch((reason) => {
      reject(reason)
    })
    .finally(() => {
      progress(100)
    })
}

// 上传文件
export default async function upload(file, progress, abortController) {
  const queue = await sliceFile(file)
  const getPartList = await POST(
    '/getPartList',
    {
      configId: CONFIG_ID,
      md5Digest: queue.md5,
    },
    {
      signal: abortController?.signal,
    },
  )

  progress(1)

  const { partUploadList, path, uploadId, url } = getPartList.data || {}

  return new Promise((resolve, reject) => {
    // 重复上传
    if (url) {
      resolve(url)
    }
    // 离线断点续传（支持更换电脑）
    else if (partUploadList) {
      uploadAllPart({
        file,
        path,
        uploadId,
        partUploadList,
        queue,
        progress,
        abortController,
        resolve,
        reject,
      })
    }
    // 全新上传
    else {
      POST(
        '/init',
        {
          configId: CONFIG_ID,
          md5Digest: queue.md5,
          name: file.name,
          size: file.size,
          chunkNumber: queue.chunks.length,
          chunkSize: queue.chunkSize,
        },
        {
          signal: abortController?.signal,
        },
      )
        .then(({ data: { path, uploadId } }) => {
          uploadAllPart({
            file,
            path,
            uploadId,
            queue,
            progress,
            abortController,
            resolve,
            reject,
          })
        })
        .catch((reason) => {
          reject(reason)
        })
    }
  })
}
