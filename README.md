<h1 align="center">
  <a href="https://npmjs.com/package/kikimore" target="_blank" rel="noopener noreferrer">
    Kikimore <sup><img alt="version" src="https://img.shields.io/npm/v/kikimore.svg?style=flat-square&color=white&label="></sup>
  </a>
</h1>

<p align="center">
  <img height="28px" src="https://user-images.githubusercontent.com/10731096/95823103-9ce15780-0d5f-11eb-8010-1bd1b5910d4f.png">
  &nbsp;
  <img height="28px" src="https://cdn.rawgit.com/ElemeFE/element/dev/element_logo.svg">
  <br>
  几个 Element Plus (Vue 3) & Element UI (Vue 2.7/2.6) 通用组件的封装。
</p>

<p align="center">
  <a href="https://bundlephobia.com/package/kikimore"><img alt="minzipped size" src="https://img.shields.io/bundlephobia/minzip/kikimore"></a>
  <a href="https://conventionalcommits.org"><img alt="conventional commits" src="https://img.shields.io/badge/commits-Conventional-FE5196.svg?logo=conventionalcommits"></a>
  <a href="https://github.com/antfu/eslint-config"><img alt="code style" src="https://antfu.me/badge-code-style.svg"></a>
  <a href="https://github.com/cloydlau/kikimore#develop"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

<br>

## 安装

```shell
npm i kikimore
```

- Vite

```ts
// vite.config.ts

export default defineConfig({
  optimizeDeps: {
    include: ['kikimore'],
  },
})
```

- Vue CLI

```js
// vue.config.js

module.exports = {
  transpileDependencies: ['kikimore'],
}
```

<br>

### Element Plus (Vue 3)

#### 局部注册

```vue
<script setup>
import { KiFormDialog, KiImage, KiImageUpload, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'
</script>
```

#### 全局注册

```ts
import { createApp, h } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { KiFormDialog, KiImage, KiImageUpload, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'
import App from './App.vue'

const app = createApp(App)
  .use(ElementPlus)
  .use(KiFormDialog, {
    // 全局配置
  })
  .use(KiImage, {
    // 全局配置
  })
  .use(KiImageUpload, {
    // 全局配置
  })
  .use(KiPopButton, {
    // 全局配置
  })
  .use(KiPopSwitch, {
    // 全局配置
  })
  .use(KiSelect, {
    // 全局配置
  })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
```

#### ~~CDN~~

⚠ 暂不支持。

<br>

### Element UI (Vue 2.7/2.6)

#### 局部注册

```vue
<script>
import { KiFormDialog, KiImage, KiImageUpload, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'

export default {
  components: { KiFormDialog, KiImage, KiImageUpload, KiPopButton, KiPopSwitch, KiSelect },
}
</script>
```

#### 全局注册

```ts
import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import { KiFormDialog, KiImage, KiImageUpload, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'
import App from './App.vue'

Vue.use(ElementUI)
Vue.use(FormDialog, {
  // 全局配置
})
Vue.use(KiImage, {
  // 全局配置
})
Vue.use(KiImageUpload, {
  // 全局配置
})
Vue.use(KiPopButton, {
  // 全局配置
})
Vue.use(KiPopSwitch, {
  // 全局配置
})
Vue.use(KiSelect, {
  // 全局配置
})

new Vue({
  render: h => h(App),
}).$mount('#app')
```

#### ~~CDN~~

⚠ 暂不支持。

<br>

## FormDialog

