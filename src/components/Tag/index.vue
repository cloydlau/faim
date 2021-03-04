<template>
  <el-tag
    v-if="text"
    v-bind="$attrs"
    :type="type"
    @click="$emit('click')"
    @close="$emit('close')"
  >
    {{ text }}
  </el-tag>
</template>

<script>
import { typeOf } from 'kayran'

export default {
  name: 'Tag',
  props: {
    value: {},
    options: {
      validator: value => ['string', 'array'].includes(typeOf(value)),
      required: true
    }
  },
  data () {
    return {
      type: undefined,
      whether: [
        { value: [0, '0'], text: '否', type: 'info' },
        { value: [1, '1'], text: '是', type: '' }
      ],
      being: [
        { value: [0, '0'], text: '无', type: 'info' },
        { value: [1, '1'], text: '有', type: '' }
      ],
      status: [
        { value: [0, '0'], text: '停用', type: 'info' },
        { value: [1, '1'], text: '启用', type: 'success' }
      ],
      required: [
        { value: [0, '0'], text: '不需要', type: 'info' },
        { value: [1, '1'], text: '需要', type: '' }
      ],
      auth: [
        { value: [0, '0'], text: '未授权', type: 'info' },
        { value: [1, '1'], text: '已授权', type: 'success' },
      ]
    }
  },
  computed: {
    text () {
      for (let v of typeof this.options === 'string' ? this[this.options] : this.options) {
        if (v.value instanceof Array) {
          if (v.value.includes(this.value)) {
            this.type = v.type
            return v.text
          }
        } else if (v.value === this.value) {
          this.type = v.type
          return v.text
        }
      }
    },
  },
  methods: {}
}
</script>

<style lang="scss" scoped>

</style>
