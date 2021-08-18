<template>
  <el-select
    v-model="value__"
    v-bind="elSelectProps"
    @change="onChange"
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
import { typeOf, isEmpty, notEmpty } from 'kayran'
import globalProps from './config'
import { getFinalProp } from '../../utils'
import { v1 as uuidv1 } from 'uuid'
import emitter from 'element-ui/src/mixins/emitter'
import { cloneDeep } from 'lodash-es'

export default {
  name: 'DropDown',
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
    props: Object,
    ellipsis: {
      validator: value => value === '' || ['boolean'].includes(typeOf(value)),
    },
    search: Function,
    searchImmediately: {
      validator: value => value === '' || ['boolean'].includes(typeOf(value)),
    }
  },
  computed: {
    grouped () {
      return notEmpty(this.Props.groupOptions)
    },
    itemTypeIsObject () {
      return typeof this.options__?.[0] === 'object'
    },
    valueComesFromObject () {
      if (isEmpty(this.Props.key) || this.keyType === 'function') {
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
    elSelectProps () {
      let globalAttrs = {}
      Object.keys(globalProps).filter(v => !Object.keys(this.$props).includes(v)).map(v => {
        globalAttrs[v] = globalProps[v]
      })

      const remote = Boolean(this.Search)
      const placeholder = remote ? '搜索' : '请选择'

      return getFinalProp(this.$attrs, globalAttrs, {
        clearable: true,
        filterable: true,
        remote,
        'reserve-keyword': true,
        'remote-method': this.remoteMethod,
        'value-key': this.valueComesFromObject ? this.Props.key : undefined,
        loading: this.loading,
        placeholder,
      })
    },
    Ellipsis () {
      const result = getFinalProp(this.ellipsis, globalProps.ellipsis, false)
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
    keyType () {
      return this.validateProps('key')
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
      return getFinalProp(this.props, globalProps.props, {
        disabled: 'disabled',
        groupDisabled: 'disabled',
      })
    },
    Search () {
      return getFinalProp(this.search, globalProps.search,)
    },
    SearchImmediately () {
      return getFinalProp(this.searchImmediately, globalProps.searchImmediately, true)
    }
  },
  data () {
    return {
      value__: this.value,
      initialValue: undefined,
      popper: null,
      //showDropdown: false
      unwatchOptions: null,
      loading: false,
      defaultSearchResult: null,
      options__: [],
      optionsSyncing: false,
    }
  },
  watch: {
    // 没有使用v-model/:value时 resetFields不会触发
    value: {
      immediate: true,
      handler (n, o) {
        this.value__ = n
      }
    },
    value__: {
      handler (n, o) {
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
    }
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
      if (!v[this.Props.disabled]) {
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
    onChange (value) {
      this.$nextTick(() => {
        this.$emit('update:label', this.$refs.elSelect.selectedLabel)
      })
      this.$emit('change', value)
    },
    onBlur () {
      // fix: 用于el表单中 且校验触发方式为blur时 没有生效
      if (this.$parent?.$options?._componentTag === ('el-form-item') && this.$parent.rules?.trigger === 'blur') {
        this.$parent.$emit('el.form.blur')
      }
    },
    getValue (v, i) {
      let result = v
      if (this.keyType === 'function') {
        result = this.Props.key(v, i)
      } else if (this.itemTypeIsObject) {
        if (notEmpty(this.Props.key)) {
          result = v[this.Props.key]
        } else if (isEmpty(this.elSelectProps.valueKey || this.elSelectProps['value-key'])) {
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
          result = v[this.Props.label]
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
          result = v[this.Props.labelRight]
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
          result = v[this.Props.groupLabel]
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
        result = v[this.Props.disabled]
      }
      return Boolean(result)
    },
    isGroupDisabled (v, i) {
      let result = false
      if (this.groupDisabledType === 'function') {
        result = this.Props.groupDisabled(v, i)
      } else if (this.itemTypeIsObject && notEmpty(this.Props.groupDisabled)) {
        result = v[this.Props.groupDisabled]
      }
      return Boolean(result)
    },
    getGroupOptions (v, i) {
      let result
      if (this.groupOptionsType === 'function') {
        result = this.Props.groupOptions(v, i)
      } else if (this.itemTypeIsObject) {
        result = v[this.Props.groupOptions]
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
      this.showDropdown = show
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
