<template>
  <el-tooltip
    v-bind="ElTooltipProps"
    ref="elTooltip"
  >
    <template #content>
      <slot
        v-if="$slots.content"
        name="content"
      />
      <div
        v-else-if="ElTooltipProps.rawContent"
        v-html="ElTooltipProps.content"
      />
      <div
        v-else
        v-text="ElTooltipProps.content"
      />
    </template>
    <el-popover
      v-bind="ElPopoverProps"
      @show="(...e) => { $emit('show', ...e) }"
      @hide="(...e) => { $emit('hide', ...e) }"
      @after-enter="(...e) => { $emit('after-enter', ...e) }"
      @after-leave="(...e) => { $emit('after-leave', ...e) }"
    >
      <div v-html="ElPopoverProps.content" />
      <template #reference>
        <el-popconfirm
          v-bind="ElPopconfirmProps"
          @cancel="(...e) => { $emit('cancel', ...e) }"
          @confirm="onConfirm"
          @on-confirm="onConfirm"
        >
          <template #reference>
            <el-switch
              v-bind="ElSwitchProps"
              ref="elSwitch"
              :class="InlinePrompt && 'inlinePrompt'"
              @click.native="onClick"
            />
          </template>
        </el-popconfirm>
      </template>
    </el-popover>
  </el-tooltip>
</template>

<script>
import { isVue3 } from 'vue-demi'
import { conclude, useGlobalConfig } from 'vue-global-config'
import { getCharCount } from './utils'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalHooks = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'change',
}

const boolProps = [
  'inlinePrompt',
]

export default {
  name: 'KiPopSwitch',
  model,
  install(app, options = {}) {
    const { props, attrs, listeners, hooks } = useGlobalConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalHooks, hooks)
    app.component(this.name, this)
  },
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
  emits: [model.event, 'confirm', 'cancel', 'show', 'hide', 'after-enter', 'after-leave'],
  computed: {
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
    ElPopoverProps() {
      return conclude([
        this.elPopoverProps,
        globalProps.elPopoverProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: userProp => ({
          popperClass: 'ki-pop-switch',
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
          popperClass: 'ki-pop-switch',
          disabled: [true, ''].includes(this.ElSwitchProps.disabled) || !userProp?.title,
        }),
        defaultIsDynamic: true,
      })
    },
    InlinePrompt() {
      return conclude([this.inlinePrompt, globalProps.inlinePrompt, true], {
        type: Boolean,
      })
    },
    ElSwitchProps() {
      return conclude([{
        [model.prop]: this.value,
        inlinePrompt: this.InlinePrompt,
      }, this.$attrs, globalAttrs], {
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
    onConfirm(...e) {
      const { checked, inactiveValue, activeValue } = this.$refs.elSwitch
      this.$emit('confirm', ...e)
      this.$emit(model.event, checked ? inactiveValue : activeValue)
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
.ki-pop-switch {
  &.el-popover {
    min-width: fit-content;
  }

  & .el-popconfirm__main {
    margin-block-start: .5em;
  }
}
</style>

<style lang="scss" scoped>
:deep(.inlinePrompt) {
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
