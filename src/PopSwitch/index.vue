<template>
  <el-tooltip
    v-bind="ElTooltipProps"
    ref="elTooltip"
  >
    <template #content>
      <div v-html="ElTooltipProps.content" />
    </template>
    <el-popover v-bind="ElPopoverProps">
      <div v-html="ElPopoverProps.content" />
      <template #reference>
        <el-popconfirm
          v-bind="ElPopconfirmProps"
          @confirm="onConfirm"
          @onConfirm="onConfirm"
        >
          <template #reference>
            <el-switch
              v-bind="ElSwitchProps"
              ref="elSwitch"
              :value="value"
              :class="InlinePrompt && 'text-inside'"
              @click.native="onClick"
            />
          </template>
        </el-popconfirm>
      </template>
    </el-popover>
  </el-tooltip>
</template>

<script>
import { conclude } from 'vue-global-config'
import { getCharCount } from '../utils'
import { globalAttrs, globalProps } from './index'

export default {
  name: 'KiPopSwitch',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {},
    inlinePrompt: {
      type: Boolean,
      default: undefined,
    },
    elPopconfirmProps: {},
    elTooltipProps: {},
    elPopoverProps: {},
  },
  emits: ['change'],
  computed: {
    InlinePrompt() {
      return conclude([this.inlinePrompt, globalProps.inlinePrompt, true], {
        type: Boolean,
      })
    },
    ElSwitchProps() {
      return conclude([this.$attrs, globalAttrs], {
        type: Object,
        camelizeObjectKeys: true,
        default: (userProp) => {
          let maxTextWidth = 0;
          ['active-text', 'inactive-text', 'activeText', 'inactiveText'].map((v) => {
            const textWidth = getCharCount(userProp[v])
            if (textWidth > maxTextWidth) {
              maxTextWidth = textWidth
            }
          })
          return {
            ...this.InlinePrompt && { width: 30 + maxTextWidth * 6 },
            ...userProp,
          }
        },
        defaultIsDynamic: true,
      })
    },
    ElPopoverProps() {
      return conclude([
        this.elPopoverProps,
        globalProps.elPopoverProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: userProp => ({
          popperClass: 'pop-switch',
          disabled: !(userProp && (userProp.title || userProp.content)),
        }),
        defaultIsDynamic: true,
      })
    },
    ElPopconfirmProps() {
      return conclude([
        this.elPopconfirmProps,
        globalProps.elPopconfirmProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: userProp => ({
          popperClass: 'pop-switch',
          disabled: [true, ''].includes(this.ElSwitchProps.disabled) || !userProp?.title,
        }),
        defaultIsDynamic: true,
      })
    },
    ElTooltipProps() {
      return conclude([
        this.elTooltipProps,
        globalProps.elTooltipProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: userProp => ({
          // openDelay: 400,
          disabled: !(userProp?.content || this.$slots.elTooltipContent),
        }),
        defaultIsDynamic: true,
      })
    },
  },
  methods: {
    onConfirm() {
      const { checked, inactiveValue, activeValue } = this.$refs.elSwitch
      this.$emit('change', checked ? inactiveValue : activeValue)
    },
    onClick() {
      if (!this.$refs.elTooltip.manual) {
        this.$refs.elTooltip.showPopper = false
      }
      if (this.ElSwitchProps.disabled === false && this.ElPopconfirmProps.disabled) {
        this.onConfirm()
      }
    },
  },
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

<style lang="scss" scoped>
:deep(.text-inside) {
  .el-switch__label * {
    font-size: 12px;
  }

  .el-switch__label--left,
  .el-switch__label--right {
    position: absolute;
    z-index: 1;
    margin: 0;

    &:not(.is-active) {
      display: none;
    }
  }

  .el-switch__label--left {
    left: 23px;
    color: gray !important;
  }

  .el-switch__label--right {
    left: 9px;
    color: white !important;
  }

  .el-switch__core {
    border-radius: 12px;

    &:after {
      top: 1px;
    }
  }

  &:not(.is-checked) .el-switch__core {

    &:after {
      left: 2px;
    }
  }

  &.is-checked .el-switch__core {
    &:after {
      background-color: white;
    }
  }
}
</style>
