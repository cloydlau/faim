<template>
  <div @click.capture="$emit('click',$event)">
    <el-button @click="send" :disabled="buttonText!=='发送验证码'">
      {{buttonText}}
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'SmsButton',
  data () {
    return {
      buttonText: '发送验证码'
    }
  },
  methods: {
    send (e) {
      let countDown = 60

      const updateBtnText = () => {
        --countDown
        if (countDown === 0) {
          clearInterval(interval)
          this.buttonText = '发送验证码'
        } else {
          this.buttonText = countDown + '秒后重新获取'
        }
      }

      updateBtnText()
      const interval = setInterval(updateBtnText, 1000)
    }
  }
}
</script>
