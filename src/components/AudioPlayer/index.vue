<template>
  <span>
    <audio v-if="inline"
           v-bind="props"
    >
      您的浏览器不支持HTML5，建议升级到新版Chrome或Edge
    </audio>
    <el-dialog
      v-else-if="show"
      title="音频播放"
      :visible.sync="show"
      :close-on-click-modal="false"
      append-to-body
      :before-close="()=>{$emit('update:show', false)}"
      destroy-on-close
    >
      <audio style="width:100%"
             v-bind="props"
      >
        您的浏览器不支持HTML5，建议升级到新版Chrome或Edge
      </audio>
    </el-dialog>
  </span>
</template>

<script>
export default {
  name: 'AudioPlayer',
  props: {
    show: Boolean,
    inline: Boolean
  },
  computed: {
    props () {
      return {
        autoplay: !this.inline,
        controls: true,
        loop: true,
        ...this.$attrs
      }
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
