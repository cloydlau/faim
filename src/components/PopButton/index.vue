<script>
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import { isGlobalSlot } from '../../utils'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const boolAttrs = [
  'plain',
  'text',
  'bg',
  'link',
  'round',
  'circle',
  'loading',
  'disabled',
  'autofocus',
  'autoInsertSpace',
  'dark',
]

export default {
  name: 'FaPopButton',
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, { props: this.props, camelizePropNames: true })
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
    ...Object.fromEntries(Array.from(boolAttrs, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: ['click', 'confirm'],
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
          disabled: !userProp?.content,
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
      return conclude([
        Object.fromEntries(
          Array.from(boolAttrs, boolAttr => [boolAttr, conclude([this[boolAttr], globalProps[boolAttr]])]).filter(
            ([, v]) => v !== undefined,
          ),
        ),
        this.$attrs,
        globalAttrs,
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
  },
  methods: {
    isGlobalSlot,
    onClick(...e) {
      if (!this.$refs[this.ElTooltipConfig.attrs.ref].manual) {
        this.$refs[this.ElTooltipConfig.attrs.ref].showPopper = false
      }
      this.$emit('confirm', ...e)
      if (!this.disabled && this.ElPopconfirmConfig.attrs.disabled) {
        this.$emit('click', ...e)
      }
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
                @confirm="$emit('click', $event)"
                @on-confirm="$emit('click', $event)"
              >
                <template #reference>
                  <el-button
                    v-bind="ElButtonProps"
                    class="fa-pop-button"
                    @click="onClick"
                  >
                    <component
                      :is="Slots.default()"
                      v-if="isGlobalSlot(Slots.default)"
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
  </span>
</template>
