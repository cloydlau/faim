<template>
  <el-tooltip
    v-if="name&&authorized"
    v-bind="ElTooltipProps"
  >
    <el-popconfirm
      @onconfirm="() => {enableDynamics = !enableDynamics}"
      @onConfirm="() => {enableDynamics = !enableDynamics}"
      :title="enableDynamics === 1? '停用': '启用'"
    >
      <template slot="reference">
        <el-switch
          ref="elSwitch"
          :value="enableDynamics"
          :active-value="1"
          :inactive-value="0"
        />
      </template>
    </el-popconfirm>
  </el-tooltip>
</template>

<script>
import globalProps from './config'
import { getFinalProp } from '../../utils'

export default {
  name: 'PopSwitch',
  props: {
    name: {
      type: String,
      //required: true // undefined 时报错
    },
    show: {
      validator: value => ['boolean', 'function'].includes(typeof value) || value === '',
    },
    elPopconfirmProps: Object,
    elTooltipProps: Object,
  },
  data () {
    return {
      authorized: false,
    }
  },
  computed: {
    ElButtonProps () {
      return getFinalProp(
        this.$attrs,
        this.presetFromCatalog,
        globalProps.elButtonProps
      )
    },
    ElPopconfirmProps () {
      const result = getFinalProp(
        this.elPopconfirmProps,
        this.presetFromCatalog.elPopconfirmProps,
        globalProps.elPopconfirmProps,
      )
      return {
        title: this.name,
        disabled: !Boolean(result), // 未配置elPopconfirmProps时默认不启用
        ...result,
      }
    },
    ElTooltipProps () {
      return getFinalProp(
        this.elTooltipProps,
        this.presetFromCatalog.elTooltipProps,
        globalProps.elTooltipProps,
        {
          content: this.name,
          placement: 'top',
          openDelay: 400,
          key: this.name,
          // 默认非圆形按钮不显示tooltip
          disabled: !getFinalProp(
            this.$attrs.circle,
            this.presetFromCatalog.circle,
            globalProps.circle,
            false
          ),
        },
      )
    },
    presetFromCatalog () {
      return {
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
        ...globalProps.catalog,
      }[this.name] || {}
    },
    Show () {
      return getFinalProp(this.show, globalProps.show, false)
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
      if (this.ElPopconfirmProps.disabled) {
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

<style lang="scss" scoped>
</style>
