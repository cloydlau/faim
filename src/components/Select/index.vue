<template>
  <el-select v-model="value__" v-bind="ElSelectProps" @change="onChange" v-on="Listeners"
    ref="elSelect" @visible-change="onVisibleChange">
    <template v-if="grouped">
      <el-option-group v-for="(group, groupIndex) of options__"
        :key="optionGroupPropsList[groupIndex].key"
        :label="optionGroupPropsList[groupIndex].label"
        :disabled="optionGroupPropsList[groupIndex].disabled">
        <el-option
          v-for="(option, optionIndex) of optionGroupPropsList[groupIndex].options"
          :key="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].key"
          :label="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].label"
          :value="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].value"
          :disabled="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].disabled"
          @click.native="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].disabled ? undefined : onOptionClick(group, groupIndex)">
          <slot v-if="$scopedSlots.default" :option="option" :index="optionIndex" />
          <template v-else>
            <el-tooltip :disabled="!Ellipsis" effect="dark" placement="right"
              :content="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].label">
              <span class="label-left">{{
                  optionGroupPropsList[groupIndex].optionPropsList[optionIndex].label
              }}</span>
            </el-tooltip>
            <span class="label-right">{{
                optionGroupPropsList[groupIndex].optionPropsList[optionIndex].labelRight
            }}</span>
          </template>
        </el-option>
      </el-option-group>
    </template>

    <template v-else>
      <el-checkbox v-model="allSelected" @change='selectAll'
        :indeterminate="indeterminate" class="px-20px py-10px"
        v-if="isMultiple && options__.length > 1">
        全选
      </el-checkbox>
      <el-option v-for="(v, i) of options__" :key="optionPropsList[i].key"
        :label="optionPropsList[i].label" :value="optionPropsList[i].value"
        :disabled="optionPropsList[i].disabled"
        @click.native="optionPropsList[i].disabled ? undefined : onOptionClick(v, i)">
        <slot v-if="$scopedSlots.default" :option="v" :index="i" />
        <template v-else>
          <el-tooltip :disabled="!Ellipsis" effect="dark" placement="right"
            :content="optionPropsList[i].label">
            <span class="label-left">{{ optionPropsList[i].label }}</span>
          </el-tooltip>
          <span class="label-right">{{ optionPropsList[i].labelRight }}</span>
        </template>
      </el-option>
    </template>

    <template v-for="(v, k) in ScopedSlots" v-slot:[k]>
      <slot :name="k" />
    </template>
  </el-select>
</template>

<script>
import Vue from 'vue'
import { typeOf, isEmpty, notEmpty } from 'kayran'
import emitter from 'element-ui/src/mixins/emitter'
import { cloneDeep } from 'lodash-es'
import { globalProps, globalAttrs, globalListeners } from './index'
import { conclude } from 'vue-global-config'
import { v4 as uuidv4 } from 'uuid'
import { getListeners } from '../../utils'

