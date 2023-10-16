// 任意类型文件的配置预设
const common = {
  maxFiles: 5,
}

// 不同类型文件的配置预设 (优先级更高)
const catalog = {
  image: {
    maxFiles: 5,
    imageValidateSizeMaxWidth: 5000,
    imageValidateSizeMaxHeight: 5000,
    extensions: '.jpg,.jpeg,.png',
    labelIdle: '将图片拖到此处，或<span class="filepond--label-action">点击</span>上传',
  },
  audio: {
    minFiles: 1,
    maxFiles: 1,
    minFileSize: '1MB',
    acceptedFileTypes: ['audio/*'],
    labelIdle: '将音频拖到此处，或<span class="filepond--label-action">点击</span>上传',
  },
  video: {
    maxFiles: 2,
    maxFileSize: '10MB',
    acceptedFileTypes: ['video/*'],
    labelIdle: '将视频拖到此处，或<span class="filepond--label-action">点击</span>上传',
  },
  pdf: {
    extensions: '.pdf',
    labelIdle: '将 PDF 文件拖到此处，或<span class="filepond--label-action">点击</span>上传',
  },
  excel: {
    extensions: '.xlsx,.xls',
    labelIdle: '将 Excel 文件拖到此处，或<span class="filepond--label-action">点击</span>上传',
  },
  apk: {
    extensions: '.apk',
    labelIdle: '将 APK 文件拖到此处，或<span class="filepond--label-action">点击</span>上传',
  },
}

export default Object.fromEntries(Array.from(
  Object.keys(catalog),
  fileType => [fileType, { ...common, ...catalog[fileType] }],
))
