<template>
  <div class="auth-tree">
    <div class="premiss-tree">
      <el-tree :data="value" :props="defaultProps" @node-click="nodeClick" />
    </div>

    <div class="recursion-box">
      <Recursion v-model="value" ref="Recursion" />
    </div>
  </div>
</template>

<script>
import Recursion from './Recursion.vue'

export default {
  name: 'AuthTree',
  components: { Recursion },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: ['value', 'check-strictly'],
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  methods: {
    nodeClick(curPage) {
      this.$refs['Recursion']?.nodeClick(curPage.id)
    }
  }
}
</script>

<style lang="scss" scoped>
$border-color: rgba(#59b9c6, 0.1);
$bg-color: #fdfdfd;
.auth-tree {
  display: flex;
  height: 100%;

  .premiss-tree {
    width: 220px;
    height: 100%;
    margin-right: 12px;
    border-right: 1px solid $border-color;
  }

  ::v-deep .recursion-box {
    flex: 1;
    height: 100%;
    overflow: auto;
    .tree-title {
      background: linear-gradient(to right, $border-color, lighten(#e9f1f6, 10%));
      margin: 0;
      margin-bottom: 12px;
      margin-left: -14px;
      padding: 8px 14px;
      border-radius: 0;
      font-weight: normal;
      line-height: 1;
      .el-checkbox {
        margin-bottom: 0px;
      }
    }
    .el-checkbox {
      margin-bottom: 12px;
      margin-right: 12px;
      line-height: 1;
    }
    .sys-root {
      margin-bottom: 14px;
      background: $bg-color;
      border-left: 1px solid $border-color;
      border-bottom: 1px solid $border-color;
      overflow: hidden;
      & > .tree-title {
        padding: 10px 14px;
        font-weight: bold;
      }
      .sub-title {
        position: relative;
        &::after {
          content: '';
          position: absolute;
          top: 55px;
          left: 0px;
          width: 13px;
          border-top: 1px solid $border-color;
        }
      }
    }
    .recursion {
      .recursion-item {
        position: relative;
        border-left: 1px solid $border-color;
        padding-left: 14px;
        line-height: 1;
        &::before {
          content: '';
          position: absolute;
          top: 17px;
          left: -14px;
          width: 13px;
          border-top: 1px solid $border-color;
        }
        .no-children {
          // 屏蔽功能按钮左侧的线条
          &::after {
            content: '';
            position: absolute;
            top: 55px;
            left: -1px;
            width: 13px;
            height: 100%;
            background: $bg-color;
            border-top: 1px solid $border-color;
          }
        }
      }
      .recursion-item:last-child {
        // 遮蔽左侧超出的边框
        &::before {
          width: 15px;
          left: -16px;
          height: 100%;
          background: $bg-color;
        }
      }
    }
  }
}
</style>
