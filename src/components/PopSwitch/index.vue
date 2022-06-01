<template>
  <el-tooltip v-bind="ElTooltipProps" ref="elTooltip">
    <div slot="content" v-html="ElTooltipProps.content" />
    <el-popover v-bind="ElPopoverProps">
      <div v-html="ElPopoverProps.content" />
      <el-popconfirm slot="reference" @confirm="onConfirm"
        @onConfirm="onConfirm" v-bind="ElPopconfirmProps">
        <el-switch slot="reference" v-bind="ElSwitchProps" ref="elSwitch"
          :value="value" @click.native="onClick"
          :class="TextInside && 'text-inside'" />
      </el-popconfirm>
    </el-popover>
  </el-tooltip>
</template>

<script>
import { globalProps, globalAttrs } from './index'
import { getCharCount } from '../../utils'
import { conclude } from 'vue-global-config'

export default {
  name: 'KiPopSwitch',
  props: {
    value: {},
    textInside: {},
    elPopconfirmProps: {},
    elTooltipProps: {},
    elPopoverProps: {},
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    TextInside() {
      return conclude([
        [true, ''].includes(this.textInside) ? true : this.textInside,
        globalProps.textInside,
        true
      ], {
        name: 'textInside',
        type: 'boolean'
      })
    },
    ElSwitchProps() {
      return conclude([this.$attrs, globalAttrs], {
        default: userProp => {
          let maxTextWidth = 0;
          ['active-text', 'inactive-text', 'activeText', 'inactiveText'].map(v => {
            let textWidth = getCharCount(userProp[v])
            if (textWidth > maxTextWidth) {
              maxTextWidth = textWidth
            }
          })
          return {
            ...this.TextInside && { width: 30 + maxTextWidth * 7 },
            ...userProp
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
        name: 'elPopoverProps',
        type: 'object',
        default: userProp => ({
          popperClass: 'pop-switch',
          disabled: !Boolean(userProp && (userProp.title || userProp.content)),
        }),
        defaultIsDynamic: true,
      })
    },
    ElPopconfirmProps() {
      return conclude([
        this.elPopconfirmProps,
        globalProps.elPopconfirmProps,
      ], {
        name: 'elPopconfirmProps',
        type: 'object',
        default: userProp => ({
          popperClass: 'pop-switch',
          disabled: [true, ''].includes(this.ElSwitchProps.disabled) || !Boolean(userProp?.title),
        }),
        defaultIsDynamic: true,
      })
    },
    ElTooltipProps() {
      return conclude([
        this.elTooltipProps,
        globalProps.elTooltipProps,
      ], {
        name: 'elTooltipProps',
        type: 'object',
        default: userProp => ({
          //openDelay: 400,
          disabled: !Boolean(userProp?.content || this.$scopedSlots.elTooltipContent),
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

<style lang="scss" scoped>
::v-deep {
  .text-inside {
    .el-switch__label * {
      font-size: 12px;
    }

    .el-switch__label--left,
    .el-switch__label--right {
      position: absolute;
      top: -1px;
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
}
</style>
