<template>
  <el-dialog
    v-if="show"
    :visible="show"
    :fullscreen="true"
    :append-to-body="true"
    :show-close="false"
    destroy-on-close
    custom-class="ki-map"
    class="ki-map"
    @close="$emit('update:show', false)"
    v-on="$listeners"
  >
    <!-- <div slot="title" class="title">
      <span v-text="title||'坐标拾取'" class="title-text"/>
    </div> -->
    <div style="height:100%">
      <div class="autoComplete-wrapper">
        <span class="magnifier" />
        <input
          id="autoComplete"
          v-model="keyword"
          tabindex="1"
          @keyup.enter="e => {
            search()
            e.currentTarget.blur()
          }"
        >
        <KiSelect
          v-model="baseCity"
          class="region-select"
          placeholder="当前城市"
          :options="cities"
          :props="{ value: 'id', label: 'name', groupLabel: 'name', groupOptions: 'cities' }"
          @update:label="(n) => {
            if (map) {
              map.setCity(n)
              drawDistrict(n)
            }
          }"
        />
      </div>
      <transition
        enter-active-class="animate__animated animate__backInLeft"
        leave-active-class="animate__animated animate__backOutLeft"
      >
        <div
          v-show="searchResult.length > 0"
          v-loading="searching"
          class="drawer"
        >
          <div
            v-for="(v, i) of searchResult"
            :key="i"
            class="item"
            @click="locate(v)"
          >
            <div>{{ v.name }}</div>
            <div>{{ v.address }}</div>
          </div>
        </div>
      </transition>
      <!-- <div class="meny-arrow">
        <i class="el-icon-search"/>
        <span>搜索</span>
      </div> -->
      <div
        id="map-container"
        ref="map-container"
        v-loading="Loading"
        element-loading-custom-class="map-container"
      />

      <div
        id="panel"
        class="scrollbar1"
      >
        <ul id="myList" />
      </div>
    </div>

    <Toolbar>
      <el-tooltip
        effect="dark"
        content="使用帮助"
        placement="bottom"
      >
        <a @click.stop="help">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M11 16h2v2h-2zm1-14C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5c0-2.21-1.79-4-4-4z"
            />
          </svg>
        </a>
      </el-tooltip>
      <el-dropdown
        :class="{ active: active === 'marker' }"
        @command="command => { this[command](['marker']) }"
      >
        <a @click.stop="active = 'marker'">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 1 0 3 5 9.71C17 12 17 10 17 9a5 5 0 0 0-5-5Z"
            />
          </svg>
        </a>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="reset">
              重置点位
            </el-dropdown-item>
            <el-dropdown-item command="clear">
              清除点位
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown
        v-if="(polyline && polyline.length) || PolylineMaxCount > 0"
        :class="{ active: active === 'polyline' }"
        @command="command => { this[command](['polyline']) }"
      >
        <a @click.stop="onPolylineBtnClick">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17 22q-.825 0-1.412-.587Q15 20.825 15 20v-.5l-7.275-3.625l-.35.087Q7.225 16 7 16H5q-.825 0-1.413-.588Q3 14.825 3 14v-2q0-.825.587-1.413Q4.175 10 5 10h2.138q.062 0 .137.025l2.875-3.3q-.075-.15-.112-.338Q10 6.2 10 6V4q0-.825.588-1.413Q11.175 2 12 2h2q.825 0 1.413.587Q16 3.175 16 4v2q0 .825-.587 1.412Q14.825 8 14 8h-2.162q-.063 0-.113-.025l-2.85 3.275q.05.2.088.362Q9 11.775 9 12v2.112q0 .063-.025.113l6.15 3.075q.2-.55.7-.925Q16.325 16 17 16h2q.825 0 1.413.587Q21 17.175 21 18v2q0 .825-.587 1.413Q19.825 22 19 22ZM12 6h2V4h-2Zm-7 8h2v-2H5Zm12 6h2v-2h-2ZM13 5Zm-7 8Zm12 6Z"
            />
          </svg>
        </a>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="reset">
              重置折线
            </el-dropdown-item>
            <el-dropdown-item command="clear">
              清除折线
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown
        v-if="(rectangle && rectangle.length) || RectangleMaxCount > 0"
        :class="{ active: active === 'rectangle' }"
        @command="command => { this[command](['rectangle']) }"
      >
        <a @click.stop="onRectangleBtnClick">
          <svg
            viewBox="0 0 100 100"
            :class="!RectangleMaxCount && 'disabled'"
          >
            <path
              fill="currentColor"
              d="M12.55 15C5.662 15 0 20.661 0 27.55c0 6.017 4.317 11.096 10 12.286v20.428c-5.683 1.19-10 6.27-10 12.287C0 79.44 5.661 85.1 12.55 85.1c6.047 0 11.09-4.374 12.241-10.1h50.455c1.152 5.732 6.253 10.1 12.305 10.1c6.65 0 12.105-5.288 12.478-11.852a3.5 3.5 0 0 0 .07-.697a3.5 3.5 0 0 0-.07-.697C99.703 66.117 95.495 61.356 90 60.246V39.854c5.495-1.11 9.703-5.87 10.03-11.606a3.5 3.5 0 0 0 .07-.697a3.5 3.5 0 0 0-.07-.697C99.655 20.29 94.201 15 87.55 15c-6.016 0-11.096 4.317-12.286 10H24.77c-1.19-5.676-6.209-10-12.22-10zm0 7c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55C9.445 33.1 7 30.657 7 27.55C7 24.445 9.444 22 12.55 22zm75 0c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.106 0-5.55-2.443-5.55-5.55c0-3.106 2.444-5.55 5.55-5.55zM24.218 32h51.62A12.678 12.678 0 0 0 83 39.225v21.65A12.684 12.684 0 0 0 75.875 68h-51.7A12.64 12.64 0 0 0 17 60.838V39.262A12.638 12.638 0 0 0 24.217 32zM12.55 67c3.106 0 5.549 2.444 5.549 5.55c0 3.107-2.443 5.55-5.55 5.55C9.445 78.1 7 75.657 7 72.55C7 69.445 9.444 67 12.55 67zm75 0c3.106 0 5.549 2.444 5.549 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.106 0-5.55-2.443-5.55-5.55c0-3.106 2.444-5.55 5.55-5.55z"
              color="currentColor"
            />
          </svg>
        </a>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-if="RectangleMaxCount > 0 && RectangleImage.length > 0"
              command="setCurImage"
            >
              选择贴图
            </el-dropdown-item>
            <el-dropdown-item command="reset">
              重置矩形
            </el-dropdown-item>
            <el-dropdown-item command="clear">
              清除矩形
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown
        v-if="(polygon && polygon.length) || PolygonMaxCount > 0"
        :class="{ active: active === 'polygon' }"
        @command="command => { this[command](['polygon']) }"
      >
        <a @click.stop="onPolygonBtnClick">
          <svg
            viewBox="0 0 256 256"
            :class="!PolygonMaxCount && 'disabled'"
          >
            <path
              fill="currentColor"
              d="M230.6 49.4a31.9 31.9 0 0 0-45.2 0a30.2 30.2 0 0 0-5.2 6.7L152 48.4a32 32 0 0 0-54.6-23a32 32 0 0 0-5.8 37.4L57.7 93.3a32 32 0 0 0-40.3 4.1a31.9 31.9 0 0 0 0 45.2A31.6 31.6 0 0 0 40 152a32.1 32.1 0 0 0 20.3-7.2l70 51.3a32 32 0 0 0 7.1 34.5a31.9 31.9 0 0 0 45.2 0a31.9 31.9 0 0 0 0-45.2a43.3 43.3 0 0 0-4.7-4l27.3-77.5h2.8a31.6 31.6 0 0 0 22.6-9.4a31.9 31.9 0 0 0 0-45.1ZM108.7 36.7a16 16 0 1 1 0 22.6a15.9 15.9 0 0 1 0-22.6Zm-80 94.6a15.9 15.9 0 0 1 0-22.6a16 16 0 1 1 0 22.6Zm142.6 88a16 16 0 0 1-22.6-22.6a16 16 0 0 1 22.6 22.6Zm-8.5-43.2a32.4 32.4 0 0 0-23.1 7.1l-70-51.3a32.4 32.4 0 0 0-1.3-26.7l33.9-30.5A32.4 32.4 0 0 0 120 80a31.6 31.6 0 0 0 22.6-9.4a30.2 30.2 0 0 0 5.2-6.7l28.2 7.7a31.6 31.6 0 0 0 9.4 23a43.3 43.3 0 0 0 4.7 4Zm56.5-92.8a16 16 0 0 1-22.6-22.6a16 16 0 1 1 22.6 22.6Z"
            />
          </svg>
        </a>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="reset">
              重置多边形
            </el-dropdown-item>
            <el-dropdown-item command="clear">
              清除多边形
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-tooltip
        effect="dark"
        content="取消"
        placement="bottom"
      >
        <el-popconfirm
          title="不保存并退出"
          @confirm="cancel"
          @onConfirm="cancel"
        >
          <template #reference>
            <a>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m2.59 6L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41L14.59 8Z"
                />
              </svg>
            </a>
          </template>
        </el-popconfirm>
      </el-tooltip>
      <el-tooltip
        :class="Loading && 'invisible'"
        effect="dark"
        content="确定"
        placement="bottom"
      >
        <a @click.stop="confirm">
          <svg viewBox="0 0 24 24">
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path
                stroke-dasharray="60"
                stroke-dashoffset="60"
                d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
              >
                <animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  dur="0.5s"
                  values="60;0"
                />
              </path>
              <path
                stroke-dasharray="14"
                stroke-dashoffset="14"
                d="M8 12L11 15L16 10"
              >
                <animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  begin="0.6s"
                  dur="0.2s"
                  values="14;0"
                />
              </path>
            </g>
          </svg>
        </a>
      </el-tooltip>
    </Toolbar>

    <div
      v-show="!Loading"
      id="zoom"
      class="absolute left-3px bottom-40px"
      style="color:#3297FD;position:absolute;left:3px;bottom:40px;"
    >
      <span
        class="text-45px"
        style="font-size:35px;"
      >{{
        MapOptions.zoom
      }}</span>
      <span
        class="text-10px"
        style="font-size:10px;"
      > 缩放级别</span>
    </div>

    <KiFormDialog
      v-model="imagePicker.data"
      :show.sync="imagePicker.show"
      append-to-body
      :retrieve="imagePicker.retrieve"
      :confirm="imagePicker.confirm"
      title="选择嵌在矩形内的贴图"
      custom-class="imagePicker"
    >
      <div flex="~">
        <KiImage
          :value="RectangleImage"
          :viewerjs="false"
        >
          <template #default="{ src }">
            <div class="inline-block relative">
              <img
                :src="src"
                class="h-148px cursor-pointer"
                alt=""
                @click="changeCurImage(src)"
              >
              <svg
                v-show="imagePicker.data === src"
                viewBox="0 0 24 24"
                class="absolute -right-3 -top-3 w-25px"
              >
                <path
                  d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="#409eff"
                />
              </svg>
            </div>
          </template>
        </KiImage>
        <!-- <Imgpond v-model="rectangleImage" ml="8px"/> -->
      </div>
    </KiFormDialog>
  </el-dialog>
