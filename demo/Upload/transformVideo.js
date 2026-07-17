import { FaMessageBox } from 'faim'
import { filesize } from 'filesize'
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  MkvOutputFormat,
  MovOutputFormat,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
} from 'mediabunny'

// Mediabunny 采用允许商业使用的 MPL-2.0，编解码由浏览器 WebCodecs 提供。
// 重新编码专利格式仍可能需要许可，具体由该功能的实际部署方根据发行地区和业务模式评估。
// 按 1024 进制格式化，单位仍用 KB/MB。
const toFileSizeLabel = value => filesize(value, { standard: 'jedec' })
const MIN_VIDEO_BITRATE = 32_000
const MAX_BITRATE_ATTEMPTS = 5
const TARGET_SIZE_RATIO = 0.98
const TARGET_SIZE_TOLERANCE = 0.98

const outputFormatFactories = {
  m4v: () => new Mp4OutputFormat({ fastStart: 'in-memory' }),
  mkv: () => new MkvOutputFormat(),
  mov: () => new MovOutputFormat({ fastStart: 'in-memory' }),
  mp4: () => new Mp4OutputFormat({ fastStart: 'in-memory' }),
  webm: () => new WebMOutputFormat(),
}

let transformQueue = Promise.resolve()

// 生成压缩前后体积文案。
function getSizeDiffText(before, after) {
  const diff = after - before
  let percent = diff === 0 ? '' : `${Number.parseFloat((diff / before * 100).toFixed(2))}%`
  if (diff > 0) {
    percent = `+${percent}`
  }
  if (percent) {
    percent = `（${percent}）`
  }
  return `原视频大小：${toFileSizeLabel(before)} ➜ 压缩后：${toFileSizeLabel(after)}${percent}`
}

// 展示压缩前后体积变化。
function showSizeDiff(before, after) {
  const sizeDiffText = getSizeDiffText(before, after)
  console.info(sizeDiffText)
  FaMessageBox.info({
    title: '大小',
    text: sizeDiffText,
    timer: 3000,
    width: 'max-content',
    willOpen(popup) {
      popup.style.minWidth = '330px'
      popup.style.maxWidth = 'calc(100vw - 32px)'
      popup.style.whiteSpace = 'nowrap'
    },
  })
}

// 将自然文件大小转换为字节数。
function fileSizeToBytes(value, base = 1000) {
  if (typeof value === 'number') {
    return value
  }
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i)
  if (!match) {
    throw new TypeError(`无法解析文件大小：${value}`)
  }
  const unitPowers = { B: 0, GB: 3, KB: 1, MB: 2 }
  return Number(match[1]) * base ** unitPowers[match[2]?.toUpperCase() || 'B']
}

// 从宽高或分辨率配置中提取用于缩小视频的上限。
function resolveUpperBound(value) {
  if (typeof value === 'number') {
    return value
  }
  if (Array.isArray(value)) {
    const values = value.filter(item => typeof item === 'number')
    return values.length ? Math.max(...values) : undefined
  }
  return typeof value?.max === 'number' ? value.max : undefined
}

// YUV 将画面拆分为亮度 Y 和色度 U/V；常见的 YUV 4:2:0 会让每个 2×2 像素块共享一组色度信息，
// 因此视频编码器通常要求宽高能被 2 整除，这里在等比缩放后向下取最接近的偶数，避免编码失败或隐式补边。
function resolveTargetSize(width, height, options) {
  const scales = [1]
  const maxWidth = resolveUpperBound(options.videoWidth)
  const maxHeight = resolveUpperBound(options.videoHeight)
  const maxResolution = resolveUpperBound(options.videoResolution)

  if (maxWidth) {
    scales.push(maxWidth / width)
  }
  if (maxHeight) {
    scales.push(maxHeight / height)
  }
  if (maxResolution) {
    scales.push(Math.sqrt(maxResolution / (width * height)))
  }

  const scale = Math.min(...scales)
  return {
    width: Math.max(2, Math.floor(width * scale / 2) * 2),
    height: Math.max(2, Math.floor(height * scale / 2) * 2),
  }
}

// 创建 Mediabunny 输入对象。
function createInput(file) {
  return new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  })
}

// 读取源视频的编码、尺寸、时长和平均码率。
async function readMetadata(file) {
  const input = createInput(file)
  try {
    const videoTrack = await input.getPrimaryVideoTrack()
    if (!videoTrack) {
      throw new Error('文件中没有视频轨道')
    }

    const audioTrack = await input.getPrimaryAudioTrack()
    const [codec, width, height, duration, videoStats, audioStats] = await Promise.all([
      videoTrack.getCodec(),
      videoTrack.getDisplayWidth(),
      videoTrack.getDisplayHeight(),
      input.computeDuration(audioTrack ? [videoTrack, audioTrack] : [videoTrack]),
      videoTrack.computePacketStats(),
      audioTrack?.computePacketStats(),
    ])
    if (!codec || !width || !height || !duration) {
      throw new Error('无法读取视频编码、尺寸或时长')
    }

    return {
      codec,
      width,
      height,
      duration,
      videoBitrate: videoStats.averageBitrate,
      audioBitrate: audioStats?.averageBitrate ?? 0,
    }
  }
  finally {
    input.dispose()
  }
}

