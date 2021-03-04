<template>
  <div v-if="!elForm.disabled" class="form-item-propmt">
    <i class="icon el-icon-info"/>
    <span class="propmt">
      <slot/>
    </span>
  </div>
</template>

<script>
export default {
  name: 'form-item-tip',
  inject: {
    elForm: {
      default: {}
    },
  },
}
</script>

<style lang="scss" scoped>
.form-item-propmt {
  margin-top: 5px;
  display: flex;
  align-items: flex-start;

  .icon {
    color: #E6A23C;
    margin-right: 7px;
    font-size: 18px;
  }

  .propmt {
    font-size: 13px;
    color: #409EFF;
    line-height: 20px;
  }
}
</style>
