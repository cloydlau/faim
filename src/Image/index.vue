<script>
import 'viewerjs/dist/viewer.min.css'
import 'swiper/css'
import Swiper from 'swiper'
import Viewer from 'viewerjs'

// import QRCode from 'qrcode'
import isURL from 'validator/es/lib/isURL'
import { conclude, resolveConfig } from 'vue-global-config'
import { isVue3 } from 'vue-demi'
import { isBase64WithScheme, isObject, tryParsingJSONArray, unwrap } from './utils'

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
}

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = { }

export default {
  name: 'KiImage',
  install(app, options = {}) {
    const { props, attrs, listeners, slots } = resolveConfig(options, this.props)
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
    swiperProps: {},
    qrcode: {
      type: [Boolean, String],
      default: undefined,
    },
    qrcodeProps: {},
    viewerjs: {
      type: Boolean,
      default: undefined,
    },
    viewerjsProps: {},
  },
  emits: ['click'],
  expose: ['viewer'],
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
    Viewerjs() {
      return conclude([this.viewerjs, globalProps.viewerjs, true], {
        type: Boolean,
      })
    },
    ViewerjsProps() {
      return conclude([this.viewerjsProps, globalProps.viewerjsProps, {
        zIndex: 5000,
        zoomRatio: 0.5,
        show() {
          // fix: 在 webpack 项目中会报错，但不影响正常使用
          try {
            this.cleanup = useEventListener(document, 'keydown', (e) => {
              if (e.key === 'Escape') {
                e.stopPropagation()
              }
            })
          } catch (e) { }
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
    SwiperProps() {
      return conclude([this.swiperProps, globalProps.swiperProps, {
        // wrapperClass: 'swiper',
        // slideClass: 'item',
        observer: true,
      }], {
        type: Object,
      })
    },
    Pattern() {
      return conclude([
        this.pattern,
        globalProps.pattern,
        // element-plus 是 TBODY
        ['TABLE', 'TBODY', 'TR', 'TH', 'TD'].includes(this.$parent?.$el?.tagName)
          ? 'table-cell'
          : undefined,
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
    Qrcode() {
      return conclude([this.qrcode, globalProps.qrcode, false], {
        type: [Boolean, String],
      })
    },
    QrcodeProps() {
      return conclude([this.qrcodeProps, globalProps.qrcodeProps, {
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
  },
  watch: {
    Value: {
      immediate: true,
      async handler(newValue) {
        // 将 value 统一为对象数组
        this.loading = true
        if (newValue) {
          // 先统一为数组
          if (typeof newValue === 'string') {
            const arr = tryParsingJSONArray(newValue)
            newValue = arr || [newValue]
          } else if (isObject(newValue)) {
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
          } else {
            this.files = []
          }
        } else {
          this.files = []
        }
        this.loading = false
      },
    },
    files(newFiles) {
      if (newFiles.length) {
        this.$nextTick(() => {
          if (this.Pattern === 'swiper' && !this.swiper) {
            this.swiper = new Swiper(this.$refs.kiImage, this.SwiperProps)
          }

          if (this.Viewerjs) {
            if (this.viewer) {
              // this.viewer.update() // 无效（非必现）
              this.viewer.destroy()
            }
            this.viewer = new Viewer(this.$refs.viewer, this.ViewerjsProps)
          }
        })
      }
    },
  },
  methods: {
    async createItem(src) {
      let type = 'qrcode'
      if (isURL(src || '')) {
        type = 'url'
      } else if (isBase64WithScheme(src, 'image/')) {
        type = 'base64'
      }

      const result = {
        src: '',
        type,
        width: '',
        height: '',
      }

      if (this.Qrcode === 'auto') {
        // 字符串
        if (type === 'qrcode') {
          result.src = await QRCode.toDataURL(src, this.QrcodeProps).catch((e) => {
            console.error(e)
          })
        // base64 或 URL
        } else {
          result.src = src
        }
      } else if (this.Qrcode) {
        result.type = 'qrcode'
        result.src = await QRCode.toDataURL(src, this.QrcodeProps).catch((e) => {
          console.error(e)
        })
      } else {
        result.src = src
      }

      return result
    },
  },
}
</script>

<template>
  <div
    v-if="files.length"
    ref="kiImage"
    class="ki-image"
    :class="{
      'swiper-container': Pattern === 'swiper',
    }"
  >
    <ul
      ref="viewer"
      :class="(Pattern === 'swiper' ? 'swiper-wrapper' : Pattern) || 'normal-flow'"
    >
      <li
        v-for="({ src, width, height }, i) of files"
        :key="i"
        :class="{
          'swiper-slide': Pattern === 'swiper',
        }"
      >
        <div @click="() => { $emit('click', { index: i, src }) }">
          <slot
            :index="i"
            :src="src"
          >
            <img
              :src="src"
              referrerpolicy="no-referrer"
              :width="width"
              :height="height"
              :class="{
                'cursor-pointer': Viewerjs,
              }"
            >
          </slot>
        </div>
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
      background: linear-gradient(315deg, white 45%, #aaa 50%, #ccc 56%, white 80%);
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
      content: "";
      position: absolute;
      z-index: -1;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      border-color: rgba(32, 152, 209, .1);
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

.ki-image {
  img {
    vertical-align: middle; // fix: 图片下方空隙
    object-fit: cover; // 保持图片比例
    max-width: 100%;
    max-height: 100%;
  }

  &>ul {
    padding: 0;
    margin: 0 auto;

    &>li {
      list-style: none;
    }
  }

  &>ul.swiper-wrapper {
    &>.swiper-slide {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  &>ul.waterfall {
    display: inline-block;
    position: relative;
    column-width: 148px;
    column-gap: $gap;
    width: 100%; // 图片大小完全一致时显示异常

    &>li {
      width: 100%;
      break-inside: avoid;
      // margin-bottom: $gap; // 会导致底部错位

      &>div {
        margin-bottom: $gap;

        &>img {
          width: 100%;
          height: 100%;
        }
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

  &>ul.normal-flow {
    display: inline-flex;
    flex-wrap: wrap;
    gap: $gap;
    margin: 0;

    &>li {
      list-style: none;
      display: inline-block;

      img {
        height: 148px; // 与 el-upload 组件保持一致
        vertical-align: middle;
      }
    }
  }

  &>ul.table-cell {
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

    &>li {
      list-style: none;
      display: inline-block;

      img {
        height: 50px;
        vertical-align: bottom; // 换行时被遮挡
      }
    }
  }
}
</style>
