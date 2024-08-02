<script>
import 'viewerjs/dist/viewer.min.css'
import Viewer from 'viewerjs'
import 'swiper/swiper-bundle.css'
import Swiper from 'swiper'
import QRCode from 'qrcode'
import isURL from 'validator/es/lib/isURL'
import { conclude, resolveConfig } from 'vue-global-config'
import { isVue3 } from 'vue-demi'
import { useEventListener } from '@vueuse/core'
import { isBase64WithScheme, isObject, tryParsingJSONArray, unwrap } from '../../utils'

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
}

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = { }

export default {
  name: 'FaImage',
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
    srcAt: {},
    pattern: {},
    swiperOptions: {},
    qrcode: {
      type: [Boolean, String],
      default: undefined,
    },
    qrcodeOptions: {},
    viewable: {
      type: Boolean,
      default: undefined,
    },
    viewerOptions: {},
  },
  expose: ['viewer', 'swiper', 'hydrate'],
  data() {
    return {
      files: [],
      viewer: null,
      swiper: null,
      loading: true,
      cleanup: null,
    }
  },
  computed: {
    Viewable() {
      return conclude([this.viewable, globalProps.viewable, true], {
        type: Boolean,
      })
    },
    ViewerOptions() {
      return conclude([this.viewerOptions, globalProps.viewerOptions, {
        zIndex: 5000,
        zoomRatio: 0.5,
        show() {
          this.cleanup = useEventListener(document.body, 'keydown', (e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              this.viewer.hide()
            }
          })
        },
        hide() {
          this.cleanup?.()
          this.cleanup = null
        },
      }], {
        type: Object,
        mergeFunction: (previousValue, currentValue) => (...args) => {
          previousValue(...args)
          currentValue(...args)
        },
      })
    },
    SwiperOptions() {
      return conclude([this.swiperOptions, globalProps.swiperOptions, {
        // wrapperClass: 'swiper',
        // slideClass: 'item',
        observer: true,
      }], {
        type: Object,
      })
    },
    isInsideTable() {
      let parent = this.$parent
      while (parent) {
        // element-plus 是 TBODY
        if (['TABLE', 'TBODY', 'TR', 'TH', 'TD'].includes(parent.$el?.tagName)) {
          return true
        }
        parent = parent.$parent
      }
      return false
    },
    Pattern() {
      return conclude([
        this.pattern,
        globalProps.pattern,
        this.isInsideTable ? 'table-cell' : undefined,
      ], {
        type: String,
      })
    },
    Value() {
      return conclude([this[model.prop], globalProps[model.prop]], {
        type: [String, Array, Object],
      })
    },
    SrcAt() {
      return conclude([this.srcAt, globalProps.srcAt], {
        type: [String, Function, Symbol],
      })
    },
    QRCode() {
      return conclude([this.qrcode, globalProps.qrcode, false], {
        type: [Boolean, String],
      })
    },
    QRCodeOptions() {
      return conclude([this.qrcodeOptions, globalProps.qrcodeOptions, {
        margin: 0,
        // scale: 4, // 太大会导致卡顿
        errorCorrectionLevel: 'L',
        // 默认使用三倍图 更加清晰
        width: 444,
        height: 444,
      }], {
        type: Object,
      })
    },
    Attrs() {
      return conclude([
        this.$attrs,
        globalAttrs,
        {
          'waterfall': {
            width: '100%',
            height: '100%',
          },
          'table-cell': {
            height: '50px',
            style: {
              'vertical-align': 'bottom', // 换行时被遮挡
            },
          },
        }[this.Pattern],
        {
          height: '148px', // 与 el-upload 组件保持一致
          style: {
            'vertical-align': 'middle', // fix: 图片下方空隙
            'object-fit': 'cover', // 保持图片比例
            'max-width': '100%',
            'max-height': '100%',
            ...this.Viewable && { cursor: 'zoom-in' },
          },
        },
      ], {
        type: Object,
      })
    },
  },
  watch: {
    Value: {
      immediate: true,
      deep: true,
      async handler(newValue) {
        // 将 value 统一为对象数组
        this.loading = true
        if (newValue) {
          // 先统一为数组
          if (typeof newValue === 'string') {
            const arr = tryParsingJSONArray(newValue)
            newValue = arr || [newValue]
          }
          else if (isObject(newValue)) {
            newValue = [newValue]
          }
          // 应用 srcAt，并过滤空值
          if (Array.isArray(newValue)) {
            this.files = (await Promise.all(newValue.map(async (v) => {
              const src = unwrap(v, this.SrcAt)
              if (src && typeof src === 'string') {
                // 同步才能保证图片的顺序不变
                return await this.createItem(src).catch((e) => {
                  console.error(e)
                })
              }
            }))).filter(v => v)
          }
          else {
            this.files = []
          }
        }
        else {
          this.files = []
        }
        this.loading = false
      },
    },
    files() {
      this.hydrate()
    },
  },
  methods: {
    async createItem(src) {
      let type = 'qrcode'
      if (isURL(src || '')) {
        type = 'url'
      }
      else if (isBase64WithScheme(src, 'image/')) {
        type = 'base64'
      }

      const result = {
        src: '',
        type,
      }

      if (this.QRCode === 'auto') {
        // 字符串
        if (type === 'qrcode') {
          result.src = await QRCode.toDataURL(src, this.QRCodeOptions).catch((e) => {
            console.error(e)
          })
        // base64 或 URL
        }
        else {
          result.src = src
        }
      }
      else if (this.QRCode) {
        result.type = 'qrcode'
        result.src = await QRCode.toDataURL(src, this.QRCodeOptions).catch((e) => {
          console.error(e)
        })
      }
      else {
        result.src = src
      }

      return result
    },
    hydrate() {
      this.$nextTick(() => {
        if (this.files.length) {
          if (this.Pattern === 'swiper') {
            this.swiper ||= new Swiper(this.$refs.faImageRef, this.SwiperOptions)
          }
          else {
            this.swiper?.destroy()
            this.swiper = null
          }

          // this.viewer?.update() // 无效（非必现）
          this.viewer?.destroy()
          if (this.Viewable) {
            this.viewer = new Viewer(this.$refs.viewerRef, this.ViewerOptions)
          }
          else {
            this.viewer = null
          }
        }
        else {
          this.swiper?.destroy()
          this.swiper = null
          this.viewer?.destroy()
          this.viewer = null
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-if="files.length"
    ref="faImageRef"
    class="fa-image"
    :class="{
      'swiper-container': Pattern === 'swiper',
    }"
  >
    <ul
      ref="viewerRef"
      :class="(Pattern === 'swiper' ? 'swiper-wrapper' : Pattern) || 'normal-flow'"
    >
      <li
        v-for="({ src }, i) of files"
        :key="i"
        :class="{
          'swiper-slide': Pattern === 'swiper',
        }"
      >
        <slot
          :index="i"
          :src="src"
        >
          <img
            :src="src"
            v-bind="Attrs"
          >
        </slot>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
/*@keyframes bob {
  0% {
    transform: translateY(-8px);
  }
  50% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(-8px);
  }
}

@keyframes bob-float {
  100% {
    transform: translateY(-8px);
  }
}*/

$gap: 8px;
$gapInTableCell: 5px;

@media (any-hover: hover) {
  .curl-on-hover {
    vertical-align: middle;
    transform: perspective(1px) translateZ(0);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0);
    position: relative;

    &:before {
      content: '';
      pointer-events: none;
      position: absolute;
      height: 0;
      width: 0;
      bottom: 0;
      right: 0;
      background: white;
      //IE9
      background: linear-gradient(
        315deg,
        white 45%,
        #aaa 50%,
        #ccc 56%,
        white 80%
      );
      box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.4);
      transition-duration: 0.3s;
      transition-property: width, height;
    }

    &:hover:before,
    &:focus:before,
    &:active:before {
      width: 25px;
      height: 25px;
    }
  }

  .reveal-on-hover {
    display: inline-block;
    vertical-align: middle;
    transform: perspective(1px) translateZ(0);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0);
    position: relative;
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      z-index: -1;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      border-color: rgba(32, 152, 209, 0.1);
      border-style: solid;
      border-width: 0;
      transition-property: border-width;
      transition-duration: 0.1s;
      transition-timing-function: ease-out;
    }

    &:hover:before,
    &:focus:before,
    &:active:before {
      transform: translateY(0);
      border-width: 4px;
    }
  }
}

