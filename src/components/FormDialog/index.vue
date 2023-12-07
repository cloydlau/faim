<script>
import './index.scss'
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import { cloneDeep, isPlainObject } from 'lodash-es'
import { getListeners, isGlobalSlot } from '../../utils'
import defaultLocale from '../../locale/en'
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
  'draggable',
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
    ...Object.fromEntries(Array.from(boolProps, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
    ...Object.fromEntries(Array.from(boolAttrs, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: [model.event, 'update:show', 'fullscreen-change'],
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
      beforeCloseIsPassed: false,
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
            ([, v]) => v !== undefined,
          ),
        ),
        this.$attrs,
        globalAttrs,
        isVue3 ? globalListeners : undefined,
      ], {
        type: Object,
        camelizeObjectKeys: true,
        default: (userProp) => {
          this.beforeCloseIsPassed = Boolean(userProp.beforeClose)
          if (this.fullscreen !== undefined && this.show) {
            this.toggleFullscreen(this.fullscreen)
          }
          return {
            closeOnClickModal: false,
            modalClass: 'fa-form-dialog-modal',
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
      return {
        model: this[model.prop],
        ...conclude([
          this.elFormProps,
          globalProps.elFormProps,
          {
            disabled: this.readonly || this.confirming,
            ref: 'elFormRef',
            labelWidth: this.labelWidth,
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
          this.retrieving_inner = true
          const result = this.Retrieve?.()
          if (result instanceof Promise) {
            result.catch((e) => {
              console.error(e)
              this.onCancel()
            }).finally(() => {
              this.retrieving_inner = false
            })
          } else {
            this.retrieving_inner = false
          }
          this.computeLabelWidth()
          // 不兼容 tinymce
          /* this.$nextTick(() => {
            this.osInstance = OverlayScrollbars(this.$refs.overlayScrollbar, {})
          }) */
        // 首次不执行
        } else if (this.initiated) {
          this.closing = true
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
        this.$emit('fullscreen-change', this.isFullscreen)
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
    onClosed() {
      this.$emit(model.event, cloneDeep(this.initialValue))
      this.$refs[this.ElFormProps.ref]?.clearValidate()
      this.confirming = false
      this.denying = false
      this.saving = false
      this.closing = false
      // el-dialog 内部的 key 是在 onCancel 时改变
      // 改为 closed 时改变，提升性能，在 DOM 较多时感受明显
      if (this.destroyOnClose) {
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
    onAction(type, status) {
      const exec = () => {
        if (typeof this[type] === 'function') {
          const result = this[type]()
          if (result instanceof Promise) {
            this[status] = true
            result.then((data) => {
              if (data?.show === true) {
                this[status] = false
              } else {
                this.onCancel()
              }
            }).catch((e) => {
              console.error(e)
              this[status] = false
            })
          } else if (result?.show !== true) {
            this.onCancel()
          }
        } else {
          this.onCancel()
        }
      }

      if (this.$refs[this.ElFormProps.ref]) {
        this.$refs[this.ElFormProps.ref].validate().then(() => {
          exec()
        }).catch(() => {
          this.highlightError(undefined, this.$refs.overlayScrollbar)
        })
      } else {
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
      :modelValue="show"
      :visible="show"
      :title="Title"
      :destroyOnClose="false"
      :fullscreen="isFullscreen"
      class="fa-form-dialog"
      v-on="Listeners"
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
            @click="onCancel"
          ><path
            fill="currentColor"
            d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275q-.275-.275-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275L12 13.4Z"
          /></svg>
        </div>
      </template>
      <div
        v-loading="Retrieving"
        style="display: flex; flex-direction: column; overflow-y: hidden;"
      >
        <div
          ref="overlayScrollbar"
          style="overflow-y: auto; padding: 10px 40px 40px 40px; max-height:calc(100vh - 45px);"
          :style="{ paddingBottom: isFullscreen ? '40px' : '85px' }"
        >
          <el-form
            v-if="ValueIsPlainObject"
            :class="Readonly && 'readonly'"
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
              @click="onCancel"
            >
              {{ Locale.cancel }}
            </el-button>
          </template>

          <template v-else>
            <el-button
              v-if="ShowCancelButton"
              :disabled="closing"
              :class="closing && 'closing'"
              @click="onCancel"
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
