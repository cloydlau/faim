<script>
export default {
  props: {
    percentage: {
      type: Number,
      required: true,
    },
    abort: {
      type: Function,
      required: true,
    },
  },
  computed: {
    Percentage() {
      return `${Math.min(100, Math.round(this.percentage * 100))}%`
    },
  },
}
</script>

<template>
  <div class="mask">
    <div class="container">
      <div
        class="progress-bar"
        :style="{ width: Percentage }"
      />
      {{ Percentage }}
      <svg
        v-if="percentage < 1"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        @click="abort"
      ><path
        fill="currentColor"
        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
      /></svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mask {
  position: absolute;
  z-index: 2000;
  background-color: rgba(255, 255, 255, 0.9);
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition: opacity 0.3s;

  &>.container{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 32px;
    width: calc(100% - 64px);
    height: 6px;
    margin: auto;
    border-radius: 3px;
    background-color: #ebeef5;
    font-size: 12px;
    line-height: 24px;
    color: #606266;

    &>.progress-bar {
      height: 6px;
      border-radius: 3px;
      background-color: #409eff;
      transition: width 1s;
    }

    &>svg {
      position: absolute;
      right: -24px;
      top: -8px;
      cursor: pointer;
    }
  }
}
</style>
