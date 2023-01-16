<template>
  <el-tooltip v-bind="ElTooltipProps">
    <template #content>
      <template v-if="Slots['tooltip-content']">
        <component
          v-if="isGlobalSlot(Slots['tooltip-content'])"
          :is="Slots['tooltip-content']()"
        />
        <slot
          v-else
          name="tooltip-content"
        />
      </template>
      <div
        v-else-if="ElTooltipProps.rawContent"
        v-html="ElTooltipProps.content"
      />
      <div
        v-else
        v-text="ElTooltipProps.content"
      />
    </template>
    <span>
      <el-popover
        v-bind="ElPopoverConfig.attrs"
        v-on="ElPopoverConfig.listeners"
      >
        <template v-if="Slots['popover-content']">
          <component
            v-if="isGlobalSlot(Slots['popover-content'])"
            :is="Slots['popover-content']()"
          />
          <slot
            v-else
            name="popover-content"
          />
        </template>
        <div
          v-else-if="ElPopoverConfig.attrs.rawContent"
          v-html="ElPopoverConfig.attrs.content"
        />
        <div
          v-else
          v-text="ElPopoverConfig.attrs.content"
        />
        <template #reference>
          <span>
            <el-popconfirm
              v-bind="ElPopconfirmConfig.attrs"
              v-on="ElPopconfirmConfig.listeners"
              @confirm="onConfirm"
              @on-confirm="onConfirm"
            >
              <template #reference>
                <el-switch
                  v-bind="ElSwitchProps"
                  :class="{
                    'ki-switch': !isVue3,
                    'inline-prompt': InlinePrompt,
                  }"
                  @click.native="onClick"
                />
              </template>
            </el-popconfirm>
          </span>
        </template>
      </el-popover>
    </span>
  </el-tooltip>
</template>

<script>
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import { getListeners, isGlobalSlot } from '../utils'
import { getCharCount } from './utils'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'change',
}

const boolProps = [
  'inlinePrompt',
]

export default {
  name: 'KiPopSwitch',
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
  model,
  props: {
    [model.prop]: {},
    elPopconfirmProps: {},
    elTooltipProps: {},
    elPopoverProps: {},
    ...Object.fromEntries(Array.from(boolProps, boolProp => [boolProp, {
      type: Boolean,
      default: undefined,
    }])),
  },
  data() {
    return {
      isVue3,
    }
  },
  emits: [model.event, 'confirm'],
  computed: {
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    Slots() {
      return conclude([isVue3 ? this.$slots : this.$scopedSlots, globalSlots])
    },
    ElTooltipProps() {
      return conclude([
        this.elTooltipProps,
        globalProps.elTooltipProps,
        { ref: 'elTooltipRef' },
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
    ElPopoverConfig() {
      return resolveConfig(conclude([
        this.elPopoverProps,
        globalProps.elPopoverProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: userProp => ({
          disabled: !(userProp && (userProp.title || userProp.content)),
        }),
        defaultIsDynamic: true,
      }))
    },
    ElPopconfirmConfig() {
      return resolveConfig(conclude([
        this.elPopconfirmProps,
        globalProps.elPopconfirmProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: userProp => ({
          disabled: [true, ''].includes(this.ElSwitchProps.disabled) || !userProp?.title,
        }),
        defaultIsDynamic: true,
      }))
    },
    InlinePrompt() {
      return conclude([this.inlinePrompt, globalProps.inlinePrompt, false], {
        type: Boolean,
      })
    },
    ElSwitchProps() {
      return conclude([
        {
          [model.prop]: this[model.prop],
          inlinePrompt: this.InlinePrompt,
        },
        this.$attrs,
        globalAttrs,
        { ref: 'elSwitchRef' },
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: (userProp) => {
          let maxTextWidth = 0;
          ['active-text', 'inactive-text', 'activeText', 'inactiveText'].forEach((v) => {
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
  },
  methods: {
    isGlobalSlot,
    onClick() {
      if (!this.$refs[this.ElTooltipProps.ref].manual) {
        this.$refs[this.ElTooltipProps.ref].showPopper = false
      }
      if (![true, ''].includes(this.ElSwitchProps.disabled) && this.ElPopconfirmConfig.attrs.disabled) {
        this.onConfirm()
      }
    },
    onConfirm(...e) {
      this.$emit('confirm', ...e)
      this.$emit(model.event, this.$refs[this.ElSwitchProps.ref].checked
        ? (this.ElSwitchProps.inactiveValue ?? false)
        : (this.ElSwitchProps.activeValue ?? true))
    },
  },
}
</script>

<style lang="scss" scoped>
// 兼容 Vue 2.6
// TODO: Vue 3 中报警告
::v-deep .ki-switch.inline-prompt {
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
    border-radius: 12px !important;

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
