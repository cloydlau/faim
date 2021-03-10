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
    <video ref="video" autoplay="" style='width:640px;height:480px'/>

    <div style="height: 80px;display: flex;align-items: flex-end;justify-content: center;">
      <el-button-group>
        <el-button @click="photograph"/>
      </el-button-group>
    </div>

    <canvas ref="canvas" width="640" height="480"/>
  </el-dialog>
</template>

<script>
export default {
  name: 'Camera',
  props: {
    show: Boolean,
  },
  data () {
    return {}
  },
  mounted () {
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
        }).catch((err) => { console.log(err.name) })
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
        }).catch((err) => { console.log(err.name) })
      }
    }
  },
  methods: {
    photograph () {
      this.$refs.canvas.drawImage(this.$refs.video, 0, 0, 640, 480)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
