<script>
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import { cloneDeep } from 'lodash-es'
import Sortable from 'sortablejs'
import { getListeners, isEmpty, isGlobalSlot, isObject, notEmpty, unwrap } from '../../utils'
import defaultLocale from '../../locale/en'

const name = 'FaSelect'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalSlots = {}

const model = {
  prop: isVue3 ? 'modelValue' : 'value',
  event: isVue3 ? 'update:modelValue' : 'input',
}

const boolProps = [
  'searchImmediately',
  'showSelectAllCheckbox',
]

export default {
  name,
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
    label: [String, Array],
    options: Array,
    props: {},
    search: {},
    locale: {},
    ...Object.fromEntries(Array.from(boolProps, boolProp => [boolProp, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: [model.event, 'update:options', 'update:label'],
  expose: ['remoteMethod'],
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
      sortablejs: null,
    }
  },
  computed: {
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
    ShowSelectAllCheckbox() {
      return conclude([
        this.showSelectAllCheckbox,
        globalProps.showSelectAllCheckbox,
        true,
      ], {
        type: Boolean,
      }) && this.isMultiple
      && this.innerOptions.length > 1
      && (!this.ElSelectProps.multipleLimit || this.ElSelectProps.multipleLimit >= this.innerOptions.length)
    },
    ElSelectProps() {
      const remote = Boolean(this.Search)

      return conclude([this.$attrs, globalAttrs, isVue3 ? globalListeners : undefined, {
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
    canSort() {
      return !this.ElSelectProps.disabled && this.isMultiple && this.innerValue?.length > 1
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
    canSort: {
      immediate: true,
      handler() {
        this.sort()
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
    isGlobalSlot,
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
    remoteMethod(query) {
      if (!this.Search) {
        return
      }
      this.loading = true
      this.previousQuery = query
      const res = this.Search(query)
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
        // 全不选时，选项被选中了，取消选中它
        } else if (i !== undefined) {
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
      this.$emit('change', this.innerValue)
    },
    // 更新全选按钮的勾选状态
    updateSelectAllStatus() {
      if (this.ShowSelectAllCheckbox) {
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
    sort() {
      if (this.sortablejs) {
        this.sortablejs.option('disabled', !this.canSort)
      } else if (this.canSort) {
        this.$nextTick(() => {
          let elSelectTagsWrapper = this.$refs.elSelectRef.$el.firstElementChild.firstElementChild
          if (isVue3) {
            elSelectTagsWrapper = elSelectTagsWrapper.firstElementChild
          }
          this.sortablejs = Sortable.create(elSelectTagsWrapper, {
            animation: 500,
            filter: '.el-tag__close',
            onStart: () => {
              setTimeout(() => {
                document.documentElement.classList.toggle('fa-select__cursor-grabbing', true)
              }, 50)
            },
            onEnd: ({ newIndex, oldIndex }) => {
              if (newIndex !== oldIndex) {
                this.innerValue.splice(newIndex, 0, this.innerValue.splice(oldIndex, 1)[0])
                this.$emit('change', this.innerValue)
              }
              document.documentElement.classList.toggle('fa-select__cursor-grabbing', false)
            },
          })
        })
      }
    },
  },
}
</script>

<template>
  <el-select
    v-bind="ElSelectProps"
    v-model="innerValue"
    class="fa-select"
    :class="{ canSort }"
    v-on="Listeners"
    @visible-change="onVisibleChange"
  >
    <template v-if="isGrouped">
      <component
        :is="Slots['option-prepend']()"
        v-if="isGlobalSlot(Slots['option-prepend'])"
      />
      <slot
        v-else
        name="option-prepend"
      >
        <el-checkbox
          v-if="ShowSelectAllCheckbox"
          v-model="allSelected"
          :indeterminate="indeterminate"
          style="padding: 10px 20px;"
          @change="selectAll"
        >
          {{ Locale.selectAll }}
        </el-checkbox>
      </slot>
      <el-option-group
        v-for="(group, groupIndex) of innerOptions"
        :key="optionGroupPropsList[groupIndex].key"
        :label="optionGroupPropsList[groupIndex].label"
        :disabled="optionGroupPropsList[groupIndex].disabled"
      >
        <component
          :is="Slots['group-prepend']()"
          v-if="isGlobalSlot(Slots['group-prepend'])"
        />
        <slot
          v-else
          name="group-prepend"
        />
        <el-option
          v-for="(option, optionIndex) of optionGroupPropsList[groupIndex].options"
          :key="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].key"
          :label="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].label"
          :value="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].value"
          :disabled="optionGroupPropsList[groupIndex].optionPropsList[optionIndex].disabled"
        >
          <component
            :is="Slots.default({ option, index: optionIndex })"
            v-if="isGlobalSlot(Slots.default)"
          />
          <slot
            v-else
            :option="option"
            :index="optionIndex"
          >
            {{ optionGroupPropsList[groupIndex].optionPropsList[optionIndex].label }}
          </slot>
        </el-option>
        <component
          :is="Slots['group-append']()"
          v-if="isGlobalSlot(Slots['group-append'])"
        />
        <slot
          v-else
          name="group-append"
        />
      </el-option-group>
      <component
        :is="Slots['option-append']()"
        v-if="isGlobalSlot(Slots['option-append'])"
      />
      <slot
        v-else
        name="option-append"
      />
    </template>

    <template v-else>
      <component
        :is="Slots['option-prepend']()"
        v-if="isGlobalSlot(Slots['option-prepend'])"
      />
      <slot
        v-else
        name="option-prepend"
      >
        <el-checkbox
          v-if="ShowSelectAllCheckbox"
          v-model="allSelected"
          :indeterminate="indeterminate"
          style="padding: 10px 20px;"
          @change="selectAll"
        >
          {{ Locale.selectAll }}
        </el-checkbox>
      </slot>
      <el-option
        v-for="(v, i) of innerOptions"
        :key="optionPropsList[i].key"
        :label="optionPropsList[i].label"
        :value="optionPropsList[i].value"
        :disabled="optionPropsList[i].disabled"
      >
        <component
          :is="Slots.default({ option: v, index: i })"
          v-if="isGlobalSlot(Slots.default)"
        />
        <slot
          v-else
          :option="v"
          :index="i"
        >
          {{ optionPropsList[i].label }}
        </slot>
      </el-option>
      <component
        :is="Slots['option-append']()"
        v-if="isGlobalSlot(Slots['option-append'])"
      />
      <slot
        v-else
        name="option-append"
      />
    </template>

    <template #prefix>
      <component
        :is="Slots.prefix()"
        v-if="isGlobalSlot(Slots.prefix)"
      />
      <slot
        v-else
        name="prefix"
      />
    </template>

    <template #empty>
      <component
        :is="Slots.empty()"
        v-if="isGlobalSlot(Slots.empty)"
      />
      <slot
        v-else
        name="empty"
      />
    </template>
  </el-select>
</template>

<style lang="scss">
.fa-select__cursor-grabbing,
.fa-select__cursor-grabbing *,
.fa-select__cursor-grabbing .fa-select.canSort .el-tag {
  cursor: grabbing !important;
}

.fa-select.canSort .el-tag {
  cursor: grab;
}
</style>
