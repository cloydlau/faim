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
        <span>{{ Title }}</span>
      </slot>
      <div
        flex="~"
        items="center"
      >
        <i
          v-if="ShowFullscreenToggle"
          :class="fullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"
          cursor="pointer"
          text="hover:[#409eff]"
          @click="toggleFullscreen()"
        />
        <i
          v-if="ElDialogProps.showClose !== false"
          class="el-icon-close"
          cursor="pointer"
          text="20px hover:[#FF7575]"
          ml="15px"
          @click="onCancel"
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
          v-bind="ElFormProps"
          ref="elFormRef"
          :class="Readonly && 'readonly'"
          :labelWidth="labelWidth"
          :model="value"
          v-on="Listeners"
        >
          <slot :elFormRef="$refs.elFormRef" />
        </el-form>
        <slot v-else />
      </div>
    </div>

    <template #footer>
      <slot name="footer">
        <template v-if="ReverseButtons">
          <el-button
            v-if="ShowConfirmButton"
            type="primary"
            :disabled="closing || denying"
            :class="closing && 'closing'"
            :loading="confirming"
            @click="onConfirm"
          >
            {{ ConfirmButtonText }}
          </el-button>
          <el-button
            v-if="ShowDenyButton"
            type="danger"
            :disabled="closing || confirming"
            :class="closing && 'closing'"
            :loading="denying"
            @click="onDeny"
          >
            {{ DenyButtonText }}
          </el-button>
          <el-button
            v-if="ShowResetButton && $refs.elFormRef"
            type="info"
            :disabled="closing || confirming || denying"
            @click="onReset"
          >
            {{ ResetButtonText }}
          </el-button>
          <el-button
            v-if="ShowCancelButton"
            :disabled="closing"
            :class="closing && 'closing'"
            @click="onCancel"
          >
            {{ CancelButtonText }}
          </el-button>
        </template>

        <template v-else>
          <el-button
            v-if="ShowCancelButton"
            :disabled="closing"
            :class="closing && 'closing'"
            @click="onCancel"
          >
            {{ CancelButtonText }}
          </el-button>
          <el-button
            v-if="ShowResetButton && $refs.elFormRef"
            type="info"
            :disabled="closing || confirming || denying"
            @click="onReset"
          >
            {{ ResetButtonText }}
          </el-button>
          <el-button
            v-if="ShowDenyButton"
            type="danger"
            :disabled="closing || confirming"
            :class="closing && 'closing'"
            :loading="denying"
            @click="onDeny"
          >
            {{ DenyButtonText }}
          </el-button>
          <el-button
            v-if="ShowConfirmButton"
            type="primary"
            :disabled="closing || denying"
            :class="closing && 'closing'"
            :loading="confirming"
            @click="onConfirm"
          >
            {{ ConfirmButtonText }}
          </el-button>
        </template>
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

const boolProps = [
  'show',
  'readonly',
  'loading',
  'showFullscreenToggle',
  'showConfirmButton',
  'showDenyButton',
  'showResetButton',
  'showCancelButton',
  'reverseButtons',
]

