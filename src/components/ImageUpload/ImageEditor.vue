<script>
import 'cropperjs/dist/cropper.min.css'
import Cropper from 'cropperjs'
import { throttle } from 'lodash-es'
import UPNG from 'upng-js'
import { useEventListener } from '@vueuse/core'
import { isVue3 } from 'vue-demi'
import FaMessageBox from '../MessageBox'
import FaFormDialog from '../FormDialog/index.vue'
import { binaryToArrayBuffer, blobToFile, sizeToLabel, toBinary, toImageTag, toLocalURL } from '../../utils'

function initialSettings() {
  return {
    rotateDegree: 0,
    quality: 1,
    isAspectRatioLocked: false,
  }
}

function initialState() {
  return {
    ...initialSettings(),
    fullscreen: false,
    binary: null,
    cnum: null,
    localURL: null,
    imageTag: null,
    loading: false,
    cropper: null,
    originalSizeLabel: '',
    inputWidth: undefined,
    inputHeight: undefined,
    flippedX: false,
    flippedY: false,
    isVue3,
  }
}

export default {
  components: { FaFormDialog },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    value: [Blob, File, String],
    outputType: String,
    size: Object,
    width: Object,
    height: Object,
    aspectRatio: Object,
    resolution: Object,
    validator: Function,
    locale: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:show', 'confirm'],
  data() {
    return initialState()
  },
  computed: {
    Debounce() {
      return 100
      // return this.binary ? Math.min(500, Math.round(this.binary.size)) : 300
    },
    sizeTooltip() {
      return this.getSizeTooltip(this.binary)
    },
    isWidthSpecified() {
      return Boolean(this.width.target)
    },
    isHeightSpecified() {
      return Boolean(this.height.target)
    },
    // 传参指定的比例
    specifiedAspectRatio() {
      if (this.width.target && this.height.target) {
        return this.width.target / this.height.target
      }
      return this.aspectRatio.target
    },
    isAspectRatioSpecified() {
      return Boolean(this.specifiedAspectRatio)
    },
    specifiedAspectRatioLabel() {
      return this.aspectRatio.targetLabel && ` (${this.aspectRatio.targetLabel})`
    },
    // 用户输入的比例
    impliedAspectRatio() {
      if (this.inputWidth && this.inputHeight) {
        return this.inputWidth / this.inputHeight
      }
      return null
    },
    // 锁定的比例
    lockedAspectRatio() {
      return this.specifiedAspectRatio || this.impliedAspectRatio
    },
    isCompressible() {
      return ['image/jpeg', 'image/png', 'image/webp'].includes(this.binary?.type)
    },
  },
  watch: {
    // 监听 value 不监听 show 是为了兼顾多选的情况
    async value(newValue) {
      if (newValue) {
        this.loading = true

        try {
          this.binary = await toBinary(newValue)
          this.localURL = await toLocalURL(newValue)
          this.imageTag = await toImageTag(this.localURL)
          this.imageTag.aspectRatio = this.imageTag.width / this.imageTag.height
          if (this.binary.type === 'image/png') {
            const { depth } = UPNG.decode(await binaryToArrayBuffer(this.binary))
            this.cnum = 2 ** depth
          }
        } catch (e) {
          console.error(e)
          this.$emit('update:show', false)
          FaMessageBox.error({
            titleText: this.locale.loadError,
            text: e,
          })
          return
        }

        await this.$nextTick()
        // Vue 2 中，二次打开时，不覆盖的话，会导致图片溢出
        if (!this.cropper || !isVue3) {
          this.cropper = new Cropper(this.$refs.cropper, {
            'overflow-hidden': true,
            'preview': '.preview',
            'background': true,
            'ready': this.initCropBox,
          })
        }

        this.initSetting()

        // 大图会卡，加一个节流
        this.updateCropBox = throttle((arg) => {
          // 可能编辑器已关闭
          if (this.cropper) {
            this.cropper.rotateTo(arg)
            this.initCropBox()
          }
        }, this.Debounce, {
          leading: false,
          trailing: true,
        })

        this.originalSizeLabel = sizeToLabel(this.binary.size)

        this.cropper.replace(this.localURL) // replace 后触发 initCropBox（参数为 Base64 类型才会触发）
      } else {
        this.$nextTick(() => {
          Object.assign(this.$data, initialState())
        })
      }
    },
    rotateDegree(n) {
      this.onRotateDegreeChange(n)
    },
  },
  mounted() {
    // fix: 在 webpack 项目中会报错，但不影响正常使用
    try {
      useEventListener(window, 'resize', throttle(() => {
        if (this.show && !this.loading && !this.submitting) {
          this.reset()
        }
      }, 100, {
        leading: false,
        trailing: true,
      }))

      useEventListener(document, 'keydown', (e) => {
        if (this.show && !this.loading && !this.submitting) {
          if (e.key === 'Enter') {
            this.onConfirm()
          }
        }
      })
    } catch (e) {
      console.error(e)
    }
  },
  methods: {
    initSetting() {
      if (this.isAspectRatioSpecified) {
        this.cropper.setAspectRatio(this.specifiedAspectRatio)
        this.isAspectRatioLocked = true
      }
      let defaultWidth = this.imageTag.width
      let defaultHeight = this.imageTag.height
      if (this.isAspectRatioLocked && this.lockedAspectRatio) {
        // 高图
        if (this.lockedAspectRatio > defaultWidth / defaultHeight) {
          defaultHeight = this.lockedAspectRatio * this.imageTag.width
        // 扁图
        } else {
          defaultWidth = this.lockedAspectRatio * this.imageTag.height
        }
      }
      this.inputWidth = this.width.target ?? defaultWidth
      this.inputHeight = this.height.target ?? defaultHeight
      // 1 会导致图片在尺寸降低的基础上，大小不降反增
      this.$nextTick(() => {
        this.quality = (this.sizeTooltip || this.shouldCrop()) ? 0.92 : 1
      })
    },
    // 先设置裁剪框的比例，后设置裁剪框的位置
    initCropBox() {
      // 图片信息
      const { width, height, left, top } = this.cropper.getCanvasData()
      // 锁定比例时，默认裁剪框在图片之内（避免裁剪出白边），也可以放大以完全框住图片（避免遗漏信息）
      // 比例可能是参数锁定的，也可能是用户锁定的
      if (this.isAspectRatioLocked && this.lockedAspectRatio) {
        // 高图
        if (this.lockedAspectRatio > width / height) {
          this.cropper.setCropBoxData({ width, left })
          const { height: containerHeight } = this.cropper.getContainerData()
          const { height: cropBoxHeight } = this.cropper.getCropBoxData() // 不能提前拿
          this.cropper.setCropBoxData({ top: (containerHeight - cropBoxHeight) / 2 })
          // 扁图
        } else {
          this.cropper.setCropBoxData({ height, top })
          const { width: containerWidth } = this.cropper.getContainerData()
          const { width: cropBoxWidth } = this.cropper.getCropBoxData() // 不能提前拿
          this.cropper.setCropBoxData({ left: (containerWidth - cropBoxWidth) / 2 })
        }
        this.loading = false
      // 不锁定比例时，裁剪框正好框住图片
      } else {
        this.cropper.setCropBoxData({ width, height, left, top })
        this.loading = false
      }
    },
    onWidthChange() {
      if (this.isAspectRatioSpecified && this.impliedAspectRatio !== this.specifiedAspectRatio) {
        this.inputHeight = (this.inputWidth ?? 0) / this.specifiedAspectRatio
      }
      // 清空宽高时，取消锁定
      if (!this.impliedAspectRatio) {
        this.isAspectRatioLocked = false
      }
      this.onIsAspectRatioSpecifiedChange()
    },
    onHeightChange() {
      if (this.isAspectRatioSpecified && this.impliedAspectRatio !== this.specifiedAspectRatio) {
        this.inputWidth = (this.inputHeight ?? 0) / this.specifiedAspectRatio
      }
      // 清空宽高时，取消锁定
      if (!this.impliedAspectRatio) {
        this.isAspectRatioLocked = false
      }
      this.onIsAspectRatioSpecifiedChange()
    },
    onIsAspectRatioSpecifiedChange() {
      this.cropper.setAspectRatio(this.isAspectRatioLocked ? this.impliedAspectRatio : null)
      this.initCropBox()
    },
    onFullscreenChange(v) {
      this.fullscreen = v
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    },
    onRotateDegreeChange(n) {
      this.updateCropBox(n)
    },
    getSizeDiffText(before, after) {
      const diff = after - before
      const textA = this.locale.sizeTip
        .replaceAll('{inputSize}', this.originalSizeLabel)
        .replaceAll('{outputSize}', sizeToLabel(after))
      let textB = diff === 0 ? '' : `${Number.parseFloat((diff / before * 100).toFixed(2))}%`
      if (diff > 0) {
        textB = `+${textB}`
      }
      if (textB) {
        textB = `（${textB}）`
      }
      return textA + textB
    },
    getSizeTooltip(binary) {
      if (binary) {
        if (this.size.max && this.size.max < binary.size) {
          // return `大小上限为${this.size.maxLabel}，${(this.isWidthSpecified || this.isHeightSpecified) ? (this.quality === 0 ? '原图过大，请更换图片' : '请降低图片品质') : '请降低图片尺寸或品质'}`
          return this.locale.maxSizeExceeded.replaceAll('{maxSize}', this.size.maxLabel)
        }
        if (this.size.min && this.size.min > binary.size) {
          // return `大小下限为${this.size.minLabel}，${(this.isWidthSpecified || this.isHeightSpecified) ? (this.quality === 1 ? '原图过小，请更换图片' : '请提升图片品质') : '请提升图片尺寸或品质'}`
          return this.locale.minSizeExceeded.replaceAll('{minSize}', this.size.minLabel)
        }
      }
    },
    shouldCrop() {
      // 可能编辑器已关闭
      if (!this.cropper) {
        return false
      }
      const canvasData = this.cropper.getCanvasData()
      const cropBoxData = this.cropper.getCropBoxData()
      // 裁剪框移动了
      return canvasData.width !== cropBoxData.width
        || canvasData.height !== cropBoxData.height
        || canvasData.top !== cropBoxData.top
        || canvasData.left !== cropBoxData.left
        // 旋转了
        || this.rotateDegree !== 0
        // 调节品质了
        || this.quality !== 1
        // 横向翻转了
        || this.flippedX
        // 纵向翻转了
        || this.flippedY
        // 设置的尺寸和原图不一致了
        || (this.inputWidth && this.inputWidth !== this.imageTag.width)
        || (this.inputHeight && this.inputHeight !== this.imageTag.height)
        // 原图尺寸不满足配置的尺寸极值了
        || (this.width.min && this.width.min > this.imageTag.width)
        || (this.width.max && this.width.max < this.imageTag.width)
        || (this.height.min && this.height.min > this.imageTag.height)
        || (this.height.max && this.height.max < this.imageTag.height)
        // 锁定比例和原图比例不一致了
        || (this.lockedAspectRatio && this.lockedAspectRatio !== this.imageTag.aspectRatio)
        // 指定了输出格式
        || Boolean(this.outputType)
    },
    onConfirm() {
      return new Promise((resolve, reject) => {
        // 在输出之前进行 宽度 & 高度 & 分辨率 & 比例校验
        // 主要是针对极值的校验，如果是指定固定值，是禁止编辑的
        // 格式不需要校验，根据 outputType 进行输出即可
        // 大小和自定义校验在输出后进行
        const outputWidth = this.inputWidth ?? this.imageTag.width
        const outputHeight = this.inputHeight ?? this.imageTag.height
        const outputResolution = outputWidth * outputHeight
        if (!(
          this.width.validate(outputWidth)
          && this.height.validate(outputHeight)
          && this.resolution.validate(outputResolution)
          && this.aspectRatio.validate(this.specifiedAspectRatio || this.impliedAspectRatio)
        )) {
          reject(new Error('Validation failed'))
          return
        }
        // 如果改变了裁剪框，或比例不符，或尺寸不符，则处理图片，否则上传原图
        if (this.shouldCrop()) {
          this.submitting = true
          const canvas = this.cropper.getCroppedCanvas({
            minWidth: this.width.min,
            width: this.inputWidth,
            maxWidth: this.width.max,
            minHeight: this.height.min,
            height: this.inputHeight,
            maxHeight: this.height.max,
          })
          if (this.binary.type === 'image/png') {
            try {
              const imgs = [canvas.getContext('2d').getImageData(0, 0, this.inputWidth, this.inputHeight).data.buffer]
              // this.submitting = true 视图不更新
              setTimeout(() => {
                const arrayBuffer = UPNG.encode(
                  imgs,
                  this.inputWidth,
                  this.inputHeight,
                  // cnum ≤ 1 时无损
                  this.quality === 1 ? 0 : Math.max(Math.floor(this.cnum * this.quality), 2),
                )
                this.doConfirm(new Blob([arrayBuffer]), resolve, reject)
              }, 0)
            } catch (e) {
              FaMessageBox.error(this.locale.exportError)
              this.submitting = false
              reject(e)
            }
          } else {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  this.doConfirm(blob, resolve, reject)
                } else {
                  FaMessageBox.error(this.locale.exportError)
                  this.submitting = false
                  reject(new Error(this.locale.exportError))
                }
              },
              // 如果旋转角度不为直角，则图片一定会出现空白区域，空白区域默认透明，使用 png 格式
              // this.rotateDegree % 90 === 0 ? this.binary.type : 'image/png',
              this.outputType || this.binary.type,
              // 质量
              // jpg 默认 0.92，webp 默认 0.8
              this.quality,
            )
          }
        } else {
          // 大小校验
          if (this.sizeTooltip) {
            FaMessageBox.warning({
              html: `<div style="text-align:center">${this.sizeTooltip}</div>`,
            })
            reject(new Error(this.sizeTooltip))
          // 自定义校验
          } else if (!this.validator(this.binary)) {
            reject(new Error('Validation failed'))
          } else {
            this.reset()
            this.$emit('confirm', this.value)
            // Closing is decided by the parent component based on the length of queue
            resolve({ show: true })
          }
        }
      })
    },
    doConfirm(blob, resolve, reject) {
      // 如果输入为 File 类型，则输出也应为 File 类型，避免 name 丢失
      const binary = this.binary instanceof File
        ? blobToFile(blob, this.binary.name, this.outputType)
        : blob

      // 大小校验
      const sizeDiffText = this.getSizeDiffText(this.binary.size, binary.size)
      const sizeTooltip = this.getSizeTooltip(binary)
      if (sizeTooltip) {
        FaMessageBox.warning({
          html: `<div style="text-align:center">${sizeDiffText}</div>
                 <div style="text-align:center">${sizeTooltip}</div>`,
        })
        reject(new Error(sizeTooltip))
      // 自定义校验
      } else if (!this.validator(binary)) {
        reject(new Error('Validation failed'))
      } else {
        console.log(sizeDiffText)
        this.reset()
        this.$emit('confirm', binary)
        // Closing is decided by the parent component based on the length of queue
        resolve({ show: true })
      }

      this.submitting = false
    },
    flipX() {
      this.flippedX = !this.flippedX
      const dom = this.$refs.flipX.$el
      let scale = dom.getAttribute('data-scale')
      scale = scale ? -scale : -1
      this.cropper.scaleX(scale)
      dom.setAttribute('data-scale', scale)
    },
    flipY() {
      this.flippedY = !this.flippedY
      const dom = this.$refs.flipY.$el
      let scale = dom.getAttribute('data-scale')
      scale = scale ? -scale : -1
      this.cropper.scaleY(scale)
      dom.setAttribute('data-scale', scale)
    },
    getCropBoxData() {
      this.data = JSON.stringify(this.cropper.getCropBoxData(), null, 4)
    },
    getData() {
      this.data = JSON.stringify(this.cropper.getData(), null, 4)
    },
    move(offsetX, offsetY) {
      this.cropper.move(offsetX, offsetY)
    },
    reset() {
      Object.assign(this.$data, initialSettings())
      this.cropper.reset()
      this.initSetting()
      this.initCropBox()
    },
    rotate(deg) {
      const sum = this.rotateDegree + deg
      if (sum > 180) {
        this.rotateDegree = sum - 360
      } else if (sum < -180) {
        this.rotateDegree = sum + 360
      } else {
        this.rotateDegree = sum
      }
      this.onRotateDegreeChange(this.rotateDegree)
      // this.cropper.rotate(deg)
    },
    setCropBoxData() {
      if (this.data) {
        this.cropper.setCropBoxData(JSON.parse(this.data))
      }
    },
    zoom(percent) {
      this.cropper.zoom(percent)
    },
    /* setData() {
      if (!this.data)
        return
      this.cropper.setData(JSON.parse(this.data))
    }, */
    /* setImage(e) {
      const file = e.target.files[0]
      if (!file.type.includes('image/')) {
        alert('Please select an image file')
        return
      }
      if (typeof FileReader === 'function') {
        const reader = new FileReader()
        reader.onload = (event) => {
          this.src = event.target.result
          // rebuild cropperjs with the updated source
          this.cropper.replace(event.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Sorry, FileReader API not supported')
      }
    }, */
    /* showFileChooser() {
      this.$refs.input.click()
    }, */
  },
}
</script>

