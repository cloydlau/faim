<template>
  <div>
    <el-checkbox v-model="allChecked" v-bind="ElCheckAllBoxProps"
      @change="checkAllChange">全选
    </el-checkbox>
    <el-checkbox-group v-model="value__" v-bind="ElCheckboxGroupProps"
      @change="checkChange">
      <el-checkbox v-for="(v, i) of options" :label="getValue(v, i)" :key="i"
        v-bind="ElCheckBoxProps" :disabled="isDisabled(v, i)">
        {{ getLabel(v, i) }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import { isEmpty, notEmpty, typeOf } from 'kayran'
import { conclude } from 'vue-global-config'
import { globalProps, globalAttrs } from './index'

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
  },
  watch: {
    value: {
      immediate: true,
      handler(n, o) {
        this.value__ = n || []
        this.checkChange(n)
      }
    },
    value__: {
      handler(n, o) {
        this.$emit('change', n)
      }
    }
  },
  computed: {
    ElCheckBoxProps() {
      return conclude([this.$attrs, globalAttrs])
    },
    ElCheckAllBoxProps() {
      return {
        ...this.ElCheckBoxProps,
        indeterminate: this.isIndeterminate,
      }
    },
    ElCheckboxGroupProps() {
      return conclude([
        this.elCheckboxGroupProps, globalProps.elCheckboxGroupProps
      ], {
        type: Object
      })
    },
    itemTypeIsObject() {
      return typeof this.options?.[0] === 'object'
    },
    valueType() {
      return this.validateProps('value')
    },
    labelType() {
      return this.validateProps('label')
    },
    disabledType() {
      return this.validateProps('disabled')
    },
    Props() {
      return conclude([
        this.props, globalProps.props, {
          disabled: 'disabled',
        }
      ], {
        type: Object
      })
    }
  },
  data() {
    return {
      value__: [],
      isIndeterminate: false,
      allChecked: false
    }
  },
  methods: {
    checkAllChange(checked) {
      this.value__ = checked ?
        Array.from(this.options, (v, i) => this.getValue(v, i)) :
        []
      this.isIndeterminate = false
    },
    checkChange(value) {
      let checkedCount = value ? value.length : 0
      this.allChecked = checkedCount > 0 && checkedCount === this.options.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.options.length
    },
    validateProps(propKey) {
      conclude([this.Props[propKey]], {
        type: [Boolean, Symbol, String, Number, Function],
      })
      return typeOf(this.Props[propKey])
    },
    getValue(v, i) {
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
    getLabel(v, i) {
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
    isDisabled(v, i) {
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
