<template>
  <el-dialog
    :visible.sync="show"
    v-bind="ElDialogProps"
    v-on="$listeners"
    ref="elDialog"
    @closed="onClosed"
  >
    <template slot="title">
      <!-- 接收slot -->
      <slot name="title"/>
    </template>
    <div v-loading="loading" class="overflow-y-auto flex flex-col">
      <!-- 传slot -->
      <overlay-scrollbars
        ref="overlayScrollbar"
        class="pl-40px pr-50px pb-30px pt-25px"
        style="max-height:calc(100vh - 100px);"
      >
        <slot/>

        <el-form
          v-if="$scopedSlots['el-form']"
          v-bind="ElFormProps"
          v-on="$listeners"
        >
          <slot name="el-form"/>
        </el-form>
      </overlay-scrollbars>

      <slot name="footer">
        <div
          slot="footer"
          class="z-1 absolute bottom-0 right-0 py-10px px-15px box-border absolute text-right"
          style="backdrop-filter: blur(4px)"
        >
          <el-button
            @click="closeDialog"
            :disabled="closing"
          >
            {{ showConfirmBtn ? '取 消' : '关 闭' }}
          </el-button>
          <!--<el-button
            v-if="showConfirmBtn && $scopedSlots['el-form']"
            type="info"
            @click="reset"
            :disabled="submitting||closing"
          >
            重 置
          </el-button>-->
          <el-button
            type="primary"
            @click="confirm"
            :disabled="closing"
            :loading="submitting"
            v-if="showConfirmBtn"
          >
            确 定
          </el-button>
        </div>
      </slot>
    </div>
  </el-dialog>
</template>

<script>
import globalConfig from './config'
import { loadStyle, getFinalProp, getGlobalAttrs } from 'kayran'
import highlightError from './highlightErrorViaOverlayScrollbars'
import { cloneDeep } from 'lodash-es'
//import Scrollbar from 'smooth-scrollbar'
import 'overlayscrollbars/css/OverlayScrollbars.min.css'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export default {
  name: 'KiFormDialog',
  components: { 'overlay-scrollbars': OverlayScrollbarsComponent },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    value: {
      default: () => ({}),
    },
    elFormProps: {},
    retrieve: {},
    submit: {},
    readonly: {},
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data () {
    return {
      loading: true,
      submitting: false,
      closing: false,
      initiated: false,
      disabledStyle: null,
      scrollbar: null,
      // 作用是防止在关闭但关闭动画未结束时隐藏的确认按钮暴露出来
      showConfirmBtn: false,
      beforeCloseIsPassed: false,
    }
  },
  computed: {
    Retrieve () {
      return getFinalProp([this.retrieve, globalConfig.retrieve], {
        name: 'retrieve',
        type: ['function', 'asyncfunction']
      })
    },
    Submit () {
      return getFinalProp([this.submit, globalConfig.submit], {
        name: 'submit',
        type: ['function', 'asyncfunction']
      })
    },
    Readonly () {
      return getFinalProp([
        [true, ''].includes(this.readonly) ? true : this.readonly,
        globalConfig.readonly,
        false
      ], {
        name: 'readonly',
        type: 'boolean'
      })
    },
    ElDialogProps () {
      return getFinalProp([
        this.$attrs,
        getGlobalAttrs(globalConfig, this.$props)
      ], {
        dynamicDefault: userProp => {
          this.beforeCloseIsPassed = Boolean(userProp.beforeClose)
          return {
            closeOnClickModal: false,
            ...!this.beforeCloseIsPassed && {
              beforeClose: () => {
                this.$emit('update:show', false)
              }
            },
          }
        }
      })
    },
    ElFormProps () {
      return getFinalProp([
        this.elFormProps, globalConfig.elFormProps, {
          disabled: this.readonly,
          labelWidth: 'auto',
          model: this.value,
          ref: 'elForm',
        }
      ], {
        name: 'elFormProps',
        type: 'object'
      })
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
          /*if (this.$scopedSlots['el-form'] && !this.labelWidthSettled) {
            this.labelWidth = await this.getLabelWidth()
            this.labelWidthSettled = true
          }*/
          if (this.Retrieve) {
            const result = this.Retrieve()
            if (result instanceof Promise) {
              result.catch(e => {
                console.error(import.meta.env.VITE_APP_CONSOLE_PREFIX, e)
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
        }
        // 首次不执行
        else if (this.initiated) {
          this.closing = true
        }
        this.initiated = true
      }
    },
    Readonly: {
      immediate: true,
      handler (n) {
        if (!this.closing) {
          this.showConfirmBtn = !n
        }
      }
    },
    showConfirmBtn: {
      immediate: true,
      handler (n) {
        if (!n) {
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
  mounted () {
    // 不兼容tinymce
    /*const unwatch = this.$watch('loading', n => {
      if (!n) {
        this.$nextTick(() => {
          /!*this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
            alwaysShowTracks: true,
          })*!/
          //this.hasScrollbar = hasScrollbar(this.$refs.elDialog.$el.firstChild)
          unwatch()
        })
      }
    }, {
      immediate: true
    })*/
  },
  methods: {
    /*reset () {
      this.$refs.elForm.resetFields()
    },*/
    onClosed () {
      // 重置表单
      this.$emit('change', cloneDeep(this.value__))
      if (this.$scopedSlots['el-form']) {
        setTimeout(() => {
          this.$refs.elForm.clearValidate()
        }, 0)
      }
      this.closing = false
      this.showConfirmBtn = !this.Readonly
    },
    closeDialog () {
      if (this.beforeCloseIsPassed) {
        this.$refs.elDialog.beforeClose()
      } else {
        this.$emit('update:show', false)
      }
    },
    confirm () {
      const exec = () => {
        if (typeof this.Submit === 'function') {
          this.submitting = true
          const result = this.Submit()
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
            highlightError(undefined, this.$refs.overlayScrollbar.osInstance())
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
.el-dialog__wrapper {
  display: flex;
}

::v-deep .el-dialog {
  min-width: 800px;

  &:not(.is-fullscreen) {
    margin: auto !important;

    .os-host {
      max-height: calc(100vh - 100px);
      padding-bottom: 85px;
    }
  }

  .el-dialog__header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;

    & > .el-dialog__headerbtn {
      position: unset;

      & > .el-dialog__close {
        font-size: 24px;
        font-weight: bolder;
      }
    }
  }

  .el-dialog__body {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;

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
  }
}
</style>
