<template>
  <el-select
    v-bind="ElSelectProps"
    v-model="innerValue"
    v-on="Listeners"
    @visible-change="onVisibleChange"
  >
    <template v-if="isGrouped">
      <slot name="option-prepend">
        <el-checkbox
          v-if="innerShowSelectAllCheckbox"
          v-model="allSelected"
          :indeterminate="indeterminate"
          style="padding: 10px 20px;"
          @change="selectAll"
        >
          {{ SelectAllCheckboxLabel }}
        </el-checkbox>
      </slot>
      <el-option-group
        v-for="(group, groupIndex) of innerOptions"
        :key="optionGroupPropsList[groupIndex].key"
        :label="optionGroupPropsList[groupIndex].label"
        :disabled="optionGroupPropsList[groupIndex].disabled"
      >
        <slot name="group-prepend" />
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
        <slot name="group-append" />
      </el-option-group>
      <slot name="option-append" />
    </template>

    <template v-else>
      <slot name="option-prepend">
        <el-checkbox
          v-if="innerShowSelectAllCheckbox"
          v-model="allSelected"
          :indeterminate="indeterminate"
          style="padding: 10px 20px;"
          @change="selectAll"
        >
          {{ SelectAllCheckboxLabel }}
        </el-checkbox>
      </slot>
      <el-option
        v-for="(v, i) of innerOptions"
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
      <slot name="option-append" />
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
import { isVue3 } from 'vue-demi'
import { conclude, useGlobalConfig } from 'vue-global-config'
import { cloneDeep } from 'lodash-es'
import { getListeners, isEmpty, isObject, notEmpty, unwrap } from '../utils'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalHooks = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

const boolProps = [
  'searchImmediately',
  'showSelectAllCheckbox',
]

