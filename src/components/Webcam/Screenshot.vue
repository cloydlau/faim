<template>
  <transition
    name="screenshot"
    @after-enter="afterEnter"
  >
    <div v-show="show" :class="['screenshot', phase]">
      <img :src="base64" alt="">
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Screenshot',
  data () {
    return {
      base64: '',
      show: false,
      phase: false,
    }
  },
  methods: {
    afterEnter () {
      this.phase = 'shrink'
      setTimeout(() => {
        this.show = false
        this.base64 = ''
        this.$emit('finish')
      }, 500)
    },
    perform (base64) {
      if (base64) {
        this.phase = false
        this.base64 = base64
        this.show = true
      }
    }
  },
}
</script>

<style lang="scss" scoped>
@keyframes screenshot {
  10% {
    transform: scale3d(0.9, 0.9, 0.9) translate3d(0, -50px, 0);
  }

  100% {
    transform: scale3d(0.1, 0.1, 0.1);
    transform-origin: bottom left;
  }
}

.screenshot-enter-active {
  animation-name: screenshot;
  animation-duration: 0.7s;
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(0.55, 0.055, 0.7, 0.2);
}

.screenshot {
  position: absolute;
  z-index: 99999;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 21, 41, 0.12);
  background-color: white;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  img {
    height: 100%;
    border: 8px solid white;
  }

  &.shrink {
    top: unset;
    right: unset;
    height: 20%;

    img {
      border-width: 3px;
    }
  }
}
</style>
