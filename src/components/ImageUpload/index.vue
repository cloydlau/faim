<script>
import Sortable from 'sortablejs'
import { conclude, resolveConfig } from 'vue-global-config'
import to from 'await-to-js'
import { isVue3 } from 'vue-demi'
import { useFormDisabled } from 'element-plus/es/components/form/src/hooks/use-form-common-props.mjs'
import FaMessageBox from '../MessageBox'
import FaImage from '../Image/index.vue'
import { isObject, tryParsingJSONArray, unwrap } from '../../utils'
import defaultLocale from '../../locale/en'
import ImageEditor from './ImageEditor.vue'
import { equalOrWithin, sizeToText, toBinary, toImageTag, toLocalURL } from './utils'
import './index.css'

const name = 'FaImageUpload'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

const MB = 1024 ** 2 // B 转 MB

// submit() 会触发 http-request
// 如果是多选 submit() 会连续多次触发 http-request

export default {
  name,
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
  components: { FaImage, ImageEditor },
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
    size: {},
    width: {},
    height: {},
    resolution: {},
    count: {},
    upload: {},
    extensions: {},
    outputType: {},
    validator: {},
    aspectRatioTolerance: {},
    locale: {},
    disabled: {
      type: Boolean,
      default: undefined,
    },
    editable: {
      type: Boolean,
      default: undefined,
    },
    arrayed: {
      type: Boolean,
      default: undefined,
    },
  },
  emits: [model.event],
  setup: () => ({ elFormDisabled: useFormDisabled() }),
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
      // isTipOverflowed: false,
    }
  },
  computed: {
    uploading() {
      return this.queue.length > 0
    },
    Count() {
      const count = conclude([this.count, globalProps.count], {
        validator: value => equalOrWithin(value),
      })

      let min, max, label
      if (Array.isArray(count)) {
        [min, max] = count
        if (min && max) {
          label = `${this.Locale.count} ${min} ~ ${max}`
        } else if (max) {
          label = `${this.Locale.count} ≤ ${max}`
        } else if (min) {
          label = `${this.Locale.count} ≥ ${min}`
        }
      } else if (count !== undefined) {
        max = count
        if (max) {
          label = `${this.Locale.count} ≤ ${max}`
        }
      }

      return { min, max, label }
    },
    Size() {
      const size = conclude([this.size, globalProps.size], {
        validator: value => equalOrWithin(value),
      })

      let min, max, _min, _max, minText, maxText, label
      if (Array.isArray(size)) {
        [min, max] = size
        if (min) {
          _min = min * MB
          minText = sizeToText(_min)
        }
        if (max) {
          _max = max * MB
          maxText = sizeToText(_max)
        }
        if (min && max) {
          label = `${this.Locale.size} ${minText} ~ ${maxText}`
        } else if (max) {
          label = `${this.Locale.size} ≤ ${maxText}`
        } else if (min) {
          label = `${this.Locale.size} ≥ ${minText}`
        }
      } else if (size !== undefined) {
        max = size
        if (max) {
          _max = max * MB
          maxText = sizeToText(_max)
          label = `${this.Locale.size} ≤ ${maxText}`
        }
      }

      return { min, max, _min, _max, minText, maxText, label }
    },
    Width() {
      const width = conclude([this.width, globalProps.width], {
        validator: value => equalOrWithin(value),
      })

      let target, min, max, targetLabel, minLabel, maxLabel, label
      if (Array.isArray(width)) {
        [min, max] = width
        if (min && max) {
          minLabel = min.toLocaleString()
          maxLabel = max.toLocaleString()
          label = `${this.Locale.width} ${minLabel} ~ ${maxLabel}`
        } else if (max) {
          maxLabel = max.toLocaleString()
          label = `${this.Locale.width} ≤ ${maxLabel}`
        } else if (min) {
          minLabel = min.toLocaleString()
          label = `${this.Locale.width} ≥ ${minLabel}`
        }
      } else if (width !== undefined) {
        target = width
        if (target) {
          targetLabel = target.toLocaleString()
          label = `${this.Locale.width} ${targetLabel}`
        }
      }

      return { target, min, max, targetLabel, minLabel, maxLabel, label }
    },
    Height() {
      const height = conclude([this.height, globalProps.height], {
        validator: value => equalOrWithin(value),
      })

      let target, min, max, targetLabel, minLabel, maxLabel, label
      if (Array.isArray(height)) {
        [min, max] = height
        if (min && max) {
          minLabel = min.toLocaleString()
          maxLabel = max.toLocaleString()
          label = `${this.Locale.height} ${minLabel} ~ ${maxLabel}`
        } else if (max) {
          maxLabel = max.toLocaleString()
          label = `${this.Locale.height} ≤ ${maxLabel}`
        } else if (min) {
          minLabel = min.toLocaleString()
          label = `${this.Locale.height} ≥ ${minLabel}`
        }
      } else if (height !== undefined) {
        target = height
        if (target) {
          targetLabel = target.toLocaleString()
          label = `${targetLabel}`
        }
      }

      return { target, min, max, targetLabel, minLabel, maxLabel, label }
    },
    Resolution() {
      const resolution = conclude([this.resolution, globalProps.resolution], {
        validator: value => equalOrWithin(value),
      })

      let target, min, max, targetLabel, minLabel, maxLabel, label
      if (Array.isArray(resolution)) {
        [min, max] = resolution
        if (min && max) {
          minLabel = min.toLocaleString()
          maxLabel = max.toLocaleString()
          label = `${this.Locale.resolution} ${minLabel} ~ ${maxLabel}`
        } else if (max) {
          maxLabel = max.toLocaleString()
          label = `${this.Locale.resolution} ≤ ${maxLabel}`
        } else if (min) {
          minLabel = min.toLocaleString()
          label = `${this.Locale.resolution} ≥ ${minLabel}`
        }
      } else if (resolution !== undefined) {
        target = resolution
        if (target) {
          targetLabel = target.toLocaleString()
          label = `${this.Locale.resolution} ${targetLabel}`
        }
      }

      // resolution 参数的值不能与 width & height 冲突
      if ((target && this.Width.target && this.Height.target && target !== (this.Width.target * this.Height.target))
       || (max && this.Width.max && this.Height.max && max !== (this.Width.max * this.Height.max))
       || (min && this.Width.min && this.Height.min && min !== (this.Width.min * this.Height.min))
      ) {
        throw new Error('Value of prop \'resolution\' conflicts with values of \'width\' and \'height\'')
      }

      return { target, min, max, targetLabel, minLabel, maxLabel, label }
    },
    dimensionLabel() {
      let t = ''
      if (this.Width.targetLabel && this.Height.targetLabel) {
        t += `${this.Locale.dimension} ${this.Width.targetLabel} × ${this.Height.targetLabel}`
      } else {
        if (this.Width.label) {
          t += this.Width.label
        }
        if (this.Height.label) {
          if (t) {
            t += '，'
          }
          t += this.Height.label
        }
      }
      return t
    },
    Locale() {
      return conclude([this.locale, globalProps.locale, defaultLocale[name]], {
        type: Object,
      })
    },
    AspectRatioTolerance() {
      return conclude([this.aspectRatioTolerance, globalProps.aspectRatioTolerance, 0], {
        type: Number,
      })
    },
    Extensions() {
      const extensions = conclude([this.extensions, globalProps.extensions], {
        type: String,
      })
      return {
        target: extensions,
        label: `${this.Locale.extensions} ${extensions}`,
        list: extensions?.split(',').map(extension => extension?.trim().toLowerCase()).filter(v => v),
      }
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
      return conclude([this.disabled, globalProps.disabled, isVue3 ? this.elFormDisabled : this.elForm.disabled], {
        type: Boolean,
      })
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
    isFull() {
      return this.Count.max !== undefined && this.files.length >= this.Count.max
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
      const ElUploadProps = conclude([this.$attrs, globalAttrs, {
        ref: 'elUploadRef',
        action: '#',
        listType: 'picture-card',
        autoUpload: false,
        drag: true,
        fileList: this.files,
        disabled: this.Disabled,
        limit: this.Count.max,
        multiple: this.Count.max !== 1,
        httpRequest: () => { },
        beforeRemove: this.onBeforeRemove,
        onChange: this.onChange,
        onPreview: this.onPreview,
        onRemove: this.onRemove,
        onExceed: this.onExceed,
      }], {
        type: Object,
        camelizeObjectKeys: true,
      })
      ElUploadProps.accept ??= this.Extensions.target || 'image/*'
      return ElUploadProps
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
        // 将 value 统一为含有 url 属性的对象数组
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
              const file = this.valueToFile(v)
              file && files.push(file)
            }
            this.files = files
          } else {
            this.files = []
          }
        } else {
          this.files = []
        }
      },
    },
  },
  // mounted() { this.computeIsTipOverflowed() },
  // updated() { this.computeIsTipOverflowed() },
  expose: ['uploading', 'openEditor'],
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

      this.files.push(file)
      this.emitInput()
      this.queue.shift()
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

      // 指定非数组
      if (this.Arrayed === false) {
        if (isSingle) {
          newValue = newValue[0]
        } else {
          newValue = JSON.stringify(newValue)
        }
      // 自动
      } else if (!this.Arrayed) {
        if (isSingle) {
          newValue = newValue[0]
        }
      }

      this.$emit(model.event, newValue)
    },
    validateExtension(source) {
      if (typeof source !== 'string' && !(source instanceof Blob)) {
        console.error('Not a valid image source: ', source)
        return false
      }
      if (!this.Extensions.list.length) {
        return true
      }
      let extension
      if (source instanceof File) {
        extension = source.name.replace(/.+\./, '.').toLowerCase()
      } else if (typeof source === 'string') {
        extension = source.replace(/.+\./, '.').toLowerCase()
      }
      if (extension && !this.Extensions.list.includes(extension)) {
        FaMessageBox.warning(`${this.Locate.extensionNotAllowed.replaceAll('{extensions}', this.Extensions.target)}`)
        return false
      }
      return true
    },
    async validateSize(source) {
      if (this.Editable) {
        return true
      }

      let sizeError = false
      file = await toBinary(source)

      if (this.Size.max !== undefined && file.size > this.Size._max) {
        FaMessageBox.warning({
          titleText: this.Locale.maxSizeExceeded.replaceAll('{maxSize}', this.Size.maxText),
          timer: 5000,
        })
        sizeError = true
      } else if (this.Size.min !== undefined && file.size < this.Size._min) {
        FaMessageBox.warning({
          titleText: this.Locale.minSizeExceeded.replaceAll('{maxSize}', this.Size.minText),
          timer: 5000,
        })
        sizeError = true
      }
      if (sizeError) {
        return false
      }
      return true
    },
    async validateDimensionAndResolution(file) {
      if (this.Editable) {
        return true
      }

      let titleText
      const imageTag = await toImageTag(await toLocalURL(file))
      const resolution = imageTag.width * imageTag.height

      if (this.Width.target !== undefined && imageTag.width !== this.Width.target) {
        titleText = this.Locale.widthNotMatch.replaceAll('{width}', this.Width.targetLabel)
      } else if (this.Width.max !== undefined && imageTag.width > this.Width.max) {
        titleText = this.Locale.maxWidthExceeded.replaceAll('{maxWidth}', this.Width.maxLabel)
      } else if (this.Width.min !== undefined && imageTag.width < this.Width.min) {
        titleText = this.Locale.minWidthExceeded.replaceAll('{minWidth}', this.Width.minLabel)
      } else if (this.Height.target !== undefined && imageTag.height !== this.Height.target) {
        titleText = this.Locale.heightNotMatch.replaceAll('{height}', this.Height.targetLabel)
      } else if (this.Height.max !== undefined && imageTag.height > this.Height.max) {
        titleText = this.Locale.maxHeightExceeded.replaceAll('{maxHeight}', this.Height.maxLabel)
      } else if (this.Height.min !== undefined && imageTag.height < this.Height.min) {
        titleText = this.Locale.minHeightExceeded.replaceAll('{minHeight}', this.Height.minLabel)
      } else if (this.Resolution.target !== undefined && resolution !== this.Resolution.target) {
        titleText = this.Locale.resolutionNotMatch.replaceAll('{resolution}', this.Resolution.targetLabel)
      } else if (this.Resolution.max !== undefined && resolution > this.Resolution.max) {
        titleText = this.Locale.maxResolutionExceeded.replaceAll('{maxResolution}', this.Resolution.maxLabel)
      } else if (this.Resolution.min !== undefined && resolution < this.Resolution.min) {
        titleText = this.Locale.minResolutionExceeded.replaceAll('{minResolution}', this.Resolution.minLabel)
      }
      if (titleText) {
        FaMessageBox.warning({
          titleText,
          timer: 5000,
        })
        return false
      }
      return true
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
          && this.validateExtension(source)
          && await this.validateSize(source)
          && await this.validateDimensionAndResolution(source)
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
        // 不让图片显示在 input 标签中
        this.$refs.elUploadRef.uploadFiles.pop()
        await this.openEditor(file.raw)
      } else {
        if (
          this.validateExtension(file.raw)
          && await this.validateSize(file.raw)
          && await this.validateDimensionAndResolution(file.raw)
          && this.Validator(file.raw)
        ) {
          this.httpRequest(file.raw)
        } else {
          // 如果 onChange 里有异步操作，则 length-- 无效
          // this.$refs.elUploadRef.uploadFiles.length--
          this.$refs.elUploadRef.uploadFiles.pop()
        }
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
      } else {
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
      } else if (this.canSort) {
        this.$nextTick(() => {
          // list-type="text" 时，this.$refs.elUploadRef.$el.firstChild 是一个注释节点
          if (this.$refs.elUploadRef.$el.firstChild?.nodeType === Node.ELEMENT_NODE) {
            this.sortablejs = Sortable.create(this.$refs.elUploadRef.$el.firstChild, {
              animation: 500,
              filter: '.el-upload-list__item-preview, .el-upload-list__item-delete',
              onStart: () => {
                document.documentElement.classList.toggle('fa-image-upload__cursor-grabbing', true)
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
    onPreview(file) {
      const i = this.$refs.elUploadRef.uploadFiles.indexOf(file)
      if (i >= 0) {
        this.$refs.faImageRef.viewer.view(i)
      }
    },
    onBeforeRemove() {
      if (this.Count.min !== undefined && this.files.length <= this.Count.min) {
        FaMessageBox.warning(this.Locale.minCountExceeded.replaceAll('{minCount}', this.Count.min))
        return false
      }
    },
    onRemove(file, fileList) {
      this.files = fileList
      this.emitInput()
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
      v-show="!Disabled"
      v-loading="uploading"
      class="fa-image-upload"
      :class="{ isFull, canSort, isInsideTable }"
      v-bind="ElUploadProps"
    >
      <!-- 无论什么 list-type -->
      <!-- 如果只有默认插槽没有 trigger 插槽，则默认插槽就是 trigger -->
      <!-- 如果默认插槽和 trigger 插槽同时存在，则只有 trigger 插槽才是 trigger -->
      <slot>
        <el-icon v-if="isVue3"><Plus /></el-icon>
        <i
          v-else
          class="el-icon-plus"
        />
      </slot>
      <slot name="trigger" />
      <div class="el-upload__tip">
        <div>{{ Count.label }}</div>
        <div>{{ Size.label }}</div>
        <div>{{ dimensionLabel }}</div>
        <div>{{ Resolution.label }}</div>
        <div>{{ Extensions.label }}</div>
      </div>
      <slot
        v-if="isVue3"
        name="file"
      />
    </el-upload>

    <FaImage
      v-show="Disabled"
      ref="faImageRef"
      :value="files"
      :modelValue="files"
      srcAt="url"
    />

    <!-- 不使用 v-model:show="editor.show" 的原因： -->
    <!-- v-model:show 会被 vue 2 识别为 v-model 导致 value 参数校验失败 -->
    <ImageEditor
      :show.sync="editor.show"
      :value="editor.value"
      :width="Width"
      :height="Height"
      :resolution="Resolution"
      :aspectRatioTolerance="AspectRatioTolerance"
      :size="Size"
      :outputType="OutputType"
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
.fa-image-upload__cursor-grabbing .canSort .el-upload-list__item-actions {
  cursor: grabbing !important;
}

.fa-image-upload {
  margin-bottom: -8px;

  .el-upload-list--picture-card {
    .el-upload-list__item {
      user-select: none;
      transition: none !important;

      .el-upload-list__item-thumbnail {
        object-fit: contain;
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
      color: var(--el-text-color-secondary);
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

  &.isFull {
    .el-upload-list--picture-card>.el-upload-list__item:last-child {
      margin-right: 0;
    }

    .el-upload--picture-card {
      display: none;
    }
  }

  &.isInsideTable {
    &>.el-upload-list {
      &>.el-upload-list__item {
        width: 50px;
        height: 50px;

        .el-upload-list__item-status-label {
          width: 34px;
          height: 18px;

          &>i {
            margin-top: 0;
          }
        }

        .el-upload-list__item-actions {
          line-height: 50px;
          font-size: 16px;

          &>span+span {
            margin-left: 4px;
          }
        }
      }
    }

    .el-upload {
      width: 50px;
      height: 50px;
      line-height: 50px;

      &>.el-upload-dragger {
        width: 50px;
        height: 50px;
      }

      .el-icon, .el-icon-plus {
        font-size: initial;
      }

      .el-upload__text {
        display: none;
      }
    }
  }
}
</style>