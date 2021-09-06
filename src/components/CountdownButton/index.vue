<template>
  <span @click.capture="$emit('click',$event)">
    <el-button
      v-bind="ElButtonProps"
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
import { getFinalProp, getGlobalAttrs } from 'kayran'
import globalConfig from './config'

export default {
  name: 'KiCountdownButton',
  props: {
    cd: {},
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
        name: 'cd',
        type: 'number'
      })
    },
    ElButtonProps () {
      return getFinalProp([
        this.$attrs,
        getGlobalAttrs(globalConfig, this.$props)
      ])
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
