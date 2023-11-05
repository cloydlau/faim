<script>
import { isVue3, reactive } from 'vue-demi'
import 'filepond/dist/filepond.min.css'
import * as FilePond from 'filepond'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImageValidateSize from 'filepond-plugin-image-validate-size'
import { conclude, resolveConfig } from 'vue-global-config'
import { isPlainObject, throttle } from 'lodash-es'
import to from 'await-to-js'
import mime from 'mime'
import { useFormDisabled } from 'element-plus/es/components/form/src/hooks/use-form-common-props.mjs'
import FaMessageBox from '../MessageBox/index'
import { getAudioMetadata, getVideoMetadata, handleNumericalProp, isBase64WithScheme, isObject, secondsToHHMMSS, toImageTag, toLocalURL, tryParsingJSONArray, unwrap } from '../../utils'
import defaultLocale from '../../locale/en'
import Uploading from './Uploading.vue'

// import FilepondPluginDragReorder from 'filepond-plugin-drag-reorder'
// import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
// import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
// import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css'
// import FilePondPluginFilePoster from 'filepond-plugin-file-poster'
// import 'filepond-plugin-image-edit/dist/filepond-plugin-image-edit.css'
// import FilePondPluginImageCrop from 'filepond-plugin-image-crop'
// import FilePondPluginImageEdit from 'filepond-plugin-image-edit'
// import FilePondPluginImageFilter from 'filepond-plugin-image-filter'
// import FilePondPluginImageResize from 'filepond-plugin-image-resize'
// import FilePondPluginImageTransform from 'filepond-plugin-image-transform'
// import FilePondPluginFileEncode from 'filepond-plugin-file-encode'
// import FilePondPluginFileRename from 'filepond-plugin-file-rename'
// import FilePondPluginFileMetadata from 'filepond-plugin-file-metadata'
// import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
// import 'filepond-plugin-media-preview/dist/filepond-plugin-media-preview.min.css'
// import FilePondPluginMediaPreview from 'filepond-plugin-media-preview'
// import 'filepond-plugin-image-overlay/dist/filepond-plugin-image-overlay.css'
// import FilePondPluginImageOverlay from 'filepond-plugin-image-overlay'
// import FilePondPluginPdfPreview from 'filepond-plugin-pdf-preview'

FilePond.registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageValidateSize,
  // FilepondPluginDragReorder,
  // FilePondPluginFileEncode,
  // FilePondPluginFileRename,
  // FilePondPluginFileMetadata,
  // FilePondPluginFilePoster,
  // FilePondPluginMediaPreview,
  // FilePondPluginImagePreview,
  // FilePondPluginImageCrop,
  // FilePondPluginImageEdit,
  // FilePondPluginImageFilter,
  // FilePondPluginImageResize,
  // FilePondPluginImageTransform,
  // FilePondPluginImageOverlay,
  // FilePondPluginImageExifOrientation,
  // FilePondPluginPdfPreview,
)

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

