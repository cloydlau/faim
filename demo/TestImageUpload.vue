<script setup>
import JsonEditorVue from 'json-editor-vue'
import axios from 'axios'
import createAxiosShortcut from 'axios-shortcut'
import SwalPreset from 'sweetalert2-preset'
import { ref } from 'vue-demi'
import { binaryToBase64, fileToBlob } from '../src/ImageUpload/utils'

function onInput(e) {
  // console.log('绑定值输出（可能未上传）: ', e)
}

const show = ref(false)

const { POST } = createAxiosShortcut(axios)

const value = ref([
  'https://picsum.photos/100',
  'https://picsum.photos/200',
  'https://picsum.photos/300',
])

const source = ref(undefined)

const sourceOptions = ref({
  url: value.value[0],
  fileFromURL: null,
  file: null,
  blob: null,
  base64: null,
  objectURL: null,
})

async function urlToFile(url, fileName) {
  const blob = await (await fetch(url)).blob()
  return new File([blob], fileName, { type: blob.type })
}

const accept = '.jpg,.jpeg,.png'
const extension = accept.split(',')

const props = ref({
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
})

async function onChooseFile(e) {
  const file = e.target.files[0]
  sourceOptions.value.file = file
  sourceOptions.value.fileFromURL = await urlToFile(value.value[0], '100x100.jpg')
  sourceOptions.value.blob = await fileToBlob(file)
  sourceOptions.value.base64 = await binaryToBase64(file)
  sourceOptions.value.objectURL = URL.createObjectURL(file)
}
</script>

<template>
  <div>
    <el-button @click="show = true">打开</el-button>
    <KiFormDialog
      v-model:show="show"
      :show.sync="show"
      title="KiImageUpload"
      fullscreen
      width="100%"
      append-to-body
    >
      <div>
        <div>
          <el-form
            border="1px solid red"
            display="inline-block"
          >
            <KiImageUpload
              ref="KiImageUploadRef"
              v-model="value"
              v-bind="props"
              @input="onInput"
            >
              <!-- <template #tip="{ dimension, size, count, accept }">
            <div>{{ count }}</div>
            <div>{{ size }}</div>
            <div>{{ dimension }}</div>
            <div>{{ accept }}</div>
          </template> -->
            </KiImageUpload>
          </el-form>
        </div>
      </div>

      <br>
      <div>
        <div
          border="1px solid red"
          display="inline-block"
        >
          <el-form>
            <el-form-item>
              <KiImageUpload />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <br>
      <div>
        <div
          border="1px solid red"
          display="inline-block"
        >
          <KiImageUpload
            v-model="value"
            v-bind="props"
            list-type="text"
            class="custom-trigger"
            mb="8px"
          >
            <el-button>自定义 trigger</el-button>
          </KiImageUpload>
        </div>
      </div>

      <br>
      <div>
        <input
          mb="5px"
          display="!block"
          type="file"
          @change="onChooseFile"
        >
        <el-radio-group v-model="source">
          <el-radio
            v-for="(v, k) in sourceOptions"
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
          display="!block"
          @click="() => {
            $refs.KiImageUploadRef.openEditor(sourceOptions[source])
          }"
        >
          编程式提供数据源
        </el-button>
      </div>

      <br>
      <JsonEditorVue v-model="value" />

      <br>
      <JsonEditorVue v-model="props" />
    </KiFormDialog>
  </div>
</template>

<style lang="scss" scoped>
.custom-trigger {

  :deep(.pic-viewer),
  :deep(.el-upload-list),
  :deep(.el-upload__tip),
  :deep(.el-upload__text) {
    display: none;
  }
}
</style>
