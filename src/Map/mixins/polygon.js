import SwalPreset from 'sweetalert2-preset'
import { conclude } from 'vue-global-config'
import { globalProps } from '../index.vue'
import { notEmpty } from '../../utils'

export default {
  props: {
    polygon: {},
    polygonCount: {},
  },
  computed: {
    Polygon() {
      return conclude([this.polygon, globalProps.polygon], {
        type: Array,
      })
    },
    PolygonStatus() {
      if (this.PolygonMaxCount > 0) {
        return 'editable'
      } else if (this.Polygon?.length > 0) {
        return 'readonly'
      }
    },
    PolygonCount() {
      return conclude([this.polygonCount, globalProps.polygonCount, 0], {
        type: [Number, Array],
      })
    },
    PolygonMaxCount() {
      return Array.isArray(this.PolygonCount) ? this.PolygonCount[1] : this.PolygonCount
    },
    PolygonMinCount() {
      return Array.isArray(this.PolygonCount) ? this.PolygonCount[0] : undefined
    },
    CurrentPolygonCount() {
      return this.overlay.polygonInstance.filter(v => v).length
    },
  },
  data() {
    return {
      polygonStyle: {
        strokeColor: '#00B2D5',
        strokeWeight: 2,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        fillOpacity: 0.5,
        cursor: 'pointer',
        zIndex: 50,
      },
    }
  },
  methods: {
    onPolygonBtnClick() {
      // 只读模式点击无效果
      if (this.PolygonMaxCount > 0) {
        if (this.CurrentPolygonCount >= this.PolygonMaxCount) {
          SwalPreset.warning(`最多绘制${this.PolygonMaxCount}个多边形`)
        } else {
          this.active = 'polygon'
        }
      }
    },
    syncPolygon() {
      // 同步可能经过删除、节点变化的多边形
      this.overlay.polygon = []
      this.overlay.polygonInstance.map((v) => {
        if (v) {
          // 新创建的polygon getPath()获取的lng和lat默认只保留6位小数 而R和Q是完整的
          this.overlay.polygon.push({
            path: Array.from(v.getPath(), v => ({ lng: this.roundOff(v.R), lat: this.roundOff(v.Q) })),
          })
        }
      })
    },
    drawPolygon({ polygon, editable }) {
      if (polygon) {
        for (let i = 0; i < polygon.length; i++) {
          const path = []
          for (const v of polygon[i]?.path || []) {
            if (notEmpty(v.lng) && notEmpty(v.lat)) {
              path.push([v.lng, v.lat])
            }
          }
          if (path.length > 0) {
            this.overlay.polygonInstance.push(new AMap.Polygon({
              ...this.polygonStyle,
              fillColor: '#00D3FC',
              map: this.map,
              path,
            }))
            this.editPolygon({ editable })
          }
        }
      } else {
        this.mouseTool.polygon({
          ...this.polygonStyle,
          fillColor: 'transparent',
        })
      }
    },
    editPolygon({ editable }) {
      const i = this.overlay.polygonInstance.length - 1

      if (this.PolygonStatus === 'editable') {
        const polygonContextMenu = new AMap.ContextMenu()
        polygonContextMenu.addItem('删除', (e) => {
          if (this.CurrentPolygonCount <= this.PolygonMinCount) {
            SwalPreset.warning(`至少绘制${this.PolygonMinCount}个多边形`)
          } else {
            if (editable) {
              this.overlay.polygonEditor[i].close()
              this.$set(this.overlay.polygonEditor, i, undefined)
            }
            this.overlay.polygonInstance[i].setMap(null)
            this.$set(this.overlay.polygonInstance, i, undefined)
          }
        }, 0)
        this.overlay.polygonInstance[i].on('rightclick', (e) => {
          polygonContextMenu.open(this.map, e.lnglat)
        })
      }

      /* this.overlay.polygonInstance[i].on('mouseout', e => {
        this.text.setText('单击绘制点位')
      }) */

      this.overlay.polygonInstance[i].on('click', this.onMapClick)

      /* this.overlay.polygonInstance[i].on('mousemove', e => {
        this.text.setText((editable ? '拖拽角调整形状，' : '') + '右键删除')
        this.setTextPosition(e)
      }) */

      let polygonEditor = null
      if (editable) {
        polygonEditor = AMap.PolygonEditor
          ? new AMap.PolygonEditor(this.map, this.overlay.polygonInstance[i])
          : new AMap.PolyEditor(this.map, this.overlay.polygonInstance[i])
        polygonEditor.open()
      }
      this.overlay.polygonEditor.push(polygonEditor)
      this.overlay.polygonInstance[i].setMap(this.map)
    },
  },
}