export default {
  name: 'FaUpload',
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
  components: { Uploading },
  inject: {
    elForm: {
      default: {},
    },
  },
  props: {
    [model.prop]: {
      validator: value => typeof value === 'string'
        || Array.isArray(value)
        || isObject(value),
    },
    srcAt: {},
    arrayed: {
      type: Boolean,
      default: undefined,
    },
    upload: {},
    minFiles: {},
    imageAspectRatio: {},
    videoWidth: {},
    videoHeight: {},
    videoAspectRatio: {},
    videoResolution: {},
    videoDuration: {},
    audioDuration: {},
    labelAccept: {},
    labelCount: {},
    labelMinFilesExceeded: {},
    labelMaxFilesExceeded: {},
    labelSize: {},
    labelImageWidth: {},
    labelImageWidthNotMatch: {},
    labelMinImageWidthExceeded: {},
    labelMaxImageWidthExceeded: {},
    labelImageHeight: {},
    labelImageHeightNotMatch: {},
    labelMinImageHeightExceeded: {},
    labelMaxImageHeightExceeded: {},
    labelImageDimension: {},
    labelImageAspectRatio: {},
    labelImageAspectRatioNotMatch: {},
    labelMinImageAspectRatioExceeded: {},
    labelMaxImageAspectRatioExceeded: {},
    labelImageResolution: {},
    labelImageResolutionNotMatch: {},
    labelVideoWidth: {},
    labelVideoWidthNotMatch: {},
    labelMinVideoWidthExceeded: {},
    labelMaxVideoWidthExceeded: {},
    labelVideoHeight: {},
    labelVideoHeightNotMatch: {},
    labelMinVideoHeightExceeded: {},
    labelMaxVideoHeightExceeded: {},
    labelVideoDimension: {},
    labelVideoResolution: {},
    labelVideoResolutionNotMatch: {},
    labelMinVideoResolutionExceeded: {},
    labelMaxVideoResolutionExceeded: {},
    labelVideoAspectRatio: {},
    labelVideoAspectRatioNotMatch: {},
    labelMinVideoAspectRatioExceeded: {},
    labelMaxVideoAspectRatioExceeded: {},
    labelVideoDuration: {},
    labelVideoDurationNotMatch: {},
    labelMinVideoDurationExceeded: {},
    labelMaxVideoDurationExceeded: {},
    labelAudioDuration: {},
    labelAudioDurationNotMatch: {},
    labelMinAudioDurationExceeded: {},
    labelMaxAudioDurationExceeded: {},
  },
  emits: [model.event, 'uploading'],
  setup: () => ({ elFormDisabled: useFormDisabled() }),
  data() {
    return {
      isVue3,
      subWindowFeatures: '',
      files: [],
      filePond: null,
      isSupported: true,
      queue: [],
    }
  },
  computed: {
    uploading() {
      return this.queue.length > 0
    },
    percentage() {
      return this.queue.length
        ? this.queue.reduce((pre, cur) => pre + cur.progress, 0) / (this.queue.length * 100)
        : 0
    },
    SrcAt() {
      return conclude([this.srcAt, globalProps.srcAt], {
        type: [String, Function, Symbol],
      })
    },
    Arrayed() {
      return conclude([this.arrayed, globalProps.arrayed], {
        type: Boolean,
      })
    },
    Upload() {
      return conclude([this.upload, globalProps.upload], {
        type: Function,
      })
    },
    MinFiles() {
      return conclude([this.minFiles, globalProps.minFiles], {
        type: Number,
      })
    },
    LabelAccept() {
      return conclude([this.labelAccept, globalProps.labelAccept], {
        type: String,
      })
    },
    LabelCount() {
      return conclude([this.labelCount, globalProps.labelCount], {
        type: String,
      })
    },
    LabelMinFilesExceeded() {
      return conclude([this.labelMinFilesExceeded, globalProps.labelMinFilesExceeded], {
        type: String,
      })
    },
    LabelMaxFilesExceeded() {
      return conclude([this.labelMaxFilesExceeded, globalProps.labelMaxFilesExceeded], {
        type: String,
      })
    },
    LabelSize() {
      return conclude([this.labelSize, globalProps.labelSize], {
        type: String,
      })
    },
    LabelImageWidth() {
      return conclude([this.labelImageWidth, globalProps.labelImageWidth], {
        type: String,
      })
    },
    LabelImageWidthNotMatch() {
      return conclude([this.labelImageWidthNotMatch, globalProps.labelImageWidthNotMatch], {
        type: String,
      })
    },
    LabelMinImageWidthExceeded() {
      return conclude([this.labelMinImageWidthExceeded, globalProps.labelMinImageWidthExceeded], {
        type: String,
      })
    },
    LabelMaxImageWidthExceeded() {
      return conclude([this.labelMaxImageWidthExceeded, globalProps.labelMaxImageWidthExceeded], {
        type: String,
      })
    },
    LabelImageHeight() {
      return conclude([this.labelImageHeight, globalProps.labelImageHeight], {
        type: String,
      })
    },
    LabelImageHeightNotMatch() {
      return conclude([this.labelImageHeightNotMatch, globalProps.labelImageHeightNotMatch], {
        type: String,
      })
    },
    LabelMinImageHeightExceeded() {
      return conclude([this.labelMinImageHeightExceeded, globalProps.labelMinImageHeightExceeded], {
        type: String,
      })
    },
    LabelMaxImageHeightExceeded() {
      return conclude([this.labelMaxImageHeightExceeded, globalProps.labelMaxImageHeightExceeded], {
        type: String,
      })
    },
    LabelImageDimension() {
      return conclude([this.labelImageDimension, globalProps.labelImageDimension], {
        type: String,
      })
    },
    LabelImageAspectRatio() {
      return conclude([this.labelImageAspectRatio, globalProps.labelImageAspectRatio], {
        type: String,
      })
    },
    LabelImageAspectRatioNotMatch() {
      return conclude([this.labelImageAspectRatioNotMatch, globalProps.labelImageAspectRatioNotMatch], {
        type: String,
      })
    },
    LabelMinImageAspectRatioExceeded() {
      return conclude([this.labelMinImageAspectRatioExceeded, globalProps.labelMinImageAspectRatioExceeded], {
        type: String,
      })
    },
    LabelMaxImageAspectRatioExceeded() {
      return conclude([this.labelMaxImageAspectRatioExceeded, globalProps.labelMaxImageAspectRatioExceeded], {
        type: String,
      })
    },
    LabelImageResolution() {
      return conclude([this.labelImageResolution, globalProps.labelImageResolution], {
        type: String,
      })
    },
    LabelImageResolutionNotMatch() {
      return conclude([this.labelImageResolutionNotMatch, globalProps.labelImageResolutionNotMatch], {
        type: String,
      })
    },
    LabelVideoWidth() {
      return conclude([this.labelVideoWidth, globalProps.labelVideoWidth], {
        type: String,
      })
    },
    LabelVideoWidthNotMatch() {
      return conclude([this.labelVideoWidthNotMatch, globalProps.labelVideoWidthNotMatch], {
        type: String,
      })
    },
    LabelMinVideoWidthExceeded() {
      return conclude([this.labelMinVideoWidthExceeded, globalProps.labelMinVideoWidthExceeded], {
        type: String,
      })
    },
    LabelMaxVideoWidthExceeded() {
      return conclude([this.labelMaxVideoWidthExceeded, globalProps.labelMaxVideoWidthExceeded], {
        type: String,
      })
    },
    LabelVideoHeight() {
      return conclude([this.labelVideoHeight, globalProps.labelVideoHeight], {
        type: String,
      })
    },
    LabelVideoHeightNotMatch() {
      return conclude([this.labelVideoHeightNotMatch, globalProps.labelVideoHeightNotMatch], {
        type: String,
      })
    },
    LabelMinVideoHeightExceeded() {
      return conclude([this.labelMinVideoHeightExceeded, globalProps.labelMinVideoHeightExceeded], {
        type: String,
      })
    },
    LabelMaxVideoHeightExceeded() {
      return conclude([this.labelMaxVideoHeightExceeded, globalProps.labelMaxVideoHeightExceeded], {
        type: String,
      })
    },
    LabelVideoDimension() {
      return conclude([this.labelVideoDimension, globalProps.labelVideoDimension], {
        type: String,
      })
    },
    LabelVideoResolution() {
      return conclude([this.labelVideoResolution, globalProps.labelVideoResolution], {
        type: String,
      })
    },
    LabelVideoResolutionNotMatch() {
      return conclude([this.labelVideoResolutionNotMatch, globalProps.labelVideoResolutionNotMatch], {
        type: String,
      })
    },
    LabelMinVideoResolutionExceeded() {
      return conclude([this.labelMinVideoResolutionExceeded, globalProps.labelMinVideoResolutionExceeded], {
        type: String,
      })
    },
    LabelMaxVideoResolutionExceeded() {
      return conclude([this.labelMaxVideoResolutionExceeded, globalProps.labelMaxVideoResolutionExceeded], {
        type: String,
      })
    },
    LabelVideoAspectRatio() {
      return conclude([this.labelVideoAspectRatio, globalProps.labelVideoAspectRatio], {
        type: String,
      })
    },
    LabelVideoAspectRatioNotMatch() {
      return conclude([this.labelVideoAspectRatioNotMatch, globalProps.labelVideoAspectRatioNotMatch], {
        type: String,
      })
    },
    LabelMinVideoAspectRatioExceeded() {
      return conclude([this.labelMinVideoAspectRatioExceeded, globalProps.labelMinVideoAspectRatioExceeded], {
        type: String,
      })
    },
    LabelMaxVideoAspectRatioExceeded() {
      return conclude([this.labelMaxVideoAspectRatioExceeded, globalProps.labelMaxVideoAspectRatioExceeded], {
        type: String,
      })
    },
    LabelVideoDuration() {
      return conclude([this.labelVideoDuration, globalProps.labelVideoDuration], {
        type: String,
      })
    },
    LabelVideoDurationNotMatch() {
      return conclude([this.labelVideoDurationNotMatch, globalProps.labelVideoDurationNotMatch], {
        type: String,
      })
    },
    LabelMinVideoDurationExceeded() {
      return conclude([this.labelMinVideoDurationExceeded, globalProps.labelMinVideoDurationExceeded], {
        type: String,
      })
    },
    LabelMaxVideoDurationExceeded() {
      return conclude([this.labelMaxVideoDurationExceeded, globalProps.labelMaxVideoDurationExceeded], {
        type: String,
      })
    },
    LabelAudioDuration() {
      return conclude([this.labelAudioDuration, globalProps.labelAudioDuration], {
        type: String,
      })
    },
    LabelAudioDurationNotMatch() {
      return conclude([this.labelAudioDurationNotMatch, globalProps.labelAudioDurationNotMatch], {
        type: String,
      })
    },
    LabelMinAudioDurationExceeded() {
      return conclude([this.labelMinAudioDurationExceeded, globalProps.labelMinAudioDurationExceeded], {
        type: String,
      })
    },
    LabelMaxAudioDurationExceeded() {
      return conclude([this.labelMaxAudioDurationExceeded, globalProps.labelMaxAudioDurationExceeded], {
        type: String,
      })
    },
    ImageAspectRatio() {
      const { tip, validate, min, minLabel, max, maxLabel, options, optionsLabel, target, targetLabel } = handleNumericalProp({
        config: [this.imageAspectRatio, globalProps.imageAspectRatio],
        labelTip: this.LabelImageAspectRatio,
        createTitleTextOfNotMatch: imageAspectRatio => this.LabelImageAspectRatioNotMatch.replaceAll('{imageAspectRatio}', imageAspectRatio),
        createTitleTextOfMinExceeded: minImageAspectRatio => this.LabelMinImageAspectRatioExceeded.replaceAll('{minImageAspectRatio}', minImageAspectRatio),
        createTitleTextOfMaxExceeded: maxImageAspectRatio => this.LabelMaxImageAspectRatioExceeded.replaceAll('{maxImageAspectRatio}', maxImageAspectRatio),
        getValue: (value) => {
          if (!/[1-9]+:[1-9]+/.test(value)) {
            throw new TypeError('Expect prop imageAspectRatio to be a string like \'1:1\'')
          }
          const [w, h] = value.split(':')
          return w / h
        },
      })

      // aspectRatio 参数的值不能与 width & height 冲突
      const { imageValidateSizeMaxWidth, imageValidateSizeMaxHeight } = this.FilePondOptions
      if (target && imageValidateSizeMaxWidth && imageValidateSizeMaxHeight && target !== (imageValidateSizeMaxWidth / imageValidateSizeMaxHeight)) {
        throw new Error('Value of prop \'imageAspectRatio\' conflicts with values of \'imageValidateSizeMaxWidth\' and \'imageValidateSizeMaxHeight\'')
      }

      return { tip, validate, min, minLabel, max, maxLabel, options, optionsLabel, target, targetLabel }
    },
    VideoWidth() {
      return handleNumericalProp({
        config: [this.videoWidth, globalProps.videoWidth],
        labelTip: this.LabelVideoWidth,
        createTitleTextOfNotMatch: videoWidth => this.LabelVideoWidthNotMatch.replaceAll('{videoWidth}', videoWidth),
        createTitleTextOfMinExceeded: minVideoWidth => this.LabelMinVideoWidthExceeded.replaceAll('{minVideoWidth}', minVideoWidth),
        createTitleTextOfMaxExceeded: maxVideoWidth => this.LabelMaxVideoWidthExceeded.replaceAll('{maxVideoWidth}', maxVideoWidth),
      })
    },
    VideoHeight() {
      return handleNumericalProp({
        config: [this.videoHeight, globalProps.videoHeight],
        labelTip: this.LabelVideoHeight,
        createTitleTextOfNotMatch: videoHeight => this.LabelVideoHeightNotMatch.replaceAll('{videoHeight}', videoHeight),
        createTitleTextOfMinExceeded: minVideoHeight => this.LabelMinVideoHeightExceeded.replaceAll('{minVideoHeight}', minVideoHeight),
        createTitleTextOfMaxExceeded: maxVideoHeight => this.LabelMaxVideoHeightExceeded.replaceAll('{maxVideoHeight}', maxVideoHeight),
      })
    },
    VideoResolution() {
      const { tip, validate, min, minLabel, max, maxLabel, options, optionsLabel, target, targetLabel } = handleNumericalProp({
        config: [this.videoResolution, globalProps.videoResolution],
        labelTip: this.LabelVideoResolution,
        createTitleTextOfNotMatch: videoResolution => this.LabelVideoResolutionNotMatch.replaceAll('{videoResolution}', videoResolution),
        createTitleTextOfMinExceeded: minVideoResolution => this.LabelMinVideoResolutionExceeded.replaceAll('{minVideoResolution}', minVideoResolution),
        createTitleTextOfMaxExceeded: maxVideoResolution => this.LabelMaxVideoResolutionExceeded.replaceAll('{maxVideoResolution}', maxVideoResolution),
      })

      // resolution 参数的值不能与 width & height 冲突
      if ((target && this.VideoWidth.target && this.VideoHeight.target && target !== (this.VideoWidth.target * this.VideoHeight.target))
       || (max && this.VideoWidth.max && this.VideoHeight.max && max !== (this.VideoWidth.max * this.VideoHeight.max))
       || (min && this.VideoWidth.min && this.VideoHeight.min && min !== (this.VideoWidth.min * this.VideoHeight.min))
      ) {
        throw new Error('Value of prop \'videoResolution\' conflicts with values of \'videoWidth\' and \'videoHeight\'')
      }

      return { tip, validate, min, minLabel, max, maxLabel, options, optionsLabel, target, targetLabel }
    },
    VideoAspectRatio() {
      const { tip, validate, min, minLabel, max, maxLabel, options, optionsLabel, target, targetLabel } = handleNumericalProp({
        config: [this.videoAspectRatio, globalProps.videoAspectRatio],
        labelTip: this.LabelVideoAspectRatio,
        createTitleTextOfNotMatch: videoAspectRatio => this.LabelVideoAspectRatioNotMatch.replaceAll('{videoAspectRatio}', videoAspectRatio),
        createTitleTextOfMinExceeded: minVideoAspectRatio => this.LabelMinVideoAspectRatioExceeded.replaceAll('{minVideoAspectRatio}', minVideoAspectRatio),
        createTitleTextOfMaxExceeded: maxVideoAspectRatio => this.LabelMaxVideoAspectRatioExceeded.replaceAll('{maxVideoAspectRatio}', maxVideoAspectRatio),
        getValue: (value) => {
          if (!/[1-9]+:[1-9]+/.test(value)) {
            throw new TypeError('Expect prop videoAspectRatio to be a string like \'16:9\'')
          }
          const [w, h] = value.split(':')
          return w / h
        },
      })

      // aspectRatio 参数的值不能与 width & height 冲突
      if ((target && this.VideoWidth.target && this.VideoHeight.target && target !== (this.VideoWidth.target / this.VideoHeight.target))
       || (max && this.VideoWidth.max && this.VideoHeight.min && max !== (this.VideoWidth.max / this.VideoHeight.min))
       || (min && this.VideoWidth.min && this.VideoHeight.max && min !== (this.VideoWidth.min / this.VideoHeight.max))
      ) {
        throw new Error('Value of prop \'videoAspectRatio\' conflicts with values of \'videoWidth\' and \'videoHeight\'')
      }

      return { tip, validate, min, minLabel, max, maxLabel, options, optionsLabel, target, targetLabel }
    },
    VideoDuration() {
      return handleNumericalProp({
        config: [this.videoDuration, globalProps.videoDuration],
        labelTip: this.LabelVideoDuration,
        createTitleTextOfNotMatch: videoDuration => this.LabelVideoDurationNotMatch.replaceAll('{videoDuration}', videoDuration),
        createTitleTextOfMinExceeded: minVideoDuration => this.LabelMinVideoDurationExceeded.replaceAll('{minVideoDuration}', minVideoDuration),
        createTitleTextOfMaxExceeded: maxVideoDuration => this.LabelMaxVideoDurationExceeded.replaceAll('{maxVideoDuration}', maxVideoDuration),
        withUnit: secondsToHHMMSS,
      })
    },
    AudioDuration() {
      return handleNumericalProp({
        config: [this.audioDuration, globalProps.audioDuration],
        labelTip: this.LabelAudioDuration,
        createTitleTextOfNotMatch: audioDuration => this.LabelAudioDurationNotMatch.replaceAll('{audioDuration}', audioDuration),
        createTitleTextOfMinExceeded: minAudioDuration => this.LabelMinAudioDurationExceeded.replaceAll('{minAudioDuration}', minAudioDuration),
        createTitleTextOfMaxExceeded: maxAudioDuration => this.LabelMaxAudioDurationExceeded.replaceAll('{maxAudioDuration}', maxAudioDuration),
        withUnit: secondsToHHMMSS,
      })
    },
    FilePondOptions() {
      const FilePondOptions = conclude([
        this.$attrs,
        globalAttrs,
        {
          ...defaultLocale.FaUpload,
          disabled: isVue3 ? this.elFormDisabled : this.elForm.disabled,
          itemInsertLocation: 'after',
          allowMultiple: true,
          allowReorder: true,
          dropValidation: true,
          credits: false,
          files: this.files,
          beforeAddFile: (item) => {
            // 不延迟的话，会导致最大数量限制计算错误
            setTimeout(async () => {
              if (item.file.type.startsWith('image/')) {
                const imageTag = await toImageTag(await toLocalURL(item.file))
                if (!this.ImageAspectRatio.validate(imageTag.width / imageTag.height)) {
                  return
                }
              } else if (item.file.type.startsWith('video/')) {
                const { videoWidth, videoHeight, duration } = await getVideoMetadata(item.file)
                // console.log('videoWidth: ', videoWidth)
                // console.log('videoHeight: ', videoHeight)
                // console.log('duration: ', duration)
                if (!(
                  this.VideoWidth.validate(videoWidth)
                  && this.VideoHeight.validate(videoHeight)
                  && this.VideoResolution.validate(videoWidth * videoHeight)
                  && this.VideoAspectRatio.validate(videoWidth / videoHeight)
                  && this.VideoDuration.validate(duration)
                )) {
                  return
                }
              } else if (item.file.type.startsWith('audio/')) {
                const { duration } = await getAudioMetadata(item.file)
                // console.log('duration: ', duration)
                if (!this.AudioDuration.validate(duration)) {
                  return
                }
              }

              const task = reactive({
                progress: 0,
                setProgress(progress) {
                  task.progress = progress
                },
                abortController: new AbortController(),
              })
              this.queue.push(task)
              let res = this.Upload
                ? this.Upload(item.file, task.setProgress, task.abortController)
                : item.file
              if (res instanceof Promise) {
                let err
                [err, res] = await to(res)
                if (err) {
                  console.error(err)
                  task.setProgress(100)
                  this.queue.shift()
                  return
                }
              }

              const file = await this.valueToFile(res)
              if (!file) {
                console.error('Invalid upload result')
                task.setProgress(100)
                this.queue.shift()
                return
              }
              this.filePond.addFile(file.source, file.options)
              if (this.FilePondOptions.itemInsertLocation === 'after') {
                this.files.push(file)
              } else {
                this.files.unshift(file)
              }
              this.emitInput()
              task.setProgress(100)
              this.queue.shift()
            }, 0)
            return false
          },
          beforeRemoveFile: (_item) => {
            if (this.MinFiles !== undefined && this.filePond.getFiles().length <= this.MinFiles) {
              if (this.LabelMinFilesExceeded) {
                FaMessageBox.warning(this.LabelMinFilesExceeded.replaceAll('{minFiles}', this.MinFiles))
              }
              return false
            }
          },
          // 不会触发 update
          onreorderfiles: (files, _origin, _target) => {
            this.files = files
            this.emitInput()
          },
          onactivatefile: this.onActivateFile,
        },
        isVue3 ? globalListeners : undefined,
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })

      const {
        minFiles,
        maxFiles,
        minFileSize,
        maxFileSize,
        imageValidateSizeMinWidth,
        imageValidateSizeMaxWidth,
        imageValidateSizeMinHeight,
        imageValidateSizeMaxHeight,
        imageValidateSizeMinResolution,
        imageValidateSizeMaxResolution,
        labelFileTypeNotAllowed,
        acceptedFileTypes,
        fileValidateTypeLabelExpectedTypesMap,
      } = FilePondOptions

      // 限制条件可视化
      const limitation = []

      // 格式
      // acceptedFileTypes 转 extensions
      if (acceptedFileTypes?.length) {
        const extensions = []
        for (let i = 0; i < acceptedFileTypes.length; i++) {
          let extension
          acceptedFileTypes[i] = acceptedFileTypes[i]?.trim().toLowerCase() // 便于扩展名校验，且原生的 accept 就支持空格和大写
          if (acceptedFileTypes[i]) {
            if (acceptedFileTypes[i].startsWith('.')) {
              extension = acceptedFileTypes[i]
              // filepond 不支持扩展名：https://github.com/pqina/filepond-plugin-file-validate-type/issues/13
              acceptedFileTypes[i] = mime.getType(acceptedFileTypes[i])
            } else if (fileValidateTypeLabelExpectedTypesMap) {
              extension = fileValidateTypeLabelExpectedTypesMap[acceptedFileTypes[i]]
            }
          }
          if (extension) {
            extensions.push(extension)
          } else {
            extensions.push(...Array.from(mime.getAllExtensions(acceptedFileTypes[i]) || [], extension => `.${extension}`))
          }
        }
        // extensions 生成 labelIdle 和 fileValidateTypeDetectType
        if (extensions.length) {
          limitation.push(`${this.LabelAccept} ${extensions.join(',')}`)
          // 校验文件扩展名
          FilePondOptions.fileValidateTypeDetectType ??= (file, type) => new Promise((resolve, reject) => {
            const extension = file.name.replace(/.+\./, '.').toLowerCase()
            // File.name (扩展名) 和 File.type (MIME) 不匹配（经测试不会出现这种情况）
            /* if (getType(extension) !== type) {
              reject(Error('File extension does not match file type'))
            } else */
            if (extensions.includes(extension)) {
              resolve(type)
            } else {
              reject(new Error(labelFileTypeNotAllowed || 'File of invalid type'))
            }
          })
        }
      }
      // 数量
      if (minFiles && maxFiles) {
        if (minFiles < maxFiles) {
          limitation.push(`${this.LabelCount} ${minFiles.toLocaleString()} ~ ${maxFiles.toLocaleString()}`)
        } else if (minFiles === maxFiles) {
          limitation.push(`${this.LabelCount} ${minFiles.toLocaleString()}`)
        } else {
          throw new Error('minFiles cannot be greater than maxFiles')
        }
      } else if (maxFiles) {
        limitation.push(`${this.LabelCount} ≤ ${maxFiles}`)
      } else if (minFiles) {
        limitation.push(`${this.LabelCount} ≥ ${minFiles}`)
      }
      // 体积
      if (minFileSize && maxFileSize) {
        if (minFileSize < maxFileSize) {
          limitation.push(`${this.LabelSize} ${minFileSize} ~ ${maxFileSize}`)
        } else if (minFileSize === maxFileSize) {
          limitation.push(`${this.LabelSize} ${minFileSize}`)
        } else {
          throw new Error('minFileSize cannot be greater than maxFileSize')
        }
      } else if (maxFileSize) {
        limitation.push(`${this.LabelSize} ≤ ${maxFileSize}`)
      } else if (minFileSize) {
        limitation.push(`${this.LabelSize} ≥ ${minFileSize}`)
      }
      // 图片尺寸
      let isWidthFixed = false
      if (imageValidateSizeMinWidth && imageValidateSizeMaxWidth) {
        if (imageValidateSizeMinWidth < imageValidateSizeMaxWidth) {
          limitation.push(`${this.LabelImageWidth} ${imageValidateSizeMinWidth.toLocaleString()} ~ ${imageValidateSizeMaxWidth.toLocaleString()}`)
        } else if (imageValidateSizeMinWidth === imageValidateSizeMaxWidth) {
          isWidthFixed = true
        } else {
          throw new Error('imageValidateSizeMinWidth cannot be greater than imageValidateSizeMaxWidth')
        }
      } else if (imageValidateSizeMaxWidth) {
        limitation.push(`${this.LabelImageWidth} ≤ ${imageValidateSizeMaxWidth.toLocaleString()}`)
      } else if (imageValidateSizeMinWidth) {
        limitation.push(`${this.LabelImageWidth} ≥ ${imageValidateSizeMinWidth.toLocaleString()}`)
      }
      let isHeightFixed = false
      if (imageValidateSizeMinHeight && imageValidateSizeMaxHeight) {
        if (imageValidateSizeMinHeight < imageValidateSizeMaxHeight) {
          limitation.push(`${this.LabelImageHeight} ${imageValidateSizeMinHeight.toLocaleString()} ~ ${imageValidateSizeMaxHeight.toLocaleString()}`)
        } else if (imageValidateSizeMinHeight === imageValidateSizeMaxHeight) {
          isHeightFixed = true
        } else {
          throw new Error('imageValidateSizeMinHeight cannot be greater than imageValidateSizeMaxHeight')
        }
      } else if (imageValidateSizeMaxHeight) {
        limitation.push(`${this.LabelImageHeight} ≤ ${imageValidateSizeMaxHeight.toLocaleString()}`)
      } else if (imageValidateSizeMinHeight) {
        limitation.push(`${this.LabelImageHeight} ≥ ${imageValidateSizeMinHeight.toLocaleString()}`)
      }
      if (isWidthFixed && isHeightFixed) {
        limitation.push(`${this.LabelImageDimension} ${imageValidateSizeMinHeight.toLocaleString()} × ${imageValidateSizeMinHeight.toLocaleString()}`)
      } else {
        if (isWidthFixed) {
          limitation.push(`${this.LabelImageWidth} ${imageValidateSizeMinWidth.toLocaleString()}`)
        }
        if (isHeightFixed) {
          limitation.push(`${this.LabelImageHeight} ${imageValidateSizeMinHeight.toLocaleString()}`)
        }
      }
      /* if (imageValidateSizeMinWidth && imageValidateSizeMinHeight) {
        FilePondOptions.imageValidateSizeLabelExpectedMinSize = `允许的${isWidthFixed && isHeightFixed ? '' : '最小'}尺寸: {minWidth} × {minHeight}`
      } else if (imageValidateSizeMinWidth) {
        FilePondOptions.imageValidateSizeLabelExpectedMinSize = `允许的${isWidthFixed ? '' : '最小'}宽度: {minWidth}`
      } else if (imageValidateSizeMinHeight) {
        FilePondOptions.imageValidateSizeLabelExpectedMinSize = `允许的${isHeightFixed ? '' : '最小'}高度: {minHeight}`
      }
      if (imageValidateSizeMaxWidth && imageValidateSizeMaxHeight) {
        FilePondOptions.imageValidateSizeLabelExpectedMaxSize = `允许的${isWidthFixed && isHeightFixed ? '' : '最大'}尺寸: {maxWidth} × {maxHeight}`
      } else if (imageValidateSizeMaxWidth) {
        FilePondOptions.imageValidateSizeLabelExpectedMaxSize = `允许的${isWidthFixed ? '' : '最大'}宽度: {maxWidth}`
      } else if (imageValidateSizeMaxHeight) {
        FilePondOptions.imageValidateSizeLabelExpectedMaxSize = `允许的${isHeightFixed ? '' : '最大'}高度: {maxHeight}`
      } */
      // 图片分辨率
      if (imageValidateSizeMinResolution && imageValidateSizeMaxResolution) {
        if (imageValidateSizeMinResolution < imageValidateSizeMaxResolution) {
          limitation.push(`${this.LabelImageResolution} ${imageValidateSizeMinResolution.toLocaleString()} ~ ${imageValidateSizeMaxResolution.toLocaleString()}`)
        } else if (imageValidateSizeMinResolution === imageValidateSizeMaxResolution) {
          limitation.push(`${this.LabelImageResolution} ${imageValidateSizeMinResolution.toLocaleString()}`)
        } else {
          throw new Error('imageValidateSizeMinResolution cannot be greater than imageValidateSizeMaxResolution')
        }
      } else if (imageValidateSizeMaxResolution) {
        limitation.push(`${this.LabelImageResolution} ≤ ${imageValidateSizeMaxResolution.toLocaleString()}`)
      } else if (imageValidateSizeMinResolution) {
        limitation.push(`${this.LabelImageResolution} ≥ ${imageValidateSizeMinResolution.toLocaleString()}`)
      }
      // 图片比例
      if (this.ImageAspectRatio.tip) {
        limitation.push(this.ImageAspectRatio.tip)
      }
      // 视频尺寸
      if (this.VideoWidth.targetLabel && this.VideoHeight.targetLabel) {
        limitation.push(`${this.LabelVideoDimension} ${this.VideoWidth.targetLabel} × ${this.VideoHeight.targetLabel}`)
      } else {
        if (this.VideoWidth.tip) {
          limitation.push(this.VideoWidth.tip)
        }
        if (this.VideoHeight.tip) {
          limitation.push(this.VideoHeight.tip)
        }
      }
      // 视频分辨率
      if (this.VideoResolution.tip) {
        limitation.push(this.VideoResolution.tip)
      }
      // 视频比例
      if (this.VideoAspectRatio.tip) {
        limitation.push(this.VideoAspectRatio.tip)
      }
      // 视频时长
      if (this.VideoDuration.tip) {
        limitation.push(this.VideoDuration.tip)
      }
      // 音频时长
      if (this.AudioDuration.tip) {
        limitation.push(this.AudioDuration.tip)
      }

      if (limitation.length) {
        const defaultLabelIdle = 'Drag & Drop your files or <span class="filepond--label-action"> Browse </span>'
        const separator = '<span style="color: #a8abb2;"> & </span>'
        const limitationLabel = `<br><div style='font-size: 12px; color: rgba(33, 150, 243, 0.8);'>${limitation.join(separator)}</div>`
        FilePondOptions.labelIdle = `${FilePondOptions.labelIdle || defaultLabelIdle}${limitationLabel}`
      }

      return FilePondOptions
    },
  },
  expose: ['filePond', 'uploading'],
  watch: {
    [model.prop]: {
      immediate: true,
      deep: true,
      async handler(newValue) {
        // 将 value 统一为符合 files 格式的对象数组
        if (newValue) {
          // 先统一为数组
          if (typeof newValue === 'string') {
            const arr = tryParsingJSONArray(newValue)
            newValue = arr || [newValue]
          } else if (isObject(newValue)) {
            newValue = [newValue]
          }
          // 应用 srcAt，并过滤掉无效的值
          if (Array.isArray(newValue)) {
            const files = []
            for (const v of newValue) {
              const file = await this.valueToFile(v)
              file && files.push(file)
            }
            this.files = files
          } else {
            this.files = []
          }
        } else {
          this.files = []
        }
        // 改变排序时，视图不会更新
        this.filePond?.setOptions({ files: this.files })
        this.filePond?.sort(() => 0)
      },
    },
    'FilePondOptions.disabled': function (newValue) {
      if (newValue) {
        FilePond.destroy(this.$refs.filePond)
      } else {
        this.$nextTick(() => {
          this.filePond = FilePond.create(this.$refs.filePond, this.FilePondOptions)
        })
      }
    },
  },
  mounted() {
    if (!FilePond.supported()) {
      this.isSupported = false
      throw new Error('Current browser does not support FilePond')
    }
    this.filePond = FilePond.create(this.$refs.filePond, this.FilePondOptions)
    this.filePond.on('removefile', () => {
      this.files = this.filePond.getFiles()
      this.emitInput()
    })
    this.filePond.on('warning', (e) => {
      FaMessageBox.warning(e.code === 0
        ? this.LabelMaxFilesExceeded.replaceAll('{maxFiles}', this.FilePondOptions.maxFiles)
        : e.body)
    })
    this.getSubWindowFeatures()
    try {
      useEventListener(window, 'resize', throttle(this.getSubWindowFeatures, 100, {
        leading: false,
        trailing: true,
      }))
    } catch (e) { }
  },
  destroyed() {
    FilePond.destroy(this.$refs.filePond)
  },
  methods: {
    getSubWindowFeatures() {
      const width = window.screen.availWidth / 2
      const height = window.screen.availHeight / 2
      const top = window.screenTop + window.screen.availHeight / 4
      const left = window.screenLeft + window.screen.availWidth / 4
      this.subWindowFeatures = `height=${height},innerHeight=${height},width=${width},innerWidth=${width},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no`
    },
    emitInput(_files) {
      // files 的格式:
      // [{ source: string | Blob, file: Blob | object }, { source: string | Blob, file: Blob | object }]

      // 配置了 srcAt 时，不需要提取文件的 URL/ID
      let newValue = this.SrcAt
        ? this.files
        // 未配置 upload 或 upload 返回值为空时，输出二进制文件
        // 过滤非法文件
        : this.files
          .map(file => file.status === FilePond.FileStatus.PROCESSING_COMPLETE && file.source)
          .filter(v => v)

      // 限制单数且实际单数
      const isSingle = this.FilePondOptions.maxFiles === 1 && newValue.length <= 1

      // 指定非数组
      if (this.Arrayed === false) {
        newValue = isSingle ? newValue[0] : JSON.stringify(newValue)
      // 自动
      } else if (!this.Arrayed && isSingle) {
        newValue = newValue[0]
      }

      this.$emit(model.event, newValue)
    },
    onActivateFile(file) {
      // 如果是浏览器支持预览的文件会预览，否则会下载
      window.open(file.source instanceof Blob ? URL.createObjectURL(file.source) : file.source, undefined, this.subWindowFeatures)
    },
    abort() {
      for (let i = this.queue.length - 1; i >= 0; i--) {
        this.queue[i].abortController.abort()
      }
    },
    // 根据 srcAt 定位 source 在绑定值中的位置，然后将绑定值转换为 files 格式
    async valueToFile(value) {
      let source = unwrap(value, this.SrcAt)
      // Base64 无法预览、无法下载，需要转换为 Blob
      if (isBase64WithScheme(source)) {
        source = await (await fetch(source)).blob()
      }
      if (source) {
        const res = isPlainObject(value) ? value : {}
        res.source = source
        res.options = { type: 'local' }
        res.status = FilePond.FileStatus.PROCESSING_COMPLETE
        if (source instanceof Blob) {
          res.options.file = source
          res.options.file.name ||= source.toString()
        } else if (value instanceof Blob) {
          res.options.file = value
          res.options.file.name ||= source.toString()
        } else if (typeof source === 'string') {
          res.options.file = { name: source }
        }
        return res
      }
    },
  },
}
</script>

