<template>
  <el-tooltip
    v-bind="ElTooltipProps"
    class="ki-pop-button"
  >
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
        v-bind="ElPopoverProps"
        @show="(...e) => { $emit('show', ...e) }"
        @hide="(...e) => { $emit('hide', ...e) }"
        @after-enter="(...e) => { $emit('after-enter', ...e) }"
        @after-leave="(...e) => { $emit('after-leave', ...e) }"
      >
        <slot v-if="$slots['popover-content']" />
        <div
          v-else-if="ElPopoverProps.rawContent"
          v-html="ElPopoverProps.content"
        />
        <div
          v-else
          v-text="ElPopoverProps.content"
        />
        <template #reference>
          <span>
            <el-popconfirm
              v-bind="ElPopconfirmProps"
              @cancel="(...e) => { $emit('cancel', ...e) }"
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
import { conclude, useGlobalConfig } from 'vue-global-config'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalHooks = {}

export default {
  name: 'KiPopButton',
  install(app, options = {}) {
    const { props, attrs, listeners, hooks } = useGlobalConfig(options, this.props)
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
    ElPopoverProps() {
      const result = conclude([
        this.elPopoverProps,
        globalProps.elPopoverProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
      const { title, content } = result || {}
      return {
        disabled: !(title || content),
        ...result,
      }
    },
    ElPopconfirmProps() {
      const result = conclude([
        this.elPopconfirmProps,
        globalProps.elPopconfirmProps,
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
      return {
        popperClass: 'ki-pop-button-popper',
        disabled: !result?.title,
        ...result,
      }
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

<style lang="scss" scoped>
.ki-pop-button {
  &+.ki-pop-button {
    margin-left: 10px;
  }

  .el-button.is-circle {
    // 固定原型按钮尺寸
    width: 36px;
    height: 36px;
    padding: 0;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    // 设置图标大小
    // & /deep/ *{
    //     font-size: 16px;
    // }
  }
}
</style>

<style lang="scss">
.ki-pop-button-popper {
  &.el-popover {
    min-width: fit-content;
  }

  &.el-popconfirm__main {
    margin-block-start: .5em;
  }
}
</style>
