<script>
export default {
  data() {
    return {
      show: false,
      value: [
        'https://picsum.photos/100/100',
        'https://picsum.photos/100/200',
        'https://picsum.photos/100/300',
        'https://picsum.photos/100/400',
        'https://picsum.photos/100/500',
        'https://picsum.photos/100/600',
        'https://picsum.photos/100/700',
        '123',
      ],
    }
  },
  methods: {
    onClick({ index, src }) {
      console.log('onClick', index, src)
      this.$refs.kiImageRef.viewer.view(index)
    },
  },
}
</script>

<template>
  <div>
    <el-button @click="show = true">打开</el-button>
    <KiFormDialog
      v-model:show="show"
      :show.sync="show"
      title="KiImage"
      fullscreen
      append-to-body
    >
      <h2>单张</h2>
      <div border="1px solid red">
        <KiImage
          :value="value[0]"
          :modelValue="value[0]"
        />
      </div>
      <br><br>

      <h2>多张（Swiper）</h2>
      <div border="1px solid red">
        <KiImage
          :value="value"
          :modelValue="value"
          pattern="swiper"
          :swiperProps="{
            slidesPerView: 3,
            spaceBetween: 15,
          }"
        >
          <template #default="{ src, index }">
            <img
              :src="src"
              alt=""
            >
            <div>第{{ index + 1 }}张</div>
          </template>
        </KiImage>
      </div>
      <br><br>

      <h2>多张（文档流）</h2>
      <div border="1px solid red">
        <KiImage
          :value="JSON.stringify(value)"
          :modelValue="JSON.stringify(value)"
          qrcode="auto"
          :qrcodeProps="{
            width: 48,
            height: 48,
          }"
        />
      </div>
      <br><br>

      <h2>多张（瀑布流）</h2>
      <div border="1px solid red">
        <KiImage
          :value="value"
          :modelValue="value"
          pattern="waterfall"
        />
      </div>
      <br><br>

      <h2>表格内</h2>
      <el-table
        :data="[
          { img: value, name: '多个（数组）' },
          { img: value && value[0], name: '单个（字符串/数组）' },
        ]"
        border
        fit
        stripe
        highlight-current-row
      >
        <el-table-column
          label="数量"
          prop="name"
        />
        <el-table-column label="图片">
          <template #default="{ row }">
            <div border="1px solid red">
              <KiImage
                :value="row.img"
                :modelValue="row.img"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <KiImage
        v-show="false"
        ref="kiImageRef"
        :value="value"
        :modelValue="value"
      />
      <KiImage
        :value="value[0]"
        :modelValue="value[0]"
        :viewerjs="false"
        @click="onClick"
      />

      <el-button-group>
        <el-button @click="() => { value = ['123'] }">
          改变value
        </el-button>
        <el-button @click="() => { $refs.kiImageRef.viewer.view() }">
          预览
        </el-button>
      </el-button-group>
    </KiFormDialog>
  </div>
</template>

<style lang="scss" scoped>

</style>
