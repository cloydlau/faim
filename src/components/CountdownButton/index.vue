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
import { getFinalProp } from 'kayran'
import globalConfig from './config'

export default {
  name: 'KiCountdownButton',
  props: {
    cd: {}
  },
  data () {
    return {
      buttonText: '发送验证码',
      remaining: 0,
    }
  },
  computed: {
    Cd () {
      return getFinalProp([
        this.cd,
        globalConfig.cd,
        60
      ], {
        type: 'number'
      })
    }
  },
  methods: {
    send (e) {
      this.remaining = this.Cd

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
