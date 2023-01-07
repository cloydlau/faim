<template>
  <div class="toolbar">
    <div class="panel">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$btnSize: 30px;

.toolbar {
  position: fixed;
  top: 18px;
  right: 0;
  height: 35px;
  z-index: 10000; // 用于移动端：高于左侧搜索框

  .panel {
    background: rgba(255, 255, 255, 0.9);
    position: absolute;
    top: 0;
    right: 15px;
    height: 100%;
    border-radius: 25px;
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 3px 8px;
    border: 1px solid rgba(64, 158, 255, 0.2);

    &>.el-tooltip,
    &>.el-dropdown {
      width: $btnSize;
      height: $btnSize;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 5px;
      box-sizing: border-box;

      ::v-deep a {
        width: 100%;
        height: 100%;
        display: flex !important;
        justify-content: center;
        align-items: center;
      }

      ::v-deep svg {
        width: 22px;
        height: 22px;
        cursor: pointer;

        &.disabled {
          cursor: unset;
        }
      }

      &:hover ::v-deep svg {
        transition: 0.5s;
        transform: scale3d(1.05, 1.05, 1);
      }

      &.active {
        border: inset;
        border-width: 1.5px;
        box-shadow: inset 0 0 5px 5px #d3d3d373;
        color: #3297FD;
      }
    }
  }
}
</style>
