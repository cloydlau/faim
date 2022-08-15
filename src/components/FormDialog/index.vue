<template>
  <el-dialog :visible.sync="show" :title="Title" v-bind="ElDialogProps" v-on="Listeners"
    ref="elDialog" @closed="onClosed" :destroyOnClose="false" :appendToBody="false"
    :key="key">
    <template #title>
      <!-- 接收 slot -->
      <slot name="title" />
    </template>
    <div v-loading="Loading" class="body" overflow="y-hidden" flex="~ col">
      <!-- 传 slot -->
      <div class="overflow-y-auto px-40px pb-85px pt-25px"
        style="max-height:calc(100vh - 45px);" ref="overlayScrollbar">
        <slot />

        <el-form v-if="$scopedSlots['el-form']" :labelWidth="labelWidth"
          v-bind="ElFormProps" v-on="Listeners">
          <slot name="el-form" />
        </el-form>
      </div>
    </div>

    <template #footer>
      <slot name="footer" :close="close" :closing="closing" :confirm="confirm"
        :submitting="submitting">
        <el-button @click="close" :disabled="closing">
          {{ showConfirmButton ? '取 消' : '关 闭' }}
        </el-button>
        <el-button type="primary" @click="confirm" :disabled="closing"
          :loading="submitting" v-if="showConfirmButton">
          确 定
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script>
import { globalProps, globalAttrs, globalListeners } from './index'
import { loadStyle } from 'kayran'
import { conclude } from 'vue-global-config'
import highlightError from './highlightError'
import { cloneDeep } from 'lodash-es'
import { getListeners } from '../../utils'
//import Scrollbar from 'smooth-scrollbar'
//import 'overlayscrollbars/css/OverlayScrollbars.min.css'
//import OverlayScrollbars from 'overlayscrollbars'
// 在某项目中触发诡异 bug：el-input 输入时触发重绘，光标被强制后移
//import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export default {
  name: 'KiFormDialog',
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
    readonly: {
      type: Boolean,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: undefined,
    },
    title: {},
    getContainer: {},
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      retrieving: true,
      submitting: false,
      closing: false,
      initiated: false,
      disabledStyle: null,
      scrollbar: null,
      // 作用是防止在关闭但关闭动画未结束时隐藏的确认按钮暴露出来
      showConfirmButton: false,
      beforeCloseIsPassed: false,
      //osInstance: null,
      labelWidth: undefined,
      key: 0,
    }
  },
  computed: {
    Title() {
      return conclude([this.title, globalProps.title], {
        type: String
      })
    },
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    Loading() {
      return conclude([this.loading, globalProps.loading, this.retrieving], {
        type: Boolean
      })
    },
    Retrieve() {
      return conclude([this.retrieve, globalProps.retrieve], {
        type: Function
      })
    },
    Submit() {
      return conclude([this.submit, globalProps.submit], {
        type: Function
      })
    },
    Readonly() {
      return conclude([this.readonly, globalProps.readonly, false], {
        type: Boolean
      })
    },
    ElDialogProps() {
      return conclude([this.$attrs, globalAttrs], {
        default: userProp => {
          this.beforeCloseIsPassed = Boolean(userProp.beforeClose)
          return {
            closeOnClickModal: false,
            ...!this.beforeCloseIsPassed && {
              beforeClose: () => {
                this.$emit('update:show', false)
              }
            },
          }
        },
        defaultIsDynamic: true,
      })
    },
    ElFormProps() {
      return conclude([
        this.elFormProps, globalProps.elFormProps, {
          disabled: this.readonly || this.submitting,
          model: this.value,
          ref: 'elForm',
        }
      ], {
        type: Object
      })
    },
    // 必须放在 ElDialogProps 下面
    GetContainer() {
      return conclude([this.getContainer, globalProps.getContainer, ['', true].includes(this.ElDialogProps.appendToBody) ? 'body' : undefined], {
        type: [String, Function],
      })
    },
  },
  created() {
    this.value__ = cloneDeep(this.value)
  },
  watch: {
    show: {
      // 针对默认打开的情况 默认打开时 依然执行retrieve
      immediate: true,
      handler(n) {
        if (n) {
          /*if (this.$scopedSlots['el-form'] && !this.labelWidthSettled) {
            this.labelWidth = await this.getLabelWidth()
            this.labelWidthSettled = true
          }*/
          this.retrieving = true
          const result = this.Retrieve?.()
          if (result instanceof Promise) {
            result.catch(e => {
              console.error(import.meta.env.VITE_APP_CONSOLE_PREFIX, e)
              this.close()
            }).finally(e => {
              this.retrieving = false
            })
          } else {
            this.retrieving = false
          }
          this.computeLabelWidth()
          // 不兼容 tinymce
          /*this.$nextTick(() => {
            this.osInstance = OverlayScrollbars(this.$refs.overlayScrollbar, {})
          })*/
        }
        // 首次不执行
        else if (this.initiated) {
          this.closing = true
        }
        if (this.GetContainer) {
          this.$nextTick(() => {
            (typeof this.GetContainer === 'function' ?
              this.GetContainer() :
              document.querySelector(this.GetContainer)
            ).appendChild(this.$el)
          })
        }
        this.initiated = true
      }
    },
    Readonly: {
      immediate: true,
      handler(n) {
        if (!this.closing) {
          this.showConfirmButton = !n
        }
      }
    },
    showConfirmButton: {
      immediate: true,
      handler(n) {
        if (!n) {
          loadStyle(this.disabledStyle || `
.el-form [disabled="disabled"],
.el-form .is-disabled,
.el-form .is-disabled *,
.el-form .disabled {
  color: unset !important;
  cursor: initial !important;
}
.el-form .el-radio__input.is-disabled.is-checked .el-radio__inner {
  border-color: #409EFF;
  background: #409EFF;
}
.el-form .el-radio__input.is-disabled.is-checked .el-radio__inner::after {
  cursor: unset;
  background-color: #FFF;
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
  /*mounted () {
    // 不兼容tinymce
    const unwatch = this.$watch('loading', n => {
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
    })
  },*/
  updated() {
    this.computeLabelWidth()
  },
  destroyed() {
    if (this.GetContainer && this.$el?.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    /*
      fix: https://github.com/ElemeFE/element/issues?q=label+width+auto
    */
    computeLabelWidth() {
      const { labelWidth, labelPosition } = this.ElFormProps
      // 如果 label 位置不为顶部 且 用户没有指定 label 宽度，则计算 label 宽度
      if (labelPosition !== 'top' && [undefined, 'auto'].includes(labelWidth)) {
        this.$nextTick(() => {
          let max = 0
          // 首次执行时 this.$refs.elForm 为空
          this.$refs.elForm?.$el.querySelectorAll('.el-form-item__label').forEach(item => {
            // updated 时，避免受之前设置的宽度影响
            const prevWidth = item.style.width
            item.style.width = 'unset'
            const computedWidth = Math.ceil(parseFloat(window.getComputedStyle(item).width))
            if (computedWidth > max) {
              max = computedWidth
            }
            // 不还原会导致文案变成居左的（默认是居右）
            item.style.width = prevWidth
          })
          if (max) {
            this.labelWidth = `${max}px`
          }
        })
      }
    },
    /*reset () {
      this.$refs.elForm.resetFields()
    },*/
    onClosed() {
      // 重置表单
      this.submitting = false
      this.$emit('change', cloneDeep(this.value__))
      if (this.$scopedSlots['el-form']) {
        this.$refs.elForm.clearValidate()
      }
      this.closing = false
      this.showConfirmButton = !this.Readonly
      // el-dialog 内部的 key 是在 close 时改变
      // 改为 closed 时改变，提升性能，在 DOM 较多时感受明显
      if (['', true].includes(this.ElDialogProps.destroyOnClose)) {
        this.key++
      }
    },
    close() {
      if (this.beforeCloseIsPassed) {
        this.$refs.elDialog.beforeClose()
      } else {
        this.$emit('update:show', false)
      }
    },
    confirm() {
      const exec = () => {
        if (typeof this.Submit === 'function') {
          const result = this.Submit()
          if (result instanceof Promise) {
            this.submitting = true
            result.then(data => {
              if (data?.show === true) {
                this.submitting = false
              } else {
                this.close()
              }
            }).catch(e => {
              console.error(import.meta.env.VITE_APP_CONSOLE_PREFIX, e)
              this.submitting = false
            })
          } else if (result?.show !== true) {
            this.close()
          }
        } else {
          this.close()
        }
      }

      if (this.$scopedSlots['el-form']) {
        this.$refs.elForm.validate(valid => {
          if (valid) {
            exec()
          } else {
            this.highlightError(undefined, this.$refs.overlayScrollbar)
          }
        })
      } else {
        exec()
      }
    },
    highlightError,
  }
}
</script>

<style lang="scss" scoped>
// 动画
/* @keyframes open {
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

.el-dialog__wrapper {
  transition-duration: 0.3s;
}

.dialog-fade-enter-active {
  animation: none !important;
}

.dialog-fade-leave-active {
  transition-duration: 0.15s !important;
  animation: none !important;
}

.dialog-fade-enter-active :deep(.el-dialog),
.dialog-fade-leave-active :deep(.el-dialog) {
  animation-fill-mode: forwards;
}

.dialog-fade-enter-active :deep(.el-dialog) {
  animation-duration: 0.3s;
  animation-name: open;
  animation-timing-function: cubic-bezier(0.6, 0, 0.4, 1);
}

.dialog-fade-leave-active :deep(.el-dialog) {
  animation-duration: 0.3s;
  animation-name: close;
} */
</style>

<style lang="scss" scoped>
.el-dialog__wrapper {
  display: flex;
}

:deep(.el-dialog) {
  min-width: 800px;

  &:not(.is-fullscreen) {
    margin: auto !important;

    .el-dialog__body {
      max-height: calc(100vh - 100px);
    }
  }

  .el-dialog__header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;

    &>.el-dialog__headerbtn {
      position: unset;

      &>.el-dialog__close {
        font-size: 24px;
        font-weight: bolder;
      }
    }
  }

  .el-dialog__body {
    max-height: calc(100vh - 45px);
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;

    /*.os-scrollbar {
      z-index: 2;
    }*/

    /* 去掉输入框的上下箭头 */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input[type="number"] {
      -moz-appearance: textfield;
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

    ::-webkit-scrollbar {
      width: 6px; // 纵向滚动条
      height: 6px; // 横向滚动条
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: rgba(0, 0, 0, .4);
    }

    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      background: #ededed;
      border-radius: 10px;
    }
  }

  .el-dialog__footer {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 10px 15px;
    backdrop-filter: blur(1px);
    z-index: 1;
  }
}
</style>
