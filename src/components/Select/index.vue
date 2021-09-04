<template>
  <el-select
    v-model="value__"
    v-bind="ElSelectProps"
    @change="onChange"
    v-on="$listeners"
    ref="elSelect"
  >
    <template v-if="grouped">
      <el-option-group
        v-for="(groupOption,groupIndex) of options__"
        :key="uuidv1()"
        :label="getGroupLabel(groupOption,groupIndex)"
        :disabled="isGroupDisabled(groupOption,groupIndex)"
      >
        <el-option
          v-for="(v,i) of getGroupOptions(groupOption,groupIndex)"
          :key="uuidv1()"
          :value="getValue(v,i)"
          :label="getLabel(v,i)"
          :disabled="isDisabled(v,i)"
          @click.native="onOptionClick(groupOption,groupIndex)"
        >
          <slot v-if="$scopedSlots.default" :option="v" :index="i"/>
          <template v-else>
            <el-tooltip
              :disabled="!Ellipsis"
              effect="dark"
              placement="right"
              :content="getLabel(v,i)"
            >
              <span class="label-left">{{ getLabel(v, i) }}</span>
            </el-tooltip>
            <span class="label-right">{{ getLabelRight(v, i) }}</span>
          </template>
        </el-option>
      </el-option-group>
    </template>

    <template v-else>
      <el-checkbox
        v-model="allSelected"
        @change='selectAll'
        :indeterminate="indeterminate"
        class="px-20px py-10px"
        v-if="isMultiple"
      >
        全选
      </el-checkbox>
      <el-option
        v-for="(v,i) of options__"
        :key="uuidv1()"
        :value="getValue(v,i)"
        :label="getLabel(v,i)"
        :disabled="isDisabled(v,i)"
        @click.native="onOptionClick(v,i)"
      >
        <slot v-if="$scopedSlots.default" :option="v" :index="i"/>
        <template v-else>
          <el-tooltip
            :disabled="!Ellipsis"
            effect="dark"
            placement="right"
            :content="getLabel(v,i)"
          >
            <span class="label-left">{{ getLabel(v, i) }}</span>
          </el-tooltip>
          <span class="label-right">{{ getLabelRight(v, i) }}</span>
        </template>
      </el-option>
    </template>

    <template v-for="(v,k) in ScopedSlots" v-slot:[k]>
      <slot :name="k"/>
    </template>
  </el-select>
</template>

<script>
import Vue from 'vue'
import { typeOf, isEmpty, notEmpty, getFinalProp, getGlobalAttrs } from 'kayran'
import globalConfig from './config'
import { v1 as uuidv1 } from 'uuid'
import emitter from 'element-ui/src/mixins/emitter'
import { cloneDeep } from 'lodash-es'

