<template>
  <span @click.capture="$emit('click',$event)">
    <el-button
      v-bind="$attrs"
      @click="send"
      :disabled="remaining>0"
    >
      <slot :remaining="remaining">
        {{ buttonText }}
      </slot>
    </el-button>
  </span>
</template>

<script>
export default {
  name: 'SmsButton',
  props: {
    cd: {
      type: Number,
      default: 60
    }
  },
  data () {
    return {
      buttonText: '发送验证码',
      remaining: 0,
    }
  },
  methods: {
    send (e) {
      this.remaining = this.cd

      const updateBtnText = () => {
        --this.remaining
        if (this.remaining === 0) {
          clearInterval(interval)
          this.buttonText = '发送验证码'
        } else {
          this.buttonText = this.remaining + '秒后可重新获取'
        }
      }

      updateBtnText()
      const interval = setInterval(updateBtnText, 1000)
    }
  }
}
</script>
