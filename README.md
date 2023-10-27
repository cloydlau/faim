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
  Element Plus (Vue 3) & Element UI (Vue 2.7/2.6) 一体通用组件库。
  <br>
  ❄️ 不止于 Element。
</p>

<p align="center">
  <a href="https://bundlephobia.com/package/kikimore"><img alt="minzipped size" src="https://img.shields.io/bundlephobia/minzip/kikimore"></a>
  <a href="https://conventionalcommits.org"><img alt="conventional commits" src="https://img.shields.io/badge/commits-Conventional-FE5196.svg?logo=conventionalcommits"></a>
  <a href="https://github.com/antfu/eslint-config"><img alt="code style" src="https://antfu.me/badge-code-style.svg"></a>
  <a href="https://github.com/cloydlau/kikimore#develop"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

<br>

## ⚠ DEPRECATED

- kikimore 已升级至原作者 [cloydlau](https://github.com/cloydlau) 的 [faim](https://github.com/cloydlau/faim)
- 除了 faim 的众多新组件和能力增强以外，为了后续的漏洞修复和迭代优化，建议尽快迁移

<br>

## 特性

- Vue 2.6/2.7/3 一体通用
- Element UI / Element Plus 一体通用
- 支持微前端 ([wujie](https://github.com/Tencent/wujie)，[qiankun](https://github.com/umijs/qiankun)，[single-spa](https://github.com/single-spa/single-spa)...)
- 支持 Vite，Vue CLI，webpack...
- 支持全局属性、全局事件、全局插槽、全局作用域插槽 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

<br>

## 安装

```shell
npm i kikimore
```

### Vite

```ts
// vite.config.ts

export default defineConfig({
  optimizeDeps: {
    include: ['kikimore'],
  },
})
```

### Vue CLI

```js
// vue.config.js

module.exports = {
  transpileDependencies: ['kikimore'],
}
```

### Element Plus (Vue 3)

#### 局部注册

```vue
<script setup>
import { KiFormDialog, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'
</script>
```

#### 全局注册

```ts
import { createApp, h } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { KiFormDialog, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'
import App from './App.vue'

const app = createApp(App)
  .use(ElementPlus)
  .use(KiFormDialog, {
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

### Element UI (Vue 2.7/2.6)

#### 局部注册

```vue
<script>
import { KiFormDialog, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'

export default {
  components: { KiFormDialog, KiPopButton, KiPopSwitch, KiSelect },
}
</script>
```

#### 全局注册

```ts
import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import { KiFormDialog, KiPopButton, KiPopSwitch, KiSelect } from 'kikimore'
import App from './App.vue'

Vue.use(ElementUI)
Vue.use(FormDialog, {
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

| 名称                                               | 说明                                | 类型     | 默认值      |
|----------------------------------------------------|-----------------------------------|----------|-------------|
| title                                              | 对话框标题                          | string   |             |
| v-model:show (Vue 3) /<br>show.sync (Vue 2)        | 是否显示                            | boolean  | `false`     |
| modelValue (Vue 3) /<br>value (Vue 2) /<br>v-model | 表单数据对象 (`el-form` 的 `model`) | any      |             |
| elFormProps                                        | `el-form` 的属性                    | object   |             |
| retrieve                                           | 读取数据                            | Function |             |
| loading                                            | 读取状态                            | boolean  | `false`     |
| readonly                                           | 是否只读                            | boolean  | `false`     |
| showFullscreenToggle                               | 是否显示全屏开关                    | boolean  | `true`      |
| showConfirmButton                                  | 是否显示确认按钮                    | boolean  | `!readonly` |
| confirmButtonText                                  | 确认按钮的文案                      | string   | `'OK'`      |
| confirm                                            | 确认                                | Function |             |
| showCancelButton                                   | 是否显示取消按钮                    | boolean  | `!readonly` |
| cancelButtonText                                   | 取消按钮的文案                      | string   | `'Cancel'`  |
| showDenyButton                                     | 是否显示拒绝按钮                    | boolean  | `false`     |
| denyButtonText                                     | 拒绝按钮的文案                      | string   | `'No'`      |
| deny                                               | 拒绝                                | Function |             |
| showResetButton                                    | 是否显示重置按钮                    | boolean  | `false`     |
| resetButtonText                                    | 重置按钮的文案                      | string   | `'Reset'`   |
| reverseButtons                                     | 是否反转按钮顺序                    | boolean  | `false`     |
| ...                                                | `el-dialog` 的属性                  |          |             |

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

| 名称                                               | 说明                              | 类型                                          | 默认值         |
|----------------------------------------------------|---------------------------------|-----------------------------------------------|----------------|
| modelValue (Vue 3) /<br>value (Vue 2) /<br>v-model | 绑定值                            | any                                           |                |
| v-model:options (Vue 3) /<br>options.sync (Vue 2)  | 选项                              | any[]                                         |                |
| props                                              | 定位选项的各项属性                | object                                        |                |
| search                                             | 远程搜索 (`remote-method` 封装)   | (query: string) =><br>Promise<any[]> \| any[] |                |
| searchImmediately                                  | 是否立即执行远程搜索              | boolean                                       | `true`         |
| v-model:label (Vue 3) /<br>label.sync (Vue 2)      | 绑定值对应的 `label` (单向数据流) | string \| string[]                            |                |
| showSelectAllCheckbox                              | 多选时是否显示全选框              | boolean                                       | `true`         |
| selectAllCheckboxLabel                             | 全选框的文案                      | string                                        | `'Select All'` |
| ...                                                | `el-select` 的属性                |                                               |                |

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
