<script>
import 'cropperjs/dist/cropper.min.css'
import Cropper from 'cropperjs'
import KiMessageBox from '../MessageBox'
import { throttle } from 'lodash-es'
import UPNG from 'upng-js'
import { useEventListener } from '@vueuse/core'
import { isVue3 } from 'vue-demi'
import KiFormDialog from '../FormDialog/index.vue'
import { binaryToArrayBuffer, blobToFile, sizeToText, toBinary, toImageTag, toLocalURL } from './utils'

function initialSettings() {
  return {
    rotateDegree: 0,
    quality: 1,
    aspectRatioSpecified: false,
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
    cropper: null,
    loading: true,
    submitting: false,
    originalSizeText: '',
    outputWidth: undefined,
    outputHeight: undefined,
    flippedX: false,
    flippedY: false,
    isVue3,
  }
}

export default {
  components: { KiFormDialog },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    value: [Blob, File, String],
    width: Object,
    height: Object,
    aspectRatioTolerance: Number,
    size: Object,
    outputType: String,
  },
  emits: ['update:show', 'confirm', 'cancel'],
  data() {
    return initialState()
  },
  computed: {
    Debounce() {
      return 100
      // return this.binary ? Math.min(500, Math.round(this.binary.size / KB)) : 300
    },
    sizeTooltip() {
      return this.getSizeTooltip(this.binary)
    },
    aspectRatio() {
      if (this.outputWidth && this.outputHeight) {
        return this.outputWidth / this.outputHeight
      }
      return null
    },
    widthSpecified() {
      return Boolean(this.width.target)
    },
    heightSpecified() {
      return Boolean(this.height.target)
    },
    dimensionSpecified() {
      return this.widthSpecified && this.heightSpecified
    },
    isCompressible() {
      return ['image/jpeg', 'image/webp', 'image/png'].includes(this.binary?.type)
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
          KiMessageBox.error(e instanceof Error ? e.message : e)
          this.$emit('update:show', false)
          return
        }

        await this.$nextTick()
        // Vue 2 中，二次打开时，不覆盖的话，会导致图片溢出
        if (!this.cropper || !isVue3) {
          this.cropper = new Cropper(this.$refs.cropper, {
            'overflow-hidden': true,
            'preview': '.preview',
            'background': true,
            'ready': this.onReady,
          })
        }

        this.initDimension()

        // 大图会卡，加一个节流
        this.updateCropBox = throttle((arg) => {
          this.cropper.rotateTo(arg)
          this.onReady()
        }, this.Debounce, {
          leading: false,
          trailing: true,
        })

        this.originalSizeText = sizeToText(this.binary.size)

        this.cropper.replace(this.localURL) // replace 后触发 onReady（参数为 Base64 类型才会触发）
      } else {
        Object.assign(this.$data, initialState())
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
    } catch (e) { }
  },
  methods: {
    onReady() {
      const { width, height, left, top } = this.cropper.getCanvasData()
      // this.canvas = { width, height, left, top }
      if (this.aspectRatioSpecified && this.aspectRatio) {
        this.$nextTick(() => {
          // 默认裁剪框在图片之内（避免裁剪出白边），也可以放大以完全框住图片（避免遗漏信息）
          // this.cropBox = this.cropper.getCropBoxData()
          // 扁图
          if (this.aspectRatio > width / height) {
            this.cropper.setCropBoxData({ width, left })
            const { width: containerWidth, height: containerHeight } = this.cropper.getContainerData()
            const { width: cropBoxWidth, height: cropBoxHeight } = this.cropper.getCropBoxData() // 不能提前拿
            this.cropper.setCropBoxData({ top: (containerHeight - cropBoxHeight) / 2 })
            // 高图
          } else {
            this.cropper.setCropBoxData({ height, top })
            const { width: containerWidth, height: containerHeight } = this.cropper.getContainerData()
            const { width: cropBoxWidth, height: cropBoxHeight } = this.cropper.getCropBoxData() // 不能提前拿
            this.cropper.setCropBoxData({ left: (containerWidth - cropBoxWidth) / 2 })
          }
          this.loading = false
        })
      } else {
        // this.cropBox = { ...this.canvas }
        this.cropper.setCropBoxData({ width, height, left, top })
        this.loading = false
      }
    },
    initDimension() {
      this.outputWidth = this.width.target ?? this.imageTag.width
      this.outputHeight = this.height.target ?? this.imageTag.height

      if (this.dimensionSpecified) {
        this.cropper.setAspectRatio(this.width.target / this.height.target)
        this.aspectRatioSpecified = true
      }
    },
    onAspectRatioSpecifiedChange() {
      if (!this.aspectRatio) {
        this.aspectRatioSpecified = false
      }
      this.cropper.setAspectRatio(this.aspectRatioSpecified ? this.aspectRatio : null)
      this.onReady()
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
      const textA = `原图大小${this.originalSizeText}，编辑后${sizeToText(after)}`
      let textB = diff === 0 ? '' : `${(diff / before * 100).toFixed(2)}%`
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
        if (this.size._max && this.size._max < binary.size) {
          return `大小上限为${this.size.maxText}，${(this.widthSpecified || this.heightSpecified) ? (this.quality === 0 ? '原图过大，请更换图片' : '请降低图片品质') : '请降低图片尺寸或品质'}`
        }
        if (this.size._min && this.size._min > binary.size) {
          return `大小下限为${this.size.minText}，${(this.widthSpecified || this.heightSpecified) ? (this.quality === 1 ? '原图过小，请更换图片' : '请提升图片品质') : '请提升图片尺寸或品质'}`
        }
      }
    },
    shouldCrop() {
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
        || (this.outputWidth && this.outputWidth !== this.imageTag.width)
        || (this.outputHeight && this.outputHeight !== this.imageTag.height)
        // 原图尺寸不满足配置的尺寸极值了
        || (this.width.min && this.width.min > this.imageTag.width)
        || (this.width.max && this.width.max < this.imageTag.width)
        || (this.height.min && this.height.min > this.imageTag.height)
        || (this.height.max && this.height.max < this.imageTag.height)
        // 设置的比例和原图比例之差超过配置的公差了
        || (this.aspectRatio && Math.abs(this.aspectRatio - this.imageTag.aspectRatio) > this.aspectRatioTolerance)
        // 指定了输出格式
        || this.outputType
    },
    onConfirm() {
      // 如果改变了裁剪框，或比例不符，或尺寸不符，则处理图片，否则上传原图
      if (this.shouldCrop()) {
        this.submitting = true
        const canvas = this.cropper.getCroppedCanvas({
          minWidth: this.width.min,
          width: this.outputWidth,
          maxWidth: this.width.max,
          minHeight: this.height.min,
          height: this.outputHeight,
          maxHeight: this.height.max,
        })
        if (this.binary.type === 'image/png') {
          const imgs = [canvas.getContext('2d').getImageData(0, 0, this.outputWidth, this.outputHeight).data.buffer]
          // this.submitting = true 视图不更新
          setTimeout(() => {
            const arrayBuffer = UPNG.encode(
              imgs,
              this.outputWidth,
              this.outputHeight,
              // cnum ≤ 1 时无损
              this.quality === 1 ? 0 : Math.max(Math.floor(this.cnum * this.quality), 2),
            )
            this.doConfirm(new Blob([arrayBuffer]))
          }, 0)
        } else {
          canvas.toBlob(
            (blob) => { this.doConfirm(blob) },
            // 如果旋转角度不为直角，则图片一定会出现空白区域，空白区域默认透明，使用 png 格式
            // this.rotateDegree % 90 === 0 ? this.binary.type : 'image/png',
            this.outputType || this.binary.type,
            // 质量
            this.quality,
          )
        }
      } else {
        const sizeTooltip = this.getSizeTooltip(this.binary)
        if (sizeTooltip) {
          KiMessageBox.warning({
            html: `<div style="text-align:center">${sizeTooltip}</div>`,
          })
        } else {
          this.$emit('confirm', this.value)
        }
      }
    },
    doConfirm(blob) {
      if (!blob) {
        KiMessageBox.error('导出失败，请尝试降低图片尺寸')
        this.submitting = false
        return
      }

      // 如果输入为 File 类型，则输出也应为 File 类型，避免 name 丢失
      const binary = this.binary instanceof File
        ? blobToFile(blob, this.binary.name, this.outputType)
        : blob

      const sizeDiffText = this.getSizeDiffText(this.binary.size, binary.size)
      const sizeTooltip = this.getSizeTooltip(binary)
      if (sizeTooltip) {
        KiMessageBox.warning({
          html: `<div style="text-align:center">${sizeDiffText}</div>
                     <div style="text-align:center">${sizeTooltip}</div>`,
        })
      } else {
        console.log(sizeDiffText)
        this.$emit('confirm', binary)
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
      this.initDimension()
      this.onAspectRatioSpecifiedChange()
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
  <KiFormDialog
    title="编辑图片"
    :show="show"
    append-to-body
    destroy-on-close
    center
    class="ki-image-editor"
    @update:show="$emit('update:show', false)"
    @fullscreen-change="onFullscreenChange"
  >
    <div
      v-loading="loading"
      element-loading-text="图片加载中..."
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
    </div>

    <el-form
      v-show="!loading"
      inline
      :style="{ 'marginTop': isVue3 ? '25px' : '15px', 'display': 'flex', 'justify-content': 'center', 'align-items': 'center' }"
    >
      <el-form-item>
        <template #label>
          原图大小
        </template>
        <el-tooltip
          v-if="Boolean(originalSizeText)"
          :disabled="Boolean(!sizeTooltip)"
          effect="dark"
          placement="top"
        >
          <template #content>
            {{ sizeTooltip }}
          </template>
          <el-tag
            v-if="originalSizeText"
            :type="sizeTooltip ? 'danger' : 'success'"
          >
            {{ originalSizeText }}
          </el-tag>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <template #label>
          宽度
        </template>
        <el-tooltip
          effect="dark"
          placement="top"
          :disabled="!widthSpecified"
        >
          <template #content>
            宽度限制为{{ width.target }}像素
          </template>
          <el-input-number
            v-model="outputWidth"
            class="dimension"
            :min="width.min ?? 1"
            :max="width.max"
            :disabled="widthSpecified"
            :step="100"
            :size="isVue3 ? 'small' : 'mini'"
            @change="onAspectRatioSpecifiedChange"
          />
        </el-tooltip>
      </el-form-item>

      <el-form-item>
        <template #label>
          高度
        </template>
        <el-tooltip
          effect="dark"
          placement="top"
          :disabled="!heightSpecified"
        >
          <template #content>
            高度限制为{{ height.target }}像素
          </template>
          <el-input-number
            v-model="outputHeight"
            class="dimension"
            :min="height.min ?? 1"
            :max="height.max"
            :disabled="heightSpecified"
            :step="100"
            :size="isVue3 ? 'small' : 'mini'"
            @change="onAspectRatioSpecifiedChange"
          />
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <template #label>
          锁定裁剪比例
        </template>
        <el-tooltip
          effect="dark"
          placement="top"
        >
          <template #content>
            <span v-if="!outputWidth && !outputHeight">请先输入图片宽高</span>
            <span v-else-if="!outputWidth">请先输入图片宽度</span>
            <span v-else-if="!outputHeight">请先输入图片高度</span>
            <span v-else>按照宽高比锁定裁剪框比例</span>
          </template>
          <el-switch
            v-model="aspectRatioSpecified"
            :disabled="dimensionSpecified"
            @change="onAspectRatioSpecifiedChange"
          />
        </el-tooltip>
      </el-form-item>

      <el-form-item>
        <template #label>
          品质
        </template>
        <el-tooltip
          effect="dark"
          placement="top"
          :disabled="isCompressible"
        >
          <template #content>
            仅 .jpg,.jpeg,.png,.webp 格式支持压缩
          </template>
          <el-slider
            v-model="quality"
            :disabled="!isCompressible"
            class="quality"
            :min="0"
            :max="1"
            :step="0.1"
            :size="isVue3 ? 'small' : 'mini'"
          />
        </el-tooltip>
      </el-form-item>
    </el-form>
    <template #footer>
      <div
        style="display: flex; align-items: center; justify-content: flex-end;"
      >
        <el-button @click="() => { $emit('cancel') }">
          取 消
        </el-button>
        <el-button
          :disabled="loading"
          style="margin-left: 10px;"
          type="info"
          @click="reset"
        >
          重 置
        </el-button>
        <el-button
          :disabled="loading"
          type="primary"
          :loading="submitting"
          @click="onConfirm"
        >
          确 定
        </el-button>
      </div>
    </template>
  </KiFormDialog>
</template>

<style lang="scss" scoped>
// .el-icon-sort 针对 vue2，.el-icon 针对 vue3
.rotateDegree.el-slider {
  width: 551px;
}

.quality.el-slider {
  width: 75px;
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
.ki-image-editor {
  .flipX>.el-icon-sort, .flipX>span>.el-icon {
    transform: rotate(90deg);
  }

  .el-dialog {
    min-width: 850px;
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
