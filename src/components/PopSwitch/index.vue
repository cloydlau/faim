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
          :class="TextInside&&'text-inside'"
        />
      </el-popconfirm>
    </el-popover>
  </el-tooltip>
</template>

<script>
import globalConfig from './config'
import { getCharCount } from '../../utils'
import { getFinalProp, getGlobalAttrs } from 'kayran'

export default {
  name: 'KiPopSwitch',
  props: {
    value: {},
    textInside: {
      type: Boolean,
      default: undefined
    },
    elPopconfirmProps: {},
    elTooltipProps: {},
    elPopoverProps: {},
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    TextInside () {
      return getFinalProp([
        this.textInside,
        globalConfig.textInside,
        true
      ], {
        type: 'boolean'
      })
    },
    ElSwitchProps () {
      const result = getFinalProp([
        this.$attrs,
        getGlobalAttrs(globalConfig, this.$props)
      ])

      let maxTextWidth = 0;
      ['active-text', 'inactive-text', 'activeText', 'inactiveText'].map(v => {
        let textWidth = getCharCount(result[v])
        if (textWidth > maxTextWidth) {
          maxTextWidth = textWidth
        }
      })

      return {
        ...this.TextInside && { width: 30 + maxTextWidth * 7 },
        ...result
      }
    },
    ElPopoverProps () {
      const result = getFinalProp([
        this.elPopoverProps,
        globalConfig.elPopoverProps,
      ], {
        type: 'object'
      })
      const { title, content } = result || {}
      return {
        popperClass: 'pop-switch',
        disabled: !Boolean(title || content),
        ...result,
      }
    },
    ElPopconfirmProps () {
      const result = getFinalProp([
        this.elPopconfirmProps,
        globalConfig.elPopconfirmProps,
      ], {
        type: 'object'
      })
      return {
        popperClass: 'pop-switch',
        disabled: !Boolean(result?.title),
        ...result,
      }
    },
    ElTooltipProps () {
      const result = getFinalProp([
        this.elTooltipProps,
        globalConfig.elTooltipProps,
      ], {
        type: 'object'
      })
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
    .el-switch__label--left, .el-switch__label--right {
      position: absolute;
      top: 0;
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
        top: .5px;
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
