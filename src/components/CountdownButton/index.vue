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
import { conclude } from 'vue-global-config'
import { globalProps, globalAttrs, globalListeners } from './index'

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
      return conclude([
        this.cd,
        globalProps.cd,
        60
      ], {
        name: 'cd',
        type: 'number'
      })
    },
    ElButtonProps () {
      return conclude([this.$attrs, globalAttrs])
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