// 使用浏览器 WebCodecs 以指定尺寸和质量或码率转换视频。
async function convert(file, extension, metadata, targetSize, bitrate) {
  const input = createInput(file)
  const target = new BufferTarget()
  const output = new Output({
    format: outputFormatFactories[extension](),
    target,
  })

  try {
    const conversion = await Conversion.init({
      input,
      output,
      tracks: 'primary',
      video: {
        width: targetSize.width,
        codec: metadata.codec,
        bitrate: bitrate ?? QUALITY_HIGH,
        forceTranscode: true,
        hardwareAcceleration: 'prefer-hardware',
      },
      showWarnings: false,
    })

    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks.map(item => item.reason).join('；')
      throw new Error(`当前浏览器无法使用原编码转换该视频${reasons ? `：${reasons}` : ''}`)
    }

    await conversion.execute()
    if (!target.buffer) {
      throw new Error('视频转换没有生成输出数据')
    }

    return new File([target.buffer], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    })
  }
  finally {
    input.dispose()
  }
}

// 缩放超限视频，并在必要时搜索最接近体积上限的视频码率。
async function transform(file, options, { onStart } = {}) {
  const maxFileSize = fileSizeToBytes(options.maxFileSize, options.fileSizeBase)
  if (file.size <= maxFileSize) {
    return file
  }

  if (!globalThis.VideoEncoder || !globalThis.VideoDecoder) {
    throw new Error('当前浏览器不支持 WebCodecs，无法压缩视频')
  }

  const extension = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
  if (!extension || !outputFormatFactories[extension]) {
    throw new Error(`暂不支持保持 ${extension || '未知'} 视频容器进行压缩`)
  }

  const fileSizeBase = options.fileSizeBase ?? 1000
  const currentSize = Number((file.size / fileSizeBase ** 2).toFixed(1))
  const limitSize = Number((maxFileSize / fileSizeBase ** 2).toFixed(1))
  try {
    await FaMessageBox.confirm({
      title: '视频体积超过限制',
      text: `当前视频为 ${currentSize} MB，超过 ${limitSize} MB，需要压缩后才能上传。压缩可能耗时较长，且画质/清晰度可能下降。`,
      confirmButtonText: '确认压缩',
      cancelButtonText: '取消上传',
    })
  }
  catch {
    throw new DOMException('已取消转换', 'AbortError')
  }

  // 确认后再切到「转换中」，并让出两帧给 UI 刷新
  onStart?.()
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const originalSize = file.size
  const metadata = await readMetadata(file)
  const targetSize = resolveTargetSize(metadata.width, metadata.height, options)
  const qualityFile = await convert(file, extension, metadata, targetSize)
  if (qualityFile.size <= maxFileSize) {
    showSizeDiff(originalSize, qualityFile.size)
    return qualityFile
  }

  const initialBitrate = Math.floor(
    maxFileSize * TARGET_SIZE_RATIO * 8 / metadata.duration - metadata.audioBitrate,
  )
  if (initialBitrate < MIN_VIDEO_BITRATE) {
    throw new Error('音频体积过大，已无足够空间压缩视频')
  }

  let low = MIN_VIDEO_BITRATE
  let high = Math.max(initialBitrate, metadata.videoBitrate)
  let bitrate = initialBitrate
  let bestFile

  for (let attempt = 0; attempt < MAX_BITRATE_ATTEMPTS && low <= high; attempt++) {
    const candidate = await convert(file, extension, metadata, targetSize, bitrate)
    if (candidate.size <= maxFileSize) {
      if (!bestFile || candidate.size > bestFile.size) {
        bestFile = candidate
      }
      if (candidate.size >= maxFileSize * TARGET_SIZE_TOLERANCE) {
        break
      }
      low = bitrate + 1
    }
    else {
      high = bitrate - 1
    }
    bitrate = Math.floor((low + high) / 2)
  }

  if (!bestFile) {
    throw new Error('视频在最低码率下仍超过最大体积限制')
  }
  showSizeDiff(originalSize, bestFile.size)
  return bestFile
}

// 串行转换视频，避免多个硬件编解码任务争抢浏览器资源。
export default function transformVideo(file, options, context) {
  const task = transformQueue.then(() => transform(file, options, context))
  transformQueue = task.catch(() => {})
  return task
}
