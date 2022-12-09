<template>
  <el-dialog
    v-bind="ElDialogProps"
    ref="elDialogRef"
    :key="key"
    :visible="show"
    :title="Title"
    :destroyOnClose="false"
    :appendToBody="false"
    :fullscreen="fullscreen"
    v-on="Listeners"
    @closed="onClosed"
  >
    <!-- 传 slot -->
    <template #title>
      <!-- 接收 slot -->
      <slot name="title">
        {{ Title }}
      </slot>
      <div
        flex="~"
        items="center"
      >
        <i
          v-if="ShowFullscreenButton"
          :class="fullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"
          cursor="pointer"
          text="hover:[#409eff]"
          @click="toggleFullscreen()"
        />
        <i
          class="el-icon-close"
          cursor="pointer"
          text="20px hover:[#FF7575]"
          ml="15px"
          @click="close"
        />
      </div>
    </template>
    <div
      v-loading="Loading"
      class="body"
      overflow="y-hidden"
      flex="~ col"
    >
      <div
        ref="overlayScrollbar"
        class="overflow-y-auto px-40px pb-85px pt-25px"
        style="max-height:calc(100vh - 45px);"
      >
        <el-form
          v-if="ValueIsPlainObject"
          :labelWidth="labelWidth"
          v-bind="ElFormProps"
          :class="!showConfirmButton && 'readonly'"
          v-on="Listeners"
        >
          <slot :elFormRef="$refs.elFormRef" />
        </el-form>
        <slot v-else />
      </div>
    </div>

    <template #footer>
      <slot
        name="footer"
        :close="close"
        :closing="closing"
        :confirm="confirm"
        :submitting="submitting"
      >
        <el-button
          v-if="AllowClose"
          :disabled="closing"
          :class="closing && 'closing'"
          @click="close"
        >
          {{ showConfirmButton ? '取 消' : '关 闭' }}
        </el-button>
        <el-button
          v-if="showConfirmButton"
          type="primary"
          :disabled="closing"
          :class="closing && 'closing'"
          :loading="submitting"
          @click="confirm"
        >
          确 定
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script>
import { conclude } from 'vue-global-config'
import { cloneDeep, isPlainObject } from 'lodash-es'
import { getListeners } from '../utils'
import highlightError from './highlightError'
import { globalAttrs, globalListeners, globalProps } from './index'
// import Scrollbar from 'smooth-scrollbar'
// import 'overlayscrollbars/css/OverlayScrollbars.min.css'
// import OverlayScrollbars from 'overlayscrollbars'
// 在某项目中触发诡异 bug：el-input 输入时触发重绘，光标被强制后移
// import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export default {
  name: 'KiFormDialog',
  props: {
    value: {},
    elFormProps: {},
    retrieve: {},
    submit: {},
    title: {},
    getContainer: {},
    show: {
      type: Boolean,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: undefined,
    },
    allowClose: {
      type: Boolean,
      default: undefined,
    },
    showFullscreenButton: {
      type: Boolean,
      default: undefined,
    },
  },
  data() {
    return {
      retrieving: true,
      submitting: false,
      closing: false,
      initiated: false,
      styleTag: null,
      scrollbar: null,
      showConfirmButton: false, // 作用是防止在关闭但关闭动画未结束时隐藏的确认按钮暴露出来
      beforeCloseIsPassed: false,
      fullscreen: false,
      labelWidth: undefined,
      key: 0,
    }
  },
  computed: {
    ShowFullscreenButton() {
      return conclude([this.showFullscreenButton, globalProps.showFullscreenButton, true])
    },
    ValueIsPlainObject() {
      return isPlainObject(this.value)
    },
    AllowClose() {
      return conclude([this.allowClose, globalProps.allowClose, true])
    },
    Title() {
      return conclude([this.title, globalProps.title], {
        type: String,
      })
    },
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    Loading() {
      return conclude([this.loading, globalProps.loading, this.retrieving], {
        type: Boolean,
      })
    },
    Retrieve() {
      return conclude([this.retrieve, globalProps.retrieve], {
        type: Function,
      })
    },
    Submit() {
      return conclude([this.submit, globalProps.submit], {
        type: Function,
      })
    },
    Readonly() {
      return conclude([this.readonly, globalProps.readonly, false], {
        type: Boolean,
      })
    },
    // 必须放在 ElDialogProps 下面
    GetContainer() {
      return conclude([this.getContainer, globalProps.getContainer, ['', true].includes(this.ElDialogProps.appendToBody) ? 'body' : undefined], {
        type: [String, Function],
      })
    },
    ElDialogProps() {
      return conclude([
        this.AllowClose
          ? undefined
          : {
              closeOnClickModal: false,
              showClose: false,
              closeOnPressEscape: false,
            },
        this.$attrs,
        globalAttrs,
      ], {
        type: Object,
        default: (userProp) => {
          this.beforeCloseIsPassed = Boolean(userProp.beforeClose)
          if (userProp.fullscreen !== undefined && this.show) {
            this.toggleFullscreen(userProp.fullscreen)
          }
          return {
            closeOnClickModal: false,
            ...!this.beforeCloseIsPassed && {
              beforeClose: () => {
                this.$emit('update:show', false)
              },
            },
          }
        },
        defaultIsDynamic: true,
        camelizeObjectKeys: true,
      })
    },
    ElFormProps() {
      return conclude([
        {
          model: this.value,
          ref: 'elFormRef',
        },
        this.elFormProps,
        globalProps.elFormProps,
        {
          disabled: this.readonly || this.submitting,
        },
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
  },
  watch: {
    show: {
      // 针对默认打开的情况 默认打开时 依然执行retrieve
      immediate: true,
      handler(n) {
        if (n) {
          /* if (!this.labelWidthSettled) {
            this.labelWidth = await this.getLabelWidth()
            this.labelWidthSettled = true
          } */
          this.retrieving = true
          const result = this.Retrieve?.()
          if (result instanceof Promise) {
            result.catch((e) => {
              console.error(e)
              this.close()
            }).finally((e) => {
              this.retrieving = false
            })
          } else {
            this.retrieving = false
          }
          this.computeLabelWidth()
          // 不兼容 tinymce
          /* this.$nextTick(() => {
            this.osInstance = OverlayScrollbars(this.$refs.overlayScrollbar, {})
          }) */
        }
        // 首次不执行
        else if (this.initiated) {
          this.closing = true
        }
        if (this.GetContainer) {
          this.$nextTick(() => {
            (typeof this.GetContainer === 'function'
              ? this.GetContainer()
              : document.querySelector(this.GetContainer)
            ).appendChild(this.$el)
          })
        }
        this.initiated = true
      },
    },
    Readonly: {
      immediate: true,
      handler(n) {
        if (!this.closing) {
          this.showConfirmButton = !n
        }
      },
    },
  },
  created() {
    this.value__ = cloneDeep(this.value)
  },
  /* mounted () {
    // 不兼容 tinymce
    const unwatch = this.$watch('loading', n => {
      if (!n) {
        this.$nextTick(() => {
          /!*this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
            alwaysShowTracks: true,
          })*!/
          //this.hasScrollbar = hasScrollbar(this.$refs.elDialogRef.$el.firstChild)
          unwatch()
        })
      }
    }, {
      immediate: true
    })
  }, */
  updated() {
    this.computeLabelWidth()
  },
  unmounted() {
    if (this.GetContainer && this.$el?.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    toggleFullscreen(newValue = !this.fullscreen) {
      this.fullscreen = newValue
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
        this.$emit('fullscreen-change', this.fullscreen)
      })
    },
    /*
      fix: https://github.com/ElemeFE/element/issues?q=label+width+auto
    */
    computeLabelWidth() {
      const { labelWidth, labelPosition } = this.ElFormProps
      // 如果 label 位置不为顶部 且 用户没有指定 label 宽度，则计算 label 宽度
      if (labelPosition !== 'top' && [undefined, 'auto'].includes(labelWidth)) {
        this.$nextTick(() => {
          let max = 0
          // 首次执行时 this.$refs.elFormRef 为空
          this.$refs.elFormRef?.$el.querySelectorAll('.el-form-item__label').forEach((item) => {
            // updated 时，避免受之前设置的宽度影响
            const prevWidth = item.style.width
            item.style.width = 'revert'
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
    /* reset () {
      this.$refs.elFormRef.resetFields()
    }, */
    onClosed() {
      // 重置表单
      this.submitting = false
      this.$emit('input', cloneDeep(this.value__))
      this.$refs.elFormRef?.clearValidate()
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
        this.$refs.elDialogRef.beforeClose()
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
            result.then((data) => {
              if (data?.show === true) {
                this.submitting = false
              } else {
                this.close()
              }
            }).catch((e) => {
              console.error(e)
              this.submitting = false
            })
          } else if (result?.show !== true) {
            this.close()
          }
        } else {
          this.close()
        }
      }

      if (this.$refs.elFormRef) {
        this.$refs.elFormRef.validate((valid) => {
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
  },
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
    display: flex;
    justify-content: space-between;
    align-items: center;

    &>.el-dialog__headerbtn {
      display: none;
    }
  }

  .el-dialog__body {
    max-height: calc(100vh - 45px);
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;

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
      background-color: rgba(144, 147, 153, 0.302);
    }
  }

  .el-dialog__footer {
    position: absolute;
    bottom: 0;
    right: 0;
    backdrop-filter: blur(1px);
    z-index: 1;

    .el-button.is-disabled.closing {
      cursor: revert;
    }
  }
}

:deep(.el-form.readonly) {

  [disabled="disabled"],
  .is-disabled,
  .is-disabled *,
  .disabled {
    color: revert !important;
    cursor: revert !important;
  }

  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner,
  .el-checkbox__input.is-disabled.is-indeterminate .el-checkbox__inner {
    background-color: #409EFF;
    border-color: #409EFF;
  }

  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: #FFF;
    cursor: revert;
  }

  .el-radio__input.is-disabled.is-checked {
    .el-radio__inner {
      border-color: #409EFF;
      background: #409EFF;
    }

    .el-radio__inner::after {
      cursor: revert;
      background-color: #FFF;
      border-color: revert;
    }
  }

  .el-slider__runway.disabled>.el-slider__button-wrapper {
    cursor: revert;

    &>.el-slider__button {
      cursor: revert;
      border-color: #409EFF;
    }
  }

  .el-color-picker.is-disabled>.el-color-picker__mask {
    display: none;
  }

  .el-upload {
    cursor: revert;
  }
}
</style>
