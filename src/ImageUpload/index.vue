<script>
import Sortable from 'sortablejs'
import { conclude, resolveConfig } from 'vue-global-config'
import { isPlainObject } from 'lodash-es'
import to from 'await-to-js'
import { isVue3 } from 'vue-demi'
import KiMessageBox from '../MessageBox'
import ImgEditor from './ImgEditor.vue'
import { equalOrWithin, isObject, sizeToText, toBinary, toImageTag, toLocalURL, tryParsingJSONArray, unwrap, wrap } from './utils'
import './index.css'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const MB = 1024 ** 2 // B 转 MB

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

// submit() 会触发 http-request
// 如果是多选 submit() 会连续多次触发 http-request

export default {
  name: 'KiImageUpload',
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
  components: { ImgEditor },
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
    width: {},
    height: {},
    count: {},
    upload: {},
    accept: {},
    outputType: {},
    validator: {},
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
      isVue3,
      crop: {
        queue: [],
        show: false,
        value: null,
      },
      uploading: false,
      uploadingCount: 0, // 针对多选情况
      files: [],
      sortablejs: null,
      isTipOverflowed: false,
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
    Count() {
      const count = conclude([this.count, globalProps.count], {
        validator: value => equalOrWithin(value),
      })

      let min, max, label
      if (Array.isArray(count)) {
        [min, max] = count
        if (min && max) {
          label = `数量 ${min} ~ ${max}张`
        } else if (max) {
          label = `数量 ≤ ${max}张`
        } else if (min) {
          label = `数量 ≥ ${min}张`
        }
      } else if (count !== undefined) {
        max = count
        if (max) {
          label = `数量 ≤ ${max}张`
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
          label = `大小 ${minText} ~ ${maxText}`
        } else if (max) {
          label = `大小 ≤ ${maxText}`
        } else if (min) {
          label = `大小 ≥ ${minText}`
        }
      } else if (size !== undefined) {
        max = size
        if (max) {
          _max = max * MB
          maxText = sizeToText(_max)
          label = `大小 ≤ ${maxText}`
        }
      }

      return { min, max, _min, _max, minText, maxText, label }
    },
    Width() {
      const width = conclude([this.width, globalProps.width], {
        validator: value => equalOrWithin(value),
      })

      let target, min, max, label
      if (Array.isArray(width)) {
        [min, max] = width
        if (min && max) {
          label = `宽度 ${min} ~ ${max}像素`
        } else if (max) {
          label = `宽度 ≤ ${max}像素`
        } else if (min) {
          label = `宽度 ≥ ${min}像素`
        }
      } else if (width !== undefined) {
        target = width
        if (target) {
          label = `宽度 ${target}像素`
        }
      }

      return { target, min, max, label }
    },
    Height() {
      const height = conclude([this.height, globalProps.height], {
        validator: value => equalOrWithin(value),
      })

      let target, min, max, label
      if (Array.isArray(height)) {
        [min, max] = height
        if (min && max) {
          label = `高度 ${min} ~ ${max}像素`
        } else if (max) {
          label = `高度 ≤ ${max}像素`
        } else if (min) {
          label = `高度 ≥ ${min}像素`
        }
      } else if (height !== undefined) {
        target = height
        if (target) {
          label = `高度 ${target}像素`
        }
      }

      return { target, min, max, label }
    },
    dimensionLabel() {
      let t = ''
      if (this.Width.target && this.Height.target) {
        t += `尺寸 ${this.Width.target} × ${this.Height.target}`
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
    AspectRatioTolerance() {
      return conclude([this.aspectRatioTolerance, globalProps.aspectRatioTolerance, 0], {
        type: Number,
      })
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
  mounted() { this.computeIsTipOverflowed() },
  updated() { this.computeIsTipOverflowed() },
  expose: ['openEditor'],
  methods: {
    computeIsTipOverflowed() {
      for (const e of document.querySelectorAll('.el-upload__tip>.el-tooltip>.ellipsis-1')) {
        if (e.offsetWidth < e.scrollWidth) {
          this.isTipOverflowed = true
          return
        }
      }
      this.isTipOverflowed = false
    },
    async httpRequest(output) {
      // output 为编辑产物 (可能未编辑)，可能为二进制或字符串类型
      // res 为上传返回值 (可能未上传)，可能为二进制或字符串类型

      this.uploading = true

      // 如果编辑产物是字符串，则认为是已经是图片链接不需要上传，将编辑产物作为上传返回值
      let res = typeof output === 'string' ? output : this.Upload?.(output)
      if (res instanceof Promise) {
        let err
        [err, res] = await to(res)
        if (err) {
          console.error(err)
          this.$emit('error', err, output, this.$refs.elUploadRef.uploadFiles)
          this.uploading = false
          return
        }
      }

      // 上传返回值为空，且编辑产物为二进制，输出该二进制，附带其 object URL 用于回显
      // 未配置 upload 时也会进入该分支：点击确认会手动调用 httpRequest，output 为 File
      if (!res && output instanceof Blob) {
        output.url = URL.createObjectURL(output)
        this.files.push(output)
      // 输出上传返回值（字符串）
      } else {
        const url = unwrap(res, this.SrcAt)
        if (!url) {
          console.error('upload 的返回值或 srcAt 的解析结果不是有效的图片链接:',
            '\n  res: ', res)
          KiMessageBox.error('上传失败')
          this.$emit('error', '上传失败', output, this.$refs.elUploadRef.uploadFiles)
          return
        }
        this.files.push(wrap(res, url))
      }

      this.emitInput()
      this.$emit('success', res, output, this.$refs.elUploadRef.uploadFiles)
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
      // 自动
      } else if (!this.Arrayed) {
        if (isSingle) {
          newValue = newValue[0]
        }
      }

      this.$emit(model.event, newValue)
    },
    async validateSize(file) {
      if (this.Editable) {
        return true
      }

      let sizeError = false
      file = await toBinary(file)

      if (this.Size.max !== undefined && file.size > this.Size._max) {
        KiMessageBox.warning({
          titleText: `“${file.name}”\n大小超过${this.Size.maxText}`,
          timer: 5000,
        })
        sizeError = true
      } else if (this.Size.min !== undefined && file.size < this.Size._min) {
        KiMessageBox.warning({
          titleText: `“${file.name}”\n大小不足${this.Size.minText}`,
          timer: 5000,
        })
        sizeError = true
      }
      if (sizeError) {
        this.$emit('size-error', file.size)
        return false
      }
      return true
    },
    async validateDimension(file) {
      if (this.Editable) {
        return true
      }

      let eventName
      let eventArgs
      let titleText
      const imageTag = await toImageTag(await toLocalURL(file))

      if (this.Width.target !== undefined && imageTag.width !== this.Width.target) {
        eventName = 'width-error'
        eventArgs = imageTag.width
        titleText = `“${file.name}”\n宽度需为${this.Width.target}像素`
      } else if (this.Height.target !== undefined && imageTag.height !== this.Height.target) {
        eventName = 'height-error'
        eventArgs = imageTag.height
        titleText = `“${file.name}”\n高度需为${this.Height.target}像素`
      } else if (this.Width.max !== undefined && imageTag.width > this.Width.max) {
        eventName = 'width-error'
        eventArgs = imageTag.width
        titleText = `“${file.name}”\n宽度超过${this.Width.max}像素`
      } else if (this.Height.max !== undefined && imageTag.height > this.Height.max) {
        eventName = 'height-error'
        eventArgs = imageTag.height
        titleText = `“${file.name}”\n高度超过${this.Height.max}像素`
      } else if (this.Width.min !== undefined && imageTag.width < this.Width.min) {
        eventName = 'width-error'
        eventArgs = imageTag.width
        titleText = `“${file.name}”\n宽度不足${this.Width.min}像素`
      } else if (this.Height.min !== undefined && imageTag.height < this.Height.min) {
        eventName = 'height-error'
        eventArgs = imageTag.height
        titleText = `“${file.name}”\n高度不足${this.Height.min}像素`
      }
      if (eventName) {
        KiMessageBox.warning({
          titleText,
          timer: 5000,
        })
        this.$emit(eventName, eventArgs)
        return false
      }
      return true
    },
    async openEditor(input) {
      if (!this.Editable) {
        throw new Error('编辑功能已禁用')
      }

      const inputs = Array.isArray(input) ? input : [input]
      const initialCropQueueLength = this.crop.queue.length

      if (this.Count.max !== undefined
        // 判断是否超过数量上限: 已有图片数量 + 编辑队列中图片数量 + 输入图片数量 > 图片数量上限
        && (this.files.length + initialCropQueueLength + inputs.length) > this.Count.max) {
        this.onExceed(inputs, this.$refs.elUploadRef.uploadFiles)
        throw new Error(`图片数量不能超过${this.Count.max}张`)
      }

      for (const source of inputs) {
        if (source) {
          if (typeof source !== 'string' && !(source instanceof Blob)) {
            console.error('不是有效的数据源: ', source)
            return
          }
          if (!await this.validateSize(source)) {
            return
          }
          if (!await this.validateDimension(source)) {
            return
          }
          if (!this.Validator(source)) {
            return
          }
          this.crop.queue.push(source)
        }
      }

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
    async onChange(file, fileList) {
      if (this.Editable) {
        // 不让图片显示在 input 标签中
        this.$refs.elUploadRef.uploadFiles.pop()
        await this.openEditor(file.raw)
      } else {
        if (await this.validateSize(file.raw) && await this.validateDimension(file.raw) && this.Validator(file.raw)) {
          this.httpRequest(file.raw)
        } else {
          // 如果 onChange 里有异步操作，则 length-- 无效
          // this.$refs.elUploadRef.uploadFiles.length--
          this.$refs.elUploadRef.uploadFiles.pop()
        }
      }
      this.$emit('change', file, fileList)
    },
    // 关闭编辑弹窗后，回车可以打开文件选择
    onCropOpen() {
      this.$refs.elUploadRef.$refs[isVue3 ? 'uploadRef' : 'upload-inner'].$el.blur()
    },
    onCropClosed() {
      this.$refs.elUploadRef.$refs[isVue3 ? 'uploadRef' : 'upload-inner'].$el.focus()
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
          // list-type="text" 时，this.$refs.elUploadRef.$el.firstChild 是一个注释节点
          if (this.$refs.elUploadRef.$el.firstChild?.nodeType === Node.ELEMENT_NODE) {
            this.sortablejs = Sortable.create(this.$refs.elUploadRef.$el.firstChild, {
              forceFallback: true,
              animation: 500,
              filter: '.el-upload-list__item-preview, .el-upload-list__item-delete',
              onStart: (e) => {
                document.documentElement.classList.toggle('cursor-grabbing', true)
              },
              onEnd: ({ newIndex, oldIndex }) => {
                if (newIndex !== oldIndex) {
                  this.files.splice(newIndex, 0, this.files.splice(oldIndex, 1)[0])
                  this.emitInput()
                }
                document.documentElement.classList.toggle('cursor-grabbing', false)
              },
            })
          }
        })
      }
    },
    onExceed(files, fileList) {
      KiMessageBox.warning(`图片数量不能超过${this.Count.max}张`)
      this.$emit('exceed', files, fileList)
    },
    onPreview(file) {
      const i = this.$refs.elUploadRef.uploadFiles.indexOf(file)
      if (i >= 0) {
        this.$refs.kiImageRef.viewer.view(i)
      }
      this.$emit('preview', file)
    },
    onBeforeRemove(file, fileList) {
      if (this.Count.min !== undefined && this.files.length <= this.Count.min) {
        KiMessageBox.warning(`图片数量不能低于${this.Count.min}张`)
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

<template>
  <!-- font="leading-initial" 作用：避免 .el-form-item__content { line-height: 40px; } 导致上方出现空隙 -->
  <div
    class="ki-image-upload"
    style="line-height: 12px;"
  >
    <el-upload
      v-show="!Disabled"
      v-loading="uploading"
      style="line-height: initial; display: inline-block; margin-bottom: -8px;"
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
        <slot
          name="tip"
          :size="Size.label"
          :dimension="dimensionLabel"
          :count="Count.label"
          :accept="Accept.label"
        >
          <el-tooltip
            effect="dark"
            placement="bottom"
            :disabled="!isTipOverflowed"
          >
            <template #content>
              <div>
                {{ Count.label }}
              </div>
              <div>
                {{ Size.label }}
              </div>
              <div>
                {{ dimensionLabel }}
              </div>
              <div>
                {{ Accept.label }}
              </div>
            </template>
            <div>
              <div class="ellipsis-1">
                {{ Count.label }}
              </div>
              <div class="ellipsis-1">
                {{ Size.label }}
              </div>
              <div class="ellipsis-1">
                {{ dimensionLabel }}
              </div>
              <div class="ellipsis-1">
                {{ Accept.label }}
              </div>
            </div>
          </el-tooltip>
        </slot>
      </div>
      <slot
        v-if="isVue3"
        name="file"
      />
    </el-upload>

    <KiImage
      v-show="Disabled"
      ref="kiImageRef"
      :value="files"
      :modelValue="files"
      srcAt="url"
    />

    <!-- 不使用 v-model:show="crop.show" 的原因： -->
    <!-- v-model:show 会被 vue 2 识别为 v-model 导致 value 参数校验失败 -->
    <ImgEditor
      :show.sync="crop.show"
      :value="crop.value"
      :width="Width"
      :height="Height"
      :aspectRatioTolerance="AspectRatioTolerance"
      :size="Size"
      :outputType="OutputType"
      @update:show="(e) => { crop.show = e }"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
      @open="onCropOpen"
      @close="onCropClose"
      @closed="onCropClosed"
    />
  </div>
</template>

<style lang="scss">
.ki-image-upload {
  .cursor-grabbing,
  .cursor-grabbing *,
  .cursor-grabbing .canSort .el-upload-list__item-actions {
    cursor: grabbing !important;
  }

  .ellipsis-1 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .el-upload-list--picture-card {
    font-size: 0;

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
    margin-bottom: 8px;

    .el-upload__tip {
      position: absolute;
      margin-top: 0;
      top: 85px;
      width: 100%;
      color: rgba(33, 150, 243, 0.8);
      line-height: 16px;
      transform-origin: top;
      transform: scale(0.9);
      text-align: center;
    }
  }

  .canSort .el-upload-list__item-actions {
    cursor: grab;
  }

  .isFull {
    .el-upload-list--picture-card>.el-upload-list__item:last-child {
      margin-right: 0;
    }

    .el-upload--picture-card {
      display: none;
    }
  }
}
</style>