.swiper-container {
  overflow-x: hidden;
}

.fa-image {
  & > ul {
    padding: 0;
    margin: 0 auto;

    & > li {
      list-style: none;
    }
  }

  & > ul.swiper-wrapper {
    & > .swiper-slide {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  & > ul.waterfall {
    display: inline-block;
    position: relative;
    column-width: 148px;
    column-gap: $gap;
    width: 100%; // 图片大小完全一致时显示异常

    & > li {
      width: 100%;
      break-inside: avoid;
      // margin-bottom: $gap; // 会导致底部错位

      & > div {
        margin-bottom: $gap;
      }

      /*&:hover {
        animation-name: bob-float, bob;
        animation-duration: .3s, 1.5s;
        animation-delay: 0s, .3s;
        animation-timing-function: ease-out, ease-in-out;
        animation-iteration-count: 1, infinite;
        animation-fill-mode: forwards;
        animation-direction: normal, alternate;
      }*/
    }
  }

  & > ul.normal-flow {
    display: inline-flex;
    flex-wrap: wrap;
    gap: $gap;
    margin: 0;

    & > li {
      list-style: none;
      display: inline-block;
    }
  }

  & > ul.table-cell {
    display: inline-flex;
    flex-wrap: wrap;
    gap: $gapInTableCell;
    margin: 0;

    @media (any-hover: hover) {
      .curl-on-hover {
        &:hover:before,
        &:focus:before,
        &:active:before {
          width: 10px;
          height: 10px;
        }
      }
    }

    & > li {
      list-style: none;
      display: inline-block;
    }
  }
}
</style>