<template>
  <FaFormDialog
    :title="locale.edit"
    :show="show"
    append-to-body
    destroy-on-close
    center
    class="fa-image-editor"
    custom-class="fa-image-editor"
    :retrieving="loading"
    :confirm="onConfirm"
    showResetButton
    :reset="reset"
    :locale="locale"
    @fullscreen-change="onFullscreenChange"
    @update:show="(e) => { $emit('update:show', e) }"
    v-on="isVue3 ? {} : $listeners"
  >
    <div
      :style="{ height: `${fullscreen ? '700' : '500'}px`, overflow: 'hidden' }"
    >
      <img
        ref="cropper"
        :src="localURL"
        style="display: block; max-width: 100%"
      >
    </div>

    <div
      style="display: flex; flex-direction: column; align-items: center; margin-top: 25px; gap: 10px;"
    >
      <el-button-group>
        <el-button @click.prevent="zoom(0.1)">
          <el-icon v-if="isVue3"><ZoomIn /></el-icon>
          <i
            v-else
            class="el-icon-zoom-in"
          />
        </el-button>
        <el-button @click.prevent="zoom(-0.1)">
          <el-icon v-if="isVue3"><ZoomOut /></el-icon>
          <i
            v-else
            class="el-icon-zoom-out"
          />
        </el-button>
        <el-button @click.prevent="move(-1, 0)">
          <el-icon v-if="isVue3"><ArrowLeft /></el-icon>
          <i
            v-else
            class="el-icon-arrow-left"
          />
        </el-button>
        <el-button @click.prevent="move(1, 0)">
          <el-icon v-if="isVue3"><ArrowRight /></el-icon>
          <i
            v-else
            class="el-icon-arrow-right"
          />
        </el-button>
        <el-button @click.prevent="move(0, -1)">
          <el-icon v-if="isVue3"><ArrowUp /></el-icon>
          <i
            v-else
            class="el-icon-arrow-up"
          />
        </el-button>
        <el-button @click.prevent="move(0, 1)">
          <el-icon v-if="isVue3"><ArrowDown /></el-icon>
          <i
            v-else
            class="el-icon-arrow-down"
          />
        </el-button>
        <el-button
          ref="flipX"
          class="flipX"
          @click.prevent="flipX"
        >
          <el-icon v-if="isVue3"><Sort /></el-icon>
          <i
            v-else
            class="el-icon-sort"
          />
        </el-button>
        <el-button
          ref="flipY"
          @click.prevent="flipY"
        >
          <el-icon v-if="isVue3"><Sort /></el-icon>
          <i
            v-else
            class="el-icon-sort"
          />
        </el-button>
        <el-button @click.prevent="rotate(90)">
          <el-icon v-if="isVue3"><RefreshRight /></el-icon>
          <i
            v-else
            class="el-icon-refresh-right"
          />
        </el-button>
        <el-button @click.prevent="rotate(-90)">
          <el-icon v-if="isVue3"><RefreshLeft /></el-icon>
          <i
            v-else
            class="el-icon-refresh-left"
          />
        </el-button>
      </el-button-group>

      <el-slider
        v-model="rotateDegree"
        :style="{ visibility: loading ? 'hidden' : 'visible' }"
        class="rotateDegree"
        show-input
        :debounce="Debounce"
        :min="-180"
        :max="180"
        :marks="{
          '0': '0°',
          '-180': '-180°',
          '180': '180°',
        }"
      />
    </div>

    <el-form
      v-show="!loading"
      inline
      :style="{ 'marginTop': isVue3 ? '25px' : '15px', 'display': 'flex', 'justify-content': 'center', 'align-items': 'center' }"
    >
      <el-form-item>
        <template #label>
          {{ locale.accept }}
        </template>
        <template v-if="binary">
          <el-tag v-if="outputType && outputType !== binary.type">
            <span style="color: #a8abb2;">{{ binary.type }}</span> ➜ {{ outputType }}
          </el-tag>
          <el-tag v-else>
            {{ binary.type }}
          </el-tag>
        </template>
      </el-form-item>

      <el-form-item>
        <template #label>
          {{ locale.size }}
        </template>
        <el-tooltip
          v-if="Boolean(originalSizeLabel)"
          :disabled="!sizeTooltip"
          effect="dark"
          placement="top"
        >
          <template #content>
            {{ sizeTooltip }}
          </template>
          <el-tag
            v-if="originalSizeLabel"
            :type="sizeTooltip ? 'danger' : 'success'"
          >
            {{ originalSizeLabel }}
          </el-tag>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <template #label>
          {{ locale.width }}
        </template>
        <el-input-number
          v-model="inputWidth"
          class="dimension"
          :min="width.min ?? 1"
          :max="width.max"
          :disabled="isWidthSpecified"
          :step="100"
          :size="isVue3 ? 'small' : 'mini'"
          @change="onWidthChange"
        />
      </el-form-item>

      <el-form-item>
        <template #label>
          {{ locale.height }}
        </template>
        <el-input-number
          v-model="inputHeight"
          class="dimension"
          :min="height.min ?? 1"
          :max="height.max"
          :disabled="isHeightSpecified"
          :step="100"
          :size="isVue3 ? 'small' : 'mini'"
          @change="onHeightChange"
        />
      </el-form-item>
      <el-form-item>
        <template #label>
          {{ locale.fixedAspectRatio }}<span style="color: #a8abb2; white-space: pre;">{{ specifiedAspectRatioLabel }}</span>
        </template>
        <el-switch
          v-model="isAspectRatioLocked"
          :disabled="isAspectRatioSpecified"
          @change="onIsAspectRatioSpecifiedChange"
        />
      </el-form-item>

      <el-form-item>
        <template #label>
          {{ locale.quality }}
        </template>
        <el-slider
          v-model="quality"
          :disabled="!isCompressible"
          class="quality"
          :min="0"
          :max="1"
          :step="0.01"
          :size="isVue3 ? 'small' : 'mini'"
        />
      </el-form-item>
    </el-form>
  </FaFormDialog>
</template>

<style lang="scss" scoped>
// .el-icon-sort 针对 vue2，.el-icon 针对 vue3
.rotateDegree.el-slider {
  width: 551px;
}

.quality.el-slider {
  width: 100px;
}

.dimension.el-input-number {
  width: 105px !important;
}

.el-form-item {
  margin-bottom: unset;
}

.el-form--inline .el-form-item {
  margin-right: 12px;
}
</style>

<style lang="scss">
.fa-image-editor {
  .flipX>span>.el-icon-sort, .flipX>span>.el-icon {
    transform: rotate(90deg);
  }

  &.el-dialog {
    min-width: 1000px !important;
  }

  .cropper-point {
    width: 8px !important;
    height: 8px !important;
    border-radius: 50%;
  }

  .rotateDegree.el-slider .el-slider__marks-text:last-child {
    width: 36.406px;
  }

  .el-form-item__label-wrap {
    margin-left: unset !important;
  }

  .cropper-hidden {
    display: none !important;
    max-height: 100% !important;
  }
}
</style>
