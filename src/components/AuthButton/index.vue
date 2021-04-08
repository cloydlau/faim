<template>
  <el-tooltip
    v-if="authorized"
    v-bind="ElTooltipProps"
  >
    <el-popconfirm
      @onConfirm="$emit('click', $event)"
      @confirm="$emit('click', $event)"
      v-bind="ElPopconfirmProps"
    >
      <el-button
        slot="reference"
        class="auth-button"
        v-bind="elButtonProps"
        @click="onElButtonClick"
      >
        <span v-if="$slots.default && ![true,''].includes($attrs.loading)">
          <slot/>
        </span>
        <span v-else-if="!preset.circle && ![true,''].includes($attrs.loading)">{{ name }}</span>
      </el-button>
    </el-popconfirm>
  </el-tooltip>
</template>

<script>
import globalProps from './config'
import { getFinalProp } from '../../utils'

export default {
  name: 'AuthButton',
  props: {
    name: {
      type: String,
      required: true
    },
    elPopconfirmProps: Object,
    elTooltipProps: Object,
    show: {
      validator: value => ['boolean', 'function'].includes(typeof value) || value === '',
    }
  },
  data () {
    return {
      authorized: false,
    }
  },
  computed: {
    popconfirmDisabled () {
      return !this.preset.elPopconfirmProps && !globalProps.elPopconfirmProps && !this.elPopconfirmProps
    },
    elButtonProps () {
      return {
        ...globalProps.elButtonProps,
        ...this.preset,
        ...this.$attrs,
      }
    },
    ElPopconfirmProps () {
      return {
        title: this.name,
        disabled: this.popconfirmDisabled,
        ...globalProps.elPopconfirmProps,
        ...this.preset.elPopconfirmProps,
        ...this.elPopconfirmProps
      }
    },
    ElTooltipProps () {
      return {
        content: this.name,
        placement: 'top',
        openDelay: 400,
        key: this.name,
        disabled: !([true, ''].includes(this.$attrs.circle) || this.preset.circle), // 仅图标型按钮显示tooltip
        ...globalProps.elTooltipProps,
        ...this.preset.elTooltipProps,
        ...this.elTooltipProps,
      }
    },
    preset () {
      return {
        重置密码: {
          type: 'info',
          icon: 'el-icon-unlock',
          circle: true,
          elPopconfirmProps: {}
        },
        新增: {
          type: 'primary',
          icon: 'el-icon-circle-plus-outline'
        },
        查看: {
          icon: 'el-icon-search',
          circle: true
        },
        编辑: {
          type: 'primary',
          icon: 'el-icon-edit',
          circle: true
        },
        停用: {
          type: 'warning',
          icon: 'el-icon-video-pause',
          circle: true,
          elPopconfirmProps: {}
        },
        启用: {
          type: 'success',
          icon: 'el-icon-video-play',
          circle: true,
          elPopconfirmProps: {}
        },
        删除: {
          type: 'danger',
          icon: 'el-icon-delete',
          circle: true,
          elPopconfirmProps: {}
        },
        授权: {
          type: 'info',
          icon: 'el-icon-user-solid',
          circle: true
        },
        ...globalProps.catalog,
      }[this.name] || {}
    },
    Show () {
      return getFinalProp(globalProps.show, this.show === '' ? true : this.show)
    }
  },
  watch: {
    Show () {
      this.verify()
    }
  },
  created () {
    this.verify()
  },
  updated () {
    this.verify()
  },
  methods: {
    onElButtonClick (e) {
      if (this.popconfirmDisabled) {
        this.$emit('click', e)
      }
    },
    async verify () {
      if (this.Show) {
        let authorized
        if (typeof this.Show === 'function') {
          const result = this.Show(this.name)
          authorized = result instanceof Promise ? await result : result
          if (authorized === true) {
            this.authorized = true
            return
          }
        } else if (this.Show === true) {
          this.authorized = true
          return
        }
      }
      this.authorized = false
    },
  }
}
</script>

<!--<style lang="scss">
.el-popconfirm__main {
  margin-top: 5px;
}
</style>-->

<style lang="scss" scoped>
.auth-button {
  margin-right: 5px;

  &:not(:first-of-type) {
    margin-left: 10px;
  }

  &.is-circle {
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

  & ::v-deep .el-popconfirm__main {
    font-size: 18px;
    margin: 8px 8px 16px 8px;
  }
}
</style>