</template>

<script>
import { isVue3 } from 'vue-demi'
import SwalPreset from 'sweetalert2-preset'
import { cloneDeep, debounce } from 'lodash-es'
import AMapLoader from '@amap/amap-jsapi-loader'
import '@tarekraafat/autocomplete.js/dist/css/autoComplete.css'
import AutoComplete from '@tarekraafat/autocomplete.js/dist/js/autoComplete'
import { conclude, useGlobalConfig } from 'vue-global-config'
import KiFormDialog from '../FormDialog/index.vue'
import KiImage from '../Image/index.vue'
import KiSelect from '../Select/index.vue'
// import './styles/meny-arrow.scss'
import './styles/sweetalert2.scss'
import './styles/autocomplete.scss'
import './styles/marker-list.scss'
import { isEmpty, notEmpty } from '../utils'
import cities from './assets/city.json'
import polygon from './mixins/polygon'
import polyline from './mixins/polyline'
import rectangle from './mixins/rectangle'
import Toolbar from './components/Toolbar.vue'

export const globalProps = {}
export const globalAttrs = {}
export const globalListeners = {}
export const globalHooks = {}

export default {
  name: 'KiMap',
  install(app, options = {}) {
    const { props, attrs, listeners, hooks } = useGlobalConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalHooks, hooks)
    app.component(this.name, this)
  },
  components: {
    KiFormDialog,
    KiImage,
    KiSelect,
    Toolbar,
  },
  mixins: [polygon, polyline, rectangle],
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    lat: {
      validator: value => ['string', 'number'].includes(typeof value),
    },
    lng: {
      validator: value => ['string', 'number'].includes(typeof value),
    },
    address: {
      validator: value => typeof value === 'string',
    },
    city: {},
    precision: {},
    mapOptions: {},
    loadOptions: {},
    addressComponent: {},
    marker: {},
    markerCount: {},
  },
  data() {
    return {
      ...this.getInitData(),
      cities,
      active: null,
      initializing: true,
      loading: false,
      // meny: null,
      // customClass: 'animate__animated animate__zoomIn',
      keyword: '',
      searching: false,
      searchResult: [],
      autoCompleteList: [],
      autoCompleteInput: null,
      plugins: {
        Geocoder: null,
        AutoComplete: null,
        PlaceSearch: null,
        MarkerList: null,
        DistrictSearch: null,
        CitySearch: null,
        LabelsLayer: null,
      },
    }
  },
  computed: {
    MarkerStatus() {
      if (this.MarkerMaxCount > 0) {
        return 'editable'
      } else if (this.Marker?.length > 0) {
        return 'readonly'
      }
      return undefined
    },
    Marker() {
      return conclude([this.marker, globalProps.marker], {
        type: [Object, Array],
      })
    },
    MarkerCount() {
      return conclude([this.markerCount, globalProps.markerCount, 1], {
        type: [Number, Array],
      })
    },
    MarkerMaxCount() {
      return Array.isArray(this.MarkerCount) ? this.MarkerCount[1] : this.MarkerCount
    },
    MarkerMinCount() {
      return Array.isArray(this.MarkerCount) ? this.MarkerCount[0] : undefined
    },
    CurrentMarkerCount() {
      return this.overlay.markerInstance.filter(v => v).length
    },
    /* title () {
      return this.curSpot.address + ((isEmpty(this.curSpot.lng) || isEmpty(this.curSpot.lat)) ? '' : `（${this.curSpot.lng}，${this.curSpot.lat}）`)
    }, */
    Precision() {
      return conclude([this.precision, globalProps.precision, 6], {
        type: Number,
      })
    },
    AddressComponent() {
      return conclude([this.addressComponent, globalProps.addressComponent, {
        province: true,
        city: true,
        district: true,
      }], {
        type: [Object, Function],
      })
    },
    Loading() {
      return this.loading || this.initializing
    },
    LoadOptions() {
      return conclude([this.loadOptions, globalProps.loadOptions, {
        AMapUI: {
          version: '1.1',
          plugins: ['misc/MarkerList', 'overlay/SimpleMarker', 'overlay/SimpleInfoWindow'],
        },
        // version: '1.4.15', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [...new Set([
          'AMap.Scale',
          'AMap.MapType',
          // 'AMap.ControlBar',
          'AMap.Geocoder',
          'AMap.CitySearch',
          'AMap.PlaceSearch',
          'AMap.Autocomplete', // 2.x为 AMap.AutoComplete
          ...this.RectangleStatus === 'editable'
            ? [
                'AMap.MouseTool',
                'AMap.ContextMenu',
                'AMap.RectangleEditor',
              ]
            : [],
          ...this.PolylineStatus === 'editable'
            ? [
                'AMap.MouseTool',
                'AMap.ContextMenu',
                'AMap.PolyEditor', // 2.x为 AMap.PolylineEditor
                'AMap.LabelsLayer',
                'AMap.LabelMarker',
              ]
            : [],
          ...this.PolylineStatus === 'readonly'
            ? [
                'AMap.Polyline',
                'AMap.LabelsLayer',
                'AMap.LabelMarker',
              ]
            : [],
          ...this.PolygonStatus === 'editable'
            ? [
                'AMap.MouseTool',
                'AMap.ContextMenu',
                'AMap.Polygon',
                'AMap.DistrictSearch',
                'AMap.PolyEditor', // 2.x为 AMap.PolygonEditor
              ]
            : [],
          ...this.PolygonStatus === 'readonly'
            ? [
                'AMap.Polygon',
              ]
            : [],
        ])],
      }], {
        required: true,
        type: Object,
        camelCase: false,
      })
    },
  },
  watch: {
    show: {
      immediate: true,
      handler(n, o) {
        if (n) {
          this.MapOptions = conclude([this.mapOptions, globalProps.mapOptions, {
            // viewMode: '3D',
          }], {
            type: Object,
          })

          // this.customClass = 'animate__animated animate__zoomIn'
          AMapLoader.load(this.LoadOptions)
            .then(async (AMap) => {
              this.map = new AMap.Map('map-container', this.MapOptions)

              this.map.on('complete', () => {
                this.$nextTick(() => {
                  /* this.meny = Meny.create({
                    // The element that will be animated in from off screen
                    menuElement: document.querySelector('.drawer'),
                    // The contents that gets pushed aside while Meny is active
                    contentsElement: document.querySelector('#map-container'),
                    // [optional] The alignment of the menu (top/right/bottom/left)
                    position: Meny.getQuery().p || 'left',
                    // [optional] The height of the menu (when using top/bottom position)
                    height: 200,
                    // [optional] The width of the menu (when using left/right position)
                    width: 384,
                    // [optional] Distance from mouse (in pixels) when menu should open
                    threshold: 40,
                    // [optional] Use mouse movement to automatically open/close
                    mouse: true,
                    // [optional] Use touch swipe events to open/close
                    touch: true,
                    angle: 15.5
                  }) */

                  const autoCompleteEl = document.querySelector('#autoComplete')
                  autoCompleteEl.addEventListener('blur', (e) => {
                    const el = document.querySelector('#autoComplete_list')
                    if (el) {
                      el.style.visibility = 'hidden'
                    }
                  })
                  autoCompleteEl.addEventListener('focus', (e) => {
                    const el = document.querySelector('#autoComplete_list')
                    if (el) {
                      document.querySelector('#autoComplete_list').style.visibility = 'visible'
                    }
                  })

                  if (!this.autoCompleteInput) {
                    this.autoCompleteInput = new AutoComplete({
                      data: { // Data src [Array, Function, Async] | (REQUIRED)
                        src: async () => {
                          if (isEmpty(this.keyword)) {
                            this.searchResult = []
                            return []
                          } else {
                            return await this.fetchSuggestions()
                          }
                        },
                        key: ['name'],
                        cache: false,
                      },
                      placeHolder: '搜索位置', // Place Holder text                 | (Optional)
                      selector: '#autoComplete', // Input field selector              | (Optional)
                      threshold: 1, // Min. Chars length to start Engine | (Optional)
                      debounce: 300, // Post duration for engine to start | (Optional)
                      searchEngine: 'loose', // Search Engine type/mode           | (Optional)
                      resultsList: { // Rendered results list object      | (Optional)
                        render: true,
                      },
                      maxResults: 10, // Max. number of rendered results | (Optional)
                      highlight: true, // Highlight matching results      | (Optional)
                      onSelection: (feedback) => { // Action script onSelection event | (Optional)
                        // console.log(feedback.selection.value.image_url)
                        this.keyword = feedback.selection.value.name
                        document.querySelector('#autoComplete_list').style.visibility = 'hidden'
                      },
                    })
                  }

                  this.initializing = false
                })
              })

              // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
              this.map.addControl(new AMap.Scale())

              // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
              this.map.addControl(new AMap.MapType())

              this.active = 'marker'

              /* this.text = new AMap.Text({
                anchor: 'center', // 设置文本标记锚点
                offset: new AMap.Pixel(0, -20),
                style: {
                  'border-radius': '17.5px',
                  'padding': '5px 10px',
                  'border-width': 0,
                  'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
                  'text-align': 'center',
                },
                //zIndex: 9999 // MarkerList始终比它高10
              })
              this.text.setMap(this.map)
              this.map.on('mousemove', this.setTextPosition) */

              this.map.on('click', this.onMapClick)

              if (notEmpty(this.MapOptions.zoom)) {
                this.MapOptions.zoom = Number(this.MapOptions.zoom)
              }

              if (this.LoadOptions.plugins.includes('AMap.MouseTool')) {
                this.mouseTool = new AMap.MouseTool(this.map)
                this.mouseTool.on('draw', (e) => {
                  // 1.x: e.obj.CLASS_NAME==='AMap.Polygon'
                  // 2.x: e.obj.className==='Overlay.Rectangle'
                  if (this.active === 'rectangle') {
                    // 绘制完毕后，恢复至初始选中的工具
                    this.active = 'marker'
                    // 如果矩形只允许有一个 清除之前绘制的
                    /* if (
                    this.Rectangle?.length === 1 &&
                    this.overlay.rectangleInstance.length === 1 &&
                    this.RectangleMaxCount === 1
                  ) {
                    this.overlay.rectangleInstance.pop().setMap(null)
                    this.overlay.rectangleEditor.pop().close()
                  } */
                    // this.overlay.rectangleInstance.push(e.obj)
                    // this.editRectangle(this.overlay.rectangleInstance.getBounds()) 1.x中编辑绘制出来矩形会报错
                    e.obj.setMap(null) // 1.x改为销毁绘制出来的矩形并新建一个矩形对象

                    this.drawRectangle({
                      image: this.curImage,
                      bounds: e.obj.getBounds(),
                    })

                    /* this.$nextTick(() => {
                      this.mouseTool.rectangle(this.rectangleStyle)
                    }) */
                  }
                  // 1.x: e.obj.CLASS_NAME==='AMap.Polygon'
                  // 2.x: e.obj.className==='Overlay.Polygon'
                  else if (this.active === 'polygon') {
                    // 绘制完毕后，恢复至初始选中的工具
                    this.active = 'marker'
                    e.obj.setOptions({
                      ...this.polygonStyle,
                      fillColor: '#00D3FC',
                    })
                    this.overlay.polygonInstance.push(e.obj)
                    this.editPolygon({ editable: true })
                  } else if (this.active === 'polyline') {
                    // 绘制完毕后，恢复至初始选中的工具
                    this.active = 'marker'
                    e.obj.setOptions({
                      ...this.polylineStyle,
                    })
                    this.overlay.polylineInstance.push(e.obj)
                    this.editPolyline({ editable: true })
                  }
                  this.mouseTool.close()
                })
              }

              // this.map.addControl(new AMap.ControlBar())

              await this.locate().catch((e) => {
                console.error(e)
              })

              this.$emit('load', AMap)
            }).catch((e) => {
              this.$emit('update:show', false)
              this.$emit('error', e)
              console.error(e)
              SwalPreset.error({
                titleText: '高德地图初始化失败',
                ...typeof e === 'string' && { text: e },
              })
            })
        } else {
          // 正常退出
          if (this.map) {
            // this.customClass = 'animate__animated animate__zoomOut'
            window.KiMap__confirm = undefined
            this.searchResult = []
            this.keyword = ''
            this.map.destroy()
            // 如果乾坤的子系统共享一个 window 对象，会报错: '禁止多种API加载方式混用'
            AMapLoader.reset()
            this.clear()
          }
        }
      },
    },
    keyword() {
      this.search()
    },
    active(newVal) {
      ({
        marker: () => {
          this.mouseTool?.close()
          // this.text.setText('单击绘制点位')
          // this.text.on('click', this.onMapClick)
          this.map.on('click', this.onMapClick)
          // this.overlay.rectangleInstance?.on('click', this.onMapClick)
        },
        rectangle: () => {
          // this.text.setText('按住左键并拖动绘制矩形')
          // this.text.off('click', this.onMapClick)
          this.map.off('click', this.onMapClick)
          // this.overlay.rectangleInstance?.off('click', this.onMapClick)
          this.mouseTool.rectangle(this.rectangleStyle)
        },
        polyline: () => {
          this.map.off('click', this.onMapClick)
          this.drawPolyline({ editable: true })
        },
        polygon: () => {
          // this.text.setText('单击确定多边形起点，双击结束绘制')
          // this.text.off('click', this.onMapClick)
          this.map.off('click', this.onMapClick)
          // this.overlay.rectangleInstance?.off('click', this.onMapClick)
          this.drawPolygon({ editable: true })
        },
      })[newVal]()
    },
    baseCity(n) {
      if (this.show) {
        this.initPlugins()
      }
    },
  },
  methods: {
    /* convertLngLat () {
      new AMap.convertFrom(gps, 'gps', function (status, result) {
        if (result.info === 'ok') {
          let lnglats = result.locations // Array.<LngLat>
        }
      })
    }, */
    cancel() {
      this.$emit('update:show', false)
      this.$emit('cancel')
    },
    changeCurImage(src) {
      this.imagePicker.data = this.imagePicker.data === src ? '' : src
    },
    setCurImage() {
      this.imagePicker.show = true
    },
    help() {
      SwalPreset.confirm({
        titleText: '使用帮助',
        html: `
<ul style="text-align:left">
  ${this.MarkerStatus === 'editable'
            ? `
  <li>点位</li>
    <ul style="margin-bottom:1rem">
      <li>添加: 选中点位工具 → 点击地图；搜索位置 → 点击搜索结果</li>
      <li>删除: 右键点位 → 点击[删除]；点位列表 → 点击右上角[×]</li>
      <li>重置: 点位工具下拉菜单 → 重置点位</li>
      <li>清除: 点位工具下拉菜单 → 清除点位</li>
    </ul>`
            : ''}
  ${this.PolylineStatus === 'editable'
            ? `
  <li>折线</li>
    <ul style="margin-bottom:1rem">
      <li>添加: 选中折线工具 → 单击地图确定起点，双击结束绘制</li>
      <li>调整形状: 拖动折线上的圆点处</li>
      <li>删除某个点: 点击这个点</li>
      <li>删除折线: 右键折线（线上，点上不行） → 点击[删除]</li>
      <li>重置: 折线工具下拉菜单 → 重置折线</li>
      <li>清除: 折线工具下拉菜单 → 清除折线</li>
    </ul>`
            : ''}
  ${this.RectangleStatus === 'editable'
            ? `
  <li>矩形</li>
    <ul style="margin-bottom:1rem">
      <li>添加: 选中矩形工具 → 长按左键并拖动，松开完成绘制</li>
      <li>选择贴图: 矩形工具下拉菜单 → 选择贴图</li>
      <li>调整形状: 拖动矩形角上的圆点处</li>
      <li>删除某个点: 点击这个点（四个点以上时有效）</li>
      <li>删除矩形: 右键矩形 → 点击[删除]</li>
      <li>重置: 矩形工具下拉菜单 → 重置矩形</li>
      <li>清除: 矩形工具下拉菜单 → 清除矩形</li>
    </ul>`
            : ''}
  ${this.PolygonStatus === 'editable'
            ? `
  <li>多边形</li>
    <ul style="margin-bottom:1rem">
      <li>添加: 选中多边形工具 → 单击地图确定起点，双击结束绘制</li>
      <li>调整形状: 拖动多边形角上的圆点处</li>
      <li>删除: 右键多边形 → 点击[删除]</li>
      <li>重置: 多边形工具下拉菜单 → 重置多边形</li>
      <li>清除: 多边形工具下拉菜单 → 清除多边形</li>
    </ul>`
            : ''}
</ul>
                    `,
        width: 700,
        cancelButtonText: '不再提示',
        showCancelButton: false,
      })
    },
    setCenter(args) {
      if (isEmpty(this.MapOptions.zoom)) {
        this.map.setCenter(args)
      } else {
        this.map.setZoomAndCenter(this.MapOptions.zoom, args)
      }
    },
    debounce(fnName, fn, param, delay) {
      // const functionName = /function\s*(\w*)/i.exec(fn.toString())[1]
      fnName += 'Debounce'
      if (!this[fnName]) {
        this[fnName] = debounce(fn, delay)
      }
      this[fnName](param)
    },
    /* setTextPosition (e) {
      this.debounce('setTextPosition', e => {
        this.text.setPosition([e.lnglat.lng, e.lnglat.lat])
      }, e, 30)
    }, */
    initPlugins() {
      /**
       * 不写在watch原因: 需要同步执行
       */
      const param = {
        city: this.baseCity,
      }
      this.plugins.Geocoder = new AMap.Geocoder(param)
      // 兼容1.x
      this.plugins.AutoComplete = AMap.AutoComplete
        ? new AMap.AutoComplete(param)
        : new AMap.Autocomplete(param)
      this.plugins.PlaceSearch = new AMap.PlaceSearch(param)
      if (this.PolygonStatus === 'editable') {
        this.plugins.DistrictSearch = new AMap.DistrictSearch({
          subdistrict: 0, // 获取边界不需要返回下级行政区
          extensions: 'all', // 返回行政区边界坐标组等具体信息
          level: 'district', // 行政级别
        })
      }
      /* if (this.polyline?.length || this.PolylineMaxCount > 0) {
        this.plugins.LabelsLayer = new AMap.LabelsLayer({
          //zooms: [10, 18],
          zIndex: 100,
          collision: true, // 开启标注避让，默认为开启，v1.4.15 新增属性
          animation: true, // 开启标注淡入动画，默认为开启，v1.4.15 新增属性
        })
      } */
    },
    getInitData(arr) {
      let result = {
        overlay: {},
      }
      const base = {
        map: null,
        baseCity: '',
        MapOptions: {},
        imagePicker: {
          show: false,
          data: '',
          retrieve: () => {
            this.imagePicker.data = this.curImage
          },
          confirm: () => {
            this.curImage = this.imagePicker.data
            this.active = 'rectangle'
            if (!this.curImage) {
              return SwalPreset.confirm({
                title: '您没有选取任何贴图，绘制的矩形将是空心的',
                customClass: {
                  popup: 'ki-map__confirm',
                },
                confirmButtonText: '确定',
                cancelButtonText: '取消',
              })
            }
          },
        },
        curImage: '',
      }
      const overlay = {
        marker: {
          markerInstance: [],
        },
        rectangle: {
          imageLayerInstance: [],
          rectangleInstance: [],
          rectangleEditor: [],
          rectangle: [],
        },
        polygon: {
          polygonInstance: [],
          polygonEditor: [],
          polygon: [],
        },
        polyline: {
          polylineInstance: [],
          polylineEditor: [],
          polyline: [],
          labelsLayer: [],
        },
      }
      if (!arr) {
        result = {
          ...base,
        }
      }
      for (const k in overlay) {
        if (!arr || arr.includes(k)) {
          result.overlay = {
            ...result.overlay,
            ...overlay[k],
          }
        }
      }

      return cloneDeep(result)
    },
    reset(arr) {
      this.clear(arr)
      this.initOverlays(arr)
    },
    isClearable(overlays = ['marker', 'rectangle', 'polygon', 'polyline']) {
      for (const v of overlays) {
        switch (v) {
          case 'marker': {
            if (this.MarkerMinCount > 0 && this.CurrentMarkerCount > 0) {
              SwalPreset.warning(`至少绘制${this.MarkerMinCount}个点位`)
              return false
            }
            break
          }
          case 'rectangle': {
            if (this.RectangleMinCount > 0 && this.CurrentRectangleCount > 0) {
              SwalPreset.warning(`至少绘制${this.RectangleMinCount}个矩形`)
              return false
            }
            break
          }
          case 'polygon':
            if (this.PolygonMinCount > 0 && this.CurrentPolygonCount > 0) {
              SwalPreset.warning(`至少绘制${this.PolygonMinCount}个多边形`)
              return false
            }
            break
          case 'polyline':
            if (this.PolylineMinCount > 0 && this.CurrentPolylineCount > 0) {
              SwalPreset.warning(`至少绘制${this.PolylineMinCount}条折线`)
              return false
            }
        }
      }
      return true
    },
    clear(arr) {
      if (Array.isArray(arr)) {
        if (arr.includes('marker')) {
          if (!this.isClearable(arr)) {
            return
          }

          this.overlay.markerInstance.forEach((v) => {
            if (v) {
              this.map.remove(v)
            }
          })
          this.overlay.markerInstance.length = 0
          this.plugins.MarkerList?.clearData()
        }

        if (arr.includes('rectangle')) {
          for (let i = 0; i < this.overlay.rectangle.length; i++) {
            if (this.overlay.rectangle[i]) {
              this.overlay.imageLayerInstance[i]?.setMap(null)
              this.overlay.rectangleInstance[i].setMap(null)
              this.overlay.rectangleEditor[i]?.close() // 只读模式 rectangleEditor 为空
            }
          }
        }

        if (arr.includes('polygon')) {
          if (!this.isClearable(arr)) {
            return
          }

          for (let i = 0; i < this.overlay.polygonInstance.length; i++) {
            if (this.overlay.polygonInstance[i]) {
              this.overlay.polygonInstance[i].setMap(null)
              this.overlay.polygonEditor[i]?.close() // 只读模式 polygonEditor 为空
            }
          }
        }

        if (arr.includes('polyline')) {
          if (!this.isClearable(arr)) {
            return
          }

          for (let i = 0; i < this.overlay.polylineInstance.length; i++) {
            if (this.overlay.polylineInstance[i]) {
              this.overlay.polylineInstance[i].setMap(null)
              this.overlay.polylineEditor[i]?.close() // 只读模式 polylineEditor 为空
              this.overlay.labelsLayer[i].setMap(null)
            }
          }
        }

        Object.assign(this.$data, {
          overlay: {
            ...this.overlay,
            ...this.getInitData(arr).overlay,
          },
        })
      } else {
        /* if (!this.isClearable()) {
          return
        } */

        this.map.clearMap()
        Object.assign(this.$data, this.getInitData(arr))
      }
    },
    getAddress([lng, lat]) {
      return new Promise((resolve, reject) => {
        if (this.plugins.Geocoder) {
          this.useAMapAPI('Geocoder.getAddress', [lng, lat]).then(({ regeocode }) => {
            if (regeocode?.formattedAddress) {
              const { province, city, district, township } = regeocode.addressComponent
              const name = regeocode.formattedAddress.replace(province + city + district + township, '')
              if (typeof this.AddressComponent === 'function') {
                resolve({ address: this.AddressComponent(regeocode.addressComponent), name })
              } else {
                let address = regeocode.formattedAddress
                for (const k in this.AddressComponent) {
                  if (this.AddressComponent[k] === false) {
                    address = address.replace(regeocode.addressComponent[k], '')
                  }
                }
                resolve({ city, address, name })
              }
            } else {
              resolve({})
            }
          })
        } else {
          // baseCity 为空时
          resolve({})
        }
      })
    },
    async onMapClick(e) {
      const { lng: longitude, lat: latitude } = e.lnglat
      const { address, name } = await this.getAddress([e.lnglat.lng, e.lnglat.lat])
      this.drawMarker({
        longitude,
        latitude,
        address,
        name,
      })
    },
    fetchSuggestions(queryString, cb) {
      return this.useAMapAPI('AutoComplete.search', this.keyword).then(({ tips }) => tips || [])
    },
    roundOff(value) {
      if (isEmpty(value)) {
        return ''
      } else {
        return {
          number: () => value.toFixed(this.Precision).toString(),
          string: () => Number(value).toFixed(this.Precision).toString(),
        }[typeof value]()
      }
    },
    confirm() {
      if (this.markerCount > 1) {
        const { lng, lat } = this.map.getCenter()
        this.$emit('update:lng', this.roundOff(lng))
        this.$emit('update:lat', this.roundOff(lat))
      } else {
        const { longitude, latitude, address } = this.overlay.markerInstance[0] || {}
        this.$emit('update:lng', this.roundOff(longitude))
        this.$emit('update:lat', this.roundOff(latitude))
        this.$emit('update:address', address)
      }
      this.$emit('update:marker', cloneDeep(this.overlay.markerInstance).map((v) => {
        v.lng = this.roundOff(v.longitude)
        v.lat = this.roundOff(v.latitude)
        delete v.longitude
        delete v.latitude
        return v
      }))
      this.$emit('update:mapOptions', this.MapOptions)
      if (this.RectangleStatus === 'editable') {
        // this.address || ((isEmpty(this.lng) || isEmpty(this.lat)) ? this.baseCity : '')
        this.$emit('update:rectangle', this.overlay.rectangle)
      }
      if (this.PolygonStatus === 'editable') {
        this.syncPolygon()
        this.$emit('update:polygon', this.overlay.polygon)
      }
      if (this.PolylineStatus === 'editable') {
        this.syncPolyline()
        this.$emit('update:polyline', this.overlay.polyline)
      }
      this.$emit('update:show', false)
      this.$emit('confirm')
    },
    drawMarker(markerOptions, isInit = false) {
      if (this.MarkerMaxCount > 1 && this.CurrentMarkerCount >= this.MarkerMaxCount && !isInit) {
        SwalPreset.warning(`最多标记${this.MarkerMaxCount}个点位`)
      } else {
        /* const position = [lng, lat]
        const marker = new AMap.Marker({
          position,
        })
        this.map.add(marker) */
        /* const marker = new AMapUI.SimpleMarker({
          containerClassNames: 'my-marker',
          // 背景图标样式
          iconStyle: 'red',
          // 前景文字
          iconLabel: {
            // A,B,C.....
            innerHTML: String.fromCharCode('A'.charCodeAt(0) + this.overlay.markerInstance.length),
          },
          map: this.map,
          position: [lng, lat],
        })

        marker.on('mouseover', e => {
          console.log('mouseover', e)
          e.target.setIconStyle('blue')
        })

        marker.on('mouseout', e => {
          console.log('mouseout', e)
          e.target.setIconStyle('red')
        })

        marker.on('click', e => {
          console.log('click', e)
        }) */
        const { lng, lat, longitude, latitude } = markerOptions
        if (lng && !longitude) {
          markerOptions.longitude = lng
          delete markerOptions.lng
        }
        if (lat && !latitude) {
          markerOptions.latitude = lng
          delete markerOptions.lat
        }
        if (this.MarkerMaxCount > 1) {
          this.overlay.markerInstance.push({
            ...markerOptions,
            // address: isInit ? this.address || await this.getAddress([lng, lat]),
          })
        } else {
          this.overlay.markerInstance[0] = markerOptions
        }

        this.drawMarkerList(this.overlay.markerInstance)
      }
    },
    drawMarkerList(marker) {
      this.plugins.MarkerList?.clearData()

      if (isEmpty(marker)) {
        return
      }

      const { MarkerList, SimpleMarker, SimpleInfoWindow } = window.AMapUI
      // 即 jQuery / Zepto
      const $ = MarkerList.utils.$

      const defaultIconStyle = 'red' // 默认的图标样式
      const hoverIconStyle = 'blue' // 鼠标 hover 时的样式
      const selectedIconStyle = 'darkblue' // 选中时的图标样式

      window.KiMap__confirm = (index) => {
        this.overlay.markerInstance.splice(index, 1)
        this.drawMarkerList(this.overlay.markerInstance)
      }

      this.plugins.MarkerList = new MarkerList({
        map: this.map,
        // ListElement对应的父节点或者ID
        listContainer: 'myList', // document.getElementById("myList"),
        // 选中后显示

        // 从数据中读取位置, 返回lngLat
        getPosition(item) {
          return [item.longitude, item.latitude]
        },
        // 数据ID，如果不提供，默认使用数组索引，即index
        getDataId(item, index) {
          return item.id
        },
        getInfoWindow(data, context, recycledInfoWindow) {
          if (recycledInfoWindow) {
            if (data.name) {
              recycledInfoWindow.setInfoTitle(data.name)
            }
            if (data.address) {
              recycledInfoWindow.setInfoBody(data.address)
            }
            return recycledInfoWindow
          }
          return new SimpleInfoWindow({
            infoTitle: data.name,
            infoBody: data.address,
            offset: new AMap.Pixel(0, -37),
          })
        },
        // 构造 marker 用的 options 对象, content 和 title 支持模板，也可以是函数，返回 marker 实例，或者返回 options 对象
        getMarker: (data, context, recycledMarker) => {
          const label = String.fromCharCode('A'.charCodeAt(0) + context.index)
          if (recycledMarker) {
            recycledMarker.setIconLabel(label)
            return
          }
          const simpleMarker = new SimpleMarker({
            containerClassNames: 'my-marker',
            iconStyle: defaultIconStyle,
            iconLabel: label,
          })

          const contextMenu = new AMap.ContextMenu()
          contextMenu.addItem('删除', (e) => {
            if (this.CurrentMarkerCount <= this.MarkerMinCount) {
              SwalPreset.warning(`至少绘制${this.MarkerMinCount}个点位`)
            } else {
              this.overlay.markerInstance.splice(context.index, 1)
              this.drawMarkerList(this.overlay.markerInstance)
            }
          }, 0)
          simpleMarker.on('rightclick', (e) => {
            contextMenu.open(this.map, e.lnglat)
          })

          return simpleMarker
        },
        // 构造列表元素，与getMarker类似，可以是函数，返回一个dom元素，或者模板 html string
        getListElement: (data, context, recycledListElement) => {
          const label = String.fromCharCode('A'.charCodeAt(0) + context.index)
          // 使用模板创建

          const innerHTML = MarkerList.utils.template(`
            <div class="poi-info-left">
              <i class="el-icon-close" style="right:0;top:0;position:absolute;font-size:18px;" onclick="KiMap__confirm(${context.index})"></i>
              <h3 class="poi-title" <%- !data.name&&'style="display:"none"' %>>
                  <%- label %>. <%- data.name %>
              </h3>
              <div class="poi-info">
                  <span class="poi-price">
                      <%= data.price %>
                  </span>
                  <p class="poi-addr"><%- data.address %></p>
              </div>
            </div>`, {
            data,
            label,
          })

          if (recycledListElement) {
            recycledListElement.innerHTML = innerHTML
            return recycledListElement
          }

          return `<li class="poibox">${innerHTML}</li>`
        },
        // 列表节点上监听的事件
        listElementEvents: ['click', 'mouseenter', 'mouseleave'],
        // marker上监听的事件
        markerEvents: ['click', 'mouseover', 'mouseout', 'rightclick'],
        // makeSelectedEvents:false,
        selectedClassNames: 'selected',
        autoSetFitView: false,
      })

      /* this.plugins.MarkerList.on('markerRightclick', (event, info) => {
        //console.log(event, info)
      }) */

      this.plugins.MarkerList.on('selectedChanged', (event, info) => {
        // checkBtnStats()
        if (info.selected) {
          if (info.selected.marker) {
            // 更新为选中样式
            info.selected.marker.setIconStyle(selectedIconStyle)
          }
          // 选中并非由列表节点上的事件触发，将关联的列表节点移动到视野内
          if (!info.sourceEventInfo.isListElementEvent) {
            if (info.selected.listElement) {
              scrollListElementIntoView($(info.selected.listElement))
            }
          }
        }
        if (info.unSelected && info.unSelected.marker) {
          // 更新为默认样式
          info.unSelected.marker.setIconStyle(defaultIconStyle)
        }
      })

      // const that = this
      this.plugins.MarkerList.on('listElementMouseenter', function (event, record) {
        if (record && record.marker) {
          // that.text.setText('右键删除')

          // this.openInfoWindowOnRecord(record);
          // 非选中的id
          if (!this.isSelectedDataId(record.id)) {
            // 设置为hover样式
            record.marker.setIconStyle(hoverIconStyle)
            // this.closeInfoWindow();
          }
        }
      })

      const focusMarker = (marker) => {
        marker.setTop(true)

        // 不在地图视野内
        if (!(this.map.getBounds().contains(marker.getPosition()))) {
          // 移动到中心
          this.map.setCenter(marker.getPosition())
        }
      }

      this.plugins.MarkerList.on('markerMouseover', function (event, record) {
        if (record && record.marker) {
          focusMarker(record.marker)
          // this.openInfoWindowOnRecord(record);
          // 非选中的id

          // that.text.setText('右键删除')

          if (!this.isSelectedDataId(record.id)) {
            // 设置为hover样式
            record.marker.setIconStyle(hoverIconStyle)
            // this.closeInfoWindow();
          }
        }
      })

      this.plugins.MarkerList.on('listElementMouseleave markerMouseout', function (event, record) {
        // that.text.setText('单击绘制点位')

        if (record && record.marker) {
          if (!this.isSelectedDataId(record.id)) {
            // 恢复默认样式
            record.marker.setIconStyle(defaultIconStyle)
          }
        }
      })

      // 数据输出完成
      /* this.plugins.MarkerList.on('renderComplete', function (event, records) {
        checkBtnStats()
      }) */

      // markerList.on('*', function(type, event, res) {
      //     console.log(type, event, res);
      // });

      // 渲染数据
      this.plugins.MarkerList.render(marker)

      const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect()

        return (
          rect.top >= 0
          && rect.left >= 0
          && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */
          && rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
        )
      }

      function scrollListElementIntoView($listEle) {
        if (!isElementInViewport($listEle.get(0))) {
          $('#panel').scrollTop($listEle.offset().top - $listEle.parent().offset().top)
        }
        // 闪动一下
        $listEle
          .one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
            function (e) {
              $(this).removeClass('flash animated')
            }).addClass('flash animated')
      }
    },
    drawDistrict(districtName) {
      if (districtName && this.PolygonStatus === 'editable') {
        this.useAMapAPI('DistrictSearch.search', districtName).then(({ districtList }) => {
          const bounds = districtList?.[0]?.boundaries
          if (bounds?.length) {
            SwalPreset.confirm({
              titleText: `是否绘制${districtName}轮廓？`,
              confirmButtonText: '是',
              cancelButtonText: '否',
            }).then(() => {
              this.drawPolygon({
                polygon: Array.from(bounds, v => ({ path: v })),
                editable: false,
              })
            })
          }
        })
      }
    },
    async initOverlays(arr) {
      let centerDesignated = false
      let hasOverlay = false

      if (!arr || arr.includes('rectangle')) {
        if (this.RectangleImage.length === 1) {
          this.curImage = this.RectangleImage[0]
        }

        if (this.Rectangle?.length > 0) {
          this.Rectangle.forEach((v) => {
            const { image, southwest, northeast } = v || {}
            const { lng: southwestLng, lat: southwestLat } = southwest || {}
            const { lng: northeastLng, lat: northeastLat } = northeast || {}

            if (notEmpty(southwestLng) && notEmpty(southwestLat) && notEmpty(northeastLng) && notEmpty(northeastLat)) {
              this.drawRectangle({
                image,
                bounds: new AMap.Bounds(
                  // 西南角
                  new AMap.LngLat(
                    // 经度 1.x版本不兼容输入东南角
                    (isEmpty(northeastLng) || isEmpty(southwestLng))
                      ? ''
                      : Math.min(northeastLng, southwestLng),
                    // 纬度
                    southwestLat,
                  ),
                  // 东北角
                  new AMap.LngLat(
                    // 经度 1.x版本不兼容输入西北角
                    (isEmpty(northeastLng) || isEmpty(southwestLng))
                      ? ''
                      : Math.max(northeastLng, southwestLng),
                    // 纬度
                    northeastLat,
                  ),
                ),
                editable: this.RectangleStatus === 'editable',
              })

              hasOverlay = true
            }
          })
        }
      }

      if (!arr || arr.includes('polygon')) {
        if (this.Polygon?.length > 0) {
          this.drawPolygon({
            polygon: this.Polygon,
            editable: this.PolygonStatus === 'editable',
          })
          hasOverlay = true
        }
      }

      if (!arr || arr.includes('polyline')) {
        if (this.Polyline?.length > 0) {
          this.drawPolyline({
            polyline: this.Polyline,
            editable: this.PolylineStatus === 'editable',
          })
          hasOverlay = true
        }
      }

      if (!arr || arr.includes('marker')) {
        // 传了点位 绘制点位
        if (this.Marker?.length > 0) {
          cloneDeep(this.Marker).forEach((v) => {
            v.longitude = v.lng
            v.latitude = v.lat
            delete v.lng
            delete v.lat
            this.overlay.markerInstance.push(v)
          })
        }
        // 只传了中心点 将中心点当作一个点位
        else if (notEmpty(this.lng) && notEmpty(this.lat)) {
          let address, name
          if (this.address) {
            address = this.address
          } else {
            const result = await this.getAddress([this.lng, this.lat])
            address = result.address
            name = result.name
          }

          this.overlay.markerInstance = [{
            longitude: this.lng,
            latitude: this.lat,
            address,
            name,
          }]

          centerDesignated = true
        }
        this.drawMarkerList(this.overlay.markerInstance)
        // 如果点位只有一个 将其视为中心点
        if (this.overlay.markerInstance.length === 1) {
          centerDesignated = true
        } else if (this.overlay.markerInstance.length > 1) {
          hasOverlay = true
        }
      }

      return {
        centerDesignated,
        hasOverlay,
      }
    },
    watchZoom() {
      this.map.on('zoomchange', (e) => {
        this.MapOptions.zoom = this.map.getZoom()
      })
    },
    async locate(selectedLocation) {
      if (this.show) {
        // 选中搜索项
        if (selectedLocation) {
          this.drawDistrict(selectedLocation.name)
          // this.meny.close()
          this.drawMarker({
            ...selectedLocation,
            longitude: selectedLocation.location.lng,
            latitude: selectedLocation.location.lat,
          })
          this.setCenter([selectedLocation.location.lng, selectedLocation.location.lat])
        }
        // 初始化
        else {
          this.baseCity = await this.getBaseCity()
          this.initPlugins()

          /**
           * 绘制覆盖物
           */
          const result = await this.initOverlays().catch((e) => {
            console.error(e)
          })
          let centerDesignated = result.centerDesignated
          const hasOverlay = result.hasOverlay

          /**
           * 中心点定位
           */
          // 如果没有传覆盖物且没有传 zoom，给 zoom 赋默认值
          if (centerDesignated && isEmpty(this.MapOptions.zoom)) {
            this.MapOptions.zoom = 12
          }
          // 传了中心点 定位至该中心点
          if (notEmpty(this.lng) && notEmpty(this.lat)) {
            this.setCenter([this.lng, this.lat])
            centerDesignated = true
          }
          // 点位数量为1 定位至该点位
          else if (this.overlay.markerInstance.length === 1 && notEmpty(this.overlay.markerInstance[0].longitude) && notEmpty(this.overlay.markerInstance[0].latitude)) {
            const { longitude, latitude } = this.overlay.markerInstance[0]
            this.setCenter([longitude, latitude])
            centerDesignated = true
          }
          // 定位至 address
          else if (this.address) {
            const result = await this.useAMapAPI('Geocoder.getLocation', this.address)
            const { lng, lat } = result?.geocodes[0]?.location || {}
            if (notEmpty(lng) && notEmpty(lat)) {
              this.setCenter([lng, lat])
              centerDesignated = true
            }
          }
          if (!centerDesignated) {
            // 存在覆盖物，将视图适配覆盖物
            if (hasOverlay) {
              this.map.setFitView()
            }
            // 定位至 baseCity
            else if (this.baseCity) {
              debugger
              this.map.setCity(this.baseCity)
            }
            // setCity 和 setZoom 同步调用时后者无效
            setTimeout(() => {
              this.map.setZoom(this.MapOptions.zoom)
              // setZoom 和 setCity 会立即触发 zoomchange
              setTimeout(() => {
                this.watchZoom()
              }, 500)
            }, 500)
          } else {
            this.watchZoom()
          }
        }
      }
    },
    getBaseCity() {
      // 直辖市: ['110100', '120100', '310100', '500100']
      let City = conclude([this.city, globalProps.city, ''], {
        type: String,
      })
      // 兼容非6位的行政区编码
      if (City && !isNaN(City)) {
        if (City.length < 6) {
          City = City.padEnd(6, '0')
        } else if (City.length > 6) {
          City = City.substring(0, 6)
        }
      }
      return new Promise((resolve, reject) => {
        if (City) {
          resolve(City)
        } else {
          this.plugins.CitySearch = new AMap.CitySearch()
          this.useAMapAPI('CitySearch.getLocalCity').then(({ city }) => {
            resolve(city)
          })
        }
      })
    },
    search() {
      if (!this.keyword) {
        this.searchResult = []
        return
      }
      this.searching = true
      this.debounce('search', () => {
        this.useAMapAPI('PlaceSearch.search', this.keyword).then(({ poiList }) => {
          this.searchResult = poiList?.pois || []
        }).finally(() => {
          this.searching = false
        })
      }, null, 500)
    },
    useAMapAPI(...args) {
      this.loading = true
      const apiName = args[0]
      const [plugin, fn] = apiName.split('.')
      args.shift()
      return new Promise((resolve, reject) => {
        this.plugins[plugin][fn](...args, (status, result) => {
          const OK = result.info === 'OK'
          const color = OK ? '#409EFF' : '#FF0000'
          console.log(`%c调用高德 Web 服务 API: ${apiName}`, `color:${color}; font-weight:bold;`,
            '\n  参数: ', args,
            '\n  返回值: ', result)
          resolve(result)
          if (!OK) {
            this.$emit('error', result)
            SwalPreset.error(result.info)
          }
          this.loading = false
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
#map-container {
  height: 100%;
  width: 100%;
  cursor: crosshair !important;
}

::v-deep .ki-map>.el-dialog.is-fullscreen {
  overflow: hidden;
}

::v-deep .ki-map>.el-dialog__header {
  display: none; // flex
  box-sizing: border-box;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 0 0 10px 10px;
  min-height: 70px;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 400px;
  width: calc(100% - 800px);
  z-index: 1;
  backdrop-filter: blur(4px);
  background-color: #ffffff7a !important;

  .title {
    font-size: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .title-text {
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      //display: -webkit-box;
      text-align: center;
      //-webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      line-height: 25px;
      font-size: 22px;
      flex: 1;
      color: #003371;
      padding: 15px 0;
    }
  }
}

::v-deep .ki-map>.el-dialog__body {
  height: 100%;
  padding: 0;

  .region-select {
    display: inline-block;
    margin-left: 15px;
    width: 105px;

    input {
      border-radius: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      border-color: rgba(64, 158, 255, 0.2) !important;

      &:hover,
      &:focus {
        box-shadow: rgba(0, 51, 113, 0.1) 0 0 20px 5px;
      }
    }
  }

  .drawer {
    box-sizing: border-box;
    //box-shadow: 50px 0 100px rgba(0, 0, 0, 0.5);
    width: 272px;
    height: 100%;
    overflow-y: auto;
    padding: 78px 16px 0 16px;
    position: absolute;
    z-index: 999;
    //background-image: linear-gradient(to left, #e6e9f0 0%, #eef1f5 100%);
    backdrop-filter: blur(2px);
    background-color: #f7f7f7ab;

    &>.item {
      padding: 10px;
      cursor: pointer;

      &> :first-child {
        font-weight: bold;
      }

      &> :nth-child(2) {
        margin-top: 5px;
      }

      &:hover {
        background-color: rgba(173, 216, 230, 0.3);
        border-radius: 8px;
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
      height: 1px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: skyblue;
      background-image: -webkit-linear-gradient(45deg,
          rgba(255, 255, 255, 0.2) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0.2) 75%,
          transparent 75%,
          transparent);
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      background: #ededed;
      //border-radius: 10px;
    }
  }
}

::v-deep .amap-maptypecontrol {
  top: unset;
  bottom: 115px;
}

::v-deep .imagePicker .el-dialog__body {
  padding: 25px;

  .footer {
    padding: 10px 0 0 0;
  }

  .el-upload-list {
    display: none;
  }
}
</style>

<style lang="scss">
.map-container {
  &.el-loading-mask {
    left: 50%;
    top: 50%;
    bottom: unset;
    right: unset;
    transform: translate(-50%, -50%);
  }
}

.ki-map__confirm {
  width: fit-content;
}
</style>