export default {
  name: 'KiSelect',
  mixins: [emitter],
  inject: {
    elForm: {
      default: {}
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {},
    label: {},
    options: {
      validator: value => ['null', 'array'].includes(typeOf(value)),
    },
    props: {},
    ellipsis: {},
    search: {},
    searchImmediately: {},
  },
  computed: {
    grouped () {
      return notEmpty(this.Props.groupOptions)
    },
    itemTypeIsObject () {
      return typeof this.options__?.[0] === 'object'
    },
    valueComesFromObject () {
      if (isEmpty(this.Props.value) || this.valueType === 'function') {
        return false
      } else {
        return this.itemTypeIsObject
      }
    },
    ScopedSlots () {
      let result = {}
      for (let k in this.$scopedSlots) {
        if (k !== 'default') {
          result[k] = this.$scopedSlots[k]
        }
      }
      return result
    },
    ElSelectProps () {
      let globalAttrs = {}
      Object.keys(globalConfig).filter(v => !Object.keys(this.$props).includes(v)).map(v => {
        globalAttrs[v] = globalConfig[v]
      })

      const remote = Boolean(this.Search)
      const placeholder = remote ? '搜索' : '请选择'

      return getFinalProp([
        this.$attrs,
        getGlobalAttrs(globalConfig, this.$props),
        {
          clearable: true,
          filterable: true,
          remote,
          reserveKeyword: true,
          remoteMethod: this.remoteMethod,
          valueKey: this.valueComesFromObject ? this.Props.value : undefined,
          loading: this.loading,
          placeholder,
        }
      ], {
        type: 'object'
      })
    },
    Ellipsis () {
      const result = getFinalProp([
        [true, ''].includes(this.ellipsis) ? true : this.ellipsis,
        globalConfig.ellipsis,
        false
      ], {
        type: 'boolean'
      })
      if (result) {
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
    valueType () {
      return this.validateProps('value')
    },
    labelType () {
      return this.validateProps('label')
    },
    labelRightType () {
      return this.validateProps('labelRight')
    },
    disabledType () {
      return this.validateProps('disabled')
    },
    groupLabelType () {
      return this.validateProps('groupLabel')
    },
    groupDisabledType () {
      return this.validateProps('groupDisabled')
    },
    groupOptionsType () {
      return this.validateProps('groupOptions')
    },
    Props () {
      return getFinalProp([
        this.props,
        globalConfig.props,
        {
          disabled: 'disabled',
          groupDisabled: 'disabled',
        }
      ], {
        type: 'object'
      })
    },
    Search () {
      return getFinalProp([this.search, globalConfig.search], {
        type: 'function'
      })
    },
    SearchImmediately () {
      return getFinalProp([
        [true, ''].includes(this.searchImmediately) ? true : this.searchImmediately,
        globalConfig.searchImmediately,
        true
      ], {
        type: 'boolean'
      })
    },
    isMultiple () {
      return [true, ''].includes(this.ElSelectProps.multiple)
    }
  },
  data () {
    return {
      value__: this.value,
      initialValue: undefined,
      popper: null,
      //showKiSelect: false
      unwatchOptions: null,
      loading: undefined,
      defaultSearchResult: null,
      options__: [],
      optionsSyncing: false,
      allSelected: false,
      indeterminate: false,
      valueInitializedWhenMultiple: false,
    }
  },
  watch: {
    // 没有使用v-model/:value时 resetFields不会触发
    value: {
      immediate: true,
      handler (n, o) {
        this.value__ = n
        // 外部设值时，同步全选按钮状态
        this.syncSelectAllBtn(n)
      }
    },
    value__: {
      handler (n, o) {
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
          if (this.defaultSearchResult) {
            this.options__ = this.defaultSearchResult
          } else {
            this.remoteMethod()
          }
        }
        this.onBlur()
      }
    },
    label: {
      immediate: true,
      handler (n, o) {
        // 没有匹配到选项时，显示label
        this.initLabel()
      }
    },
    options: {
      immediate: true,
      handler (n, o) {
        if (this.optionsSyncing) {
          this.optionsSyncing = false
        } else {
          this.options__ = n || []
        }
      }
    },
    // 在组件内部维护一份options__的目的：search时可以不绑定options。
    options__: {
      handler (n, o) {
        this.optionsSyncing = true
        this.$emit('update:options', n)
      }
    },
  },
  created () {
    if (this.SearchImmediately) {
      this.remoteMethod()
    }
  },
  mounted () {
    this.initialValue = cloneDeep(this.value)
    this.dispatch('ElForm', 'el.form.addField', [this])
  },
  methods: {
    initLabel () {
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
    selectAll () {
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
    // el-from重置触发
    resetField () {
      const initialValue = cloneDeep(this.initialValue)
      this.value__ = initialValue
      this.onChange(initialValue)
    },
    validate (trigger, callback) {
      callback()
    },
    clearValidate () {},
    getRules () {
      return []
    },
    getFilteredRule () {
      return []
    },
    validateProps (propKey) {
      const result = typeOf(this.Props[propKey])
      if (['undefined', 'boolean', 'symbol', 'string', 'number', 'null', 'function'].includes(result)) {
        return result
      } else {
        throw Error(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}props.${propKey}的类型仅能为string/number/symbol/function`)
      }
    },
    onOptionClick (v, i) {
      if (v?.[this.Props.disabled] !== true) {
        this.$emit('update:index', i)
      }
    },
    uuidv1,
    remoteMethod (e) {
      if (!this.Search) {
        return
      }
      this.loading = true
      const result = this.Search(e)
      if (result instanceof Promise) {
        result.then(res => {
          this.options__ = res
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.options__ = result
        this.loading = false
      }
    },
    syncSelectAllBtn (value) {
      if (this.isMultiple && !this.grouped) {
        let valueLen = value ? value.length : 0
        const optionsLen = this.options__.length
        this.allSelected = valueLen > 0 && valueLen === optionsLen
        this.indeterminate = valueLen > 0 && valueLen < optionsLen
      }
    },
    onChange (value) {
      this.syncSelectAllBtn(value)
      this.$nextTick(() => {
        this.$emit('update:label', this.$refs.elSelect.selectedLabel)
      })
      this.$emit('change', value)
    },
    onBlur () {
      //this.initLabel()
      // fix: 用于el表单中 且校验触发方式为blur时 没有生效
      if (this.$parent?.$options?._componentTag === ('el-form-item') && this.$parent.rules?.trigger === 'blur') {
        this.$parent.$emit('el.form.blur')
      }
    },
    getValue (v, i) {
      let result = v
      if (this.valueType === 'function') {
        result = this.Props.value(v, i)
      } else if (this.itemTypeIsObject) {
        if (notEmpty(this.Props.value)) {
          result = v?.[this.Props.value]
        } else if (isEmpty(this.ElSelectProps.valueKey || this.ElSelectProps['value-key'])) {
          throw Error(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}绑定值为object类型时，必须按el-select的要求指定value-key`)
        }
      }
      return result
    },
    getLabel (v, i) {
      let result = v
      if (this.labelType === 'function') {
        result = this.Props.label(v, i)
      } else if (this.itemTypeIsObject) {
        if (notEmpty(this.Props.label)) {
          result = v?.[this.Props.label]
        } else {
          result = JSON.stringify(v)
        }
      }
      return isEmpty(result) ? '' : String(result)
    },
    getLabelRight (v, i) {
      let result
      if (this.labelRightType === 'function') {
        result = this.Props.labelRight(v, i)
      } else if (this.itemTypeIsObject) {
        if (notEmpty(this.Props.labelRight)) {
          result = v?.[this.Props.labelRight]
        }
      }
      return isEmpty(result) ? '' : String(result)
    },
    getGroupLabel (v, i) {
      let result = v
      if (this.groupLabelType === 'function') {
        result = this.Props.groupLabel(v, i)
      } else if (this.itemTypeIsObject) {
        if (notEmpty(this.Props.groupLabel)) {
          result = v?.[this.Props.groupLabel]
        } else {
          result = JSON.stringify(v)
        }
      }
      return isEmpty(result) ? '' : String(result)
    },
    isDisabled (v, i) {
      let result = false
      if (this.disabledType === 'function') {
        result = this.Props.disabled(v, i)
      } else if (this.itemTypeIsObject && notEmpty(this.Props.disabled)) {
        result = v?.[this.Props.disabled]
      }
      return Boolean(result)
    },
    isGroupDisabled (v, i) {
      let result = false
      if (this.groupDisabledType === 'function') {
        result = this.Props.groupDisabled(v, i)
      } else if (this.itemTypeIsObject && notEmpty(this.Props.groupDisabled)) {
        result = v?.[this.Props.groupDisabled]
      }
      return Boolean(result)
    },
    getGroupOptions (v, i) {
      let result
      if (this.groupOptionsType === 'function') {
        result = this.Props.groupOptions(v, i)
      } else if (this.itemTypeIsObject) {
        result = v?.[this.Props.groupOptions]
      }
      if (isEmpty(result)) {
        return []
      } else if (!Array.isArray(result)) {
        console.warn(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}groupOptions的值类型仅能为any[]`)
        return []
      }
      return result
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

  & > .label-left {
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    line-height: normal;
  }

  & > .label-right {
    flex-shrink: 0;
    color: #8492a6;
    font-size: 13px;
    margin-left: 1rem;
    font-weight: normal; // 默认选中时加粗
  }
}
</style>
