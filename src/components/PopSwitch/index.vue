<script>
import { debounce } from 'lodash-es'
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import { isGlobalSlot } from '../../utils'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

const boolProps = [
  'inlinePrompt',
]

const boolAttrs = [
  'disabled',
  'loading',
  'validateEvent',
]

export default {
  name: 'FaPopSwitch',
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, { props: this.props, camelizePropNames: true })
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
    ...Object.fromEntries(Array.from(boolProps, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
    ...Object.fromEntries(Array.from(boolAttrs, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: [model.event, 'confirm', 'change'],
  data() {
    return {
      isVue3,
      onConfirm() {},
    }
  },
  computed: {
    Slots() {
      return conclude([isVue3 ? this.$slots : this.$scopedSlots, globalSlots])
    },
    ElTooltipConfig() {
      return resolveConfig(conclude([
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
      }))
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
        { ref: 'elPopconfirmRef' },
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: userProp => ({
          disabled: this.disabled || !userProp?.title,
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
        Object.fromEntries(
          Array.from(boolAttrs, boolAttr => [boolAttr, conclude([this[boolAttr], globalProps[boolAttr]])]).filter(
            ([, item]) => item !== undefined,
          ),
        ),
        this.$attrs,
        globalAttrs,
        { ref: 'elSwitchRef' },
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: (userProp) => {
          let maxTextWidth = 0;
          ['active-text', 'inactive-text', 'activeText', 'inactiveText'].forEach((v) => {
            const textWidth = this.getCharCount(userProp[v])
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
  mounted() {
    this.onConfirm = debounce((...e) => {
      const value = this.$refs[this.ElSwitchProps.ref].checked
        ? (this.ElSwitchProps.inactiveValue ?? false)
        : (this.ElSwitchProps.activeValue ?? true)
      this.$emit(model.event, value)
      this.$emit('confirm', ...e)
      this.$emit('change', value)
    }, this.$refs[this.ElPopconfirmConfig.attrs.ref]?.hideAfter ?? 200)
  },
  methods: {
    isGlobalSlot,
    onClick(...e) {
      if (!this.$refs[this.ElTooltipConfig.attrs.ref].manual) {
        this.$refs[this.ElTooltipConfig.attrs.ref].showPopper = false
      }
      if (!this.disabled && this.ElPopconfirmConfig.attrs.disabled) {
        this.onConfirm(...e)
      }
    },
    getCharCount(text) {
      let count = 0
      if (text) {
        for (const v of text) {
          count += v.charCodeAt(0) > 255 ? 2 : 1
        }
      }
      return count
    },
  },
}
</script>

<template>
  <span>
    <el-tooltip v-bind="ElTooltipConfig.attrs">
      <template #content>
        <template v-if="Slots['tooltip-content']">
          <component
            :is="Slots['tooltip-content']()"
            v-if="isGlobalSlot(Slots['tooltip-content'])"
          />
          <slot
            v-else
            name="tooltip-content"
          />
        </template>
        <!-- vue 3 中，element-plus & v-html 支持渲染原生元素，不支持渲染组件 -->
        <!-- vue 2 中，element-ui 不支持将 content 当作 html 处理，v-html 待测试 -->
        <div
          v-else-if="ElTooltipConfig.attrs.rawContent"
          v-html="ElTooltipConfig.attrs.content"
        />
        <div
          v-else
          v-text="ElTooltipConfig.attrs.content"
        />
      </template>
      <span>
        <el-popover
          v-bind="ElPopoverConfig.attrs"
          v-on="ElPopoverConfig.listeners"
        >
          <template v-if="Slots['popover-content']">
            <component
              :is="Slots['popover-content']()"
              v-if="isGlobalSlot(Slots['popover-content'])"
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
                    class="fa-pop-switch"
                    :class="{
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
  </span>
</template>

<style lang="scss">
.fa-pop-switch.inline-prompt {
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
