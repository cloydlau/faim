export const RETRY_MAX = 3
export const CONFIG_ID = 23 // OSS ID
export const MB = 1024 ** 2
export const TEN_MB = 10 * MB
export const GB = MB * 1024
export const TEN_GB = 10 * GB

// 文件存储S3协议的限制，分片数量不能超过1000个
export function getChunkSize(fileSize) {
  return fileSize > TEN_GB ? fileSize / 1000 : TEN_MB
}

// 任意类型文件的配置预设
const common = {
  maxFiles: 5,
}

// 不同类型文件的配置预设 (优先级更高)
const catalog = {
  image: {
    maxFiles: 5,
    // imageValidateSizeMaxWidth: 5000,
    // imageValidateSizeMaxHeight: 5000,
    imageAspectRatio: '1:1',
    acceptedFileTypes: ['image/jpeg', 'image/png'],
    labelIdle: '将图片拖到此处，或点击上传',
  },
  audio: {
    maxFiles: 1,
    // minFileSize: '1MB',
    acceptedFileTypes: ['audio/*'],
    audioDuration: { max: 22 },
    labelIdle: '将音频拖到此处，或点击上传',
    fileValidateTypeLabelExpectedTypes: '应为 {allTypes}',
  },
  video: {
    maxFiles: 2,
    maxFileSize: '100MB',
    acceptedFileTypes: ['video/*'],
    // videoWidth: { max: 1280 },
    // videoHeight: 720,
    videoAspectRatio: { min: '16:10', max: '16:9' },
    videoResolution: 1280 * 720,
    videoDuration: { max: 14 },
    labelIdle: '将视频拖到此处，或点击上传',
    fileValidateTypeLabelExpectedTypes: '应为 {allTypes}',
  },
  pdf: {
    acceptedFileTypes: ['application/pdf'],
    labelIdle: '将 PDF 文件拖到此处，或点击上传',
    fileValidateTypeLabelExpectedTypes: '应为 {allTypes}',
  },
  excel: {
    // acceptedFileTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    acceptedFileTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xls'],
    labelIdle: '将 Excel 文件拖到此处，或点击上传',
  },
  apk: {
    acceptedFileTypes: ['application/vnd.android.package-archive'],
    labelIdle: '将 APK 文件拖到此处，或点击上传',
    fileValidateTypeLabelExpectedTypes: '应为 {allTypes}',
  },
}

export default Object.fromEntries(Array.from(
  Object.keys(catalog),
  fileType => [fileType, { ...common, ...catalog[fileType] }],
))
