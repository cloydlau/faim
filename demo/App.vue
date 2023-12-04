<script setup>
import { reactive, ref } from 'vue-demi'
import JsonEditorVue from 'json-editor-vue'
import { binaryToBase64, fileToBlob } from '../src/utils'
import { FaMessageBox } from '../src'
import presets from './useUpload/presets'

const console = window.console
const show = ref(true)
const source = ref(undefined)
const data = reactive({
  value: {
    readonly: false,
    richtext: '',
    files: [
      'https://picsum.photos/100/100',
    ],
    images: [
      'https://picsum.photos/100/100',
      'https://picsum.photos/100/200',
      'https://picsum.photos/100/300',
    ],
    FaImage: [
      'https://picsum.photos/100/100',
      'https://picsum.photos/100/200',
      'https://picsum.photos/100/300',
      'https://picsum.photos/100/400',
      'https://picsum.photos/100/500',
      'https://picsum.photos/100/600',
      'https://picsum.photos/100/700',
      '123',
    ],
    FaUpload: undefined,
    ElSwitch: 0,
    FaPopSwitch: true,
    ElSelect: { a: 1, b: 1 },
    FaSelect: undefined,
    FaSelectLabel: undefined,
  },
  sourceOptions: {
    url: 'https://picsum.photos/100',
    fileURL: `${import.meta.env.VITE_APP_UPLOAD_API}/file-upload-noauth/file/1/video/202310/4CBF0F24F7EF7851AF89F857A4BA9A1CB1A1849B.jpg`,
    fileFromURL: null,
    file: null,
    blob: null,
    base64: null,
    objectURL: null,
  },
})

async function urlToFile(url, fileName) {
  const blob = await (await fetch(url)).blob()
  return new File([blob], fileName, { type: blob.type })
}

const loadingFile = ref(false)

async function onChooseFile(e) {
  loadingFile.value = true
  const file = e.target.files[0]
  data.sourceOptions.file = file
  data.sourceOptions.fileFromURL = await urlToFile(data.sourceOptions.url, '100x100.jpg')
  data.sourceOptions.blob = await fileToBlob(file)
  data.sourceOptions.base64 = await binaryToBase64(file)
  data.sourceOptions.objectURL = URL.createObjectURL(file)
  loadingFile.value = false
}

const FaImageRef = ref()

function onClick({ index, src }) {
  console.log('onClick', index, src)
  FaImageRef.value.viewer.view(index)
}

