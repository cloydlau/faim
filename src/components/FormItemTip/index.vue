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
  computed: {
    Show () {
      return getFinalProp(globalProps.show, this.show === '' ? true : this.show, !this.elForm.disabled)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
