<template>
  <el-select
    v-bind="ElSelectProps"
    ref="elSelect"
    v-model="value__"
    @change="onChange"
    v-on="Listeners"
    @visible-change="onVisibleChange"
  >
    <template v-if="grouped">
      <el-option-group
        v-for="(group, groupIndex) of options__"
        :key="optionGroupPropsList[groupIndex].key"
        :label="optionGroupPropsList[groupIndex].label"
        :disabled="optionGroupPropsList[groupIndex].disabled"
      >
        <el-option
          v-for="(option, optionIndex) of optionGroupPropsList[groupIndex].options"
          :key="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].key"
          :label="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].label"
          :value="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].value"
          :disabled="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].disabled"
        >
          <slot
            v-if="$slots.default"
            :option="option"
            :index="optionIndex"
          />
          <template v-else>
            {{ optionGroupPropsList[groupIndex].optionPropsList[optionIndex].label }}
          </template>
        </el-option>
      </el-option-group>
    </template>

    <template v-else>
      <el-checkbox
        v-if="AllowSelectAll && isMultiple && options__.length > 1"
        v-model="allSelected"
        :indeterminate="indeterminate"
        class="px-20px py-10px"
        @change="selectAll"
      >
        全选
      </el-checkbox>
      <el-option
        v-for="(v, i) of options__"
        :key="optionPropsList[i].key"
        :label="optionPropsList[i].label"
        :value="optionPropsList[i].value"
        :disabled="optionPropsList[i].disabled"
      >
        <slot
          v-if="$slots.default"
          :option="v"
          :index="i"
        />
        <template v-else>
          {{ optionPropsList[i].label }}
        </template>
      </el-option>
    </template>

    <template
      v-for="(v, k) in ScopedSlots"
      #[k]
    >
      <slot :name="k" />
    </template>
  </el-select>
</template>

<script>
import Vue from 'vue'
import { cloneDeep } from 'lodash-es'
import { conclude } from 'vue-global-config'
import { v4 as uuidv4 } from 'uuid'
import { isVue3 } from 'vue-demi'
import { getListeners, isEmpty, isObject, notEmpty, unwrap } from '../utils'
import { globalAttrs, globalListeners, globalProps } from './index'

const modelValueProp = isVue3 ? 'modelValue' : 'value'
const updateModelValue = isVue3 ? 'update:modelValue' : 'input'

