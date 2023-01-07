<template>
  <KiFormDialog
    title="编辑图片"
    :show="show"
    append-to-body
    destroy-on-close
    center
    v-on="$listeners"
    @close="$emit('update:show', false)"
    @fullscreen-change="onFullscreenChange"
  >
    <div
      v-loading="loading"
      element-loading-text="图片加载中..."
    >
      <div :style="{ height: `${fullscreen ? '747' : '500'}px` }">
        <img
          ref="cropper"
          style="display: block; max-width: 100%;"
          :src="localURL"
        >
      </div>

      <div
        style="display: flex; flex-direction: column; align-items: center; margin-top: 25px; gap: 10px;"
      >
        <el-button-group>
          <el-button
            icon="el-icon-zoom-in"
            @click.prevent="zoom(0.2)"
          />
          <el-button
            icon="el-icon-zoom-out"
            @click.prevent="zoom(-0.2)"
          />
          <el-button
            icon="el-icon-arrow-left"
            @click.prevent="move(-10, 0)"
          />
          <el-button
            icon="el-icon-arrow-right"
            @click.prevent="move(10, 0)"
          />
          <el-button
            icon="el-icon-arrow-up"
            @click.prevent="move(0, -10)"
          />
          <el-button
            icon="el-icon-arrow-down"
            @click.prevent="move(0, 10)"
          />
          <el-button
            ref="flipX"
            class="flipX"
            icon="el-icon-sort"
            @click.prevent="flipX"
          />
          <el-button
            ref="flipY"
            icon="el-icon-sort"
            @click.prevent="flipY"
          />
          <el-button
            icon="el-icon-refresh-right"
            @click.prevent="rotate(90)"
          />
          <el-button
            icon="el-icon-refresh-left"
            @click.prevent="rotate(-90)"
          />
          <!-- <el-button type="info" @click.prevent="reset" icon="el-icon-refresh"/> -->
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
          @change="() => { isTouched = true }"
        />
      </div>
    </div>

    <template #footer>
      <div style="display: flex; align-items: center; justify-content: end;">
        <el-form
          v-show="(!loading && MustCrop)"
          inline
          style="display: flex;"
        >
          <el-form-item v-if="isLargeResolution">
            <template #label>
              最大分辨率
              <el-tooltip
                effect="dark"
                placement="top"
              >
                <template #content>
                  调低该值可缩小图片体积<br>
                  调高该值可提升清晰度
                </template>
                <i class="el-icon-question" />
              </el-tooltip>
            </template>
            <el-input-number
              v-model="maxResolution"
              class="maxResolution"
              :min="0"
              :step="128"
              size="mini"
            />
          </el-form-item>

          <el-form-item>
            <template #label>
              品质
              <el-tooltip
                effect="dark"
                placement="top"
              >
                <template #content>
                  调低该值可缩小图片体积<br>
                  调高该值可提升清晰度
                </template>
                <i class="el-icon-question" />
              </el-tooltip>
            </template>
            <el-slider
              v-model="quality"
              class="quality"
              :min="0"
              :max="1"
              :step="0.1"
              size="mini"
            />
          </el-form-item>
        </el-form>

        <div v-show="!loading && !MustCrop">
          <el-tag>原图{{ sizeText }}</el-tag>
        </div>

        <el-button
          :disabled="loading"
          style="margin-left: 10px;"
          type="info"
          @click="reset"
        >
          重 置
        </el-button>
        <el-button @click="() => { $emit('cancel') }">
          取 消
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

<script>
import 'cropperjs/dist/cropper.min.css'
import Cropper from 'cropperjs'
import SwalPreset from 'sweetalert2-preset'
import { throttle } from 'lodash-es'
import KiFormDialog from '../FormDialog/index.vue'
import { KB, MB, blobToFile, sizeToText, toBinary, toImageTag, toLocalURL } from './utils'

const initialSettings = () => ({
  sizeThreshold: MB,
  rotateDegree: 0,
  maxResolution: 2560,
  quality: 1,
  isTouched: false,
})

const initialState = () => ({
  ...initialSettings(),
  fullscreen: false,
  binary: null,
  localURL: null,
  imageTag: null,
  cropper: null,
  loading: true,
  submitting: false,
  sizeText: '',
  isLargeResolution: false,
  canvas: {},
  cropBox: {},
})

