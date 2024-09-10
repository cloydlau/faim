<script>
import { cloneDeep, isPlainObject } from 'lodash-es'
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import defaultLocale from '../../locale/en'
import { getListeners, isGlobalSlot } from '../../utils'
import highlightError from './highlightError'

const name = 'FaFormDialog'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

const boolProps = [
  'show',
  'readonly',
  'retrieving',
  'showFullscreenToggle',
  'showConfirmButton',
  'showDenyButton',
  'showSaveButton',
  'showResetButton',
  'showCancelButton',
  'reverseButtons',
]

const boolAttrs = [
  'fullscreen',
  'modal',
  'appendToBody',
  'lockScroll',
  'closeOnClickModal',
  'closeOnPressEscape',
  'showClose',
  'draggable',
  'center',
  'alignCenter',
  'destroyOnClose',
  'overflow',
  'modalAppendToBody', // vue 2 only
]

export default {
  name,
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, { props: this.props, camelizePropNames: true })
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
  props: {
    [model.prop]: {},
    title: {},
    elFormProps: {},
    retrieve: {},
    confirm: {},
    deny: {},
    save: {},
    reset: {},
    locale: {},
    // beforeCancel: {},
    ...Object.fromEntries(Array.from(boolProps, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
    ...Object.fromEntries(Array.from(boolAttrs, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: [model.event, 'update:show', 'fullscreenChange'],
  data() {
    return {
      initialValue: undefined,
      initiated: false,
      retrieving_inner: true,
      confirming: false,
      denying: false,
      saving: false,
      closing: false,
      scrollbar: null,
      isFullscreen: false,
      labelWidth: undefined,
      key: 0,
      isVue3,
    }
  },
  computed: {
    Readonly() {
      return conclude([this.readonly, globalProps.readonly, false], {
        type: Boolean,
      })
    },
    Locale() {
      return conclude([this.locale, globalProps.locale, defaultLocale[name]], {
        type: Object,
      })
    },
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    Slots() {
      return conclude([isVue3 ? this.$slots : this.$scopedSlots, globalSlots])
    },
    headerSlotName() {
      return isVue3 ? 'header' : 'title'
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
    ShowSaveButton() {
      return conclude([this.showSaveButton, globalProps.showSaveButton, false], {
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
      return isPlainObject(this[model.prop])
    },
    Title() {
      return conclude([this.title, globalProps.title], {
        type: String,
      })
    },
    Retrieving() {
      return conclude([this.retrieving, globalProps.retrieving, this.retrieving_inner], {
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
    Save() {
      return conclude([this.save, globalProps.save], {
        type: Function,
      })
    },
    Reset() {
      return conclude([this.reset, globalProps.reset], {
        type: Function,
      })
    },
    ElDialogProps() {
      return conclude([
        Object.fromEntries(
          Array.from(boolAttrs, boolAttr => [boolAttr, conclude([this[boolAttr], globalProps[boolAttr]])]).filter(
            ([, item]) => item !== undefined,
          ),
        ),
        this.$attrs,
        globalAttrs,
        isVue3 ? globalListeners : undefined,
        {
          closeOnClickModal: false,
          modalClass: 'fa-form-dialog-modal',
        },
      ], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
    ElFormProps() {
      return {
        model: this[model.prop],
        ...conclude([
          this.elFormProps,
          globalProps.elFormProps,
          {
            disabled: this.readonly || this.confirming,
            ref: 'elFormRef',
            // model 不能写在这里因为会被深拷贝，将导致无法重置
            // model: this[model.prop],
          },
          isVue3 ? globalListeners : undefined,
        ], {
          type: Object,
          camelizeObjectKeys: true,
        }),
      }
    },
    /* BeforeCancel() {
      return conclude([this.beforeCancel, globalProps.beforeCancel], {
        type: Function,
      })
    }, */
  },
  watch: {
    show: {
      // 针对默认打开的情况 默认打开时 依然执行 retrieve
      immediate: true,
      handler(newShow) {
        if (newShow) {
          if (this.ElDialogProps.fullscreen !== undefined) {
            this.toggleFullscreen(this.ElDialogProps.fullscreen)
          }
          /* if (!this.labelWidthSettled) {
            this.labelWidth = await this.getLabelWidth()
            this.labelWidthSettled = true
          } */
          this.retrieving_inner = true
          const result = this.Retrieve?.()
          if (result instanceof Promise) {
            result.catch((e) => {
              console.error(e)
              this.doClose()
            }).finally(() => {
              this.retrieving_inner = false
            })
          }
          else {
            this.retrieving_inner = false
          }
          this.computeLabelWidth()
          // 不兼容 tinymce
          /* this.$nextTick(() => {
            this.osInstance = OverlayScrollbars(this.$refs.overlayScrollbar, {})
          }) */
        }
        this.initiated = true
      },
    },
  },
  mounted() {
    this.initialValue = cloneDeep(this[model.prop])
  },
  updated() {
    this.computeLabelWidth()
  },
  methods: {
    isGlobalSlot,
    toggleFullscreen(newValue = !this.isFullscreen) {
      if (typeof newValue !== 'boolean') {
        return
      }
      this.isFullscreen = newValue
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
        this.$emit('fullscreenChange', this.isFullscreen)
      })
    },
    // fix: https://github.com/ElemeFE/element/issues?q=label+width+auto
    computeLabelWidth() {
      const { labelWidth, labelPosition } = this.ElFormProps
      // 如果 label 位置不为顶部 且 用户没有指定 label 宽度，则计算 label 宽度
      if (labelPosition !== 'top' && [undefined, 'auto'].includes(labelWidth)) {
        this.$nextTick(() => {
          // fix: show 的初始值为 true 时 this.$refs.elFormRef 为空
          setTimeout(() => {
            let max = 0
            this.$refs[this.ElFormProps.ref]?.$el.querySelectorAll('.el-form-item__label').forEach((item) => {
              // updated 时，避免受之前设置的宽度影响
              const prevWidth = item.style.width
              item.style.width = 'revert'
              const computedWidth = Math.ceil(Number.parseFloat(window.getComputedStyle(item).width))
              if (computedWidth > max) {
                max = computedWidth
              }
              // 不还原会导致文案变成居左的（默认是居右）
              item.style.width = prevWidth
            })
            if (max) {
              this.labelWidth = `${max}px`
            }
          }, 0)
        })
      }
    },
    onClose() {
      // 首次不执行
      if (this.initiated) {
        this.closing = true
      }
      // esc 关闭时，show 仍为 true
      if (this.show) {
        this.doClose()
      }
    },
    onClosed() {
      this.$emit(model.event, cloneDeep(this.initialValue))
      this.$refs[this.ElFormProps.ref]?.clearValidate()
      this.confirming = false
      this.denying = false
      this.saving = false
      this.closing = false
      // el-dialog 内部的 key 是在 close 时改变
      // 改为 closed 时改变，提升性能，在 DOM 较多时感受明显
      if (this.destroyOnClose) {
        this.key++
      }
    },
    /* cancel() {
      if (this.BeforeCancel) {
        this.BeforeCancel(this.doClose)
      } else {
        this.doClose()
      }
    }, */
    close() {
      // el-dialog 在点击右上角和 esc 时，会触发 beforeClose，点击自定义的取消按钮不会触发
      // FaImageUpload 自定义了右上角，因此只有 esc 时触发 beforeClose
      // 由于 FaImageUpload 封装了关闭逻辑，所以需要配套补全 beforeClose
      if (this.ElDialogProps.beforeClose) {
        this.ElDialogProps.beforeClose(this.doClose)
      }
      else {
        this.doClose()
      }
    },
    doClose() {
      this.$emit('update:show', false)
    },
    onAction(type, status) {
      const exec = () => {
        if (typeof this[type] === 'function') {
          const result = this[type]()
          if (result instanceof Promise) {
            this[status] = true
            result.then((data) => {
              if (data?.show === true) {
                this[status] = false
              }
              else {
                this.close()
              }
            }).catch((e) => {
              console.error(e)
              this[status] = false
            })
          }
          else if (result?.show !== true) {
            this.close()
          }
        }
        else {
          this.close()
        }
      }

      if (this.$refs[this.ElFormProps.ref]) {
        this.$refs[this.ElFormProps.ref].validate().then(() => {
          exec()
        }).catch(() => {
          this.highlightError(undefined, this.$refs.overlayScrollbar)
        })
      }
      else {
        exec()
      }
    },
    onReset() {
      this.$refs[this.ElFormProps.ref]?.resetFields()
      this.Reset?.()
    },
    highlightError,
  },
}
</script>

<template>
  <!-- 为什么要套一个 div？ -->
  <!-- https://github.com/element-plus/element-plus/issues/10515 -->
  <div>
    <el-dialog
      v-bind="ElDialogProps"
      ref="elDialogRef"
      :key="key"
      :model-value="show"
      :visible="show"
      :title="Title"
      :fullscreen="isFullscreen"
      class="fa-form-dialog"
      v-on="Listeners"
      @close="onClose"
      @closed="onClosed"
    >
      <!-- 向 el-dialog 传递 slot -->
      <template #[headerSlotName]>
        <!-- 接收 slot -->
        <component
          :is="Slots[headerSlotName]()"
          v-if="isGlobalSlot(Slots[headerSlotName])"
        />
        <slot
          v-else
          :name="headerSlotName"
        >
          <span>{{ Title }}</span>
        </slot>
        <div style="display: flex; align-items: center;">
          <template v-if="ShowFullscreenToggle">
            <svg
              v-if="isFullscreen"
              class="icon-fullscreen"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              @click="toggleFullscreen()"
            ><path
              fill="currentColor"
              d="M6 21v-3H3v-2h5v5H6Zm10 0v-5h5v2h-3v3h-2ZM3 8V6h3V3h2v5H3Zm13 0V3h2v3h3v2h-5Z"
            /></svg>
            <svg
              v-else
              class="icon-fullscreen-exit"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              @click="toggleFullscreen()"
            ><path
              fill="currentColor"
              d="M3 21v-5h2v3h3v2H3Zm13 0v-2h3v-3h2v5h-5ZM3 8V3h5v2H5v3H3Zm16 0V5h-3V3h5v5h-2Z"
            /></svg>
          </template>
          <svg
            v-if="ElDialogProps.showClose !== false"
            class="icon-close"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            @click="close"
          ><path
            fill="currentColor"
            d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275q-.275-.275-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275L12 13.4Z"
          /></svg>
        </div>
      </template>
      <div
        v-loading="Retrieving"
        style="display: flex; flex-direction: column; overflow-y: hidden;"
        :class="Readonly && 'is-readonly'"
      >
        <div
          ref="overlayScrollbar"
          style="overflow-y: auto; padding: 10px 20px 40px 40px; max-height:calc(100vh - 54.5px);"
          :style="{ paddingBottom: isFullscreen ? '40px' : '85px' }"
        >
          <el-form
            v-if="ValueIsPlainObject"
            :label-width="labelWidth"
            v-bind="ElFormProps"
            v-on="Listeners"
          >
            <component
              :is="Slots.default()"
              v-if="isGlobalSlot(Slots.default)"
            />
            <slot v-else />
          </el-form>
          <template v-else>
            <component
              :is="Slots.default()"
              v-if="isGlobalSlot(Slots.default)"
            />
            <slot v-else />
          </template>
        </div>
      </div>

      <template #footer>
        <component
          :is="Slots.footer()"
          v-if="isGlobalSlot(Slots.footer)"
        />
        <slot
          v-else
          name="footer"
        >
          <template v-if="ReverseButtons">
            <el-button
              v-if="ShowConfirmButton"
              type="primary"
              :disabled="closing || denying || saving"
              :class="closing && 'closing'"
              :loading="confirming"
              @click="onAction('Confirm', 'confirming')"
            >
              {{ Locale.confirm }}
            </el-button>
            <el-button
              v-if="ShowDenyButton"
              type="danger"
              :disabled="closing || confirming || saving"
              :class="closing && 'closing'"
              :loading="denying"
              @click="onAction('Deny', 'denying')"
            >
              {{ Locale.deny }}
            </el-button>
            <el-button
              v-if="ShowSaveButton"
              type="info"
              :disabled="closing || confirming || denying"
              :class="closing && 'closing'"
              :loading="saving"
              @click="onAction('Save', 'saving')"
            >
              {{ Locale.save }}
            </el-button>
            <el-button
              v-if="ShowResetButton"
              type="info"
              :disabled="closing || confirming || denying || saving"
              @click="onReset"
            >
              {{ Locale.reset }}
            </el-button>
            <el-button
              v-if="ShowCancelButton"
              :disabled="closing"
              :class="closing && 'closing'"
              @click="close"
            >
              {{ Locale.cancel }}
            </el-button>
          </template>

          <template v-else>
            <el-button
              v-if="ShowCancelButton"
              :disabled="closing"
              :class="closing && 'closing'"
              @click="close"
            >
              {{ Locale.cancel }}
            </el-button>
            <el-button
              v-if="ShowResetButton"
              type="info"
              :disabled="closing || confirming || denying || saving"
              @click="onReset"
            >
              {{ Locale.reset }}
            </el-button>
            <el-button
              v-if="ShowSaveButton"
              type="info"
              :disabled="closing || confirming || denying"
              :class="closing && 'closing'"
              :loading="saving"
              @click="onAction('Save', 'saving')"
            >
              {{ Locale.save }}
            </el-button>
            <el-button
              v-if="ShowDenyButton"
              type="danger"
              :disabled="closing || confirming || saving"
              :class="closing && 'closing'"
              :loading="denying"
              @click="onAction('Deny', 'denying')"
            >
              {{ Locale.deny }}
            </el-button>
            <el-button
              v-if="ShowConfirmButton"
              type="primary"
              :disabled="closing || denying || saving"
              :class="closing && 'closing'"
              :loading="confirming"
              @click="onAction('Confirm', 'confirming')"
            >
              {{ Locale.confirm }}
            </el-button>
          </template>
        </slot>
      </template>
    </el-dialog>
  </div>
</template>

<!-- <style lang="scss" scoped>
// 动画
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
}
</style> -->

<style lang="scss">
 // element plus
.fa-form-dialog-modal>.el-overlay-dialog,
 // element ui
 .fa-form-dialog.el-dialog__wrapper {
  display: flex;

  & > .el-dialog {
    padding: 0;

    &:not(.is-fullscreen) {
      margin: auto !important;

      .el-dialog__body {
        max-height: calc(100vh - 75px);
      }
    }

    .el-dialog__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;

      & > .el-dialog__headerbtn {
        display: none;
      }

      .icon-fullscreen,
      .icon-fullscreen-exit {
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }

      .icon-close {
        cursor: pointer;
        margin-left: 15px;

        &:hover {
          color: #ff7575;
        }
      }
    }

    .el-dialog__body {
      max-height: calc(100vh - 54.5px);
      overflow-y: auto;
      padding: 0;
      display: flex;
      flex-direction: column;

      /* .el-form-item__content {
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
      } */

      .el-form-item:last-child {
        margin-bottom: 0;
      }

      ::-webkit-scrollbar {
        width: 6px; // 纵向滚动条
        height: 6px; // 横向滚动条
      }

      ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: #c0c0c0;
      }

      .is-readonly {
        [disabled='disabled'],
        .is-disabled,
        .is-disabled *,
        .disabled {
          -webkit-text-fill-color: revert;
          color: revert;
          cursor: revert;
        }

        .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner,
        .el-checkbox__input.is-disabled.is-indeterminate .el-checkbox__inner {
          background-color: #409eff;
          border-color: #409eff;
        }

        .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
          border-color: #fff;
          cursor: revert;
        }

        .el-radio__input.is-disabled.is-checked {
          .el-radio__inner {
            border-color: #409eff;
            background: #409eff;
          }

          .el-radio__inner::after {
            cursor: revert;
            background-color: #fff;
            border-color: revert;
          }
        }

        .el-slider__bar {
          background-color: #409eff;
        }

        .el-slider__button-wrapper {
          cursor: revert;
        }

        .el-slider__button {
          border: solid 2px #409eff;
          cursor: revert;
        }

        .el-color-picker.is-disabled > .el-color-picker__mask {
          display: none;
        }

        .el-upload,
        .el-upload-dragger {
          cursor: revert;
        }

        .el-switch {
          opacity: revert;
        }

        .el-rate .el-rate__icon.is-active {
          color: var(--el-rate-fill-color);
        }

        .el-color-picker__icon {
          color: #fff;
        }

        .el-transfer__button {
          color: #fff;
        }

        .el-switch__inner .is-text {
          color: var(--el-color-white);
        }
      }
    }

    .el-dialog__footer {
      position: absolute;
      bottom: 0;
      right: 0;
      backdrop-filter: blur(1px);
      z-index: 3; // higher than .el-table__inner-wrapper
      padding: 16px;

      .el-button.is-disabled.closing {
        cursor: revert;
      }
    }
  }
}
</style>
