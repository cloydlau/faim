<template>
  <el-tooltip v-bind="ElTooltipProps" ref="elTooltip" class="pop-button">
    <div slot="content" v-html="ElTooltipProps.content" />
    <el-popover v-bind="ElPopoverProps">
      <div v-html="ElPopoverProps.content" />
      <el-popconfirm
        slot="reference" v-bind="ElPopconfirmProps" @confirm="$emit('click', $event)"
        @onConfirm="$emit('click', $event)"
      >
        <el-button slot="reference" v-bind="ElButtonProps" @click="onClick">
          <slot />
        </el-button>
      </el-popconfirm>
    </el-popover>
  </el-tooltip>
</template>

<script>
import { conclude } from 'vue-global-config'
import { globalAttrs, globalProps } from './index'

export default {
  name: 'KiPopButton',
  props: {
    elPopconfirmProps: {},
    elTooltipProps: {},
    elPopoverProps: {},
  },
  computed: {
    ElButtonProps() {
      return conclude([this.$attrs, globalAttrs], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
    ElPopoverProps() {
      const result = conclude([
        this.elPopoverProps,
        globalProps.elPopoverProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
      const { title, content } = result || {}
      return {
        disabled: !(title || content),
        ...result,
      }
    },
    ElPopconfirmProps() {
      const result = conclude([
        this.elPopconfirmProps,
        globalProps.elPopconfirmProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
      return {
        popperClass: 'pop-button-popper',
        disabled: !result?.title,
        ...result,
      }
    },
    ElTooltipProps() {
      const result = conclude([
        this.elTooltipProps,
        globalProps.elTooltipProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
      return {
        // openDelay: 400,
        disabled: !result?.content,
        ...result,
      }
    },
  },
  methods: {
    onClick(e) {
      if (!this.$refs.elTooltip.manual) {
        this.$refs.elTooltip.showPopper = false
      }
      if (this.ElPopconfirmProps.disabled) {
        this.$emit('click', e)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.pop-button {
  &+.pop-button {
    margin-left: 10px;
  }

  .el-button.is-circle {
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
.pop-button-popper {
  &.el-popover {
    min-width: fit-content;
  }

  &.el-popconfirm__main {
    margin-block-start: .5em;
  }
}
</style>
