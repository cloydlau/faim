<template>
  <el-tooltip v-bind="ElTooltipProps">
    <template #content>
      <slot
        v-if="$slots['tooltip-content']"
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
    <span>
      <el-popover
        v-bind="ElPopoverConfig.attrs"
        v-on="ElPopoverConfig.listeners"
      >
        <slot v-if="$slots['popover-content']" />
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
              @confirm="$emit('click', $event)"
              @on-confirm="$emit('click', $event)"
            >
              <template #reference>
                <el-button
                  v-bind="ElButtonProps"
                  @click="onClick"
                >
                  <slot />
                </el-button>
              </template>
            </el-popconfirm>
          </span>
        </template>
      </el-popover>
    </span>
  </el-tooltip>
</template>

<script>
import { conclude, resolveConfig } from 'vue-global-config'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalHooks = {}

export default {
  name: 'KiPopButton',
  install(app, options = {}) {
    const { props, attrs, listeners, hooks } = resolveConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalHooks, hooks)
    app.component(this.name, this)
  },
  props: {
    elPopconfirmProps: {},
    elTooltipProps: {},
    elPopoverProps: {},
  },
  emits: ['click', 'confirm', 'cancel', 'show', 'hide', 'after-enter', 'after-leave'],
  computed: {
    ElTooltipProps() {
      const result = conclude([
        this.elTooltipProps,
        globalProps.elTooltipProps,
        { ref: 'elTooltipRef' },
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
          disabled: !userProp?.title,
        }),
        defaultIsDynamic: true,
      }))
    },
    ElButtonProps() {
      return conclude([this.$attrs, globalAttrs], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
  },
  methods: {
    onClick(...e) {
      if (!this.$refs[this.ElTooltipProps.ref].manual) {
        this.$refs[this.ElTooltipProps.ref].showPopper = false
      }
      this.$emit('confirm', ...e)
      if (this.ElPopconfirmProps.disabled) {
        this.$emit('click', ...e)
      }
    },
  },
}
</script>
