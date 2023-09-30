<script setup>
import axios from 'axios'
import createAxiosShortcut from 'axios-shortcut'
import { ref } from 'vue-demi'
import { KiMessageBox } from 'kikimore'
import JsonEditorVue from 'json-editor-vue'
import { binaryToBase64, fileToBlob } from '../src/ImageUpload/utils'

function onInput(e) {
  // console.log('绑定值输出（可能未上传）: ', e)
}

const show = ref(true)

const { POST } = createAxiosShortcut(axios)

const accept = '.jpg,.jpeg,.png'
const extension = accept.split(',')
const source = ref(undefined)

const data = reactive({
  value: {
    kiImageUpload: [
      'https://picsum.photos/100/100',
      'https://picsum.photos/100/200',
      'https://picsum.photos/100/300',
    ],
    kiImage: [
      'https://picsum.photos/100/100',
      'https://picsum.photos/100/200',
      'https://picsum.photos/100/300',
      'https://picsum.photos/100/400',
      'https://picsum.photos/100/500',
      'https://picsum.photos/100/600',
      'https://picsum.photos/100/700',
      '123',
    ],
    kiPopSwitch: true,
    elSelect: { a: 1, b: 1 },
    kiSelect: undefined,
    kiSelectLabel: undefined,
  },
  sourceOptions: {
    url: 'https://picsum.photos/100',
    fileFromURL: null,
    file: null,
    blob: null,
    base64: null,
    objectURL: null,
  },
  props: {
    width: 800,
    height: 800,
    count: 6,
    disabled: false,
    editable: true,
    arrayed: undefined,
    size: 0.5,
    aspectRatioTolerance: 0.1,
    accept,
    validator: (source) => {
      let valid = true
      if (source instanceof File) {
        valid = extension.includes(source.name.replace(/.+\./, '.').toLowerCase())
        if (!valid) {
          SwalPreset.warning(`"${source.name}" 的格式不在可支持范围: ${accept}`)
        }
      }
      return valid
    },
    requestParam: {
      original: 'true',
    },
    // srcAt: 'url',
    async upload(binary) {
    // console.log('编辑输出（可能未编辑）: ', binary)
    /* return {
      a: 'https://picsum.photos/200',
      b: 1,
    } */

      await new Promise(resolve => setTimeout(resolve, 500))

      return POST.upload(import.meta.env.VITE_APP_UPLOAD_API, {
        file: binary,
        dir: 'img',
        domainId: '1',
        ...this.$attrs.requestParam,
      }, {
        baseURL: '', // 针对 prod 环境中 baseAPI 为相对路径的情况
        timeout: 20000,
      }).then(res => res.data.data)
    },
  },
})

async function urlToFile(url, fileName) {
  const blob = await (await fetch(url)).blob()
  return new File([blob], fileName, { type: blob.type })
}

async function onChooseFile(e) {
  const file = e.target.files[0]
  data.sourceOptions.file = file
  data.sourceOptions.fileFromURL = await urlToFile(data.value.kiImageUpload[0], '100x100.jpg')
  data.sourceOptions.blob = await fileToBlob(file)
  data.sourceOptions.base64 = await binaryToBase64(file)
  data.sourceOptions.objectURL = URL.createObjectURL(file)
}

const kiImageRef = ref()

const console = window.console

function onClick({ index, src }) {
  console.log('onClick', index, src)
  kiImageRef.value.viewer.view(index)
}

const options = reactive({
  elSelect: [
    { a: 2, b: 2 },
    { a: 3, b: 3 },
  ],
  kiSelect: [
    {
      name: '广东省',
      code: '440000',
      children: [
        {
          name: '深圳市',
          code: '440300',
        },
        {
          name: '广州市',
          code: '440100',
        },
      ],
    },
    {
      name: '江苏省',
      code: '320000',
      children: [
        {
          name: '南京市',
          code: '320100',
        },
        {
          name: '苏州市',
          code: '320500',
        },
      ],
    },
  ],
})

const $swal = KiMessageBox
</script>

