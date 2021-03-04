<template>
  <div>
    <el-checkbox v-model="allChecked"
                 @change="checkAllChange"
                 v-bind="{
                   indeterminate: isIndeterminate,
                   ...$attrs,
                 }"
    >全选
    </el-checkbox>
    <div style="margin: 15px 0;"/>
    <el-checkbox-group v-model="selfValue" @change="checkChange" :disabled="disabled">
      <el-checkbox v-for="(v,k,i) in options"
                   :label="v"
                   :key="i"
                   v-bind="$attrs"
      >{{ k }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
export default {
  name: 'CheckAllBox',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      validator: value => ['Array', 'Null'].includes(({}).toString.call(value).slice(8, -1)),
      default: () => [],
      required: true
    },
    options: {
      type: Object,
      required: true,
      default: () => {}
    },
    disabled: Boolean,
  },
  watch: {
    value: {
      immediate: true,
      handler (newVal, oldVal) {
        this.selfValue = newVal || []
        this.checkChange()
      }
    },
    selfValue: {
      handler (newVal, oldVal) {
        this.$emit('change', newVal)
        //fix: 用于el表单中 且校验触发方式为blur时 没有生效
        if (this.$parent?.$options?._componentTag === ('el-form-item') && this.$parent.rules?.trigger === 'blur') {
          this.$parent.$emit('el.form.blur')
        }
      }
    }
  },
  computed: {
    props () {
      return {
        indeterminate: this.isIndeterminate,
        ...this.$attrs,
      }
    },
    optionsLen () {
      return Object.keys(this.options).length
    }
  },
  data () {
    return {
      selfValue: [],
      isIndeterminate: false,
      allChecked: false
    }
  },
  methods: {
    checkAllChange (checked) {
      this.selfValue = checked ? Object.values(this.options) : []
      this.isIndeterminate = false
    },
    checkChange (value) {
      let checkedCount = this.selfValue.length
      this.allChecked = checkedCount === this.optionsLen
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.optionsLen
    }
  }
}
</script>