export default {
  name: 'KiSelect',
  install(app, options = {}) {
    const { props, attrs, listeners, hooks } = useGlobalConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalHooks, hooks)
    app.component(this.name, this)
  },
  props: {
    [model.prop]: {},
    label: [String, Array],
    options: Array,
    props: {},
    search: {},
    selectAllCheckboxLabel: {},
    ...Object.fromEntries(Array.from(boolProps, boolProp => [boolProp, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: [model.event, 'update:options', 'update:label'],
  data() {
    return {
      innerValue: this[model.prop],
      initialValue: undefined,
      loading: undefined,
      // 在组件内部维护一份 innerOptions 的目的：search 时可以不绑定 options
      innerOptions: [],
      optionGroupPropsList: [],
      optionPropsList: [],
      allSelected: false,
      indeterminate: false,
      previousQuery: null,
    }
  },
  computed: {
    ShowSelectAllCheckbox() {
      return conclude([this.showSelectAllCheckbox, globalProps.showSelectAllCheckbox, true], {
        type: Boolean,
      })
    },
    innerShowSelectAllCheckbox() {
      return this.ShowSelectAllCheckbox && this.isMultiple && this.innerOptions.length > 1
    },
    SelectAllCheckboxLabel() {
      return conclude([this.selectAllCheckboxLabel, globalProps.selectAllCheckboxLabel, 'Select All'], {
        type: String,
        required: true,
      })
    },
    Listeners() {
      return getListeners.call(this, globalListeners)
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
        ref: 'elSelectRef',
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
    isGrouped() {
      return notEmpty(this.Props.groupOptions)
    },
  },
  watch: {
    options: {
      immediate: true,
      handler(newOptions) {
        this.setInnerOptions(newOptions)
      },
    },
    [model.prop]: {
      handler(newValue) {
        this.innerValue = newValue
        this.updateSelectAllStatus()
        this.updateLabel()
      },
    },
    innerValue: {
      handler(newInnerValue) {
        // 清空时
        if (isEmpty(newInnerValue)) {
          this.remoteMethod()
        }
        this.$emit(model.event, newInnerValue)
      },
    },
  },
  created() {
    if (this.SearchImmediately) {
      this.remoteMethod()
    }
  },
  mounted() {
    this.initialValue = cloneDeep(this[model.prop])
  },
  methods: {
    // 不写在 watch 里的原因：innerOptions、optionPropsList、optionGroupPropsList 的长度必须保持同步
    setInnerOptions(newOptions) {
      // 校验类型
      conclude([newOptions], { type: Array })

      // 必须先于 optionPropsList、optionGroupPropsList 执行，否则会影响 getValue 等的判断
      this.innerOptions = newOptions || []

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

      this.updateSelectAllStatus()
      this.updateLabel()
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
          this.setInnerOptions(res)
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.setInnerOptions(res)
        this.loading = false
      }
    },
    // value 没匹配上选项时，el-select 默认显示 value，改为显示 label
    updateLabel() {
      this.$nextTick(() => {
        if (this.isMultiple) {
          const label = []
          this.$refs[this.ElSelectProps.ref].selected.forEach((v) => {
            if (!v.currentLabel) {
              v.currentLabel = this.getLabel(v.value)
            }
            label.push(v.currentLabel)
          })
          this.$emit('update:label', label)
        } else {
          if (!this.$refs[this.ElSelectProps.ref].selectedLabel) {
            this.$refs[this.ElSelectProps.ref].selectedLabel = this.getLabel(this.innerValue)
          }
          this.$emit('update:label', this.$refs[this.ElSelectProps.ref].selectedLabel)
        }
      })
    },
    selectAll(checked) {
      const innerValue = cloneDeep(this.innerValue)
      // 便于高效判断一个选项是否被选中
      const valueKeyToIndex = Object.fromEntries(Array.from(innerValue, (item, i) =>
        [isObject(item) ? item[this.ElSelectProps.valueKey] : item, i]))

      const callback = (disabled, value, key) => {
        const i = valueKeyToIndex[isObject(value) ? key : value]
        // 全选时，选项处于启用状态且没有被选中，选中它
        if (checked) {
          if (!disabled && i === undefined) {
            innerValue.push(value)
          }
        }
        // 全不选时，选项被选中了，取消选中它
        else if (i !== undefined) {
          innerValue[i] = undefined
        }
      }

      if (this.isGrouped) {
        this.optionGroupPropsList.forEach(({ disabled, optionPropsList }) => {
          if (!disabled) {
            optionPropsList?.forEach(({ disabled, value, key }) => callback(disabled, value, key))
          }
        })
      } else {
        this.optionPropsList.forEach(({ disabled, value, key }) => callback(disabled, value, key))
      }

      this.innerValue = innerValue.filter(v => v !== undefined)
    },
    // 更新全选按钮的勾选状态
    updateSelectAllStatus() {
      if (this.innerShowSelectAllCheckbox) {
        if (this.innerValue?.length) {
          // 便于高效判断一个选项是否被选中
          const valueToIndex = Object.fromEntries(Array.from(this.innerValue, (item, i) =>
            [isObject(item) ? item[this.ElSelectProps.valueKey] : item, i]))
          let matchCount = 0
          let optionsCount = 0

          const callback = (value, key) => {
            if (valueToIndex[isObject(value) ? key : value] !== undefined) {
              matchCount++
            }
            optionsCount++
          }

          if (this.isGrouped) {
            this.optionGroupPropsList.forEach(({ optionPropsList }) => {
              optionPropsList?.forEach(({ value, key }) => callback(value, key))
            })
          } else {
            this.optionPropsList.forEach(({ value, key }) => callback(value, key))
          }
          this.indeterminate = matchCount > 0 && matchCount < optionsCount
          this.allSelected = matchCount > 0 && matchCount === optionsCount
        } else {
          this.indeterminate = false
          this.allSelected = false
        }
      }
    },
    // 下拉框隐藏时，如果没有选中，el-select 会清空搜索关键字，此时需要恢复 options
    onVisibleChange(isVisible) {
      if (!isVisible) {
        this.updateLabel()
        if (isEmpty(this.innerValue) && this.previousQuery) {
          // 加延迟的原因：在下拉框隐藏动画结束后再恢复
          setTimeout(() => {
            this.remoteMethod()
          }, 100)
        }
      }
    },
    getKey(v) {
      if (isObject(v) && !this.Props.value && !this.ElSelectProps.valueKey) {
        throw new Error('Either props.value or valueKey should be specified when option value is of type object.')
      }
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
