<template>
  <el-pagination
    @size-change="onSizeChange"
    @prev-click="$emit('prev-click',$event)"
    @next-click="$emit('next-click',$event)"
    @current-change="onCurrentChange"
    :current-page.sync="currentPage__"
    :page-size.sync="pageSize__"
    v-bind="elPaginationProps"
  />
</template>

<script>
export default {
  name: 'Pagination',
  inject: {
    elForm: {
      default: {}
    },
  },
  props: {
    pageSize: {
      type: Number,
    },
    currentPage: {
      type: Number,
    },
  },
  data () {
    return {
      currentPage__: null,
      pageSize__: null,
    }
  },
  watch: {
    currentPage: {
      immediate: true,
      handler (newValue) {
        this.currentPage__ = newValue
      }
    },
    pageSize: {
      immediate: true,
      handler (newVal) {
        this.pageSize__ = newVal
      }
    }
  },
  computed: {
    elPaginationProps () {
      return {
        layout: 'total, prev, pager, next, jumper',
        background: true,
        ...this.$attrs,
        disabled: ['', true].includes(this.$attrs.disabled) || this.elForm.disabled,
      }
    },
  },
  methods: {
    onSizeChange (e) {
      this.$emit('update:pageSize', e)
      this.$emit('size-change', e)
    },
    onCurrentChange (currentPage) {
      this.$emit('update:currentPage', currentPage)
      this.$emit('current-change', currentPage)
    }
  },
}
</script>
