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
import { lookup as toMIME } from 'mrmime'
import { useFormDisabled } from 'element-plus/es/components/form/src/hooks/use-form-common-props.mjs'
import FaMessageBox from '../MessageBox/index'
import { isBase64WithScheme, isObject, tryParsingJSONArray, unwrap } from '../../utils'
import Uploading from './Uploading.vue'

// import FilepondPluginDragReorder from 'filepond-plugin-drag-reorder';
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
    extensions: {},
    labelMinFilesExceeded: {},
    labelMaxFilesExceeded: {},
    labelBrowserNotSupported: {},
    labelCount: {},
    labelSize: {},
    labelWidth: {},
    labelHeight: {},
    // labelDimension: {},
    labelResolution: {},
    labelExtensions: {},
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
        type: String,
        /* validator(value) {
          if (value && this.maxFiles && value > this.maxFiles) {
            return false
          }
          return true
        }, */
      })
    },
    Extensions() {
      return conclude([this.extensions, globalProps.extensions], {
        type: String,
      })
    },
    LabelMinFilesExceeded() {
      return conclude([this.labelMinFilesExceeded, globalProps.labelMinFilesExceeded, 'Minimum file count: {minFiles}'], {
        type: String,
      })
    },
    LabelMaxFilesExceeded() {
      return conclude([this.labelMaxFilesExceeded, globalProps.labelMaxFilesExceeded, 'Maximum file count: {maxFiles}'], {
        type: String,
      })
    },
    LabelBrowserNotSupported() {
      return conclude([this.labelBrowserNotSupported, globalProps.labelBrowserNotSupported, 'Current browser does not support the file upload component FilePond, we recommend using the latest stable version of Chrome/Safari/Edge'], {
        type: String,
      })
    },
    LabelCount() {
      return conclude([this.labelCount, globalProps.labelCount, 'Count'], {
        type: String,
      })
    },
    LabelSize() {
      return conclude([this.labelSize, globalProps.labelSize, 'Size'], {
        type: String,
      })
    },
    LabelWidth() {
      return conclude([this.labelWidth, globalProps.labelWidth, 'Width'], {
        type: String,
      })
    },
    LabelHeight() {
      return conclude([this.labelHeight, globalProps.labelHeight, 'Height'], {
        type: String,
      })
    },
    /* LabelDimension() {
      return conclude([this.labelDimension, globalProps.labelDimension, 'Dimension'], {
        type: String,
      })
    }, */
    LabelResolution() {
      return conclude([this.labelResolution, globalProps.labelResolution, 'Resolution'], {
        type: String,
      })
    },
    LabelExtensions() {
      return conclude([this.labelExtensions, globalProps.labelExtensions, 'Extension'], {
        type: String,
      })
    },
    progress() {
      return this.queue.length
        ? this.queue.reduce((pre, cur) => pre + cur.progress, 0) / this.queue.length
        : 0
    },
    FilePondOptions() {
      const FilePondOptions = conclude([
        this.$attrs,
        globalAttrs,
        {
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
                  task.setProgress(1)
                  this.queue.shift()
                  return
                }
              }

              const file = await this.valueToFile(res)
              if (!file) {
                console.error('Invalid upload result')
                task.setProgress(1)
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
              task.setProgress(1)
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
      } = FilePondOptions

      const limitation = []
      // extensions 生成 acceptedFileTypes 和 fileValidateTypeLabelExpectedTypesMap
      const extensions = this.Extensions?.split(',').map(extension => extension?.trim().toLowerCase()).filter(v => v) || []
      if (extensions.length) {
        if (!FilePondOptions.acceptedFileTypes) {
          const set = new Set()
          for (const extension of extensions) {
            const mime = toMIME(extension)
            mime && set.add(mime)
          }
          FilePondOptions.acceptedFileTypes = Array.from(set)
        }
        if (!FilePondOptions.fileValidateTypeLabelExpectedTypesMap) {
          FilePondOptions.fileValidateTypeLabelExpectedTypesMap = {}
          for (const extension of extensions) {
            const mime = toMIME(extension)
            if (mime && extension) {
              FilePondOptions.fileValidateTypeLabelExpectedTypesMap[mime]
              = FilePondOptions.fileValidateTypeLabelExpectedTypesMap[mime]
                  ? `${FilePondOptions.fileValidateTypeLabelExpectedTypesMap[mime]}, ${extension}`
                  : extension
            }
          }
        }
      // acceptedFileTypes 和 fileValidateTypeLabelExpectedTypesMap 生成 extensions
      } else if (FilePondOptions.acceptedFileTypes?.length && FilePondOptions.fileValidateTypeLabelExpectedTypesMap) {
        for (const acceptedFileType of FilePondOptions.acceptedFileTypes) {
          const extension = FilePondOptions.fileValidateTypeLabelExpectedTypesMap[acceptedFileType]
          extension && extensions.push(extension)
        }
      }
      // extensions 生成 labelIdle 和 fileValidateTypeDetectType
      if (extensions.length) {
        limitation.push(`${this.LabelExtensions} ${extensions.join(',')}`)
        FilePondOptions.fileValidateTypeDetectType ??= (file, type) => new Promise((resolve, reject) => {
          const extension = file.name.replace(/.+\./, '.').toLowerCase()
          // File.name (扩展名) 和 File.type (MIME) 不匹配
          if (toMIME(extension) !== type) {
            reject(Error('File extension does not match file type'))
          } else if (extensions.includes(extension)) {
            resolve(type)
          } else {
            reject(Error(labelFileTypeNotAllowed || 'File of invalid type'))
          }
        })
      }
      if (minFileSize && maxFileSize) {
        if (minFileSize < maxFileSize) {
          limitation.push(`${this.LabelSize} ${minFileSize.toLocaleString()} ~ ${maxFileSize.toLocaleString()}`)
        } else if (minFileSize === maxFileSize) {
          limitation.push(`${this.LabelSize} ${minFileSize.toLocaleString()}`)
        } else {
          throw new Error('minFileSize cannot be greater than maxFileSize')
        }
      } else if (maxFileSize) {
        limitation.push(`${this.LabelSize} ≤ ${maxFileSize}`)
      } else if (minFileSize) {
        limitation.push(`${this.LabelSize} ≥ ${minFileSize}`)
      }
      // let isWidthFixed = false
      if (imageValidateSizeMinWidth && imageValidateSizeMaxWidth) {
        if (imageValidateSizeMinWidth < imageValidateSizeMaxWidth) {
          limitation.push(`${this.LabelWidth} ${imageValidateSizeMinWidth.toLocaleString()} ~ ${imageValidateSizeMaxWidth.toLocaleString()}`)
        } else if (imageValidateSizeMinWidth === imageValidateSizeMaxWidth) {
          // isWidthFixed = true
          limitation.push(`${this.LabelWidth} ${imageValidateSizeMinWidth.toLocaleString()}`)
        } else {
          throw new Error('imageValidateSizeMinWidth cannot be greater than imageValidateSizeMaxWidth')
        }
      } else if (imageValidateSizeMaxWidth) {
        limitation.push(`${this.LabelWidth} ≤ ${imageValidateSizeMaxWidth.toLocaleString()}`)
      } else if (imageValidateSizeMinWidth) {
        limitation.push(`${this.LabelWidth} ≥ ${imageValidateSizeMinWidth.toLocaleString()}`)
      }
      // let isHeightFixed = false
      if (imageValidateSizeMinHeight && imageValidateSizeMaxHeight) {
        if (imageValidateSizeMinHeight < imageValidateSizeMaxHeight) {
          limitation.push(`${this.LabelHeight} ${imageValidateSizeMinHeight.toLocaleString()} ~ ${imageValidateSizeMaxHeight.toLocaleString()}`)
        } else if (imageValidateSizeMinHeight === imageValidateSizeMaxHeight) {
          // isHeightFixed = true
          limitation.push(`${this.LabelHeight} ${imageValidateSizeMinHeight.toLocaleString()}`)
        } else {
          throw new Error('imageValidateSizeMinHeight cannot be greater than imageValidateSizeMaxHeight')
        }
      } else if (imageValidateSizeMaxHeight) {
        limitation.push(`${this.LabelHeight} ≤ ${imageValidateSizeMaxHeight.toLocaleString()}`)
      } else if (imageValidateSizeMinHeight) {
        limitation.push(`${this.LabelHeight} ≥ ${imageValidateSizeMinHeight.toLocaleString()}`)
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
      if (imageValidateSizeMinResolution && imageValidateSizeMaxResolution) {
        if (imageValidateSizeMinResolution < imageValidateSizeMaxResolution) {
          limitation.push(`${this.LabelResolution} ${imageValidateSizeMinResolution.toLocaleString()} ~ ${imageValidateSizeMaxResolution.toLocaleString()}`)
        } else if (imageValidateSizeMinResolution === imageValidateSizeMaxResolution) {
          limitation.push(`${this.LabelResolution} ${imageValidateSizeMinResolution.toLocaleString()}`)
        } else {
          throw new Error('imageValidateSizeMinResolution cannot be greater than imageValidateSizeMaxResolution')
        }
      } else if (imageValidateSizeMaxResolution) {
        limitation.push(`${this.LabelResolution} ≤ ${imageValidateSizeMaxResolution.toLocaleString()}`)
      } else if (imageValidateSizeMinResolution) {
        limitation.push(`${this.LabelResolution} ≥ ${imageValidateSizeMinResolution.toLocaleString()}`)
      }
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

      if (limitation.length) {
        const defaultLabelIdle = 'Drag & Drop your files or <span class="filepond--label-action"> Browse </span>'
        const separator = '<span style="color: #a8abb2;"> & </span>'
        const limitationLabel = `<br><div style='font-size: 12px; color: rgba(33, 150, 243, 0.8);'>${limitation.join(separator)}</div>`
        FilePondOptions.labelIdle = `${FilePondOptions.labelIdle || defaultLabelIdle}${limitationLabel}`
      }

      return FilePondOptions
    },
  },
  expose: ['filePond'],
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
      FaMessageBox.error(this.LabelBrowserNotSupported)
      throw new Error(this.LabelBrowserNotSupported)
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
      :progress="progress"
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