<template>
  <div>
    <el-button @click="show = true">打开</el-button>
    <KiFormDialog
      v-model:show="show"
      v-model="data.value"
      :show.sync="show"
      title="Kikimore"
      fullscreen
      append-to-body
    >
      <p>
        <JsonEditorVue
          v-model="data.value"
          :main-menu-bar="false"
          :navigation-bar="false"
        />
      </p>
      <el-form-item label="KiImageUpload">
        <div style="display: inline-block; border: 1px solid red;">
          <KiImageUpload
            ref="KiImageUploadRef"
            v-model="data.value.kiImageUpload"
            v-bind="data.props"
            @input="onInput"
          >
            <!-- <template #tip="{ dimension, size, count, accept }">
              <div>{{ count }}</div>
              <div>{{ size }}</div>
              <div>{{ dimension }}</div>
              <div>{{ accept }}</div>
            </template> -->
          </KiImageUpload>
        </div>

        <div>
          <div style="display: inline-block; border: 1px solid red; padding-bottom: 8px;">
            <KiImageUpload
              v-model="data.value.kiImageUpload"
              v-bind="data.props"
              list-type="text"
              class="custom-trigger"
            >
              <el-button>自定义 trigger</el-button>
            </KiImageUpload>
          </div>
        </div>

        <p>
          <input
            style="display: block !important; margin-bottom: 5px;"
            type="file"
            @change="onChooseFile"
          >
          <el-radio-group v-model="source">
            <el-radio
              v-for="(v, k) in data.sourceOptions"
              :key="k"
              display="!block"
              w="full"
              mb="5px"
              :label="k"
            >
              {{ k }}: {{ v }}
            </el-radio>
          </el-radio-group>
          <el-button
            :disabled="!source"
            style="display: block !important;"
            @click="() => {
              $refs.KiImageUploadRef.openEditor(data.sourceOptions[source])
            }"
          >
            编程式提供数据源
          </el-button>
        </p>
        <p>
          <JsonEditorVue
            v-model="data.props"
            :main-menu-bar="false"
            :navigation-bar="false"
          />
        </p>
      </el-form-item>
      <h3>KiImage</h3>
      <div>
        <h2>单张</h2>
        <p border="1px solid red">
          <KiImage
            :value="data.value.kiImage[0]"
            :modelValue="data.value.kiImage[0]"
          />
        </p>

        <h2>多张（Swiper）</h2>
        <p border="1px solid red">
          <KiImage
            :value="data.value.kiImage"
            :modelValue="data.value.kiImage"
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
        </p>

        <h2>多张（文档流）</h2>
        <p border="1px solid red">
          <KiImage
            :value="JSON.stringify(data.value.kiImage)"
            :modelValue="JSON.stringify(data.value.kiImage)"
            qrcode="auto"
            :qrcodeProps="{
              width: 48,
              height: 48,
            }"
          />
        </p>

        <h2>多张（瀑布流）</h2>
        <p border="1px solid red">
          <KiImage
            :value="data.value.kiImage"
            :modelValue="data.value.kiImage"
            pattern="waterfall"
          />
        </p>

        <h2>表格内</h2>
        <el-table
          :data="[
            { img: data.value.kiImage, name: '多个（数组）' },
            { img: data.value.kiImage && data.value.kiImage[0], name: '单个（字符串/数组）' },
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
          :value="data.value.kiImage"
          :modelValue="data.value.kiImage"
        />
        <KiImage
          :value="data.value.kiImage[0]"
          :modelValue="data.value.kiImage[0]"
          :viewerjs="false"
          @click="onClick"
        />

        <el-button-group>
          <el-button @click="() => { data.value.kiImage = ['123'] }">
            改变value
          </el-button>
          <el-button @click="() => { kiImageRef.viewer.view() }">
            预览
          </el-button>
        </el-button-group>
      </div>
      <br>

      <el-form-item label="KiPopButton">
        <KiPopButton
          :elTooltipProps="{ rawContent: true, content: '删除' }"
          :elPopoverProps="{ content: `权限不足`, disabled: true }"
          :elPopconfirmProps="{ title: '确认删除吗？' }"
          @click="console.log('[KiPopButton] click')"
        >
          删除
        </KiPopButton>
      </el-form-item>

      <el-form-item
        label="KiPopSwitch"
        prop="KiPopSwitch"
      >
        <KiPopSwitch
          v-model="data.value.kiPopSwitch"
          :elTooltipProps="{ rawContent: true, content: '已停用' }"
          :elPopoverProps="{ content: `权限不足` }"
          :elPopconfirmProps="{ title: '确认启用吗？' }"
          active-text="启用"
          inactive-text="停用"
          @change="console.log('[KiPopSwitch] change')"
        />
      </el-form-item>
      {{ data.value.elSelect }}
      <el-form-item
        label="ElSelect"
        prop="elSelect"
      >
        <el-select
          v-model="data.value.elSelect"
          value-key="a"
        >
          <el-option
            v-for="v of options.elSelect"
            :key="v.a"
            :value="v.a"
            :label="v.b"
          />
        </el-select>
      </el-form-item>
      {{ data.value.kiSelect }}
      {{ data.value.kiSelectLabel }}
      <el-form-item
        label="KiSelect"
        prop="kiSelect"
      >
        <KiSelect
          v-model="data.value.kiSelect"
          v-model:label="data.value.kiSelectLabel"
          :options="options.kiSelect"
          :props="{ label: 'name' }"
          value-key="code"
          multiple
        >
          <template #prefix>
            Local Slot
          </template>
          <template #default="{ option }">
            {{ option.name }} (From Local Scoped Slot)
          </template>
        </KiSelect>
        <!-- <KiSelect
            v-model="data.value.kiSelect"
            v-model:label="data.value.kiSelectLabel"
            :options="options.kiSelect"
            :props="{ label: 'name' }"
            value-key="code"
            multiple
          /> -->
      </el-form-item>
      <el-form-item label="MessageBox">
        <el-button-group>
          <el-button
            @click="() => {
              $swal.success({
                titleText: '操作成功',
                timer: 0,
              }).then(() => { console.log('success') })
            }"
          >
            success
          </el-button>
          <el-button
            @click="() => {
              $swal.info('提示').then(() => { console.log('info') })
            }"
          >
            info
          </el-button>
          <el-button
            @click="() => {
              $swal.warning('警告').then(() => {
                console.log('warning')
              })
            }"
          >
            warning
          </el-button>
          <el-button
            @click="() => {
              $swal.error('错误').then(() => {
                console.log('error')
              })
            }"
          >
            error
          </el-button>
          <el-button
            @click="() => {
              $swal.confirm('确认').then(() => {
                console.log('确认')
              }).catch(() => {
                console.log('取消')
              })
            }"
          >
            confirm
          </el-button>
        </el-button-group>
      </el-form-item>
    </KiFormDialog>
  </div>
</template>

<style>
.custom-trigger {
  .ki-image,
  .el-upload-list,
  .el-upload__tip,
  .el-upload__text {
    display: none;
  }
}
</style>
