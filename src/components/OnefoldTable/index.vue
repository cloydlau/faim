<template>
  <div class="onefold-table">
    <h2 v-if="title">{{title}}</h2>
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
export default {
  name: 'OnefoldTable',
  props: {
    title: String
  }
}
</script>

<style lang="scss" scoped>
.onefold-table {
  &:not(:last-child) {
    margin-bottom: 40px;
  }

  table {
    width: 100%;

    tr {
      display: flex;

      td {
        padding-left: 10px;
        padding-right: 10px;

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
