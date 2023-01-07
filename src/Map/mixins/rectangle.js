import SwalPreset from 'sweetalert2-preset'
import { conclude } from 'vue-global-config'
import { globalProps } from '../index.vue'

export default {
  props: {
    rectangleImage: {},
    rectangle: {},
    rectangleCount: {},
  },
  computed: {
    RectangleStatus() {
      if (this.RectangleMaxCount > 0) {
        return 'editable'
      } else if (this.Rectangle?.length > 0) {
        return 'readonly'
      }
    },
    Rectangle() {
      return conclude([this.rectangle, globalProps.rectangle], {
        type: Array,
      })
    },
    RectangleImage() {
      const temp = conclude([this.rectangleImage, globalProps.rectangleImage, []], {
        type: [String, Array],
      })
      return (typeof temp === 'string') ? [temp] : temp
    },
    RectangleCount() {
      return conclude([this.rectangleCount, globalProps.rectangleCount, 0], {
        type: [Number, Array],
      })
    },
    RectangleMaxCount() {
      return Array.isArray(this.RectangleCount) ? this.RectangleCount[1] : this.RectangleCount
    },
    RectangleMinCount() {
      return Array.isArray(this.RectangleCount) ? this.RectangleCount[0] : undefined
    },
    CurrentRectangleCount() {
      return this.overlay.rectangleInstance.filter(v => v).length
    },
  },
  data() {
    return {
      rectangleStyle: {
        strokeColor: '#00B2D5',
        strokeWeight: 2,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        fillColor: 'transparent',
        fillOpacity: 0,
        cursor: 'pointer',
        zIndex: 50,
      },
    }
  },
  methods: {
    onRectangleBtnClick() {
      // 只读模式点击无效果
      if (this.RectangleMaxCount > 0) {
        if (this.CurrentRectangleCount >= this.RectangleMaxCount) {
          SwalPreset.warning(`最多绘制${this.RectangleMaxCount}个矩形`)
        } else if (!this.curImage && this.RectangleImage.length > 1) {
          this.imagePicker.show = true
        } else {
          this.active = 'rectangle'
        }
      }
    },
    syncRectangleBounds({ i, image, bounds }) {
      // 兼容1.x
      this.overlay.rectangle[i] = {
        ...this.overlay.rectangle[i],
        ...image && { image },
        northeast: {
          lng: bounds.northEast ? this.roundOff(bounds.northEast.lng) : this.roundOff(bounds.northeast.lng),
          lat: bounds.northEast ? this.roundOff(bounds.northEast.lat) : this.roundOff(bounds.northeast.lat),
        },
        southwest: {
          lng: bounds.southWest ? this.roundOff(bounds.southWest.lng) : this.roundOff(bounds.southwest.lng),
          lat: bounds.southWest ? this.roundOff(bounds.southWest.lat) : this.roundOff(bounds.southwest.lat),
        },
      }
      // 矩形可能不包含贴图 所以需要判空
      this.overlay.imageLayerInstance[i]?.setBounds(bounds)
    },
    drawRectangle({ image, bounds, editable = true }) {
      const rectangleInstance = new AMap.Rectangle({
        ...this.rectangleStyle,
        bounds,
      })
      this.overlay.rectangleInstance.push(rectangleInstance)
      const i = this.overlay.rectangleInstance.length - 1
      rectangleInstance.on('click', this.onMapClick)

      if (this.RectangleStatus === 'editable') {
        const contextMenu = new AMap.ContextMenu()
        contextMenu.addItem('删除', (e) => {
          if (this.CurrentRectangleCount <= this.RectangleMinCount) {
            SwalPreset.warning(`至少绘制${this.RectangleMinCount}个矩形`)
          } else {
            this.$set(this.overlay.rectangle, i, undefined)
            // 矩形可能是空心的 需要判空
            if (editable && this.overlay.rectangleEditor[i]) {
              this.overlay.rectangleEditor[i].close()
              this.$set(this.overlay.rectangleEditor, i, undefined)
            }
            this.overlay.rectangleInstance[i].setMap(null)
            this.$set(this.overlay.rectangleInstance, i, undefined)
            if (this.overlay.imageLayerInstance[i]) {
              this.overlay.imageLayerInstance[i].setMap(null)
              this.$set(this.overlay.imageLayerInstance, i, undefined)
            }
          }
        }, 0)
        rectangleInstance.on('rightclick', (e) => {
          contextMenu.open(this.map, e.lnglat)
        })
      }

      rectangleInstance.setMap(this.map)
      let imageLayerInstance = null
      if (image) {
        imageLayerInstance = new AMap.ImageLayer({
          url: image,
          bounds,
        })
        this.map.add(imageLayerInstance)
      }
      this.overlay.imageLayerInstance.push(imageLayerInstance)
      this.syncRectangleBounds({ i, image, bounds })

      if (editable) {
        this.editRectangle({
          i,
          rectangleInstance,
        })
      }
    },
    editRectangle({ i, rectangleInstance }) {
      /* rectangleInstance.on('mousemove', e => {
        this.text.setText('拖拽角调整大小')
        this.setTextPosition(e)
      })
      rectangleInstance.on('mouseout', e => {
        this.text.setText('单击绘制点位')
      }) */

      const rectangleEditor = new AMap.RectangleEditor(this.map, rectangleInstance)

      this.overlay.rectangleEditor.push(rectangleEditor)

      /**
       * 移动选框时 同步矩形角坐标
       */
      rectangleEditor.on('adjust', (e) => {
        this.syncRectangleBounds({
          i,
          bounds: e.bounds || e.Td, // 兼容 1.x
        })
      })
      // 短距离平移触发
      /* this.text.on('mouseup', e => {
        this.syncRectangleBounds(rectangleInstance.getBounds())
      }) */
      // 短距离平移触发
      rectangleInstance.on('mouseup', (e) => {
        this.syncRectangleBounds({
          i,
          bounds: rectangleInstance.getBounds(),
        })
      })
      // 长距离平移触发
      /* this.map.on('mouseup', e => {
        if (rectangleInstance) {
          this.syncRectangleBounds({
            i,
            bound: rectangleInstance.getBounds()
          })
        }
      }) */

      rectangleEditor.open()
    },
  },
}