const options = reactive({
  ElSelect: [
    { a: 2, b: 2 },
    { a: 3, b: 3 },
  ],
  FaSelect: [
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

function loading() {
  FaMessageBox.loading().then(() => {
    console.log('结束')
  })
  setTimeout(() => {
    FaMessageBox.close()
  }, 1000)
}
</script>

<template>
  <div>
    <el-button @click="show = true">打开</el-button>
    <FaFormDialog
      v-model:show="show"
      v-model="data.value"
      title="Faim"
      :show.sync="show"
      fullscreen
      append-to-body
      :readonly="data.value.readonly"
    >
      <p>
        <JsonEditorVue
          v-model="data.value"
          :main-menu-bar="false"
          :navigation-bar="false"
        />
      </p>

      <el-form-item label="FaPopButton">
        <FaPopButton
          :elTooltipProps="{ rawContent: true, content: '删除' }"
          :elPopoverProps="{ content: `权限不足`, disabled: true }"
          :elPopconfirmProps="{ title: '确认删除吗？' }"
          @click="console.log('[FaPopButton] click')"
        >
          删除
        </FaPopButton>
      </el-form-item>
      <el-form-item
        label="ElSwitch"
        prop="ElSwitch"
      >
        <el-switch
          v-model="data.value.ElSwitch"
          @change="() => {
            console.log('change')
          }"
          @input="() => {
            // console.log('input')
          }"
          @update:model-value="() => {
            console.log('update:modelValue')
          }"
        />
      </el-form-item>
      <el-form-item
        label="FaPopSwitch"
        prop="FaPopSwitch"
      >
        <FaPopSwitch
          v-model="data.value.FaPopSwitch"
          :elTooltipProps="{ rawContent: true, content: '已停用' }"
          :elPopoverProps="{ content: `权限不足`, trigger: 'hover' }"
          :elPopconfirmProps="{ title: '确认启用吗？' }"
          active-text="启用"
          inactive-text="停用"
          inlinePrompt
          @change="console.log('[FaPopSwitch] change')"
        />
      </el-form-item>
      <el-form-item
        label="FaRichText"
        prop="FaRichText"
      >
        <FaRichText v-model="data.value.richtext" />
      </el-form-item>

      <el-form-item label="生成测试文件">
        <input
          style="display: block !important; margin: 5px 0 5px 0; width: 100%;"
          type="file"
          @change="onChooseFile"
        >
        <el-radio-group
          v-model="source"
          v-loading="loadingFile"
        >
          <el-radio
            v-for="(v, k) in data.sourceOptions"
            :key="k"
            :label="k"
            style="display: block; width: 100%;"
          >
            <b>{{ k }}</b>: {{ v }}
          </el-radio>
        </el-radio-group>
        <el-button
          @click="() => {
            $refs.faUploadRef.filePond.addFile(data.sourceOptions[source], {
              type: 'local',
            })
          }"
        >
          FaUpload addFile
        </el-button>
        <el-button
          @click="() => {
            $refs.faImageUploadRef.openEditor(data.sourceOptions[source])
          }"
        >
          FaImageUpload openEditor
        </el-button>
        <el-button
          @click="() => {
            data.value.files.push(data.sourceOptions[source])
          }"
        >
          编程式改变绑定值
        </el-button>
      </el-form-item>

      <el-form-item
        label="FaUpload"
        prop="FaUpload"
      >
        <FaUpload
          v-bind="presets.video"
          ref="faUploadRef"
          v-model="data.value.files"
        />
      </el-form-item>
      <el-form-item
        label="FaImageUpload"
        prop="FaImageUpload"
        class="FaImageUpload"
      >
        <div style="display: inline-block; border: 1px solid red;">
          <FaImageUpload
            ref="faImageUploadRef"
            v-model="data.value.images"
          />
        </div>

        <div style="display: inline-block; border: 1px solid red;">
          <FaImageUpload
            v-model="data.value.images"
            list-type="text"
            class="fa-image-upload__custom-trigger"
          >
            <el-button>自定义 trigger</el-button>
          </FaImageUpload>
        </div>

        <el-table :data="[{}]">
          <el-table-column>
            <template #default>
              <FaImageUpload
                v-model="data.value.images[0]"
                :maxCount="1"
              />
            </template>
          </el-table-column>
          <el-table-column>
            <template #default>
              <FaImageUpload
                v-model="data.value.images"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <h3>FaImage</h3>
      <div>
        <h2>单张</h2>
        <p border="1px solid red">
          <FaImage
            :value="data.value.FaImage[0]"
            :modelValue="data.value.FaImage[0]"
          />
        </p>

        <h2>多张 (Swiper)</h2>
        <p border="1px solid red">
          <FaImage
            :value="data.value.FaImage"
            :modelValue="data.value.FaImage"
            pattern="swiper"
            :swiperOptions="{
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
          </FaImage>
        </p>

        <h2>多张 (文档流)</h2>
        <p border="1px solid red">
          <FaImage
            :value="JSON.stringify(data.value.FaImage)"
            :modelValue="JSON.stringify(data.value.FaImage)"
            qrcode="auto"
            :qrcodeOptions="{
              width: 48,
              height: 48,
            }"
          />
        </p>

        <h2>多张 (瀑布流)</h2>
        <p border="1px solid red">
          <FaImage
            :value="data.value.FaImage"
            :modelValue="data.value.FaImage"
            pattern="waterfall"
          />
        </p>

        <h2>表格内</h2>
        <el-table
          :data="[
            { img: data.value.FaImage, name: '多个（数组）' },
            { img: data.value.FaImage && data.value.FaImage[0], name: '单个（字符串/数组）' },
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
                <FaImage
                  :value="row.img"
                  :modelValue="row.img"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>

        <FaImage
          v-show="false"
          ref="FaImageRef"
          :value="data.value.FaImage"
          :modelValue="data.value.FaImage"
        />
        <FaImage
          :value="data.value.FaImage[0]"
          :modelValue="data.value.FaImage[0]"
          :viewer="false"
          @click="onClick"
        />

        <el-button-group>
          <el-button @click="() => { data.value.FaImage = ['123'] }">
            改变value
          </el-button>
          <el-button @click="() => { FaImageRef.viewer.view() }">
            预览
          </el-button>
        </el-button-group>
      </div>
      <br>
      <el-form-item label="FaMessageBox">
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
          <el-button
            @click="loading"
          >
            loading
          </el-button>
        </el-button-group>
      </el-form-item>
      <el-form-item
        label="ElSelect"
        prop="ElSelect"
      >
        <el-select
          v-model="data.value.ElSelect"
          value-key="a"
        >
          <el-option
            v-for="v of options.ElSelect"
            :key="v.a"
            :value="v.a"
            :label="v.b"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="FaSelect"
        prop="FaSelect"
      >
        <FaSelect
          v-model="data.value.FaSelect"
          v-model:label="data.value.FaSelectLabel"
          :options="options.FaSelect"
          :props="{ label: 'name' }"
          value-key="code"
          multiple
          :multiple-limit="1"
          @change="() => {
            console.log(111)
          }"
        >
          <template #prefix>
            Local Slot
          </template>
          <template #default="{ option }">
            {{ option.name }} (From Local Scoped Slot)
          </template>
        </FaSelect>
        <FaSelect
          v-model="data.value.FaSelect"
          v-model:label="data.value.FaSelectLabel"
          :options="options.FaSelect"
          :props="{ label: 'name' }"
          value-key="code"
          multiple
        />
      </el-form-item>
    </FaFormDialog>
  </div>
</template>

<style lang="scss">
.FaImageUpload>.el-form-item__content {
  display: flex;
  flex-direction: column;
  align-items: start;
}

.fa-image-upload__custom-trigger {
  .fa-image,
  .el-upload-list,
  .el-upload__tip,
  .el-upload__text {
    display: none;
  }
  .el-upload-dragger {
    width: unset;
    height: unset;
    margin-bottom: 8px;
  }
}

.fa-form-dialog.el-dialog__wrapper > .el-dialog {
  min-width: revert;
}
</style>