<template>
  <div
    style="position: relative;"
    class="fa-upload"
  >
    <div v-if="FilePondOptions.disabled">
      <div
        v-for="(v, index) of files"
        :key="index"
        style="display: block;"
      >
        <a @click="onActivateFile(v)">
          {{ v.options.file.name }}
          <svg
            style="margin-left: 5px;"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"
          /></svg>
        </a>
      </div>
    </div>
    <div
      v-else
      ref="filePond"
    />
    <Uploading
      v-show="uploading"
      :percentage="percentage"
      :abort="abort"
    />
  </div>
</template>

<style lang="scss">
/* 避免在 Vue 3 el-form-item 中样式错乱 */
.el-form-item__content:has(.fa-upload) {
  display: block;
}

.fa-upload {
  .filepond--file-info-sub {
    display: none;
  }

  a {
    --el-link-font-size: 14px;
    --el-link-font-weight: 500;
    --el-link-text-color: #606266;
    --el-link-hover-text-color: #409eff;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    position: relative;
    text-decoration: none;
    outline: 0;
    cursor: pointer;
    padding: 0;
    font-size: var(--el-link-font-size);
    font-weight: var(--el-link-font-weight);
    color: var(--el-link-text-color)
  }

  a:hover {
    color: var(--el-link-hover-text-color)
  }

  a:hover::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    bottom: 0;
    border-bottom: 1px solid var(--el-link-hover-text-color)
  }
}
</style>
