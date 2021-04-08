<template>
  <div class="qrcode" :style="{ width: Size, height: Size }">
    <img :src="qrcode" alt="" />
    <div class="mask" v-if="maskText">{{ maskText }}</div>
  </div>
</template>

<script>
  //import QRCode from 'exports-loader?QRCode!qrcodejs/qrcode'
  import QRCode from 'qrcode'
  import { validator } from 'kayran'
  const { base64 } = validator

  export default {
    name: 'QR',
    props: {
      value: {
        //required: true, 使value绑定的变量为undefined时报错
        type: String
      },
      maskText: String,
      size: {
        type: [String, Number],
        default: '200'
      },
      options: Object
    },
    watch: {
      value: {
        immediate: true,
        handler(newVal) {
          if (newVal) {
            if (
              base64(newVal, {
                mediaType: 'image',
                scheme: true
              })
            ) {
              QRCode.toDataURL(newVal, {
                margin: 0,
                scale: 16,
                errorCorrectionLevel: 'L',
                width: this.size,
                height: this.size,
                ...this.options
              })
                .then(url => {
                  this.qrcode = url
                  this.$emit('load', url)
                })
                .catch(e => {
                  this.$emit('error', e)
                })
            } else {
              this.qrcode = newVal
              this.$emit('load', newVal)
            }
          }
        }
      }
    },
    data() {
      return {
        qrcode: ''
      }
    },
    computed: {
      Size() {
        return this.size
          ? isNaN(this.size)
            ? this.size
            : this.size + 'px'
          : '200px'
      }
    }
  }
  /*
  new QRCode(document.getElementById("qrcode"), {
    text: this.orderInfo.exchangeCode,
    width: 150,
    height: 150,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  })
*/
</script>

<style lang="scss" scoped>
  .qrcode {
    position: relative;

    &>img {
      display: block;
      margin: auto;
      width: 100%;
      height: 100%;
    }

    &>.mask {
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 1.5rem;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      margin: auto;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }
  }
</style>