export default {
  components: { KiFormDialog },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    value: [Blob, File, String],
    aspectRatio: Object,
  },
  data() {
    return initialState()
  },
  computed: {
    Debounce() {
      return this.binary ? Math.min(500, Math.round(this.binary.size / KB)) : 300
    },
    MaxResolution() {
      return this.maxResolution === '' ? Infinity : this.maxResolution
    },
    MustCrop() {
      const { width, height } = this.imageTag
      const originalAspectRatio = width / height

      return this.isTouched || (
        (this.aspectRatio.min !== undefined && originalAspectRatio < this.aspectRatio.min)
        || (this.aspectRatio.max !== undefined && originalAspectRatio > this.aspectRatio.max)
      )
    },
  },
  watch: {
    // 监听 value 不监听 show 是为了兼顾多选的情况
    async value(newValue) {
      if (newValue) {
        try {
          this.binary = await toBinary(newValue)
          this.localURL = await toLocalURL(newValue)
          this.imageTag = await toImageTag(this.localURL)
        } catch (e) {
          SwalPreset.error(e instanceof Error ? e.message : e)
          this.$emit('update:show', false)
          return
        }

        await this.$nextTick()
        this.cropper ??= new Cropper(this.$refs.cropper, {
          'overflow-hidden': true,
          'preview': '.preview',
          'background': true,
          'cropmove': () => { this.isTouched = true },
          'zoom': () => { this.isTouched = true },
          'ready': this.onReady,
        })

        // 大图会卡，加一个节流
        this.updateCropBox = throttle((arg) => {
          this.cropper.rotateTo(arg)
          this.onReady()
        }, this.Debounce, {
          leading: false,
          trailing: true,
        })

        this.sizeText = sizeToText(this.binary.size)

        // 如果是大图，则提供最大分辨率的配置
        const { width, height } = this.imageTag
        const originalAspectRatio = width / height
        this.isLargeResolution = width >= this.maxResolution || height >= this.maxResolution

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
    onFullscreenChange(v) {
      this.fullscreen = v
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
        this.reset()
      })
    },
    onRotateDegreeChange(n) {
      this.updateCropBox(n)
    },
    getSizeDiffText(before, after) {
      const diff = after - before
      const textA = `原图体积${sizeToText(before)}，编辑后${sizeToText(after)}`
      let textB = diff === 0 ? '' : `${(diff / before * 100).toFixed(2)}%`
      if (diff > 0) {
        textB = `+${textB}`
      }
      if (textB) {
        textB = `（${textB}）`
      }
      return textA + textB
    },
    onConfirm() {
      if (this.MustCrop) {
        this.submitting = true
        const { width, height } = this.cropper.getCropBoxData()
        const aspectRatio = width / height
        if ((this.aspectRatio.min !== undefined && aspectRatio < this.aspectRatio.min)
          || (this.aspectRatio.max !== undefined && aspectRatio > this.aspectRatio.max)) {
          SwalPreset.warning(`不符合${this.aspectRatio.label}`)
          this.submitting = false
          return
        }

        this.cropper.getCroppedCanvas({
          // 限制画布大小，限制生成的图片体积
          maxWidth: this.maxResolution,
          maxHeight: this.maxResolution,
        }).toBlob(
          (blob) => {
            // 如果输入为 File 类型，则输出也应为 File 类型，避免 name 丢失
            const binary = this.binary instanceof File
              ? blobToFile(blob, this.binary.name)
              : blob

            const sizeDiffText = this.getSizeDiffText(this.binary.size, binary.size)
            if (binary.size >= this.sizeThreshold && binary.size > this.binary.size) {
              SwalPreset.confirm({
                icon: 'warning',
                html: `<div style="text-align:center">${sizeDiffText}</div>`,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
              }).then(() => {
                this.$emit('confirm', binary)
              })
            } else {
              console.log(sizeDiffText)
              this.$emit('confirm', binary)
            }
            this.submitting = false
          },
          // 如果旋转角度不为直角，则图片一定会出现空白区域，空白区域默认透明，使用 png 格式
          // this.rotateDegree % 90 === 0 ? this.binary.type : 'image/png',
          this.binary.type,
          // 质量
          this.quality,
        )
      } else {
        this.$emit('confirm', this.value)
      }
    },
    /* isTouched () {
      const { width, height, left, top } = this.cropper.getCanvasData()
      const finalData = {
        canvas: { width, height, left, top },
        cropBox: this.cropper.getCropBoxData(),
      }
      for (const k in finalData.canvas) {
        if (this.canvas[k] !== finalData.canvas[k]) {
          return true
        }
      }
      for (const k in finalData.cropBox) {
        if (this.cropBox[k] !== finalData.cropBox[k]) {
          return true
        }
      }
      return false
    }, */
    onReady() {
      const { width, height, left, top } = this.cropper.getCanvasData()
      // this.canvas = { width, height, left, top }
      if (typeof this.aspectRatio.target === 'number') {
        this.cropper.setAspectRatio(this.aspectRatio.target)

        this.$nextTick(() => {
          // 默认裁剪框在图片之内（避免裁剪出白边），也可以放大以完全框住图片（避免遗漏信息）
          const originalRatio = width / height
          // this.cropBox = this.cropper.getCropBoxData()
          if (this.aspectRatio.target > originalRatio) {
            this.cropper.setCropBoxData({ width, left })
            const { width: containerWidth, height: containerHeight } = this.cropper.getContainerData()
            const { width: cropBoxWidth, height: cropBoxHeight } = this.cropper.getCropBoxData() // 不能提前拿
            this.cropper.setCropBoxData({ top: (containerHeight - cropBoxHeight) / 2 })
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
    flipX() {
      this.isTouched = true
      const dom = this.$refs.flipX.$el
      let scale = dom.getAttribute('data-scale')
      scale = scale ? -scale : -1
      this.cropper.scaleX(scale)
      dom.setAttribute('data-scale', scale)
    },
    flipY() {
      this.isTouched = true
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
      this.isTouched = true
      this.cropper.move(offsetX, offsetY)
    },
    reset() {
      Object.assign(this.$data, initialSettings())
      this.cropper.reset()
      this.onReady()
      this.isTouched = false
    },
    rotate(deg) {
      this.isTouched = true
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
      if (!this.data)
        return
      this.cropper.setCropBoxData(JSON.parse(this.data))
    },
    zoom(percent) {
      this.cropper.relativeZoom(percent)
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

<style lang="scss" scoped>
:deep(.flipX>.el-icon-sort) {
  transform: rotate(90deg);
}

:deep(.cropper-point) {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50%;
}

.rotateDegree.el-slider {
  width: 551px;

  :deep(.el-slider__marks-text:last-child) {
    width: 36.406px;
  }
}

.maxResolution.el-input-number {
  width: 105px;
}

.quality.el-slider {
  width: 75px;
}

:deep(.el-form-item__label-wrap) {
  margin-left: unset !important;
}

.el-form-item {
  margin-bottom: unset;
}

:deep(.cropper-hidden) {
  display: none !important;
  max-height: 100% !important;
}
</style>
