<template>
  <el-dialog
    title='摄像头'
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    v-bind="$attrs"
    v-on="$listeners"
    :visible.sync="show"
    :before-close="()=>{$emit('update:show', false)}"
  >
    <div v-loading="initializing">
      <div class="relative">
        <video ref="video" class="w-full h-full"/>
        <Screenshot ref="screenshot" @finish="()=>{performing=false}"/>
      </div>

      <slot name="footer">
        <div slot="footer" class="flex justify-between p-0 pt-30px">
          <div>
            <canvas ref="canvas" :width="width" :height="height" class="hidden"></canvas>
            <PicViewer :waterfall="false" ref="picViewer" :value="base64" style="font-size:0"/>
          </div>
          <div>
            <el-button
              @click="photograph"
              :disabled="error"
              :loading="Loading"
              icon="el-icon-camera"
            >
              拍 照
            </el-button>
            <el-button type="primary" @click="confirm">
              确 定
            </el-button>
          </div>
        </div>
      </slot>
    </div>
  </el-dialog>
</template>

<script>
import globalProps from './config'
import { getFinalProp } from '../../utils'
import { error, info, warning } from '../Swal'
import PicViewer from 'pic-viewer'
import Screenshot from './Screenshot.vue'
const prefix = `[Camera] `

export default {
  name: 'Camera',
  components: { PicViewer, Screenshot },
  props: {
    show: Boolean,
    count: {
      type: [Number, Array],
      default: 1
    }
  },
  data () {
    return {
      error: false,
      initializing: true,
      loading: false,
      performing: false,
      base64: null,
      blob: null,
      file: null,
      width: 1600,
      height: 1200,
    }
  },
  watch: {
    show: {
      immediate: true,
      handler (newVal) {
        if (newVal) {
          this.$nextTick(() => {
            if (navigator.mediaDevices) {
              if (navigator.mediaDevices.getUserMedia) { // 标准的API
                navigator.mediaDevices.getUserMedia({
                  video: true
                }).then((mediaStream) => {
                  let video = this.$refs.video
                  try {
                    video.srcObject = mediaStream
                  } catch (error) {
                    video.src = window.URL.createObjectURL(mediaStream)
                  }
                  video.onloadedmetadata = (e) => {
                    // Do something with the video here.
                    video.play()
                  }
                }).catch((err) => {
                  this.error = true
                  this.err()
                  console.error(err)
                }).finally(() => {
                  this.initializing = false
                })
              } else if (navigator.mediaDevices.webkitGetUserMedia) { // WebKit
                navigator.mediaDevices.webkitGetUserMedia({
                  video: true
                }).then((mediaStream) => {
                  let video = this.$refs.video
                  video.src = window.URL.createObjectURL(mediaStream)
                  video.onloadedmetadata = (e) => {
                    // Do something with the video here.
                    video.play()
                  }
                }).catch((err) => {
                  this.error = true
                  this.err()
                  console.error(err)
                }).finally(() => {
                  this.initializing = false
                })
              }
            }
          })
        }
      }
    },
  },
  computed: {
    canvasCtx () {
      return this.$refs.canvas.getContext('2d')
    },
    maxCount () {
      if (this.count) {
        return typeof this.count === 'number' ? this.count : this.count[1]
      }
    },
    minCount () {
      if (Array.isArray(this.count)) {
        return this.count[0]
      }
    },
    Count () {
      return this.file ?
        Array.isArray(this.file) ?
          this.file.length :
          1 :
        0
    },
    Loading () {
      return !(!this.performing && !this.loading)
    }
  },
  methods: {
    err () {
      error({
        titleText: '调用摄像头失败',
        html: `
        <ol class="list-disc">
          <li>请确保摄像头已正确配置 win10系统可在【相机】应用查看</li>
          <li>建议使用最新版现代浏览器如 Chrome / Edge / Firefox</li>
          <li>浏览器提示申请使用摄像头时 请点击【允许】</li>
        </ol>
      `,
      })
    },
    confirm () {
      if (this.minCount && this.minCount > this.Count) {
        warning(`至少拍摄${this.Count}张`)
        return
      }

      this.$emit('confirm', {
        base64: this.base64,
        blob: this.blob,
        file: this.file
      })
      this.$emit('update:show', false)
    },
    reset () {
      this.base64 = null
      this.blob = null
      this.file = null
    },
    async photograph () {
      if (this.maxCount > 1 && this.maxCount === this.Count) {
        warning(`最多拍摄${this.Count}张`)
        return
      }

      this.loading = true
      if (this.maxCount === 1) {
        this.reset()
      }

      let blob, file, base64

      await new Promise((resolve, reject) => {
        this.$refs.canvas.toBlob(blob__ => {
          blob = blob__
          file = new File([blob__], String(new Date().valueOf()), { type: blob__.type })
          resolve()
        }, 'image/png') //第三个参数为质量 默认＜1
      })

      this.canvasCtx.drawImage(this.$refs.video, 0, 0, this.width, this.height)
      base64 = this.$refs.canvas.toDataURL()

      this.$refs.screenshot.perform(base64)

      if (this.maxCount > 1) {
        if (Array.isArray(this.blob)) {
          this.blob.push(blob)
          this.file.push(file)
          this.base64.push(base64)
        } else {
          this.blob = [blob]
          this.file = [file]
          this.base64 = [base64]
        }
      } else {
        this.blob = blob
        this.file = file
        this.base64 = base64
      }

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 7.5px 20px 30px 20px;
}

::v-deep .pic-viewer {
  & > ul.normal-flow {
    height: unset;

    > li {
      margin-bottom: 0;

      img {
        height: 38px !important;
      }
    }
  }
}
</style>
