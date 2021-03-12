<template>
  <el-dialog
    title='摄像头'
    :visible.sync="show"
    :before-close="()=>{$emit('update:show', false)}"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    v-on="$listeners"
  >
    <div v-loading="loading">
      <video ref="video" class="w-full h-full"/>

      <slot name="footer">
        <div slot="footer" class="flex justify-between p-0 pt-30px">
          <div>
            <canvas ref="canvas" :width="width" :height="height" class="hidden"></canvas>
            <PicViewer ref="picViewer" :value="base64" style="font-size:0"/>
          </div>
          <div>
            <el-button @click="photograph" :disabled="error" icon="el-icon-camera">
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
import { error, info } from '../Swal'
import PicViewer from 'pic-viewer'
const prefix = `[Camera] `

export default {
  name: 'Camera',
  components: { PicViewer },
  props: {
    show: Boolean,
  },
  data () {
    return {
      error: false,
      loading: true,
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
                  error(err.name)
                  console.error(err)
                }).finally(() => {
                  this.loading = false
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
                  error(err.name)
                  console.error(err)
                }).finally(() => {
                  this.loading = false
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
    }
  },
  mounted () {
    //info('如网页左上角提示申请使用摄像头 请点击【允许】')
  },
  methods: {
    confirm () {
      this.$emit('change', {
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
    photograph () {
      this.reset()
      this.$refs.canvas.toBlob(blob => {
        this.blob = blob
        this.file = new File([blob], String(new Date().valueOf()), { type: blob.type })
      }, 'image/png') //第三个参数为质量 默认＜1
      this.canvasCtx.drawImage(this.$refs.video, 0, 0, this.width, this.height)
      this.base64 = this.$refs.canvas.toDataURL()
      //this.$refs.picViewer.preview()
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 7.5px 20px 30px 20px;
}

::v-deep .pic-viewer img {
  height: 38px !important;
}
</style>
