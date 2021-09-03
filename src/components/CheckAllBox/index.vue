<template>
  <div>
    <el-checkbox
      v-model="allChecked"
      :disabled="Disabled"
      v-bind="ElCheckAllBoxProps"
      @change="checkAllChange"
    >全选
    </el-checkbox>
    <el-checkbox-group
      v-model="value__"
      :disabled="Disabled"
      v-bind="ElCheckboxGroupProps"
      @change="checkChange"
    >
      <el-checkbox
        v-for="(v,i) of options"
        :label="getValue(v,i)"
        :key="uuidv1()"
        v-bind="ElCheckBoxProps"
        :disabled="isDisabled(v,i)"
      >
        {{ getLabel(v, i) }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import { v1 as uuidv1 } from 'uuid'
import { isEmpty, notEmpty, typeOf, getFinalProp, getGlobalAttrs } from 'kayran'
import globalConfig from './config'

export default {
  name: 'KiCheckAllBox',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      validator: value => ['array', 'null'].includes(typeOf(value))
    },
    options: {
      type: Array,
      default: () => ([])
    },
    elCheckboxGroupProps: {},
    props: {},
    disabled: {
      type: Boolean,
      default: undefined
    },
    border: {
      type: Boolean,
      default: undefined
    },
    checked: {
      type: Boolean,
      default: undefined
    },
    indeterminate: {
      type: Boolean,
      default: undefined
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (n, o) {
        this.value__ = n || []
        this.checkChange(n)
      }
    },
    value__: {
      handler (n, o) {
        this.$emit('change', n)
        //fix: 用于el表单中 且校验触发方式为blur时 没有生效
        if (this.$parent?.$options?._componentTag === ('el-form-item') && this.$parent.rules?.trigger === 'blur') {
          this.$parent.$emit('el.form.blur')
        }
      }
    }
  },
  computed: {
    Disabled () {
      return getFinalProp([
        this.disabled,
        globalConfig.disabled,
        false
      ], {
        type: 'boolean'
      })
    },
    ElCheckBoxProps () {
      return getFinalProp([
        this.$attrs, getGlobalAttrs(globalConfig, this.$props)
      ])
    },
    ElCheckAllBoxProps () {
      return {
        ...this.ElCheckBoxProps,
        indeterminate: this.isIndeterminate,
      }
    },
    ElCheckboxGroupProps () {
      return getFinalProp([
        this.elCheckboxGroupProps, globalConfig.elCheckboxGroupProps
      ], {
        type: 'object'
      })
    },
    itemTypeIsObject () {
      return typeof this.options?.[0] === 'object'
    },
    valueType () {
      return this.validateProps('value')
    },
    labelType () {
      return this.validateProps('label')
    },
    disabledType () {
      return this.validateProps('disabled')
    },
    Props () {
      return getFinalProp([
        this.props, globalConfig.props, {
          disabled: 'disabled',
        }
      ], {
        type: 'object'
      })
    }
  },
  data () {
    return {
      value__: [],
      isIndeterminate: false,
      allChecked: false
    }
  },
  methods: {
    uuidv1,
    checkAllChange (checked) {
      this.value__ = checked ?
        Array.from(this.options, (v, i) => this.getValue(v, i)) :
        []
      this.isIndeterminate = false
    },
    checkChange (value) {
      let checkedCount = value ? value.length : 0
      this.allChecked = checkedCount > 0 && checkedCount === this.options.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.options.length
    },
    validateProps (propKey) {
      const result = typeOf(this.Props[propKey])
      if (['undefined', 'boolean', 'symbol', 'string', 'number', 'null', 'function'].includes(result)) {
        return result
      } else {
        throw Error(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}props.${propKey}的类型仅能为string/number/symbol/function`)
      }
    },
    getValue (v, i) {
      let result = v
      if (this.valueType === 'function') {
        result = this.Props.value(v, i)
      } else if (this.itemTypeIsObject) {
        if (notEmpty(this.Props.value)) {
          result = v?.[this.Props.value]
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
    isDisabled (v, i) {
      let result = false
      if (this.disabledType === 'function') {
        result = this.Props.disabled(v, i)
      } else if (this.itemTypeIsObject && notEmpty(this.Props.disabled)) {
        result = v?.[this.Props.disabled]
      }
      return Boolean(result)
    },
  }
}
</script>
