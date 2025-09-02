<script>
import { cloneDeep } from 'lodash-es'
import Sortable from 'sortablejs'
import { isVue3 } from 'vue-demi'
import { conclude, resolveConfig } from 'vue-global-config'
import defaultLocale from '../../locale/en'
import { getListeners, isGlobalSlot, isObject, notEmpty, unwrap } from '../../utils'

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

const boolAttrs = [
  'disabled',
  'multiple',
  'clearable',
  'collapseTags',
  'collapseTagsTooltip',
  'filterable',
  'allowCreate',
  'remote',
  'remoteShowSuffix',
  'loading',
  'reserveKeyword',
  'defaultFirstOption',
  'teleported',
  'persistent',
  'automaticDropdown',
  'fitInputWidth',
  'validateEvent',
  'popperAppendToBody', // vue 2 only
]

export default {
  name,
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
    label: [String, Array],
    options: Array,
    props: {},
    search: {},
    locale: {},
    ...Object.fromEntries(Array.from(boolProps, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
    ...Object.fromEntries(Array.from(boolAttrs, v => [v, {
      type: Boolean,
      default: undefined,
    }])),
  },
  emits: [
    model.event,
    'change', // 会导致 Vue 3 不再透传 el-select 的 change 事件
    'update:options',
    'update:label',
  ],
  expose: ['remoteMethod'],
  data() {
    return {
      isVue3,
      innerValue: this[model.prop],
      initialValue: undefined,
      innerLoading: undefined,
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
      }) && this.multiple
      && this.innerOptions.length > 1
      && (!this.ElSelectProps.multipleLimit || this.ElSelectProps.multipleLimit >= this.innerOptions.length)
    },
    ElSelectProps() {
      const remote = Boolean(this.Search)

      return conclude([
        Object.fromEntries(
          Array.from(boolAttrs, boolAttr => [boolAttr, conclude([this[boolAttr], globalProps[boolAttr]])]).filter(
            ([, item]) => item !== undefined,
          ),
        ),
        this.$attrs,
        globalAttrs,
        isVue3 ? globalListeners : undefined,
        {
          ref: 'elSelectRef',
          clearable: true,
          filterable: true,
          remote,
          reserveKeyword: true,
          remoteMethod: remote ? this.remoteMethod : undefined,
          valueKey: (this.Props.value && typeof this.Props.value === 'string') ? this.Props.value : undefined,
          loading: this.innerLoading,
        },
      ], {
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
    isGrouped() {
      return notEmpty(this.Props.groupOptions)
    },
    canSort() {
      return !this.ElSelectProps.disabled && this.multiple && this.innerValue?.length > 1
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
      },
    },
    innerValue: {
      handler(newInnerValue) {
        this.$emit(model.event, newInnerValue)
        if (isVue3) {
          this.$emit('change', newInnerValue)
        }
        this.updateLabel()
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
      }
      else {
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
      this.innerLoading = true
      this.previousQuery = query
      const res = this.Search(query)
      if (res instanceof Promise) {
        res.then((res) => {
          this.setInnerOptions(res)
        }).finally(() => {
          this.innerLoading = false
        })
      }
      else {
        this.setInnerOptions(res)
        this.innerLoading = false
      }
    },
    // value 没匹配上选项时，el-select 默认显示 value，改为显示 label
    updateLabel() {
      this.$nextTick(() => {
        if (this.multiple) {
          if (isVue3) {
            this.$emit('update:label', this.$refs[this.ElSelectProps.ref].selectedLabel)
          }
          else {
            const label = []
            this.$refs[this.ElSelectProps.ref].selected?.forEach((v) => {
              if (!v.currentLabel) {
                v.currentLabel = this.getLabel(v.value)
              }
              label.push(v.currentLabel)
            })
            this.$emit('update:label', label)
          }
        }
        else {
          // 仅限 Vue2 的原因 —— [Vue warn] Write operation failed: computed value is readonly
          if (!isVue3 && !this.$refs[this.ElSelectProps.ref].selectedLabel) {
            this.$refs[this.ElSelectProps.ref].selectedLabel = this.getLabel(this.innerValue)
          }
          this.$emit('update:label', this.$refs[this.ElSelectProps.ref].selectedLabel)
        }
      })
    },
    selectAll(checked) {
      const innerValue = cloneDeep(this.innerValue) || []
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
        }
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
      }
      else {
        this.optionPropsList.forEach(({ disabled, value, key }) => callback(disabled, value, key))
      }

      this.innerValue = innerValue.filter(v => v !== undefined)
      if (!isVue3) {
        this.$emit('change', this.innerValue)
      }
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
          }
          else {
            this.optionPropsList.forEach(({ value, key }) => callback(value, key))
          }
          this.indeterminate = matchCount > 0 && matchCount < optionsCount
          this.allSelected = matchCount > 0 && matchCount === optionsCount
        }
        else {
          this.indeterminate = false
          this.allSelected = false
        }
      }
    },
    onVisibleChange(isVisible) {
      if (!isVue3) {
        // ElementUI 不会像 ElementPlus 一样在聚焦时调用 remoteMethod
        if (isVisible) {
          this.remoteMethod()
        }
        // ElementUI 点击已选中的选项然后失焦，selectedLabel 会丢失
        else {
          this.updateLabel()
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
      }
      else if (this.canSort) {
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
                if (!isVue3) {
                  this.$emit('change', this.innerValue)
                }
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
          style="padding: 0 20px; display: flex; align-items: center;"
          :style="isVue3 || { paddingTop: '10px', paddingBottom: '10px' }"
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
          style="padding: 0 20px; display: flex; align-items: center;"
          :style="isVue3 || { paddingTop: '10px', paddingBottom: '10px' }"
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

    <template
      v-if="Slots.prefix"
      #prefix
    >
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

.fa-select.canSort .el-select__tags > span {
  // see: https://github.com/SortableJS/Sortable/issues/1853
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;

  & > .el-tag {
    cursor: grab;
  }
}
</style>