[el-dialog](https://element.eleme.cn/#/zh-CN/component/dialog) + [el-form](https://element.eleme.cn/#/zh-CN/component/form) 组合拳。

### 特性

- 打开对话框自动回显数据，关闭对话框自动重置数据
- 提交、拒绝、重置、全屏一应俱全
- 校验失败时平滑滚动至错误项并震动提示
- 限制高度，无页面级滚动条
- 只读模式
- 支持全局属性、全局事件、全局插槽 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称                                            | 说明                                | 类型     | 默认值      |
|-------------------------------------------------|-----------------------------------|----------|-------------|
| title                                           | 对话框标题                          | string   |             |
| v-model:show (Vue 3) /<br>show.sync (Vue 2)     | 是否显示                            | boolean  | `false`     |
| modelValue (Vue 3) /<br>value (Vue 2) / v-model | 表单数据对象 (`el-form` 的 `model`) | any      |             |
| elFormProps                                     | `el-form` 的属性                    | object   |             |
| retrieve                                        | 读取数据                            | Function |             |
| loading                                         | 读取状态                            | boolean  | `false`     |
| readonly                                        | 是否只读                            | boolean  | `false`     |
| showFullscreenToggle                            | 是否显示全屏开关                    | boolean  | `true`      |
| showConfirmButton                               | 是否显示确认按钮                    | boolean  | `!readonly` |
| confirmButtonText                               | 确认按钮的文案                      | string   | `'OK'`      |
| confirm                                         | 确认                                | Function |             |
| showCancelButton                                | 是否显示取消按钮                    | boolean  | `!readonly` |
| cancelButtonText                                | 取消按钮的文案                      | string   | `'Cancel'`  |
| showDenyButton                                  | 是否显示拒绝按钮                    | boolean  | `false`     |
| denyButtonText                                  | 拒绝按钮的文案                      | string   | `'No'`      |
| deny                                            | 拒绝                                | Function |             |
| showResetButton                                 | 是否显示重置按钮                    | boolean  | `false`     |
| resetButtonText                                 | 重置按钮的文案                      | string   | `'Reset'`   |
| reverseButtons                                  | 是否反转按钮顺序                    | boolean  | `false`     |
| ...                                             | `el-dialog` 的属性                  |          |             |

#### modelValue (Vue 3) / value (Vue 2) / v-model

如果是 plain object 类型，将用于 `el-form` 的 `model`。

`onMounted` 时记录初始值 (与 `el-form-item` 保持一致)，关闭对话框时会重置至初始值。

#### retrieve

```vue
<template>
  <KiFormDialog
    :retrieve="() => {
      // 表格打开之后、获取数据之前
      $POST('xxx').then(() => {
        // 获取数据之后
      })
    }"
  />
</template>
```

#### readonly

开启只读模式时默认不显示确认和取消按钮。

跟 `<el-form disabled />` 的区别是在样式上，更便于用户阅读。

如果希望部分组件不进入禁用状态：

- 单独给这个组件设置 `:disabled="false"`
- 给这部分组件包一层 `<el-form />`

#### confirm

如果返回一个 Promise 实例，则在该 Promise 实例状态终结后对话框才会关闭。

```vue
<template>
  <KiFormDialog
    :confirm="() => {
      // 确认之前
      $POST('xxx').then(() => {
        // 确认之后
      })
    }"
  />
</template>
```

返回 `Promise.reject()` / `Promise.resolve({ show: true })` / `{ show: true }` 时对话框不会关闭。

```vue
<template>
  <KiFormDialog
    :confirm="() => {
      const valid = true
      if (valid) {
        return $POST('xxx')
      }
      else {
        $swal.warning('校验失败')
        return {
          show: true,
        }
      }
    }"
  />
</template>
```

#### deny

如果返回一个 Promise 实例，则在该 Promise 实例状态终结后对话框才会关闭。

```vue
<template>
  <KiFormDialog
    :deny="() => {
      // 确认之前
      $POST('xxx').then(() => {
        // 确认之后
      })
    }"
  />
</template>
```

返回 `Promise.reject()` / `Promise.resolve({ show: true })` / `{ show: true }` 时对话框不会关闭。

```vue
<template>
  <KiFormDialog
    :deny="() => {
      const valid = true
      if (valid) {
        return $POST('xxx')
      }
      else {
        $swal.warning('校验失败')
        return {
          show: true,
        }
      }
    }"
  />
</template>
```

#### reverseButtons

关于 “确定” 和 “取消” 按钮的顺序，可以看看这篇[知乎回答](https://www.zhihu.com/question/20694680/answer/1400624833)。

### Events

| 名称              | 说明                         | 回调参数              |
|-------------------|----------------------------|-----------------------|
| fullscreen-change | 切换全屏状态时触发           | (fullscreen: boolean) |
| ...               | `el-dialog`、`el-form` 的事件 |                       |

### Slots

| 名称 | 说明               |
|------|------------------|
| —    | `el-form` 的内容   |
| ...  | `el-dialog` 的插槽 |

### Exposes

| 名称           | 说明                           | 类型                                                                                                       |
|----------------|------------------------------|------------------------------------------------------------------------------------------------------------|
| highlightError | 平滑滚动至校验失败的表单项     | (selectors: string \| Element \| NodeList = '.el-form .el-form-item.is-error', container = window) => void |
| ...            | 通过 ref 调用 `el-form` 的方法 |                                                                                                            |

### 改变遮罩层定位

```scss
.el-dialog__wrapper, .v-modal {
  position: absolute;
}

// 在原来的基础上减去 navbar + tab 的高度 (以 90px 为例)
.el-dialog {
  .el-dialog__body {
    max-height: calc(100vh - 190px) !important;
  }

  &.is-fullscreen .el-dialog__body {
    max-height: calc(100vh - 135px) !important;
  }
}
```

<br>

## Image

[Viewer.js](https://github.com/fengyuanchen/viewerjs) + [Swiper](https://swiperjs.com) + [node-qrcode](https://github.com/soldair/node-qrcode) 组合拳。

### 特性

- 不依赖 Element，任意 UI 框架中均能使用，支持移动端
- 多样的展示形式：文档流/瀑布流/轮播图/表格嵌套
- 灵活的数据类型：URL/Base64/二维码/[object URL](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#example_using_object_urls_to_display_images)
- 任意绑定值类型
- 局部注册并传参，或全局注册并传参 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称          | 说明                                                  | 类型                                  | 默认值                                                              |
|---------------|-----------------------------------------------------|---------------------------------------|---------------------------------------------------------------------|
| value         | 绑定值                                                | any                                   |                                                                     |
| pattern       | 展示模式（`'waterfall'`, `'swiper'` 或 `'table-cell'`） | string                                | `undefined`（即文档流）                                               |
| srcAt         | 图片 `src` 的位置                                     | string / symbol / (value: any) => any |                                                                     |
| viewerjs      | 是否启用 Viewer.js                                    | boolean                               | `true`                                                              |
| viewerjsProps | Viewer.js 的参数                                      | object                                | `{ zIndex: 5000, zoomRatio: 0.4 }`                                  |
| swiperProps   | Swiper 的参数                                         | object                                | `{ observer: true }`                                                |
| qrcode        | 是否将 `value` 转换为二维码                           | boolean / `'auto'`                    | `false`                                                             |
| qrcodeProps   | node-qrcode 的参数                                    | object                                | `{ margin: 0, errorCorrectionLevel: 'L', width: 444, height: 444 }` |

#### qrcode

如果将 `qrcode` 设为 `'auto'`，KiImage 会自动判断是否需要转换 (`value` 为 Base64 或 URL 时不会转换)。

#### srcAt

用于定位 `value` 中的图片 `src`，适用于绑定值非 `src` 本身的情况。

- 支持属性名，如 `'url'`
- 支持属性路径，如 `'data[0].url'`
- 支持 symbol 类型的属性名
- 支持 Function，如 `({ url }) => url`

### Events

| 名称  | 说明           | 回调参数                     |
|-------|--------------|------------------------------|
| click | 点击图片后触发 | (src: string, index: number) |

### Slots

| 名称     | 说明           |
|--------|--------------|
| 默认插槽 | 自定义图片标签 |

### Exposes

| 名称   | 说明           | 类型   |
|--------|--------------|--------|
| viewer | Viewer.js 实例 | Object |

```html
<KiImage>
  <template #default="{ src, index }">
    <img :src="src">
    <div>第{{ index + 1 }}张</div>
  </template>
</KiImage>
```

通过默认插槽来使用 `el-image`：

```html
<KiImage>
  <template #default="{ src, index }">
    <el-image :src="src"></el-image>
    <div>第{{ index + 1 }}张</div>
  </template>
</KiImage>
```

### 获取 Swiper 实例

```vue
<script setup>
import KiImage from 'ki-image'

const kiImageRef = ref()
</script>

<template>
  <KiImage
    ref="kiImageRef"
    pattern="swiper"
    :swiperProps="{
      on: {
        init: () => {
          $nextTick(() => {
            console.log(kiImageRef.swiper)
          })
        },
      },
    }"
  />
</template>
```

### 二维码清晰度

默认的图片 CSS 高度为 148px (与 `el-upload` 保持一致)，默认的二维码分辨率为 444 × 444 (三倍图)，如果你增大了图片的 CSS 尺寸，将导致图片变模糊。

解决方式：将二维码分辨率设置为展示尺寸的三倍。

```vue
<template>
  <KiImage
    :qrcodeProps="{
      width: 900,
      height: 900,
    }"
  />
</template>

<style lang="scss" scoped>
// Vue 2.6 需要将 :deep 替换为 ::v-deep
:deep(.ki-image) img {
  width: 300px;
  height: 300px;
}
</style>
```

<br>

## ImageUpload

`el-upload` 封装，图片上传一站式解决方案。

### 特性

- 数据双向绑定 `v-model`，支持任意绑定值类型
- 数据源
  - 用户选择本地文件 (File)
  - 编程式提供数据源 (File/Blob/Base64/URL/[object URL](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#example_using_object_urls_to_display_images))
- 编辑图片
  - 格式转换
  - 尺寸指定
  - 品质调节
  - 自由裁剪 & 锁定比例裁剪
  - 翻转、缩放、无级角度旋转
- 限制图片
  - 格式筛选
  - 尺寸或尺寸范围 (间接限制宽高比例)
  - 大小上限、下限
  - 数量上限、下限
  - 自定义校验
- 多选
- 拖拉拽排序
- 预览图片 ([ki-image](https://github.com/cloydlau/ki-image) 提供技术支持)
- 局部注册并传参，或全局注册并传参 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称                 | 说明                             | 类型                                                                            | 默认值      |
|----------------------|--------------------------------|---------------------------------------------------------------------------------|-------------|
| value / v-model      | 绑定值                           | any                                                                             |             |
| arrayed              | 绑定值是否为数组类型，默认自动    | boolean                                                                         |             |
| srcAt                | 图片链接的位置                   | string / symbol / (value: any) => any                                           |             |
| upload               | 调用接口上传图片，返回图片链接    | (output: File \| Blob) => Promise<string \| object> \| string \| object \| void |             |
| count                | 数量限制                         | number / [number?, number?]                                                     |             |
| size                 | 大小限制 (MB)                    | number / [number?, number?]                                                     |             |
| accept               | 图片格式筛选                     | string                                                                          | `'image/*'` |
| outputType           | 图片输出格式 (编辑后)，默认原格式 | string                                                                          |             |
| validator            | 自定义数据源校验器               | (source: File \| Blob \| string) => boolean                                     |             |
| disabled             | 禁用状态                         | boolean                                                                         | `false`     |
| editable             | 是否开启编辑功能                 | boolean                                                                         | `true`      |
| width                | 宽度或宽度范围 (像素)            | number / [number?, number?]                                                     |             |
| height               | 高度或高度范围 (像素)            | number / [number?, number?]                                                     |             |
| aspectRatioTolerance | 锁定裁剪比例的公差               | number                                                                          | `0`         |

#### arrayed

如果数量上限和图片数量均不超过 1，则处于单选状态，否则为多选

默认情况下，在单选时输出的绑定值形如：item，多选时输出的绑定值形如：[item，item]

item 具体是什么格式？

未配置 srcAt 时，会提取图片链接作为 item，配置了则不会

如果将 arrayed 设置为 `true` 则强制输出数组类型，无论单选还是多选

如果将 arrayed 设置为 `false` 则强制输出非数组类型，如果此时图片数量为多个，则会执行 `JSON.stringify`

#### srcAt

用于定位 value 和 upload 返回值中的图片链接，适用于绑定值非图片链接本身的情况

- 支持属性名，如 `'url'`
- 支持属性路径，如 `'data[0].url'`
- 支持 symbol 类型的属性名
- 支持 Function，如 `value => value.url`

#### upload

开启编辑功能时，会在编辑完成后调用，未开启编辑功能时，会在选择图片后调用

未配置或函数返回值为空时，绑定值将输出二进制文件

参数为编辑产物：

用户选择本地文件、编程式提供 File 类型的数据源时，编辑产物的类型为 File

编程式提供非 File 类型的数据源且编辑了图片时，编辑产物的类型为 Blob

未开启编辑功能或未编辑时，编辑产物即输入值

编程式提供 string 类型的数据源且未编辑时，不需要上传，该方法不会被调用

返回值类型为 Promise\<object\> 或 object 时需要配置 srcAt

#### count

- `10`：限制数量上限为 10 张
- `[1]`：限制数量下限为 1 张
- `[, 10]`：限制数量上限为 10 张
- `[1, 10]`：限制数量下限为 1 张，且上限为 10 张

#### size

- `10`：限制大小上限为 10 MB
- `[1]`：限制大小下限为 1 MB
- `[, 10]`：限制大小上限为 10 MB
- `[1, 10]`：限制大小下限为 1 MB，且上限为 10 MB

#### width

- `100`：限制宽度为 100 像素
- `[100]`：限制宽度下限为 100 像素
- `[, 200]`：限制宽度上限为 200 像素
- `[100, 200]`：限制宽度下限 100 像素，且上限为 200 像素

#### height

- `100`：限制高度为 100 像素
- `[100]`：限制高度下限为 100 像素
- `[, 200]`：限制高度上限为 200 像素
- `[100, 200]`：限制高度下限 100 像素，且上限为 200 像素

#### accept

通过文件对话框选择图片时，优先展示指定类型的文件，同[原生 input 的 accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept)

> ⚠ 用户仍可以选择其它类型，文件类型校验应使用 validator

可选值：

- 文件扩展名，不区分大小写，如 `'.jpg.jpeg.png'`
- [MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)，如 `'image/jpeg,image/png'`

#### outputType

开启编辑模式时，可以指定输出的图片格式，可选值参考 [MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)

### Events

| 名称         | 说明                                                  | 回调参数        |
|--------------|-----------------------------------------------------|-----------------|
| size-error   | 未开启编辑模式，且图片大小不符合要求时触发             | 图片体积 (Byte) |
| width-error  | 未开启编辑模式，且图片宽度不符合要求时触发             | 图片宽度 (像素) |
| height-error | 未开启编辑模式，且图片高度不符合要求时触发             | 图片高度 (像素) |
| ...          | `el-upload` 的事件 (Function 类型的属性，去掉 on 前缀) |                 |

```html
<KiImageUpload
  @remove="onRemove"
  @beforeUpload="onBeforeUpload"
/>
```

### Slots

同 `el-upload`

### Exposes

| 名称       | 说明                             | 参数                                                                     |
|------------|--------------------------------|--------------------------------------------------------------------------|
| openEditor | 打开图片编辑对话框               | (source: File \| Blob \| string \| File[] \| Blob[] \| string[]) => void |
| ...        | 通过 ref 调用 `el-upload` 的方法 |                                                                          |

参数为输入的数据源，支持的数据类型有：

- File
- Blob
- Base64
- URL：需要跨域支持
- object URL：需要在当前 `document` 创建

如果没有编辑图片，则输出值类型不变 (与输入值一致)

如果编辑了图片，输入类型为 File 时，输出类型也为 File，其它情况均输出 Blob 类型

如果未开启编辑模式，且限制了图片大小或宽高，则需要 `await openEditor(...)`

### 编程式提供数据源

```vue
<!-- 示例: 输入图片链接进行编辑 -->
<!-- 如果需要附加图片名称，可以先转换为 File 类型再输入 -->

<script setup>
const kiImageUploadRef = ref()

async function urlToFile(url, fileName) {
  const blob = await (await fetch(url)).blob()
  return new File([blob], fileName, { type: blob.type })
}

async function openEditor() {
  const file = urlToFile('https://picsum.photos/100', '100x100.jpg')
  await kiImageUploadRef.value.openEditor(file)
}

function upload(file) {
  return POST.upload(import.meta.env.VITE_APP_UPLOAD_API, {
    file,
  }).then(res => res.data.data)
}
</script>

<template>
  <KiImageUpload
    v-show="false"
    ref="kiImageUploadRef"
    :upload="upload"
  />

  <el-button @click="openEditor">
    编辑图片
  </el-button>
</template>
```

### 校验文件扩展名

```vue
<script setup>
const accept = '.jpg,.jpeg,.png'
const extension = accept.split(',')

function validator(source) {
  let valid = true
  if (source instanceof File) {
    valid = extension.includes(source.name.replace(/.+\./, '.').toLowerCase())
    if (!valid) {
      alert(`"${source.name}" 的格式不在可支持范围: ${accept}`)
    }
  }
  return valid
}
</script>

<template>
  <KiImageUpload
    :accept="accept"
    :validator="validator"
  />
</template>
```

### 输出体积

图片经过编辑后，输出的体积与以下因素相关：

- 原图体积
- 配置或用户设置的图片宽度
- 配置或用户设置的图片高度
- 配置的图片格式
- 用户设置的品质系数

### 上传状态

```vue
<script setup>
const kiImageUploadRef = ref()

console.log(kiImageUploadRef.value.uploading)
</script>

<template>
  <KiImageUpload ref="kiImageUploadRef" />
</template>
```

### 自定义上传时机

1. 不配置 upload，绑定值得到二进制文件
2. 将 srcAt 配置为 `'url'`，使图片能够正常预览
3. 在适当时机自行上传

### 自定义 trigger

```vue
<template>
  <div pb="8px">
    <KiImageUpload
      class="custom-trigger"
      list-type="text"
    >
      <el-button>自定义 trigger</el-button>
    </KiImageUpload>
  </div>
</template>

<style lang="scss" scoped>
// Vue 2.6 需要将 :deep 替换为 ::v-deep
.custom-trigger {
  :deep(.ki-image),
  :deep(.el-upload-list),
  :deep(.el-upload__tip),
  :deep(.el-upload__text) {
    display: none;
  }
}
</style>
```

### 自定义 tip

```vue
<KiImageUpload
  :width="200"
  :height="100"
  :size="10"
  :count="1"
>
  <template #tip="{ count, size, dimension, accept }">
    <div>{{ count }}</div>
    <div>{{ size }}</div>
    <div>{{ dimension }}</div>
    <div>{{ accept }}</div>
  </template>
</KiImageUpload>
```

### 嵌套在表格中

以宽高 `50px` 为例，修改为如下样式：

```scss
// Vue 2.6 需要将 :deep 替换为 ::v-deep

:deep(.ki-image li) {
  margin: 0 !important; // 如果允许多张，则去掉这行

  img {
    height: 50px !important;
  }
}

:deep(.el-upload-list__item) {
  width: 50px;
  height: 50px;
  margin: 0; // 如果允许多张，则去掉这行

  &>.el-upload-list__item-status-label {
    width: 34px;
    height: 18px;

    &>i {
      margin-top: 0;
    }
  }

  .el-upload-list__item-actions {
    line-height: 50px;
    font-size: 16px;

    &>span+span {
      margin-left: 4px;
    }
  }
}

:deep(.el-upload) {
  width: 50px;
  height: 50px;
  line-height: 50px;
  margin: 0;

  &>.el-icon-plus {
    font-size: initial;
  }

  &>.el-upload__text {
    display: none;
  }
}
```

<br>

## PopButton

`el-button` + `el-popconfirm` + `el-popover` + `el-tooltip` 组合拳。

### 特性

- 操作拦截 (`el-popconfirm` 点击确定后才会触发 `click` 事件)
- `el-popover` 和 `el-tooltip` 的 `content` 属性均支持渲染 HTML
- `el-tooltip` 不与 `el-popconfirm`、`el-popover` 冲突
- `el-popconfirm`、`el-popover`、`el-tooltip` 内容为空时，默认不启用
- 支持全局属性、全局事件、全局插槽 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称                        | 说明                                       | 类型    | 默认值  |
|-----------------------------|------------------------------------------|---------|---------|
| elPopconfirmProps           | `el-popconfirm` 的属性                     | object  |         |
| elPopoverProps              | `el-popover` 的属性，支持事件绑定           | object  |         |
| `elPopoverProps.rawContent` | `content` 中的内容是否作为 HTML 字符串处理 | boolean | `false` |
| elTooltipProps              | `el-tooltip` 的属性                        | object  |         |
| `elTooltipProps.rawContent` | `content` 中的内容是否作为 HTML 字符串处理 | boolean | `false` |
| ...                         | `el-button` 的属性                         |         |         |

### Events

`el-popconfirm`、`el-popover` 的事件。

### Slots

| 名称            | 说明                           |
|-----------------|------------------------------|
| tooltip-content | `el-tooltip` 的 `content` 插槽 |
| popover-content | `el-popover` 的 `content` 插槽 |

<br>

## PopSwitch

`el-switch` + `el-popconfirm` + `el-popover` + `el-tooltip` 组合拳。

### 特性

- 操作拦截 (`el-popconfirm` 点击确定后才会触发 `change` 事件)
- 支持内嵌文字描述，宽度自适应
- `el-popover` 和 `el-tooltip` 的 `content` 属性均支持渲染 HTML
- `el-tooltip` 不与 `el-popconfirm`、`el-popover` 冲突
- `el-popconfirm`、`el-popover`、`el-tooltip` 内容为空时，默认不启用
- 支持全局属性、全局事件、全局插槽 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称                        | 说明                                       | 类型    | 默认值  |
|-----------------------------|------------------------------------------|---------|---------|
| inlinePrompt                | 是否内嵌文字描述                           | boolean | `false` |
| elPopconfirmProps           | `el-popconfirm` 的属性                     | object  |         |
| elPopoverProps              | `el-popover` 的属性，支持事件绑定           | object  |         |
| `elPopoverProps.rawContent` | `content` 中的内容是否作为 HTML 字符串处理 | boolean | `false` |
| elTooltipProps              | `el-tooltip` 的属性                        | object  |         |
| `elTooltipProps.rawContent` | `content` 中的内容是否作为 HTML 字符串处理 | boolean | `false` |
| ...                         | `el-switch` 的属性                         |         |         |

### Events

`el-switch`、`el-popconfirm`、`el-popover` 的事件。

### Slots

| 名称            | 说明                           |
|-----------------|------------------------------|
| tooltip-content | `el-tooltip` 的 `content` 插槽 |
| popover-content | `el-popover` 的 `content` 插槽 |

### Exposes

通过 ref 调用 `el-switch` 的方法。

## Select

`el-select` + `el-option` + `el-option-group` 组合拳。

### 特性

- 单向绑定 `label`
- 远程搜索时无需关心 `options` 和 `loading`
- 无匹配选项时展示 `label` (而不是 `value`)
- 多选时支持一键全选
- 支持全局属性、全局事件、全局插槽、全局作用域插槽 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称                                              | 说明                              | 类型                                          | 默认值         |
|---------------------------------------------------|---------------------------------|-----------------------------------------------|----------------|
| modelValue (Vue 3) /<br>value (Vue 2) / v-model   | 绑定值                            | any                                           |                |
| v-model:options (Vue 3) /<br>options.sync (Vue 2) | 选项                              | any[]                                         |                |
| props                                             | 定位选项的各项属性                | object                                        |                |
| search                                            | 远程搜索 (`remote-method` 封装)   | (query: string) =><br>Promise<any[]> \| any[] |                |
| searchImmediately                                 | 是否立即执行远程搜索              | boolean                                       | `true`         |
| v-model:label (Vue 3) /<br>label.sync (Vue 2)     | 绑定值对应的 `label` (单向数据流) | string \| string[]                            |                |
| showSelectAllCheckbox                             | 多选时是否显示全选框              | boolean                                       | `true`         |
| selectAllCheckboxLabel                            | 全选框的文案                      | string                                        | `'Select All'` |
| ...                                               | `el-select` 的属性                |                                               |                |

#### options

默认情况下绑定值将得到选中项的数组元素本身。

可使用 `props.value` 改变此行为 (比如选项的数组元素是 plain object 类型，而绑定值只想要其中某个属性)。

#### props

```ts
interface Props {
  // 定位 option 中的 value
  // 如果是 string 类型，将默认用于 el-select 的 value-key
  'value': string | symbol | ((value: any) => any)
  // 定位 option 中的 label
  'label': string | symbol | ((value: any) => string)
  // 定位 option 中的 disabled
  'disabled': string | symbol | ((value: any) => boolean)
  // 定位 option 中分组的 label
  'groupLabel': string | symbol | ((value: any) => string)
  // 定位 option 中分组的 options
  'groupOptions': string | symbol | ((value: any) => any[])
  // 定位 option 中分组的 disabled
  'groupDisabled': string | symbol | ((value: any) => boolean)
}
```

- 支持属性名，如 `'url'`
- 支持属性路径，如 `'data[0].url'`
- 支持 symbol 类型的属性名
- 支持 Function，如 `value => value.url`

### Events

`el-select` 的事件。

### Slots

| 名称           | 说明                                                               |
|----------------|------------------------------------------------------------------|
| prefix         | `el-select` 的 `prefix` 插槽                                       |
| empty          | `el-select` 的 `empty` 插槽                                        |
| group-prepend  | `el-option-group` 的前置内容                                       |
| group-append   | `el-option-group` 的后置内容                                       |
| —              | `el-option` 的默认插槽，作用域参数为 `{option: any, index: number}` |
| option-prepend | `el-option` 的前置内容，默认内容为全选框                            |
| option-append  | `el-option` 的后置内容                                             |

### Exposes

| 名称         | 说明                                                            | 类型                    |
|--------------|---------------------------------------------------------------|-------------------------|
| remoteMethod | `el-select` 的 `remoteMethod` 属性，自行控制 `search` 时机时使用 | (query: string) => void |
| ...          | 通过 ref 调用 `el-select` 的方法                                |                         |

### 命名

关于 `value` 和 `label` 的命名：

- `value`：这里要表达的含义就是选中目标的 “值”，等同于原生 `<input type="checkbox">` 元素的 `value` 属性，不一定是其唯一标识，所以不应该使用 id 或者 key，且 key 与 Vue 的特殊 attribute 冲突。

- `label`：HTML 中 `<label>` 与 `<input>` 元素相关联，用于对后者进行说明，所以 `label` 天生是用来表达选中目标的 “展示名称” 的，而 ‘name’ 由于与原生 `<input>` 元素的 `name` 属性冲突故不考虑使用 ‘name’。

> Element 本身没有做到命名的统一，`el-select` 中 `label` 表示选项的标签，
> 但 `el-checkbox` 中 `label` 却表示的是选中状态的值。

UI 组件库的标杆 Ant Design 也是使用 `value` 与 `label` 命名。

<br>

## 更新日志

各版本详细改动请参考 [release notes](https://github.com/cloydlau/kikimore/releases)。

<br>