export default {
  name: 'KiSelect',
  mixins: [emitter],
  inject: {
    elForm: {
      default: {}
    }
  },
  props: {
    value: {},
    label: {},
    options: {
      validator: value => ['null', 'array'].includes(typeOf(value)),
    },
    props: {},
    ellipsis: {
      type: Boolean,
      default: undefined,
    },
    search: {},
    searchImmediately: {
      type: Boolean,
      default: undefined,
    },
  },
  computed: {
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    grouped() {
      return notEmpty(this.Props.groupOptions)
    },
    itemTypeIsJSON() {
      return typeof this.options__?.[0] === 'object'
    },
    valueComesFromObject() {
      if (isEmpty(this.Props.value) || this.valueType === 'function') {
        return false
      } else {
        return this.itemTypeIsJSON
      }
    },
    ScopedSlots() {
      let res = {}
      for (let k in this.$scopedSlots) {
        if (k !== 'default') {
          res[k] = this.$scopedSlots[k]
        }
      }
      return res
    },
    ElSelectProps() {
      const remote = Boolean(this.Search)
      const placeholder = remote ? '搜索' : '请选择'

      return conclude([this.$attrs, globalAttrs, {
        clearable: true,
        filterable: true,
        remote,
        reserveKeyword: true,
        remoteMethod: this.remoteMethod,
        valueKey: this.valueComesFromObject ? this.Props.value : undefined,
        loading: this.loading,
        placeholder,
      }], {
        type: 'object',
      })
    },
    Ellipsis() {
      const res = conclude([this.ellipsis, globalProps.ellipsis, false], {
        name: 'ellipsis',
        type: 'boolean'
      })
      if (res) {
        this.$nextTick(() => {
          this.popper = this.$refs.elSelect.$refs.popper
          this.unwatchOptions = this.$watch('options__', newVal => {
            if (newVal && newVal.length) {
              setTimeout(() => {
                if (this.popper) {
                  this.popper.$el.style.maxWidth = this.popper.minWidth
                }
              })
            }
          }, {
            immediate: true,
          })
        })
      } else {
        this.unwatchOptions?.()
      }
    },
    valueType() {
      return this.validateProps('value')
    },
    labelType() {
      return this.validateProps('label')
    },
    labelRightType() {
      return this.validateProps('labelRight')
    },
    disabledType() {
      return this.validateProps('disabled')
    },
    groupLabelType() {
      return this.validateProps('groupLabel')
    },
    groupDisabledType() {
      return this.validateProps('groupDisabled')
    },
    groupOptionsType() {
      return this.validateProps('groupOptions')
    },
    Props() {
      return conclude([
        this.props,
        globalProps.props,
        {
          disabled: 'disabled',
          groupDisabled: 'disabled',
        }
      ], {
        name: 'props',
        type: 'object'
      })
    },
    Search() {
      return conclude([this.search, globalProps.search], {
        type: ['function', 'asyncfunction']
      })
    },
    SearchImmediately() {
      return conclude([this.searchImmediately, globalProps.searchImmediately, true], {
        name: 'searchImmediately',
        type: 'boolean'
      })
    },
    isMultiple() {
      return [true, ''].includes(this.ElSelectProps.multiple)
    }
  },
  data() {
    return {
      value__: this.value,
      initialValue: undefined,
      popper: null,
      //showKiSelect: false
      unwatchOptions: null,
      loading: undefined,
      // 在组件内部维护一份 options__ 的目的：search 时可以不绑定 options
      options__: [],
      optionGroupPropsList: [],
      optionPropsList: [],
      allSelected: false,
      indeterminate: false,
      valueInitializedWhenMultiple: false,
    }
  },
  watch: {
    // 没有使用v-model/:value时 resetFields不会触发
    value: {
      immediate: true,
      handler(n, o) {
        this.value__ = n
        // 外部设值时，同步全选按钮状态
        this.syncSelectAllBtn(n)
      }
    },
    value__: {
      handler(n, o) {
        // 多选时，value会被el-select初始化为[]，此时不应执行清空逻辑
        if (this.isMultiple) {
          if (!this.valueInitializedWhenMultiple) {
            return
          }
          this.valueInitializedWhenMultiple = true
        }
        // 清空时
        if (isEmpty(n)) {
          this.$emit('update:index', undefined)
          this.remoteMethod()
        }
      }
    },
    label: {
      immediate: true,
      handler(n, o) {
        // 没有匹配到选项时，显示label
        this.initLabel()
      }
    },
    options: {
      immediate: true,
      handler(n, o) {
        this.setOptions__(n)
      }
    },
  },
  created() {
    if (this.SearchImmediately) {
      this.remoteMethod(undefined, true)
    }
  },
  mounted() {
    this.initialValue = cloneDeep(this.value)
    this.dispatch('ElForm', 'el.form.addField', [this])
  },
  methods: {
    // 下拉框隐藏时，如果没有选中，el-select 会清空搜索关键字，此时需要恢复 options
    onVisibleChange(isVisible) {
      if (!isVisible && isEmpty(this.value__)) {
        // 加延迟的原因：在下拉框隐藏动画结束后再恢复
        setTimeout(() => {
          this.remoteMethod()
        }, 100)
      }
    },
    // 不写在 watch 里的原因：options__、optionPropsList、optionGroupPropsList 的长度必须保持同步
    setOptions__(n) {
      if (!['undefined', 'null', 'array'].includes(typeOf(n))) {
        throw Error(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}options 的类型仅能为 any[]，得到：`, n)
      }
      // 必须先于 optionPropsList、optionGroupPropsList 执行，否则会影响 getValue 等的判断
      this.options__ = n || []

      if (this.grouped) {
        this.optionGroupPropsList = Array.from(n || [], (group, groupIndex) => {
          const options = this.getGroupOptions(group, groupIndex)
          return {
            key: uuidv4(),
            label: this.getGroupLabel(group, groupIndex),
            disabled: this.isGroupDisabled(group, groupIndex),
            options,
            optionPropsList: Array.from(options || [], (v, i) => ({
              key: uuidv4(),
              value: this.getValue(v, i),
              label: this.getLabel(v, i),
              labelRight: this.getLabelRight(v, i),
              disabled: this.isDisabled(v, i),
            }))
          }
        })
      } else {
        this.optionPropsList = Array.from(n || [], (v, i) => ({
          key: uuidv4(),
          value: this.getValue(v, i),
          label: this.getLabel(v, i),
          labelRight: this.getLabelRight(v, i),
          disabled: this.isDisabled(v, i),
        }))
      }

      this.$emit('update:options', n)
    },
    initLabel() {
      if (this.label) {
        setTimeout(() => {
          const { selected, selectedLabel } = this.$refs.elSelect
          if (!(selected instanceof Vue) && selectedLabel === '') {
            this.$refs.elSelect.selectedLabel = this.label
            this.$refs.elSelect.query = this.label
          }
        })
      }
    },
    selectAll() {
      if (this.allSelected) {
        let temp = []
        this.options__.map((v, i) => {
          if (!this.isDisabled(v, i)) {
            temp.push(this.getValue(v, i))
          }
        })
        this.value__ = temp
      } else {
        this.value__ = []
      }
      this.onChange(this.value__)
    },
    // el-from 重置触发
    resetField() {
      const initialValue = cloneDeep(this.initialValue)
      this.value__ = initialValue
      this.onChange(initialValue)
    },
    validate(trigger, callback) {
      callback()
    },
    clearValidate() { },
    getRules() {
      return []
    },
    getFilteredRule() {
      return []
    },
    validateProps(propKey) {
      const res = typeOf(this.Props[propKey])
      if (['undefined', 'boolean', 'symbol', 'string', 'number', 'null', 'function'].includes(res)) {
        return res
      } else {
        throw Error(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}props.${propKey} 的类型仅能为 string / number / symbol / function，得到：`, this.Props[propKey])
      }
    },
    onOptionClick(v, i) {
      this.$emit('update:index', i)
    },
    remoteMethod(e, isImmediate = false) {
      if (!this.Search) {
        return
      }
      this.loading = true
      const res = this.Search(e, isImmediate)
      if (res instanceof Promise) {
        res.then(res => {
          this.setOptions__(res)
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.setOptions__(res)
        this.loading = false
      }
    },
    syncSelectAllBtn(value) {
      if (this.isMultiple && !this.grouped) {
        let valueLen = value ? value.length : 0
        const optionsLen = this.options__.length
        this.allSelected = valueLen > 0 && valueLen === optionsLen
        this.indeterminate = valueLen > 0 && valueLen < optionsLen
      }
    },
    onChange(value) {
      this.syncSelectAllBtn(value)
      this.$nextTick(() => {
        this.$emit('update:label', this.$refs.elSelect.selectedLabel)
      })
      this.$emit('input', value)
    },
    getValue(v, i) {
      let res = v
      if (this.valueType === 'function') {
        res = this.Props.value(v, i)
      } else if (this.itemTypeIsJSON) {
        if (notEmpty(this.Props.value)) {
          res = v?.[this.Props.value]
        } else if (isEmpty(this.ElSelectProps.valueKey)) {
          throw Error(`${import.meta.env.VITE_APP_CONSOLE_PREFIX} 绑定值为 object 类型时，必须按 el-select 的要求指定 value-key`)
        }
      }
      return res
    },
    getLabel(v, i) {
      let res = v
      if (this.labelType === 'function') {
        res = this.Props.label(v, i)
      } else if (this.itemTypeIsJSON) {
        if (notEmpty(this.Props.label)) {
          res = v?.[this.Props.label]
        } else {
          res = JSON.stringify(v)
        }
      }
      return isEmpty(res) ? '' : String(res)
    },
    getLabelRight(v, i) {
      let res
      if (this.labelRightType === 'function') {
        res = this.Props.labelRight(v, i)
      } else if (this.itemTypeIsJSON) {
        if (notEmpty(this.Props.labelRight)) {
          res = v?.[this.Props.labelRight]
        }
      }
      return isEmpty(res) ? '' : String(res)
    },
    getGroupLabel(v, i) {
      let res = v
      if (this.groupLabelType === 'function') {
        res = this.Props.groupLabel(v, i)
      } else if (this.itemTypeIsJSON) {
        if (notEmpty(this.Props.groupLabel)) {
          res = v?.[this.Props.groupLabel]
        } else {
          res = JSON.stringify(v)
        }
      }
      return isEmpty(res) ? '' : String(res)
    },
    isDisabled(v, i) {
      let res = false
      if (this.disabledType === 'function') {
        res = this.Props.disabled(v, i)
      } else if (this.itemTypeIsJSON && notEmpty(this.Props.disabled)) {
        res = v?.[this.Props.disabled]
      }
      return Boolean(res)
    },
    isGroupDisabled(v, i) {
      let res = false
      if (this.groupDisabledType === 'function') {
        res = this.Props.groupDisabled(v, i)
      } else if (this.itemTypeIsJSON && notEmpty(this.Props.groupDisabled)) {
        res = v?.[this.Props.groupDisabled]
      }
      return Boolean(res)
    },
    getGroupOptions(v, i) {
      let res
      if (this.groupOptionsType === 'function') {
        res = this.Props.groupOptions(v, i)
      } else if (this.itemTypeIsJSON) {
        res = v?.[this.Props.groupOptions]
      }
      if (isEmpty(res)) {
        return []
      } else if (!Array.isArray(res)) {
        console.warn(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}groupOptions 的值类型仅能为 any[]`)
        return []
      }
      return res
    },
    /*onVisibleChange (show) {
      this.showKiSelect = show
    },
    isEllipsis*/
  }
}
</script>

<style lang="scss">
.el-select-dropdown__item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &>.label-left {
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    line-height: normal;
  }

  &>.label-right {
    flex-shrink: 0;
    color: #8492a6;
    font-size: 13px;
    margin-left: 1rem;
    font-weight: normal; // 默认选中时加粗
  }
}
</style>
