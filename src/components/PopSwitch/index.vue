<template>
  <el-tooltip v-bind="ElTooltipProps" ref="elTooltip">
    <div slot="content" v-html="ElTooltipProps.content"/>
    <el-popover v-bind="ElPopoverProps">
      <div v-html="ElPopoverProps.content"/>
      <el-popconfirm
        slot="reference"
        @confirm="onConfirm"
        @onConfirm="onConfirm"
        v-bind="ElPopconfirmProps"
      >
        <el-switch
          slot="reference"
          v-bind="ElSwitchProps"
          ref="elSwitch"
          :value="value"
          @click.native="onClick"
        />
      </el-popconfirm>
    </el-popover>
  </el-tooltip>
</template>

<script>
import globalProps from './config'
import { getFinalProp } from '../../utils'

export default {
  name: 'PopSwitch',
  props: {
    value: {},
    elPopconfirmProps: Object,
    elTooltipProps: Object,
    elPopoverProps: Object,
  },
  computed: {
    ElSwitchProps () {
      return getFinalProp(
        this.$attrs,
        globalProps
      )
    },
    ElPopoverProps () {
      const result = getFinalProp(
        this.elPopoverProps,
        globalProps.elPopoverProps,
      )
      const { title, content } = result || {}
      return {
        popperClass: 'pop-switch',
        disabled: !Boolean(title || content),
        ...result,
      }
    },
    ElPopconfirmProps () {
      const result = getFinalProp(
        this.elPopconfirmProps,
        globalProps.elPopconfirmProps,
      )
      return {
        popperClass: 'pop-switch',
        disabled: !Boolean(result?.title),
        ...result,
      }
    },
    ElTooltipProps () {
      const result = getFinalProp(
        this.elTooltipProps,
        globalProps.elTooltipProps,
      )
      return {
        //openDelay: 400,
        disabled: !Boolean(result?.content || this.$scopedSlots.elTooltipContent),
        ...result,
      }
    },
  },
  methods: {
    onConfirm () {
      const { checked, inactiveValue, activeValue } = this.$refs.elSwitch
      this.$emit('change', checked ? inactiveValue : activeValue)
    },
    onClick () {
      this.$refs.elTooltip.showPopper = false
    }
  }
}
</script>

<style lang="scss">
.pop-switch {
  &.el-popover {
    min-width: fit-content;
  }

  & .el-popconfirm__main {
    margin-block-start: .5em;
  }
}
</style>
