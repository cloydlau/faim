<template>
  <el-dialog
    :visible.sync="show"
    v-bind="ElDialogProps"
    v-on="$listeners"
    ref="elDialog"
  >
    <template slot="title">
      <slot name="title"/>
    </template>

    <div v-loading="loading" class="h-full">
      <el-form
        v-if="$scopedSlots['el-form']"
        v-bind="ElFormProps"
        v-on="$listeners"
      >
        <slot name="el-form"/>
      </el-form>

      <slot/>

      <slot name="footer">
        <div :class="['',true].includes($attrs.fullscreen)&&hasScrollbar&&'h-90px'"/>
        <div slot="footer" :class="['',true].includes($attrs.fullscreen)?'footer-fixed':'footer'">
          <el-button @click="closeDialog" :disabled="submitting">
            关 闭
          </el-button>
          <el-button type="primary" @click="confirm" :loading="submitting" v-if="!readonly">
            确 定
          </el-button>
        </div>
      </slot>
    </div>
  </el-dialog>
</template>

<script>
import globalProps from './config'
import { getFinalProp, hasScrollbar } from '../../utils'
import { highlightError, loadStyle } from 'kayran'
import { cloneDeep } from 'lodash-es'

export default {
  name: 'FormDialog',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    readonly: Boolean,
    value: {
      default: () => ({}),
    },
    elFormProps: Object,
    retrieve: Function,
    submit: Function,
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data () {
    return {
      loading: false,
      submitting: false,
      initiated: false,
      hasScrollbar: false,
      disabledStyle: null
    }
  },
  computed: {
    beforeClosePassed () {
      return globalProps.beforeClose ||
        globalProps['before-close'] ||
        this.$attrs.beforeClose ||
        this.$attrs['before-close']
    },
    ElDialogProps () {
      return {
        closeOnClickModal: false,
        ...!this.beforeClosePassed && {
          beforeClose: () => {
            this.$emit('update:show', false)
          }
        },
        ...globalProps,
        ...this.$attrs,
      }
    },
    ElFormProps () {
      return {
        disabled: this.readonly,
        labelPosition: 'right',
        labelWidth: 'auto',
        ...globalProps.elFormProps,
        ...this.elFormProps,
        model: this.value,
        ref: 'elForm',
      }
    }
  },
  created () {
    this.value__ = cloneDeep(this.value)
  },
  watch: {
    show: {
      // 针对默认打开的情况 默认打开时 依然执行retrieve
      immediate: true,
      async handler (newVal) {
        if (newVal) {
          this.loading = true
          /*if (this.$scopedSlots['el-form'] && !this.labelWidthSettled) {
            this.labelWidth = await this.getLabelWidth()
            this.labelWidthSettled = true
          }*/
          if (this.retrieve) {
            const result = this.retrieve()
            if (result instanceof Promise) {
              result.catch(e => {
                console.error(e)
                this.closeDialog()
              }).finally(e => {
                this.loading = false
              })
            } else {
              this.loading = false
            }
          } else {
            this.loading = false
          }
        } else if (this.initiated) {
          // 重置表单
          this.$emit('change', cloneDeep(this.value__))
          if (this.$scopedSlots['el-form']) {
            this.$nextTick(this.$refs.elForm.clearValidate)
          }
        }
        this.initiated = true
      }
    },
    loading (n) {
      if (!n) {
        this.$nextTick(() => {
          this.hasScrollbar = hasScrollbar(this.$refs.elDialog.$el.firstChild)
        })
      }
    },
    readonly: {
      immediate: true,
      handler (n) {
        if (n) {
          loadStyle(this.disabledStyle || `
.el-form [disabled="disabled"],
.el-form .is-disabled,
.el-form .is-disabled *,
.el-form .disabled {
  color: unset !important;
  cursor: initial !important;
}
          `).then(disabledStyle => {
            this.disabledStyle = disabledStyle
          })
        } else if (this.disabledStyle) {
          this.disabledStyle.remove()
          this.disabledStyle = null
        }
      }
    }
  },
  methods: {
    closeDialog () {
      if (this.beforeClosePassed) {
        this.$refs.elDialog.beforeClose()
      } else {
        this.$emit('update:show', false)
      }
    },
    doSubmit () {
      console.warn('[FormDialog] doSubmit命名已废弃 请改用confirm')
      this.confirm()
    },
    confirm () {
      const exec = () => {
        if (typeof this.submit === 'function') {
          this.submitting = true
          const result = this.submit()
          if (result instanceof Promise) {
            result.then(data => {
              if (data?.close !== false) {
                this.closeDialog()
              }
            }).finally(e => {
              this.submitting = false
            })
          } else {
            this.submitting = false
            if (result?.close !== false) {
              this.closeDialog()
            }
          }
        } else {
          this.closeDialog()
        }
      }

      if (this.$scopedSlots['el-form']) {
        this.$refs.elForm.validate(valid => {
          if (valid) {
            exec()
          } else {
            highlightError()
          }
        })
      } else {
        exec()
      }
    }
  }
}
</script>

<!--动画-->
<style lang="scss" scoped>
@keyframes open {
  0% {
    opacity: 0;
    transform: scale3d(0, 0, 1);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

@keyframes close {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale3d(0.5, 0.5, 1);
  }
}

::v-deep .el-dialog__wrapper {
  transition-duration: 0.3s;
}

::v-deep .dialog-fade-enter-active {
  animation: none !important;
}

::v-deep .dialog-fade-leave-active {
  transition-duration: 0.15s !important;
  animation: none !important;
}

::v-deep .dialog-fade-enter-active .el-dialog,
::v-deep .dialog-fade-leave-active .el-dialog {
  animation-fill-mode: forwards;
}

::v-deep .dialog-fade-enter-active .el-dialog {
  animation-duration: 0.3s;
  animation-name: open;
  animation-timing-function: cubic-bezier(0.6, 0, 0.4, 1);
}

::v-deep .dialog-fade-leave-active .el-dialog {
  animation-duration: 0.3s;
  animation-name: close;
}
</style>

<style lang="scss" scoped>
::v-deep .el-dialog {
  min-width: 600px;

  .el-dialog__header {
    border-bottom: 1px solid #F7F7F7;

    .el-dialog__headerbtn .el-dialog__close {
      font-size: 20px;
    }
  }

  .el-dialog__body {
    height: calc(100% - 55px);
    padding: 25px 50px;

    /* 去掉输入框的上下箭头 */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }

    .el-form-item__label {
      font-size: 14px !important; //会影响getCharLen算法
    }

    .el-form-item__content {
      .el-input,
      .el-input-number,
      .el-select,
      .el-time-select,
      .el-time-picker,
      .el-date-picker,
      .el-date-editor,
      .el-cascader {
        width: 100%;
      }
    }

    .el-form-item:last-child {
      margin-bottom: 0;
    }

    .footer {
      text-align: right;
      padding: 50px 0 0 0;
    }

    .footer-fixed {
      @apply fixed bottom-5 right-9;
    }
  }

  &:not(.is-fullscreen) {
    margin: 15vh auto !important;
  }
}
</style>
