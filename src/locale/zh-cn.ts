export default {
  FaFormDialog: {
    confirm: '确 认',
    reset: '重 置',
    cancel: '取 消',
    deny: '拒 绝',
  },
  FaImageUpload: {
    count: '数量',
    size: '体积',
    width: '宽度',
    height: '高度',
    dimension: '尺寸',
    resolution: '分辨率',
    extensions: '格式',
    extensionNotAllowed: '允许的格式：{extensions}',
    quality: '品质',
    edit: '编辑',
    fixedAspectRatio: '固定比例',
    sizeTip: '原图体积：{inputSize} ➜ 编辑后：{outputSize}',
    maxSizeExceeded: '允许的最大体积：{maxSize}，请降低图片尺寸或品质',
    minSizeExceeded: '允许的最小体积：{minSize}，请提升图片尺寸或品质',
    maxCountExceeded: '允许的最大数量：{maxCount}',
    minCountExceeded: '允许的最小数量：{minCount}',
    maxWidthExceeded: '允许的最大宽度：{maxWidth}',
    minWidthExceeded: '允许的最小宽度：{minWidth}',
    widthNotMatch: '允许的宽度：{width}',
    maxHeightExceeded: '允许的最大高度：{maxHeight}',
    minHeightExceeded: '允许的最小高度：{minHeight}',
    heightNotMatch: '允许的高度：{height}',
    maxResolutionExceeded: '允许的最大分辨率：{maxResolution}',
    minResolutionExceeded: '允许的最小分辨率：{minResolution}',
    resolutionNotMatch: '允许的分辨率：{resolution}',
    loadError: '图片加载失败',
    exportError: '图片导出失败，请尝试降低图片尺寸或品质',
    confirm: '确 认',
    reset: '重 置',
    cancel: '取 消',
  },
  FaSelect: {
    selecttAll: '全选',
  },
  FaUpload: {
    ...filePondLocale,

    labelAccept: '格式', // FaUpload 新增

    labelCount: '数量', // FaUpload 新增
    labelMinFilesExceeded: '允许的最小数量：{minFiles}', // FaUpload 新增
    labelMaxFilesExceeded: '允许的最大数量：{maxFiles}', // FaUpload 新增

    labelSize: '体积', // FaUpload 新增
    labelMinFileSizeExceeded: '文件体积过小 (未上传)', // filePondLocale 未包含
    labelMinFileSize: '允许的最小体积：{filesize}', // filePondLocale 未包含

    labelImageWidth: '图片宽度', // FaUpload 新增
    labelImageWidthNotMatch: '允许的图片宽度：{imageWidth}', // FaUpload 新增
    labelMinImageWidthExceeded: '允许的最小图片宽度：{minImageWidth}', // FaUpload 新增
    labelMaxImageWidthExceeded: '允许的最大图片宽度：{maxImageWidth}', // FaUpload 新增

    labelImageHeight: '图片高度', // FaUpload 新增
    labelImageHeightNotMatch: '允许的图片高度：{imageHeight}', // FaUpload 新增
    labelMinImageHeightExceeded: '允许的最小图片高度：{minImageHeight}', // FaUpload 新增
    labelMaxImageHeightExceeded: '允许的最大图片高度：{maxImageHeight}', // FaUpload 新增

    labelImageDimension: '图片尺寸', // FaUpload 新增

    labelImageResolution: '图片分辨率', // FaUpload 新增
    labelImageResolutionNotMatch: '允许的图片分辨率：{imageResolution}', // FaUpload 新增

    labelImageAspectRatio: '图片比例', // FaUpload 新增
    labelImageAspectRatioNotMatch: '允许的图片比例：{imageAspectRatio}', // FaUpload 新增
    labelMinImageAspectRatioExceeded: '允许的最小图片比例：{minImageAspectRatio}', // FaUpload 新增
    labelMaxImageAspectRatioExceeded: '允许的最大图片比例：{maxImageAspectRatio}', // FaUpload 新增

    labelVideoWidth: '视频宽度', // FaUpload 新增
    labelVideoWidthNotMatch: '允许的视频宽度：{videoWidth}', // FaUpload 新增
    labelMinVideoWidthExceeded: '允许的最小视频宽度：{minVideoWidth}', // FaUpload 新增
    labelMaxVideoWidthExceeded: '允许的最大视频宽度：{maxVideoWidth}', // FaUpload 新增

    labelVideoHeight: '视频高度', // FaUpload 新增
    labelVideoHeightNotMatch: '允许的视频高度：{videoHeight}', // FaUpload 新增
    labelMinVideoHeightExceeded: '允许的最小视频高度：{minVideoHeight}', // FaUpload 新增
    labelMaxVideoHeightExceeded: '允许的最大视频高度：{maxVideoHeight}', // FaUpload 新增

    labelVideoDimension: '视频尺寸', // FaUpload 新增

    labelVideoResolution: '视频分辨率', // FaUpload 新增
    labelVideoResolutionNotMatch: '允许的视频分辨率：{videoResolution}', // FaUpload 新增
    labelMinVideoResolutionExceeded: '允许的最小视频分辨率：{minVideoResolution}', // FaUpload 新增
    labelMaxVideoResolutionExceeded: '允许的最大视频分辨率：{maxVideoResolution}', // FaUpload 新增

    labelVideoAspectRatio: '视频比例', // FaUpload 新增
    labelVideoAspectRatioNotMatch: '允许的视频比例：{videoAspectRatio}', // FaUpload 新增
    labelMinVideoAspectRatioExceeded: '允许的最小视频比例：{minVideoAspectRatio}', // FaUpload 新增
    labelMaxVideoAspectRatioExceeded: '允许的最大视频比例：{maxVideoAspectRatio}', // FaUpload 新增

    labelVideoDuration: '视频时长', // FaUpload 新增
    labelVideoDurationNotMatch: '允许的视频时长：{videoDuration}', // FaUpload 新增
    labelMinVideoDurationExceeded: '允许的最小视频时长：{minVideoDuration}', // FaUpload 新增
    labelMaxVideoDurationExceeded: '允许的最大视频时长：{maxVideoDuration}', // FaUpload 新增

    labelAudioDuration: '音频时长', // FaUpload 新增
    labelAudioDurationNotMatch: '允许的音频时长：{audioDuration}', // FaUpload 新增
    labelMinAudioDurationExceeded: '允许的最小音频时长：{minAudioDuration}', // FaUpload 新增
    labelMaxAudioDurationExceeded: '允许的最大音频时长：{maxAudioDuration}', // FaUpload 新增
  },
}
