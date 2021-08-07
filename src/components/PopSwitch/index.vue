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
import globalProps from './config'
import { getCharCount, getFinalProp } from '../../utils'
import { typeOf } from 'kayran'

export default {
  name: 'PopSwitch',
  props: {
    value: {},
    textInside: {
      validator: value => value === '' || ['boolean'].includes(typeOf(value)),
    },
    elPopconfirmProps: Object,
    elTooltipProps: Object,
    elPopoverProps: Object,
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    TextInside () {
      return getFinalProp(this.textInside, globalProps.textInside, true)
    },
    ElSwitchProps () {
      const result = getFinalProp(
        this.$attrs,
        globalProps
      )

      let maxTextWidth = 0;
      ['active-text', 'inactive-text', 'activeText', 'inactiveText'].map(v => {
        let textWidth = getCharCount(result[v])
        if (textWidth > maxTextWidth) {
          maxTextWidth = textWidth
        }
      })

      return {
        ...this.TextInside && { width: 40 + maxTextWidth * 7 },
        ...result
      }
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
      left: 26px;
      color: gray !important;
    }

    .el-switch__label--right {
      left: 12px;
      color: white !important;
    }

    .el-switch__core {
      height: 24px;
      border-radius: 12px;

      &:after {
        top: 2px;
        width: 18px;
        height: 18px;
      }
    }

    &:not(.is-checked) .el-switch__core {
      //background: white;
      //border-color: #A9A9A9;

      &:after {
        //background-color: #A9A9A9;
        left: 2px;
      }
    }

    &.is-checked .el-switch__core {
      &:after {
        background-color: white;
        margin-left: -20px;
      }
    }
  }
}
</style>
