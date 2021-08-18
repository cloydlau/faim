<template>
  <div v-if="Show" class="mt-5px flex items-start">
    <i class="el-icon-info text-orange-500 mr-7px text-18px"/>
    <span class="text-13px text-cyan-500 leading-20px">
      <slot/>
    </span>
  </div>
</template>

<script>
import globalProps from './config'
import { getFinalProp } from '../../utils'
import { typeOf } from 'kayran'

export default {
  name: 'form-item-tip',
  inject: {
    elForm: {
      default: {}
    },
  },
  props: {
    show: {
      validator: value => value === '' || typeOf(value) === 'boolean',
    }
  },
  created () {
    console.warn(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}FormItemTip已废弃。`)
  },
  computed: {
    Show () {
      return getFinalProp(this.show, globalProps.show, !Boolean(this.elForm.disabled))
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
