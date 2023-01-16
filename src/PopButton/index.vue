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
              @confirm="$emit('click', $event)"
              @on-confirm="$emit('click', $event)"
            >
              <template #reference>
                <el-button
                  v-bind="ElButtonProps"
                  @click="onClick"
                >
                  <component
                    v-if="isGlobalSlot(Slots['default'])"
                    :is="Slots['default']()"
                  />
                  <slot v-else />
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
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import { getListeners, isGlobalSlot } from '../utils'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

export default {
  name: 'KiPopButton',
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
  props: {
    elPopconfirmProps: {},
    elTooltipProps: {},
    elPopoverProps: {},
  },
  emits: ['click', 'confirm'],
  computed: {
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    Slots() {
      return conclude([isVue3 ? this.$slots : this.$scopedSlots, globalSlots])
    },
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
    isGlobalSlot,
    onClick(...e) {
      if (!this.$refs[this.ElTooltipProps.ref].manual) {
        this.$refs[this.ElTooltipProps.ref].showPopper = false
      }
      this.$emit('confirm', ...e)
      if (![true, ''].includes(this.ElButtonProps.disabled) && this.ElPopconfirmConfig.attrs.disabled) {
        this.$emit('click', ...e)
      }
    },
  },
}
</script>