export default {
  name: 'KiFormDialog',
  props: {
    value: {},
    title: {},
    elFormProps: {},
    retrieve: {},
    confirm: {},
    deny: {},
    getContainer: {},
    confirmButtonText: {},
    denyButtonText: {},
    cancelButtonText: {},
    ...Object.fromEntries(Array.from(boolProps, boolProp => [boolProp, {
      type: Boolean,
      default: undefined,
    }])),
  },
  data() {
    return {
      initialValue: undefined,
      initiated: false,
      retrieving: true,
      confirming: false,
      denying: false,
      closing: false,
      scrollbar: null,
      beforeCloseIsPassed: false,
      fullscreen: false,
      labelWidth: undefined,
      key: 0,
    }
  },
  computed: {
    ConfirmButtonText() {
      return conclude([this.confirmButtonText, globalProps.confirmButtonText, 'OK'], {
        type: String,
      })
    },
    DenyButtonText() {
      return conclude([this.denyButtonText, globalProps.denyButtonText, 'No'], {
        type: String,
      })
    },
    ResetButtonText() {
      return conclude([this.resetButtonText, globalProps.resetButtonText, 'Reset'], {
        type: String,
      })
    },
    CancelButtonText() {
      return conclude([this.cancelButtonText, globalProps.cancelButtonText, 'Cancel'], {
        type: String,
      })
    },
    ShowFullscreenToggle() {
      return conclude([this.showFullscreenToggle, globalProps.showFullscreenToggle, true], {
        type: Boolean,
      })
    },
    ShowConfirmButton() {
      return conclude([this.showConfirmButton, globalProps.showConfirmButton, !this.Readonly], {
        type: Boolean,
      })
    },
    ShowDenyButton() {
      return conclude([this.showDenyButton, globalProps.showDenyButton, false], {
        type: Boolean,
      })
    },
    ShowResetButton() {
      return conclude([this.showResetButton, globalProps.showResetButton, false], {
        type: Boolean,
      })
    },
    ShowCancelButton() {
      return conclude([this.showCancelButton, globalProps.showCancelButton, !this.Readonly], {
        type: Boolean,
      })
    },
    ReverseButtons() {
      return conclude([this.reverseButtons, globalProps.reverseButtons, false], {
        type: Boolean,
      })
    },
    ValueIsPlainObject() {
      return isPlainObject(this.value)
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
    Confirm() {
      return conclude([this.confirm, globalProps.confirm], {
        type: Function,
      })
    },
    Deny() {
      return conclude([this.deny, globalProps.deny], {
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
      return conclude([this.getContainer, globalProps.getContainer, [true, ''].includes(this.ElDialogProps.appendToBody) ? 'body' : undefined], {
        type: [String, Function],
      })
    },
    ElDialogProps() {
      return conclude([this.$attrs, globalAttrs], {
        type: Object,
        camelizeObjectKeys: true,
        default: (userProp) => {
          this.beforeCloseIsPassed = Boolean(userProp.beforeClose)
          if (userProp.fullscreen !== undefined && this.show) {
            this.toggleFullscreen([true, ''].includes(userProp.fullscreen))
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
      })
    },
    ElFormProps() {
      return conclude([
        this.elFormProps,
        globalProps.elFormProps,
        {
          disabled: this.readonly || this.confirming,
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
      handler(newShow) {
        if (newShow) {
          /* if (!this.labelWidthSettled) {
            this.labelWidth = await this.getLabelWidth()
            this.labelWidthSettled = true
          } */
          this.retrieving = true
          const result = this.Retrieve?.()
          if (result instanceof Promise) {
            result.catch((e) => {
              console.error(e)
              this.onCancel()
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
  },
  mounted() {
    this.initialValue = cloneDeep(this.value)
  },
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
      if (typeof newValue !== 'boolean') {
        return
      }
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
    onReset() {
      this.$refs.elFormRef.resetFields()
    },
    onClosed() {
      this.$emit('input', cloneDeep(this.initialValue))
      this.$refs.elFormRef?.clearValidate()
      this.confirming = false
      this.denying = false
      this.closing = false
      // el-dialog 内部的 key 是在 onCancel 时改变
      // 改为 closed 时改变，提升性能，在 DOM 较多时感受明显
      if (['', true].includes(this.ElDialogProps.destroyOnClose)) {
        this.key++
      }
    },
    onCancel() {
      if (this.beforeCloseIsPassed) {
        this.$refs.elDialogRef.beforeClose()
      } else {
        this.$emit('update:show', false)
      }
    },
    onConfirm() {
      const exec = () => {
        if (typeof this.Confirm === 'function') {
          const result = this.Confirm()
          if (result instanceof Promise) {
            this.confirming = true
            result.then((data) => {
              if (data?.show === true) {
                this.confirming = false
              } else {
                this.onCancel()
              }
            }).catch((e) => {
              console.error(e)
              this.confirming = false
            })
          } else if (result?.show !== true) {
            this.onCancel()
          }
        } else {
          this.onCancel()
        }
      }

      if (this.$refs.elFormRef) {
        this.$refs.elFormRef.validate().then(() => {
          exec()
        }).catch((e) => {
          this.highlightError(undefined, this.$refs.overlayScrollbar)
        })
      } else {
        exec()
      }
    },
    onDeny() {
      const exec = () => {
        if (typeof this.Deny === 'function') {
          const result = this.Deny()
          if (result instanceof Promise) {
            this.denying = true
            result.then((data) => {
              if (data?.show === true) {
                this.denying = false
              } else {
                this.onCancel()
              }
            }).catch((e) => {
              console.error(e)
              this.denying = false
            })
          } else if (result?.show !== true) {
            this.onCancel()
          }
        } else {
          this.onCancel()
        }
      }

      if (this.$refs.elFormRef) {
        this.$refs.elFormRef.validate().then(() => {
          exec()
        }).catch((e) => {
          this.highlightError(undefined, this.$refs.overlayScrollbar)
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
      background-color: #C0C0C0;
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
