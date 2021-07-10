<template>
  <el-tooltip v-bind="ElTooltipProps" ref="elTooltip">
    <div slot="content" v-html="ElTooltipProps.content"/>
    <el-popover v-bind="ElPopoverProps">
      <div v-html="ElPopoverProps.content"/>
      <el-popconfirm
        slot="reference"
        @confirm="$emit('click', $event)"
        @onConfirm="$emit('click', $event)"
        v-bind="ElPopconfirmProps"
      >
        <el-button
          slot="reference"
          class="pop-button"
          v-bind="ElButtonProps"
          @click="onClick"
        >
          <slot/>
        </el-button>
      </el-popconfirm>
    </el-popover>
  </el-tooltip>
</template>

<script>
import globalProps from './config'
import { getFinalProp } from '../../utils'

export default {
  name: 'PopButton',
  props: {
    elPopconfirmProps: Object,
    elTooltipProps: Object,
    elPopoverProps: Object,
  },
  data () {
    return {}
  },
  computed: {
    ElButtonProps () {
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
        popperClass: 'pop-button',
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
        disabled: !Boolean(result?.content),
        ...result,
      }
    },
  },
  methods: {
    onClick (e) {
      this.$refs.elTooltip.showPopper = false
      if (this.ElPopconfirmProps.disabled) {
        this.$emit('click', e)
      }
    },
  }
}
</script>

<!--<style lang="scss">
.el-popconfirm__main {
  margin-top: 5px;
}
</style>-->

<style lang="scss" scoped>
.pop-button {
  margin-right: 5px;

  &:not(:first-of-type) {
    margin-left: 10px;
  }

  &.is-circle {
    // 固定原型按钮尺寸
    width: 36px;
    height: 36px;
    padding: 0;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    // 设置图标大小
    // & /deep/ *{
    //     font-size: 16px;
    // }
  }
}
</style>

<style lang="scss">
.pop-button {
  &.el-popover {
    min-width: fit-content;
  }

  & .el-popconfirm__main {
    margin-block-start: .5em;
  }
}
</style>
