<script>
import to from 'await-to-js'
import { destr } from 'destr'
import { cloneDeep } from 'lodash-es'
import mime from 'mime'
import Sortable from 'sortablejs'
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import defaultLocale from '../../locale/en'
import { handleNumericalProp, isObject, sizeToLabel, toBlobLike, toImageTag, toLocalURL, unwrap } from '../../utils'
import FaImage from '../Image/index.vue'
import FaMessageBox from '../MessageBox'
import ImageEditor from './ImageEditor.vue'
import './index.css'

/* console.log(mime.getAllExtensions(' image/jpeg'))
console.log(mime.getAllExtensions('image/jpeg '))
console.log(mime.getAllExtensions(' image/jpeg '))
console.log(mime.getAllExtensions('IMAGE/JPEg'))
console.log(mime.getAllExtensions('jpg'))
console.log(mime.getAllExtensions('.jpg'))
console.log(mime.getAllExtensions('image/*'))
console.log(mime.getAllExtensions('audio/*'))
console.log(mime.getAllExtensions('video/*'))
console.log(mime.getAllExtensions('image/jpeg'))
console.log(mime.getAllExtensions('image/png'))
console.log(mime.getAllExtensions('image/gif'))
console.log(mime.getAllExtensions('audio/mp3'))
console.log(mime.getAllExtensions('video/mp4'))
console.log(mime.getAllExtensions('application/pdf'))
console.log(mime.getAllExtensions('application/vnd.android.package-archive'))
console.log(mime.getAllExtensions('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
console.log(mime.getAllExtensions('application/vnd.ms-excel')) */

const name = 'FaImageUpload'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

const boolProps = [
  'editable',
  'arrayed',
  'stringified',
]

const boolAttrs = [
  'disabled',
  'multiple',
  'withCredentials',
  'showFileList',
  'drag',
  'autoUpload',
]

// submit() 会触发 http-request
// 如果是多选 submit() 会连续多次触发 http-request