export default {
  name: 'KiSelect',
  props: {
    [modelValueProp]: {},
    label: {},
    options: {
      type: Array,
    },
    props: {},
    search: {},
    searchImmediately: {
      type: Boolean,
      default: undefined,
    },
    allowSelectAll: {
      type: Boolean,
      default: undefined,
    },
  },
  emits: [updateModelValue, 'update:options', 'update:label'],
  data() {
    return {
      value__: this.value,
      initialValue: undefined,
      popper: null,
      // showKiSelect: false
      unwatchOptions: null,
      loading: undefined,
      // 在组件内部维护一份 options__ 的目的：search 时可以不绑定 options
      options__: [],
      optionGroupPropsList: [],
      optionPropsList: [],
      allSelected: false,
      indeterminate: false,
      valueInitializedWhenMultiple: false,
      previousQuery: null,
    }
  },
  computed: {
    AllowSelectAll() {
      return conclude([this.allowSelectAll, globalProps.allowSelectAll, true])
    },
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    grouped() {
      return notEmpty(this.Props.groupOptions)
    },
    itemTypeIsJSON() {
      return isObject(this.options__?.[0])
    },
    valueComesFromObject() {
      return this.Props.value && typeof this.Props.value === 'string' && this.itemTypeIsJSON
    },
    ScopedSlots() {
      const res = {}
      for (const k in this.$slots) {
        if (k !== 'default') {
          res[k] = this.$slots[k]
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
        remoteMethod: this.Search ? this.remoteMethod : undefined,
        valueKey: this.valueComesFromObject ? this.Props.value : undefined,
        loading: this.loading,
        placeholder,
      }], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
    Props() {
      return conclude([this.props, globalProps.props], {
        type: Object,
      })
    },
    Search() {
      return conclude([this.search, globalProps.search], {
        type: Function,
      })
    },
    SearchImmediately() {
      return conclude([this.searchImmediately, globalProps.searchImmediately, true], {
        type: Boolean,
      })
    },
    isMultiple() {
      return [true, ''].includes(this.ElSelectProps.multiple)
    },
  },
  watch: {
    // 没有使用 v-model / value 时，resetFields 不会触发
    value: {
      immediate: true,
      handler(n, o) {
        this.value__ = n
        this.showLabel()
        // 外部设值时，同步全选按钮状态
        this.syncSelectAllBtn(n)
      },
    },
    value__: {
      handler(n, o) {
        // 多选时，value 会被 el-select 初始化为 []，此时不应执行清空逻辑
        if (this.isMultiple) {
          if (!this.valueInitializedWhenMultiple) {
            return
          }
          this.valueInitializedWhenMultiple = true
        }
        // 清空时
        if (isEmpty(n)) {
          this.remoteMethod()
        }
      },
    },
    options: {
      immediate: true,
      handler(n, o) {
        this.setOptions__(n)
      },
    },
  },
  created() {
    if (this.SearchImmediately) {
      this.remoteMethod()
    }
  },
  mounted() {
    this.initialValue = cloneDeep(this.value)
  },
  methods: {
    // value 没匹配上选项时，el-select 默认显示 value，改为显示 label
    showLabel() {
      this.$nextTick(() => {
        if (this.isMultiple) {
          this.$refs.elSelect.selected.forEach((v) => {
            if (!v.currentLabel) {
              v.currentLabel = this.getLabel(v.value)
            }
          })
        } else if (!(this.$refs.elSelect.selected instanceof Vue)) {
          const selectedLabel = this.getLabel(this.value__)
          if (selectedLabel) {
            this.$refs.elSelect.selectedLabel = selectedLabel
          }
        }
      })
    },
    // 下拉框隐藏时，如果没有选中，el-select 会清空搜索关键字，此时需要恢复 options
    onVisibleChange(isVisible) {
      if (!isVisible) {
        this.showLabel()
        if (isEmpty(this.value__) && this.previousQuery) {
          // 加延迟的原因：在下拉框隐藏动画结束后再恢复
          setTimeout(() => {
            this.remoteMethod()
          }, 100)
        }
      }
    },
    // 不写在 watch 里的原因：options__、optionPropsList、optionGroupPropsList 的长度必须保持同步
    setOptions__(n) {
      // 校验类型
      conclude([n], { type: Array })

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
            optionPropsList: Array.from(options || [], v => ({
              key: uuidv4(),
              value: this.getValue(v),
              label: this.getLabel(v),
              disabled: this.isDisabled(v),
            })),
          }
        })
      } else {
        this.optionPropsList = Array.from(n || [], v => ({
          key: uuidv4(),
          value: this.getValue(v),
          label: this.getLabel(v),
          disabled: this.isDisabled(v),
        }))
      }

      if (notEmpty(n)) {
        this.showLabel()
      }
      this.$emit('update:options', n)
    },
    selectAll() {
      if (this.allSelected) {
        const temp = []
        this.options__.forEach((v) => {
          if (!this.isDisabled(v)) {
            temp.push(this.getValue(v))
          }
        })
        this.value__ = temp
      } else {
        this.value__ = []
      }
      this.onChange(this.value__)
      this.$emit('input', this.value__)
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
    remoteMethod(e) {
      if (!this.Search) {
        return
      }
      this.loading = true
      this.previousQuery = e
      const res = this.Search(e)
      if (res instanceof Promise) {
        res.then((res) => {
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
        const valueLen = value ? value.length : 0
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
    },
    getValue(v) {
      return unwrap(v, this.Props.value)
    },
    getLabel(v) {
      return unwrap(v, this.Props.label)
    },
    getGroupLabel(v) {
      return unwrap(v, this.Props.groupLabel)
    },
    isDisabled(v) {
      return unwrap(v, this.Props.disabled)
    },
    isGroupDisabled(v) {
      return unwrap(v, this.Props.groupDisabled)
    },
    getGroupOptions(v) {
      return unwrap(v, this.Props.groupOptions)
    },
  },
}
</script>
