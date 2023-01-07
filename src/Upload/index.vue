<template>
  <div>
    <el-upload
      v-show="!Disabled"
      v-loading="uploading"
      style="display:inline-block; line-height: initial; margin-bottom: -8px;"
      v-bind="ElUploadProps"
    >
      <!-- 无论什么 list-type -->
      <!-- 如果只有默认插槽没有 trigger 插槽，则默认插槽就是 trigger -->
      <!-- 如果默认插槽和 trigger 插槽同时存在，则只有 trigger 插槽才是 trigger -->
      <slot>
        <i class="el-icon-plus" />
      </slot>
      <slot name="trigger" />
      <div class="el-upload__tip">
        <slot
          name="tip"
          :aspectRatio="AspectRatio.label"
          :size="Size.label"
          :count="Count.label"
          :accept="Accept.label"
        >
          <div class="ellipsis-1">
            {{ Count.label }}
          </div>
          <div class="ellipsis-1">
            {{ Size.label }}
          </div>
          <div class="ellipsis-1">
            {{ AspectRatio.label }}
          </div>
          <div class="ellipsis-1">
            {{ Accept.label }}
          </div>
        </slot>
      </div>
    </el-upload>

    <KiImage
      v-show="Disabled"
      ref="kiImageRef"
      :modelValue="files"
      :value="files"
      srcAt="url"
    />

    <ImgEditor
      :show.sync="crop.show"
      :value="crop.value"
      :aspectRatio="AspectRatio"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
      @open="onCropOpen"
      @close="onCropClose"
      @closed="onCropClosed"
    />
  </div>
</template>

<script>
import { isVue3 } from 'vue-demi'
import SwalPreset from 'sweetalert2-preset'
import Sortable from 'sortablejs'
import { conclude, useGlobalConfig } from 'vue-global-config'
import { isPlainObject } from 'lodash-es'
import to from 'await-to-js'
import KiImage from '../Image/index.vue'
import { isObject, unwrap, wrap } from '../utils'
import ImgEditor from './ImgEditor.vue'
import { equalOrWithin, tryParsingJSONArray } from './utils'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalHooks = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

const MB = 1024 ** 2 // B 转 MB

// submit() 会触发 http-request
// 如果是多选 submit() 会连续多次触发 http-request

