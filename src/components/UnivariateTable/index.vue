<template>
  <div class="ki-univariate-table">
    <h2 v-if="Title">{{ Title }}</h2>
    <div class="el-table el-table--fit el-table--border">
      <div class="el-table__body-wrapper">
        <table class="el-table__body" cellspacing="0" cellpadding="0" border="0">
          <slot/>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { conclude } from 'vue-global-config'
import { globalProps, globalListeners } from './index'

export default {
  name: 'KiUnivariateTable',
  props: {
    title: {}
  },
  computed: {
    Title () {
      return conclude([
        this.title, globalProps.title
      ], {
        name: 'title',
        type: 'string'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ki-univariate-table {
  &:not(:last-child) {
    margin-bottom: 40px;
  }

  table {
    width: 100%;

    tr {
      display: flex;

      td {
        line-height: initial; // 避免被 .el-form-item__content 的样式覆盖
        transition: background-color 0.25s ease;
        border-bottom: 1px solid #dfe6ec;
        border-right: 1px solid #dfe6ec;
        padding: 10px;

        &:nth-child(2n - 1) {
          width: 20%;
          background: #f9f9f9;
          text-align: center;
        }

        &:nth-child(2n) {
          flex: 2;
        }
      }
    }
  }
}
</style>
