<template>
  <el-select
    v-bind="ElSelectProps"
    ref="elSelectRef"
    v-model="value__"
    v-on="Listeners"
    @visible-change="onVisibleChange"
  >
    <template v-if="isGrouped">
      <el-checkbox
        v-if="showSelectAll"
        v-model="allSelected"
        :indeterminate="indeterminate"
        class="px-20px py-10px"
        @change="selectAll"
      >
        {{ SelectAllText }}
      </el-checkbox>
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
        {{ SelectAllText }}
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
import { isVue3 } from 'vue-demi'
import { getListeners, isEmpty, isObject, notEmpty, unwrap } from '../utils'
import { globalAttrs, globalListeners, globalProps } from './index'

const modelValueProp = isVue3 ? 'modelValue' : 'value'
const updateModelValue = isVue3 ? 'update:modelValue' : 'input'
const boolProps = [
  'searchImmediately',
  'allowSelectAll',
]

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
    selectAllText: {},
    ...Object.fromEntries(Array.from(boolProps, boolProp => [boolProp, {
      type: Boolean,
      default: undefined,
    }])),
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
      return conclude([this.allowSelectAll, globalProps.allowSelectAll, true], {
        type: Boolean,
      })
    },
    SelectAllText() {
      return conclude([this.selectAllText, globalProps.selectAllText, 'Select All'], {
        type: String,
        required: true,
      })
    },
    showSelectAll() {
      return this.AllowSelectAll && this.isMultiple && this.options__.length > 1
    },
    Listeners() {
      return getListeners.call(this, globalListeners)
    },
    isGrouped() {
      return notEmpty(this.Props.groupOptions)
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

      return conclude([this.$attrs, globalAttrs, {
        clearable: true,
        filterable: true,
        remote,
        reserveKeyword: true,
        remoteMethod: remote ? this.remoteMethod : undefined,
        valueKey: (this.Props.value && typeof this.Props.value === 'string') ? this.Props.value : undefined,
        loading: this.loading,
      }], {
        type: Object,
        camelizeObjectKeys: true,
      })
    },
    Props() {
      return conclude([this.props, globalProps.props, {}], {
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
    // 必须放在 value 前面，否则会影响 syncSelectAllBtn 的判断
    options: {
      immediate: true,
      handler(newOptions, o) {
        this.setOptions__(newOptions)
      },
    },
    // 没有使用 v-model / value 时，resetFields 不会触发
    value: {
      immediate: true,
      handler(newValue, o) {
        this.value__ = newValue
        this.showLabel()
        // 外部设值时，同步全选按钮状态
        this.syncSelectAllBtn(newValue)
      },
    },
    value__: {
      handler(newValue__, o) {
        // 多选时，value 会被 el-select 初始化为 []，此时不应执行清空逻辑
        if (this.isMultiple) {
          if (!this.valueInitializedWhenMultiple) {
            return
          }
          this.valueInitializedWhenMultiple = true
        }
        // 清空时
        if (isEmpty(newValue__)) {
          this.remoteMethod()
        }
        this.syncSelectAllBtn(value)
        this.$nextTick(() => {
          this.$emit('update:label', this.isMultiple
            ? this.$refs.elSelectRef.selected.map(({ currentLabel }) => currentLabel)
            : this.$refs.elSelectRef.selectedLabel)
        })
        this.$emit(updateModelValue, this.value__)
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
    // 不写在 watch 里的原因：options__、optionPropsList、optionGroupPropsList 的长度必须保持同步
    setOptions__(newOptions) {
      // 校验类型
      conclude([newOptions], { type: Array })

      // 必须先于 optionPropsList、optionGroupPropsList 执行，否则会影响 getValue 等的判断
      this.options__ = newOptions || []

      if (this.isGrouped) {
        this.optionGroupPropsList = Array.from(newOptions || [], (group, groupIndex) => {
          const options = this.getGroupOptions(group, groupIndex)
          return {
            key: this.getKey(group),
            label: this.getGroupLabel(group, groupIndex),
            disabled: this.isGroupDisabled(group, groupIndex),
            options,
            optionPropsList: Array.from(options || [], v => ({
              key: this.getKey(v),
              value: this.getValue(v),
              label: this.getLabel(v),
              disabled: this.isDisabled(v),
            })),
          }
        })
      } else {
        this.optionPropsList = Array.from(newOptions || [], v => ({
          key: this.getKey(v),
          value: this.getValue(v),
          label: this.getLabel(v),
          disabled: this.isDisabled(v),
        }))
      }

      if (notEmpty(newOptions)) {
        this.showLabel()
      }
      this.$emit('update:options', newOptions)
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
    // value 没匹配上选项时，el-select 默认显示 value，改为显示 label
    showLabel() {
      this.$nextTick(() => {
        if (this.isMultiple) {
          this.$refs.elSelectRef.selected.forEach((v) => {
            if (!v.currentLabel) {
              v.currentLabel = this.getLabel(v.value)
            }
          })
        } else if (!(this.$refs.elSelectRef.selected instanceof Vue)) {
          const selectedLabel = this.getLabel(this.value__)
          if (selectedLabel) {
            this.$refs.elSelectRef.selectedLabel = selectedLabel
          }
        }
      })
    },
    selectAll(checked) {
      const value__ = cloneDeep(this.value__)

      const callback = (disabled, value) => {
        const valueToIndex = Object.fromEntries(Array.from(value__, (item, i) => [item, i]))
        const i = valueToIndex[value]
        if (checked) {
          if (!disabled && i === undefined) {
            value__.push(value)
          }
        } else if (i !== undefined) {
          value__.splice(i, 1)
        }
      }

      if (this.isGrouped) {
        this.optionGroupPropsList.forEach(({ disabled, optionPropsList }) => {
          if (!disabled) {
            optionPropsList?.forEach(({ disabled, value }) => callback(disabled, value))
          }
        })
      } else {
        this.optionPropsList.forEach(({ disabled, value }) => callback(disabled, value))
      }

      this.value__ = value__
    },
    syncSelectAllBtn(value) {
      if (this.showSelectAll) {
        const valueLen = value?.length || 0
        const optionsLen = this.isGrouped
          ? this.optionGroupPropsList.reduce((pre, cur) => pre + cur.options.length, 0)
          : this.optionPropsList.length
        this.allSelected = valueLen > 0 && valueLen === optionsLen
        this.indeterminate = valueLen > 0 && valueLen < optionsLen
      }
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
    getKey(v) {
      return unwrap(v, this.ElSelectProps.valueKey)
    },
    getValue(v) {
      return unwrap(v, this.Props.value)
    },
    getLabel(v) {
      return unwrap(v, this.Props.label)
    },
    isDisabled(v) {
      return this.Props.disabled ? unwrap(v, this.Props.disabled) : undefined
    },
    getGroupLabel(v) {
      return this.Props.groupLabel ? unwrap(v, this.Props.groupLabel) : undefined
    },
    getGroupOptions(v) {
      return this.Props.groupOptions ? unwrap(v, this.Props.groupOptions) : undefined
    },
    isGroupDisabled(v) {
      return this.Props.groupDisabled ? unwrap(v, this.Props.groupDisabled) : undefined
    },
  },
}
</script>