export default {
  name,
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, { props: this.props, camelizePropNames: true })
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
  components: { FaImage, ImageEditor },
  props: {
    [model.prop]: {
      validator: value => typeof value === 'string'
        || Array.isArray(value)
        || isObject(value),
    },
    srcAt: {},
    minCount: {},
    maxCount: {},
    minSize: {},
    maxSize: {},
    width: {},
    height: {},
    resolution: {},
    aspectRatio: {},
    upload: {},
    outputType: {},
    validator: {},
    locale: {},
    ...Object.fromEntries(Array.from(boolProps, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
    ...Object.fromEntries(Array.from(boolAttrs, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: [model.event],
  // updated() { this.computeIsTipOverflowed() },
  expose: ['openEditor', 'uploading'],
  data() {
    return {
      isVue3,
      queue: [],
      editor: {
        queue: [],
        show: false,
        // showing: false,
        value: null,
      },
      files: [],
      sortablejs: null,
      updatingModelValue: false,
      // isTipOverflowed: false,
      fileURLToBePreviewed: undefined,
    }
  },
  computed: {
    uploading() {
      return this.queue.length > 0
    },
    Count() {
      return handleNumericalProp({
        config: [{ min: this.minCount, max: this.maxCount }, { min: globalProps.minCount, max: globalProps.maxCount }],
        labelTip: this.Locale.count,
        createTitleTextOfNotMatched: count => this.Locale.countNotMatched.replaceAll('{count}', count),
        createTitleTextOfMinExceeded: minCount => this.Locale.minCountExceeded.replaceAll('{minCount}', minCount),
        createTitleTextOfMaxExceeded: maxCount => this.Locale.maxCountExceeded.replaceAll('{maxCount}', maxCount),
        allowOptions: false,
        allowTarget: false,
      })
    },
    Size() {
      return handleNumericalProp({
        config: [{ min: this.minSize, max: this.maxSize }, { min: globalProps.minSize, max: globalProps.maxSize }],
        labelTip: this.Locale.size,
        createTitleTextOfMinExceeded: minSize => this.Locale.minSizeExceeded.replaceAll('{minSize}', minSize),
        createTitleTextOfMaxExceeded: maxSize => this.Locale.maxSizeExceeded.replaceAll('{maxSize}', maxSize),
        withUnit: sizeToLabel,
      })
    },
    Width() {
      return handleNumericalProp({
        config: [this.width, globalProps.width],
        labelTip: this.Locale.width,
        createTitleTextOfNotMatched: width => this.Locale.widthNotMatched.replaceAll('{width}', width),
        createTitleTextOfMinExceeded: minWidth => this.Locale.minWidthExceeded.replaceAll('{minWidth}', minWidth),
        createTitleTextOfMaxExceeded: maxWidth => this.Locale.maxWidthExceeded.replaceAll('{maxWidth}', maxWidth),
      })
    },
    Height() {
      return handleNumericalProp({
        config: [this.height, globalProps.height],
        labelTip: this.Locale.height,
        createTitleTextOfNotMatched: height => this.Locale.heightNotMatched.replaceAll('{height}', height),
        createTitleTextOfMinExceeded: minHeight => this.Locale.minHeightExceeded.replaceAll('{minHeight}', minHeight),
        createTitleTextOfMaxExceeded: maxHeight => this.Locale.maxHeightExceeded.replaceAll('{maxHeight}', maxHeight),
      })
    },
    Resolution() {
      return handleNumericalProp({
        config: [this.resolution, globalProps.resolution],
        labelTip: this.Locale.resolution,
        createTitleTextOfNotMatched: resolution => this.Locale.resolutionNotMatched.replaceAll('{resolution}', resolution),
        createTitleTextOfMinExceeded: minResolution => this.Locale.minResolutionExceeded.replaceAll('{minResolution}', minResolution),
        createTitleTextOfMaxExceeded: maxResolution => this.Locale.maxResolutionExceeded.replaceAll('{maxResolution}', maxResolution),
      })
    },
    AspectRatio() {
      return handleNumericalProp({
        config: [this.aspectRatio, globalProps.aspectRatio],
        labelTip: this.Locale.aspectRatio,
        createTitleTextOfNotMatched: aspectRatio => this.Locale.aspectRatioNotMatched.replaceAll('{aspectRatio}', aspectRatio),
        createTitleTextOfMinExceeded: minAspectRatio => this.Locale.minAspectRatioExceeded.replaceAll('{minAspectRatio}', minAspectRatio),
        createTitleTextOfMaxExceeded: maxAspectRatio => this.Locale.maxAspectRatioExceeded.replaceAll('{maxAspectRatio}', maxAspectRatio),
        getValue: (value) => {
          if (!/[1-9]+:[1-9]+/.test(value)) {
            throw new TypeError('Expect prop aspectRatio to be a string like \'1:1\'')
          }
          const [w, h] = value.split(':')
          return w / h
        },
      })
    },
    dimensionTip() {
      if (this.Width.tip && this.Height.tip) {
        if (this.Resolution.tip) {
          throw new Error('Prohibit specifying width, height, and resolution simultaneously to avoid conflicts')
        }
        else if (this.AspectRatio.tip) {
          throw new Error('Prohibit specifying width, height and aspect ratio simultaneously to avoid conflicts')
        }
      }
      return (this.Width.targetLabel && this.Height.targetLabel)
        ? `${this.Locale.dimension} ${this.Width.targetLabel} × ${this.Height.targetLabel}`
        : [this.Width.tip, this.Height.tip].filter(v => v).join(' ')
    },
    Locale() {
      return conclude([this.locale, globalProps.locale, defaultLocale[name]], {
        type: Object,
      })
    },
    OutputType() {
      return conclude([this.outputType, globalProps.outputType], {
        type: String,
      })
    },
    SrcAt() {
      return conclude([this.srcAt, globalProps.srcAt], {
        type: [String, Function, Symbol],
      })
    },
    Validator() {
      return conclude([this.validator, globalProps.validator, () => true], {
        type: Function,
      })
    },
    Upload() {
      return conclude([this.upload, globalProps.upload], {
        type: Function,
      })
    },
    Disabled() {
      return conclude([this.disabled, globalProps.disabled], { type: Boolean })
    },
    Editable() {
      return conclude([this.editable, globalProps.editable, true], {
        type: Boolean,
      })
    },
    Arrayed() {
      return conclude([this.arrayed, globalProps.arrayed], {
        type: Boolean,
      })
    },
    Stringified() {
      return conclude([this.stringified, globalProps.stringified], {
        type: Boolean,
      })
    },
    isFull() {
      return this.Count.max && this.files.length >= this.Count.max
    },
    canSort() {
      return !this.Disabled && this.files.length > 1
    },
    isInsideTable() {
      let parent = this.$parent
      while (parent) {
        // element-plus 是 TBODY
        if (['TABLE', 'TBODY', 'TR', 'TH', 'TD'].includes(parent.$el?.tagName)) {
          return true
        }
        parent = parent.$parent
      }
      return false
    },
    ElUploadProps() {
      return conclude([
        Object.fromEntries(
          Array.from(boolAttrs, boolAttr => [boolAttr, conclude([this[boolAttr], globalProps[boolAttr]])]).filter(
            ([, item]) => item !== undefined,
          ),
        ),
        this.$attrs,
        globalAttrs,
        {
          ref: 'elUploadRef',
          action: '#',
          listType: 'picture-card',
          accept: 'image/*',
          autoUpload: false,
          drag: true,
          disabled: this.Disabled,
          limit: this.Count.max,
          multiple: this.Count.max !== 1,
          httpRequest: () => { },
          beforeRemove: this.onBeforeRemove,
          onChange: this.onChange,
          onPreview: this.onPreview,
          onRemove: this.onRemove,
          onExceed: this.onExceed,
        },
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
    // accept 转 extension + mime
    Type() {
      let mimeMap = {}
      let extensions = this.ElUploadProps.accept?.split(',')

      if (extensions) {
        for (let i = 0; i < extensions.length; i++) {
          const accept = extensions[i]?.trim().toLowerCase() // 便于扩展名校验，且原生的 accept 就支持空格和大写
          if (accept) {
            if (accept.startsWith('.')) {
              const type = mime.getType(accept)
              if (type) {
                mimeMap[type] = true
              }
              continue
            }
            else if (accept.startsWith('image/')) {
              if (accept === 'image/*') {
                // 不需要校验
                mimeMap = null
                extensions[i] = null
                break
              }
              else {
                mimeMap[accept] = true
                extensions[i] = Array.from(mime.getAllExtensions(accept) || [], extension => `.${extension}`)
              }
            }
            else {
              throw new Error(`Prop 'accept' contains illegal value: '${accept}'`)
            }
          }
        }

        extensions = extensions
          .filter(v => v)
          .flat(1)
          .join(',')

        if (mimeMap && !Object.keys(mimeMap).length) {
          mimeMap = null
        }
      }

      return {
        extensions: extensions || 'image/*',
        tip: extensions ? `${this.Locale.accept} ${extensions}` : '',
        mimeMap,
      }
    },
  },
  watch: {
    canSort: {
      immediate: true,
      handler() {
        this.sort()
      },
    },
    [model.prop]: {
      immediate: true,
      deep: true,
      handler(newValue) {
        if (this.updatingModelValue) {
          this.updatingModelValue = false
          return
        }
        // 将 model-value 统一为含有 url 属性的对象数组
        this.files = this.formatModelValue(newValue)
      },
    },
  },
  // mounted() { this.computeIsTipOverflowed() },
  methods: {
    /* computeIsTipOverflowed() {
      for (const e of document.querySelectorAll(isVue3
        ? '.el-upload__tip>.el-tooltip__trigger'
        : '.el-upload__tip>.el-tooltip>.ellipsis-1')) {
        if (e.offsetWidth < e.scrollWidth) {
          this.isTipOverflowed = true
          return
        }
      }
      this.isTipOverflowed = false
    }, */
    async httpRequest(output) {
      // output 为编辑产物 (可能未编辑)，可能为二进制或字符串类型
      // res 为上传返回值 (可能未上传)，可能为任意类型
      this.queue.push(Symbol('UPLOAD_TASK'))
      // 如果编辑产物是字符串，则认为是已经是图片 URL/ID 不需要上传，将编辑产物作为上传返回值
      // 如果没有配置 upload，则不需要上传，直接用编辑产物
      let res = (typeof output === 'string' || !this.Upload) ? output : this.Upload(output)
      if (res instanceof Promise) {
        let err
        [err, res] = await to(res)
        if (err) {
          console.error(err)
          this.queue.shift()
          return
        }
      }

      const file = this.valueToFile(res)
      if (!file) {
        console.error('Invalid upload result')
        this.queue.shift()
        return
      }

      this.files[this.files.length - 1] = file
      this.emitInput()
      // 加 nextTick 的目的：确保添加上传文件时不产生删除动画
      this.$nextTick(() => {
        this.queue.shift()
      })
    },
    emitInput() {
      // files 的格式:
      // 1. [{ url: "xxx" }, { url: "xxx" }]
      // 2. [File { name: '', url: 'blob:xxx' }, File { name: '', url: 'blob:xxx' }]
      // 3. [Blob { url: 'blob:xxx' }, Blob { url: 'blob:xxx' }]
      // 4. 以上三者的混合

      // 配置了 srcAt 时，不需要提取图片的 url
      let newValue = this.SrcAt
        ? this.files
        // 未配置 upload 或 upload 返回值为空时，输出二进制文件
        : this.files.map(file => file instanceof Blob ? file : file.url)

      // 限制单数且实际单数
      const isSingle = this.Count.max === 1 && newValue.length <= 1

      let hasStringified = false
      // 指定非数组
      if (this.Arrayed === false) {
        if (isSingle) {
          newValue = newValue[0]
        }
        else {
          newValue = JSON.stringify(newValue)
          hasStringified = true
        }
      }
      // 自动
      else if (!this.Arrayed) {
        if (isSingle) {
          newValue = newValue[0]
        }
      }

      if (this.Stringified && !hasStringified) {
        newValue = JSON.stringify(newValue)
      }

      this.updatingModelValue = true
      this.$emit(model.event, newValue)
    },
    async validateTypeAndSize(source) {
      let binary
      // 可以编辑且指定输出的格式时，免校验格式
      if (!(this.Editable && this.outputType)) {
        if (source instanceof Blob) {
          if (!source.type.startsWith('image/')) {
            FaMessageBox.warning(`${this.Locale.typeNotAllowed.replaceAll('{accept}', this.Type.extensions)}`)
            return false
          }
          if (this.Type.mimeMap && !this.Type.mimeMap[source.type]) {
            FaMessageBox.warning(`${this.Locale.typeNotAllowed.replaceAll('{accept}', this.Type.extensions)}`)
            return false
          }
        }
        else if (typeof source === 'string') {
          binary = await toBlobLike(source)
          if (!binary.type.startsWith('image/')) {
            FaMessageBox.warning(`${this.Locale.typeNotAllowed.replaceAll('{accept}', this.Type.extensions)}`)
            return false
          }
          if (this.Type.mimeMap && !this.Type.mimeMap[binary.type]) {
            FaMessageBox.warning(`${this.Locale.typeNotAllowed.replaceAll('{accept}', this.Type.extensions)}`)
            return false
          }
        }
        else {
          console.error('Invalid image source: ', source)
          return false
        }
      }

      // 可以编辑时，免校验大小
      if (this.Editable) {
        return true
      }
      binary ??= await toBlobLike(source)
      return this.Size.validate(binary.size)
    },
    async validateDimension(file) {
      if (this.Editable) {
        return true
      }
      const imageTag = await toImageTag(await toLocalURL(file))
      return this.Width.validate(imageTag.width)
        && this.Height.validate(imageTag.height)
        && this.Resolution.validate(imageTag.width * imageTag.height)
        && this.AspectRatio.validate(imageTag.width / imageTag.height)
    },
    async openEditor(input) {
      if (!this.Editable) {
        throw new Error('Edit mode has been disabled')
      }

      const inputs = Array.isArray(input) ? input : [input]
      const initialEditorQueueLength = this.editor.queue.length

      if (
        this.Count.max !== undefined
        // 判断是否超过数量上限: 已有图片数量 + 编辑队列中图片数量 + 输入图片数量 > 图片数量上限
        && (this.files.length + initialEditorQueueLength + inputs.length) > this.Count.max
      ) {
        throw new Error(this.onExceed())
      }

      // this.editor.showing = true
      for (const source of inputs) {
        if (
          source
          && await this.validateTypeAndSize(source)
          && await this.validateDimension(source)
          && this.Validator(source)
        ) {
          this.editor.queue.push(source)
        }
      }

      if (this.editor.queue.length === initialEditorQueueLength) {
        // this.editor.showing = false
        throw new Error('Please provide valid image source')
      }

      if (!this.editor.show) {
        this.editor.value = this.editor.queue.shift()
        this.editor.show = true
      }
    },
    // 添加文件、上传成功和上传失败时都会被调用
    // 配置了 httpRequest 以后，只有添加文件时会被调用
    async onChange(file, _fileList) {
      if (this.Editable) {
        await this.openEditor(file.raw)
      }
      else if (
        await this.validateTypeAndSize(file.raw)
        && await this.validateDimension(file.raw)
        && this.Validator(file.raw)
      ) {
        this.httpRequest(file.raw)
      }
    },
    // 关闭编辑弹窗后，回车可以打开文件选择
    onEditorOpened() {
      this.$refs.elUploadRef.$refs[isVue3 ? 'uploadRef' : 'upload-inner'].$el.blur()
      // this.editor.showing = false
    },
    onEditorClosed() {
      this.$refs.elUploadRef.$refs[isVue3 ? 'uploadRef' : 'upload-inner'].$el.focus()
    },
    onEditorConfirm(output) {
      this.httpRequest(output)
      if (this.editor.queue.length > 0) {
        this.editor.value = this.editor.queue.shift()
      }
      else {
        this.editor.show = false
      }
    },
    // 取消上传所有图片
    onEditorClose() {
      this.editor.queue.length = 0
      this.editor.value = null
    },
    sort() {
      if (this.sortablejs) {
        this.sortablejs.option('disabled', !this.canSort)
      }
      else if (this.canSort) {
        this.$nextTick(() => {
          // list-type="text" 时，this.$refs.elUploadRef.$el.firstElementChild 是一个注释节点
          if (this.$refs.elUploadRef.$el.firstElementChild?.nodeType === Node.ELEMENT_NODE) {
            this.sortablejs = Sortable.create(this.$refs.elUploadRef.$el.firstElementChild, {
              animation: 500,
              filter: '.el-upload-list__item-preview, .el-upload-list__item-delete',
              onStart: () => {
                setTimeout(() => {
                  document.documentElement.classList.toggle('fa-image-upload__cursor-grabbing', true)
                }, 50)
              },
              onEnd: ({ newIndex, oldIndex }) => {
                if (newIndex !== oldIndex) {
                  this.files.splice(newIndex, 0, this.files.splice(oldIndex, 1)[0])
                  this.emitInput()
                }
                document.documentElement.classList.toggle('fa-image-upload__cursor-grabbing', false)
              },
            })
          }
        })
      }
    },
    onExceed() {
      const tip = this.Locale.maxCountExceeded.replaceAll('{maxCount}', this.Count.max)
      FaMessageBox.warning(tip)
      return tip
    },
    onPreview(uploadFile) {
      /* const i = this.$refs.elUploadRef.uploadFiles?.indexOf(file)
      if (i >= 0) {
        this.$refs.faImageRef.viewer.view(i)
      } */
      this.fileURLToBePreviewed = uploadFile.url
      setTimeout(() => {
        this.$refs.faImageRef.viewer.view()
      }, 0)
    },
    onBeforeRemove() {
      if (this.Count.min && this.files.length <= this.Count.min) {
        FaMessageBox.warning(this.Locale.minCountExceeded.replaceAll('{minCount}', this.Count.min))
        return false
      }
    },
    onRemove(file, fileList) {
      this.files = fileList
      this.emitInput()
    },
    // 应用 srcAt，并过滤掉无效的值
    formatModelValue(modelValue) {
      const files = []
      if (!modelValue) {
        return files
      }
      else if (Array.isArray(modelValue)) {
        for (const item of modelValue) {
          const file = this.valueToFile(cloneDeep(item))
          if (file) {
            files.push(file)
          }
        }
        return files
      }
      else if (this.Stringified) {
        const parsedModelValue = destr(modelValue)
        return parsedModelValue ? this.formatModelValue(Array.isArray(parsedModelValue) ? parsedModelValue : [parsedModelValue]) : files
      }
      else if (typeof modelValue === 'string' || isObject(modelValue)) {
        return this.formatModelValue([modelValue])
      }
      else {
        return files
      }
    },
    // 根据 srcAt 定位 url 在绑定值中的位置，然后将绑定值转换为 files 格式
    valueToFile(value) {
      let url = unwrap(value, this.SrcAt)
      if (url instanceof Blob) {
        url = URL.createObjectURL(url)
      }
      if (url && typeof url === 'string') {
        const res = isObject(value) ? value : {}
        res.url = url
        return res
      }
    },
  },
}
</script>

<template>
  <div style="line-height: 0;">
    <el-upload
      v-model:file-list="files"
      v-loading="uploading"
      class="fa-image-upload"
      :class="{ isVue3, uploading, isFull, canSort, isInsideTable }"
      v-bind="ElUploadProps"
      :file-list="files"
    >
      <!-- 无论什么 list-type -->
      <!-- 如果只有默认插槽没有 trigger 插槽，则默认插槽就是 trigger -->
      <!-- 如果默认插槽和 trigger 插槽同时存在，则只有 trigger 插槽才是 trigger -->
      <slot>
        <el-icon v-if="isVue3"><Plus /></el-icon>
        <i v-else class="el-icon-plus" />
      </slot>
      <slot name="trigger" />
      <div class="el-upload__tip">
        <div>{{ Count.tip }}</div>
        <div>{{ Size.tip }}</div>
        <div>{{ dimensionTip }}</div>
        <div>{{ Resolution.tip }} {{ AspectRatio.tip }}</div>
        <div>{{ Type.tip }}</div>
      </div>
      <slot v-if="isVue3" name="file" />
    </el-upload>

    <FaImage
      v-show="false"
      ref="faImageRef"
      :value="fileURLToBePreviewed"
      :model-value="fileURLToBePreviewed"
    />

    <!-- 不使用 v-model:show="editor.show" 的原因： -->
    <!-- v-model:show 会被 vue 2 识别为 v-model 导致 value 参数校验失败 -->
    <ImageEditor
      :show.sync="editor.show"
      :value="editor.value"
      :output-type="OutputType"
      :size="Size"
      :width="Width"
      :height="Height"
      :resolution="Resolution"
      :aspect-ratio="AspectRatio"
      :validator="Validator"
      :locale="Locale"
      @update:show="(e) => { editor.show = e }"
      @confirm="onEditorConfirm"
      @opened="onEditorOpened"
      @close="onEditorClose"
      @closed="onEditorClosed"
    />
  </div>
</template>

<style lang="scss">
.fa-image-upload__cursor-grabbing,
.fa-image-upload__cursor-grabbing *,
.fa-image-upload__cursor-grabbing .fa-image-upload.canSort .el-upload-list__item-actions {
  cursor: grabbing !important;
}

.fa-image-upload {
  margin-bottom: -8px;

  // see: https://github.com/SortableJS/Sortable/issues/1853
  &:not(.isVue3) .el-upload-list--picture-card {
    display: inline-block;
  }

  &.uploading .el-upload-list__item {
    transition: none !important;
  }

  .el-upload-list--picture-card {
    .el-upload-list__item {
      user-select: none;

      .el-upload-list__item-thumbnail {
        object-fit: contain;
      }

      .el-upload-list__item-status-label {
        display: none !important;
      }

      .el-upload-list__item-actions {
        color: #fff !important;
      }
    }
  }

  .el-upload--picture-card {
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 8px;

    i {
      font-size: 28px;
      color: #909399;
    }

    .el-upload__tip {
      position: absolute;
      margin-top: 1px;
      top: 85px;
      width: 100%;
      color: rgba(33, 150, 243, 0.8);
      line-height: 16px;
      transform-origin: top;
      transform: scale(0.9);
      text-align: center;

      * {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  .el-upload-dragger {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    width: var(--el-upload-picture-card-size, 148px);
    height: var(--el-upload-picture-card-size, 148px);
  }

  &.canSort .el-upload-list__item-actions {
    cursor: grab;
  }

  .el-upload-list__item-actions > .el-upload-list__item-preview {
    cursor: zoom-in !important;
  }

  &.isFull {
    .el-upload-list--picture-card > .el-upload-list__item:last-child {
      margin-right: 0;
    }

    .el-upload--picture-card {
      display: none;
    }
  }

  &.isInsideTable {
    & > .el-upload-list {
      & > .el-upload-list__item {
        width: 50px;
        height: 50px;

        .el-upload-list__item-status-label {
          width: 34px;
          height: 18px;

          & > i {
            margin-top: 0;
          }
        }

        .el-upload-list__item-actions {
          line-height: 50px;
          font-size: 16px;

          & > span + span {
            margin-left: 4px;
          }
        }
      }
    }

    .el-upload {
      width: 50px;
      height: 50px;
      line-height: 50px;

      & > .el-upload-dragger {
        width: 50px;
        height: 50px;
      }

      .el-icon,
      .el-icon-plus {
        font-size: initial;
      }

      .el-upload__text {
        display: none;
      }
    }
  }
}
</style>