export default {
  name: 'KiUpload',
  install(app, options = {}) {
    const { props, attrs, listeners, hooks } = useGlobalConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalHooks, hooks)
    app.component(this.name, this)
  },
  components: { ImgEditor, KiImage },
  inject: {
    elForm: {
      default: {},
    },
  },
  props: {
    [model.prop]: {
      validator: value => typeof value === 'string'
        || Array.isArray(value)
        || isPlainObject(value),
    },
    srcAt: {},
    size: {},
    count: {},
    upload: {},
    accept: {},
    validator: {},
    aspectRatio: {},
    aspectRatioTolerance: {},
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
  emits: [model.event, 'exceed', 'preview', 'before-remove', 'size-error', 'change', 'remove', 'before-upload', 'error', 'progress', 'success'],
  data() {
    return {
      crop: {
        queue: [],
        show: false,
        value: null,
      },
      uploading: false,
      uploadingCount: 0, // 针对多选情况
      files: [],
      sortablejs: null,
    }
  },
  computed: {
    ElUploadProps() {
      return conclude([this.$attrs, globalAttrs, {
        ref: 'elUploadRef',
        action: '#',
        listType: 'picture-card',
        class: { isFull: this.isFull, canSort: this.canSort },
        autoUpload: false,
        fileList: this.files,
        disabled: this.Disabled,
        limit: this.Count.max,
        multiple: this.Count.max !== 1,
        accept: this.Accept.target,
        httpRequest: () => { },
        beforeRemove: this.onBeforeRemove,
        beforeUpload: this.onBeforeUpload,
        onChange: this.onChange,
        onPreview: this.onPreview,
        onRemove: this.onRemove,
        onExceed: this.onExceed,
        onProgress: (e, file, fileList) => {
          this.$emit('progress', e, file, fileList)
        },
      }], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
    AspectRatio() {
      let aspectRatio

      const _aspectRatio = conclude([this.aspectRatio, globalProps.aspectRatio], {
        validator: (value) => {
          const isValid = str => /^\d+\/\d+$/.test(str)
          const toNumber = (str) => {
            const [width, height] = str.split('/')
            return width / height
          }
          if (Array.isArray(value)) {
            aspectRatio = value.map(item => isValid(item) ? toNumber(item) : item)
          } else if (isValid(value)) {
            aspectRatio = toNumber(value)
          }
          return equalOrWithin(aspectRatio)
        },
      })

      const tolerance = conclude([this.aspectRatioTolerance, globalProps.aspectRatioTolerance, 0], {
        type: Number,
      })

      let target, min, max, _target, _min, _max, label
      if (Array.isArray(aspectRatio)) {
        [min, max] = aspectRatio;
        [_min, _max] = _aspectRatio
        if (min && max) {
          label = `宽高比 ${_min} ~ ${_max}`
        } else if (min) {
          label = `宽高比 ≥ ${_min}`
        } else if (max) {
          label = `宽高比 ≤ ${_max}`
        }
      } else if (aspectRatio !== undefined) {
        target = aspectRatio
        _target = _aspectRatio
        min = aspectRatio * (1 - tolerance)
        max = aspectRatio * (1 + tolerance)
        label = `宽高比 ${_aspectRatio}`
      }

      return { target, min, max, _target, _min, _max, label }
    },
    Count() {
      const count = conclude([this.count, globalProps.count], {
        validator: value => equalOrWithin(value),
      })

      let min, max, label
      if (Array.isArray(count)) {
        [min, max] = count
        if (min && max) {
          label = `数量 ${min} ~ ${max} 张`
        } else if (max) {
          label = `数量 ≤ ${max} 张`
        } else if (min) {
          label = `数量 ≥ ${min} 张`
        }
      } else if (count !== undefined) {
        max = count
        if (max) {
          label = `数量 ≤ ${max} 张`
        }
      }

      return { min, max, label }
    },
    Size() {
      const size = conclude([this.size, globalProps.size], {
        validator: value => equalOrWithin(value),
      })

      let min, max, _min, _max, label
      if (Array.isArray(size)) {
        [min, max] = size
        if (min) {
          _min = min * MB
        }
        if (max) {
          _max = max * MB
        }
        if (min && max) {
          label = `大小 ${min} ~ ${max}M`
        } else if (max) {
          label = `大小 ≤ ${max}M`
        } else if (min) {
          label = `大小 ≥ ${min}M`
        }
      } else if (size !== undefined) {
        max = size
        if (max) {
          _max = max * MB
          label = `大小 ≤ ${max}M`
        }
      }

      return { min, max, _min, _max, label }
    },
    Accept() {
      const accept = conclude([this.accept, globalProps.accept, 'image/*'], {
        type: String,
      })
      return {
        target: accept,
        label: (!accept || ['image/*', '*/*'].includes(accept)) ? null : `格式 ${accept}`,
      }
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
      return conclude([this.disabled, globalProps.disabled, Boolean(this.elForm.disabled)], {
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
  },
  watch: {
    canSort: {
      immediate: true,
      handler(n) {
        this.sort()
      },
    },
    [model.prop]: {
      immediate: true,
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
            this.files = newValue.map(v => wrap(v, unwrap(v, this.SrcAt))).filter(v => v)
          } else {
            this.files = []
          }
        } else {
          this.files = []
        }
      },
    },
  },
  methods: {
    async httpRequest(output) {
      // output 为编辑产物(可能未编辑)，可能为二进制或字符串类型
      // res 为上传返回值(可能未上传)，可能为二进制或字符串类型

      this.uploading = true

      // 如果编辑产物是字符串，则认为是已经是图片链接不需要上传，将编辑产物作为上传返回值
      let res = typeof output === 'string' ? output : this.Upload?.(output)
      if (res instanceof Promise) {
        let err
        [err, res] = await to(res)
        if (err) {
          console.error(err)
          this.$emit('error', err, output, this.$refs.elUploadRef.fileList)
          this.uploading = false
          return
        }
      }

      // 上传返回值为空，且编辑产物为二进制，输出该二进制，附带其 object URL 用于回显
      if (!res && output instanceof Blob) {
        output.url = URL.createObjectURL(output)
        this.files.push(output)
      }
      // 输出上传返回值（字符串）
      else {
        const url = unwrap(res, this.SrcAt)
        if (!url) {
          console.error('upload 的返回值或 srcAt 的解析结果不是有效的图片链接:',
            '\n  res: ', res)
          SwalPreset.error('上传失败')
          this.$emit('error', '上传失败', output, this.$refs.elUploadRef.fileList)
          return
        }
        this.files.push(wrap(res, url))
      }

      this.emitInput()
      this.$emit('success', res, output, this.$refs.elUploadRef.fileList)
      this.uploading = false
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
      }
      // 自动
      else if (!this.Arrayed) {
        if (isSingle) {
          newValue = newValue[0]
        }
      }

      this.$emit(model.event, newValue)
    },
    validateSize(file) {
      let sizeError = false
      if (this.Size.max !== undefined && file.size > this.Size._max) {
        SwalPreset.warning({
          titleText: `"${file.name}" 的大小超过${this.Size.max}M`,
          timer: 3000,
        })
        sizeError = true
      } else if (this.Size.min !== undefined && file.size < this.Size._min) {
        SwalPreset.warning({
          titleText: `"${file.name}" 的大小不足${this.Size.min}M`,
          timer: 3000,
        })
        sizeError = true
      }
      if (sizeError) {
        this.$emit('size-error', file.size)
        return false
      }
      return true
    },
    openEditor(input) {
      if (!this.Editable) {
        throw new Error('编辑功能已禁用')
      }

      const inputs = Array.isArray(input) ? input : [input]
      const initialCropQueueLength = this.crop.queue.length

      if (this.Count.max !== undefined
        // 判断是否超过数量上限: 已有图片数量 + 编辑队列中图片数量 + 输入图片数量 > 图片数量上限
        && (this.files.length + initialCropQueueLength + inputs.length) > this.Count.max) {
        this.onExceed(inputs, this.$refs.elUploadRef.fileList)
        throw new Error(`图片数量不能超过${this.Count.max}张`)
      }

      inputs.forEach((source) => {
        if (source) {
          if (typeof source !== 'string' && !(source instanceof Blob)) {
            console.error('不是有效的数据源: ', source)
            return
          }
          if (source instanceof Blob && !this.validateSize(source)) {
            return
          }
          if (!this.Validator(source)) {
            return
          }
          this.crop.queue.push(source)
        }
      })

      if (this.crop.queue.length === initialCropQueueLength) {
        throw new Error('请提供有效的数据源')
      }

      if (!this.crop.show) {
        this.crop.value = this.crop.queue.shift()
        this.crop.show = true
      }
    },
    // 添加文件、上传成功和上传失败时都会被调用
    // 配置了 httpRequest 以后，只有添加文件时会被调用
    onChange(file, fileList) {
      if (this.Editable) {
        // 不让图片显示在 input 标签中
        this.$refs.elUploadRef.uploadFiles.length--
        this.openEditor(file.raw)
      } else {
        if (this.validateSize(file.raw) && this.Validator(file.raw)) {
          this.httpRequest(file.raw)
        } else {
          this.$refs.elUploadRef.uploadFiles.length--
        }
      }
      this.$emit('change', file, fileList)
    },
    onCropOpen() {
      this.$refs.elUploadRef.$refs['upload-inner'].$el.blur()
    },
    onCropClosed() {
      this.$refs.elUploadRef.$refs['upload-inner'].$el.focus()
    },
    onCropConfirm(output) {
      this.httpRequest(output)
      this.onCropCancel()
    },
    // 取消上传某一张图片
    onCropCancel() {
      if (this.crop.queue.length > 0) {
        this.crop.value = this.crop.queue.shift()
      } else {
        this.crop.show = false
      }
    },
    // 取消上传所有图片
    onCropClose() {
      this.crop.queue.length = 0
      this.crop.value = null
    },
    sort() {
      if (this.sortablejs) {
        this.sortablejs.option('disabled', !this.canSort)
      } else if (this.canSort) {
        this.$nextTick(() => {
          this.sortablejs = Sortable.create(this.$refs.elUploadRef.$el.firstChild, {
            forceFallback: true,
            animation: 500,
            filter: '.el-upload-list__item-preview, .el-upload-list__item-delete',
            onStart: (e) => {
              document.documentElement.classList.toggle('ki-upload__cursor-grabbing', true)
            },
            onEnd: ({ newIndex, oldIndex }) => {
              if (newIndex !== oldIndex) {
                this.files.splice(newIndex, 0, this.files.splice(oldIndex, 1)[0])
                this.emitInput()
              }
              document.documentElement.classList.toggle('ki-upload__cursor-grabbing', false)
            },
          })
        })
      }
    },
    onExceed(files, fileList) {
      SwalPreset.warning(`图片数量不能超过${this.Count.max}张`)
      this.$emit('exceed', files, fileList)
    },
    onPreview(file) {
      const i = this.$refs.elUploadRef.uploadFiles.indexOf(file)
      if (i >= 0) {
        this.$refs.kiImageRef.preview(i)
      }
      this.$emit('preview', file)
    },
    onBeforeRemove(file, fileList) {
      if (this.Count.min !== undefined && this.files.length <= this.Count.min) {
        SwalPreset.warning(`图片数量不能低于${this.Count.min}张`)
        return false
      }
      this.$emit('before-remove', file, fileList)
    },
    onRemove(file, fileList) {
      this.files = fileList
      this.emitInput()
      this.$emit('remove', file, fileList)
    },
    onBeforeUpload(file) {
      this.$emit('before-upload', file)
    },
  },
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog) {
  min-width: 750px;
}

:deep(.el-upload-list--picture-card) {
  font-size: 0;

  .el-upload-list__item {
    user-select: none;
    transition: none !important;

    .el-upload-list__item-thumbnail {
      object-fit: contain;
    }
  }
}

:deep(.el-upload--picture-card) {
  position: relative;
  margin-bottom: 8px;

  .el-upload__tip {
    position: absolute;
    margin-top: 0;
    top: 83px;
    width: 100%;
    color: rgba(33, 150, 243, 0.8);
    line-height: 16px;
    transform-origin: top;
    transform: scale(0.9);
  }
}

.canSort :deep(.el-upload-list__item-actions) {
  cursor: grab;
}

.isFull {
  :deep(.el-upload-list--picture-card>.el-upload-list__item:last-child) {
    margin-right: 0;
  }

  :deep(.el-upload--picture-card) {
    display: none;
  }
}

.ellipsis-1 {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

<style>
.ki-upload__cursor-grabbing,
.ki-upload__cursor-grabbing *,
.ki-upload__cursor-grabbing .canSort .el-upload-list__item-actions {
  cursor: grabbing !important;
}
</style>
