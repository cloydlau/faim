<template>
  <span>
    <video
      v-if="inline"
      class="video-plyr"
      v-bind="props"
    >
      您的浏览器不支持HTML5，建议升级到新版Chrome或Edge
    </video>
    <div v-else-if="show" class="player-dialog">
      <div>
        <!--<Plyr :options="config" ref="plyr" :emit="['error']" @error="onError">-->
        <video class="video-plyr"
               v-bind="props"
        >
          您的浏览器不支持HTML5，建议升级到新版Chrome或Edge
        </video>
        <!--</Plyr>-->
        <div class="close" @click="close({key:'Escape'})"/>
      </div>
    </div>
  </span>
</template>

<script>
//import Plyr from 'vue-plyr'

export default {
  name: 'VideoPlayer',
  //components: { Plyr },
  props: {
    show: Boolean,
    inline: Boolean
  },
  watch: {
    show (newVal) {
      if (newVal) {
        document.addEventListener('keyup', this.close)
      } else {
        document.removeEventListener('keyup', this.close)
      }
    },
  },
  destroyed () {
    document.removeEventListener('keyup', this.close)
  },
  computed: {
    props () {
      return {
        crossorigin: true,
        controls: true,
        autoplay: !this.inline,
        ...this.$attrs,
      }
    }
  },
  data () {
    return {
      config: {
        i18n: {
          speed: '速度',
          normal: '1.0',
        },
        keyboard: {
          global: true
        },
        resetOnEnd: true,
        //settings: ['captions', 'quality', 'speed', 'loop'],
        //controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']
      }
    }
  },
  methods: {
    /*onError (e) {
      //document.getElementById("video-player").error.message
      err('播放失败')
    },*/
    close (e) {
      if (e.key === 'Escape') {
        const videoElement = document.querySelector('.video-plyr')
        videoElement.pause()
        videoElement.load()
        //this.$refs.plyr.player.destroy()
        this.$emit('update:show', false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.player-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  > div {
    position: relative;
    max-width: 50%;

    > .video-plyr {
      max-width: 100%;
      max-height: calc(100vh - 55px);
    }

    > .close {
      z-index: 3001;
      position: absolute;
      right: -25px;
      top: -25px;
      width: 40px;
      height: 40px;
      background: silver;
      border-radius: 25px;
      cursor: pointer;

      &:hover {
        background: #ff461f;
      }

      &:before {
        position: absolute;
        content: '';
        width: 25px;
        height: 4px;
        background: white;
        transform: rotate(45deg);
        top: 18px;
        left: 7.5px;
      }

      &:after {
        content: '';
        position: absolute;
        width: 25px;
        height: 4px;
        background: white;
        transform: rotate(-45deg);
        top: 18px;
        left: 7.5px;
      }
    }
  }
}
</style>
