<h1 align="center">
  <a href="https://npmjs.com/package/kikimore" target="_blank" rel="noopener noreferrer">
    Kikimore <sup><img alt="version" src="https://versionbadg.es/cloydlau/kikimore.svg"></sup>
  </a>
</h1>

<p align="center">
  几个 ElementUI 组件的封装。
</p>

<p align="center">
  <a href="https://bundlephobia.com/package/kikimore"><img alt="minzipped size" src="https://img.shields.io/bundlephobia/minzip/kikimore"></a>
  <a href="https://eslint.org"><img alt="code style" src="https://img.shields.io/badge/code_style-ESLint-4B32C3.svg?logo=eslint"></a>
  <a href="https://conventionalcommits.org"><img alt="conventional commits" src="https://img.shields.io/badge/commits-Conventional-FE5196.svg?logo=conventionalcommits&logoColor=white"></a>
</p>

<br>

## 安装

```shell
npm add kikimore
```

### 外置依赖

- vue@2
- element-ui

### 局部注册

```ts
import { FormDialog, PopButton, PopSwitch, Select } from 'kikimore'

export default {
  components: {
    [FormDialog.name]: FormDialog,
    [PopButton.name]: PopButton,
    [PopSwitch.name]: PopSwitch,
    [Select.name]: Select,
  },
}
```

### 全局注册

```ts
import Vue from 'vue'
import { FormDialog, PopButton, PopSwitch, Select } from 'kikimore'

;[
  [FormDialog, {
    // 全局配置
  }],
  [Select, {
    // 全局配置
  }],
  [PopButton, {
    // 全局配置
  }],
  [PopSwitch, {
    // 全局配置
  }]
].map(([component, config]) => {
  Vue.use(FormDialog, config)
})
```

### CDN + ESM

> ⚠ 暂不支持 (ElementUI 未提供 ESM 导出)

### CDN + UMD

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link
    rel="stylesheet"
    href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"
  >
</head>

<body>
  <div id="app">
    <ki-form-dialog></ki-form-dialog>
    <ki-pop-button></ki-pop-button>
    <ki-pop-switch></ki-pop-switch>
    <ki-select></ki-select>
  </div>
  <script src="https://unpkg.com/vue@2"></script>
  <script src="https://unpkg.com/element-ui/lib/index.js"></script>
  <script src="https://unpkg.com/kikimore@0.11"></script>
  <script>
    const { FormDialog, PopButton, PopSwitch, Select } = Kikimore

    new Vue({
      components: {
        [FormDialog.name]: FormDialog,
        [PopButton.name]: PopButton,
        [PopSwitch.name]: PopSwitch,
        [Select.name]: Select,
      },
    }).$mount('#app')
  </script>
</body>

</html>
```

<br>

## 命名风格

所有组件命名均符合 [Vue 官方风格指南](https://v2.cn.vuejs.org/v2/style-guide/#%E7%BB%84%E4%BB%B6%E5%90%8D%E4%B8%BA%E5%A4%9A%E4%B8%AA%E5%8D%95%E8%AF%8D%E5%BF%85%E8%A6%81)
指导的“组件名为多个单词”

关于 KiSelect 组件中 value 和 label 的命名：

- value：这里要表达的含义就是选中目标的 “值”，等同于原生 `<input type="checkbox">` 元素的 value 属性，不一定是其唯一标识，所以不应该使用 id 或者 key，且 key 与 Vue 的特殊 attribute 冲突

- label：html 中 `<label>` 与 `<input>` 元素相关联，用于对后者进行说明，所以 label 天生是用来表达选中目标的 “展示名称” 的，而 name 由于与原生 input 元素的 name 属性冲突故不考虑使用 name

> Element 本身没有做到命名的统一，`el-select` 中 label 表示选项的标签，
> 但 `el-checkbox` 中 label 却表示的是选中状态的值

UI 组件库的标杆 Ant Design 也是使用 value 与 label 命名

<br>

## FormDialog

[el-dialog](https://element.eleme.cn/#/zh-CN/component/dialog) + [el-form](https://element.eleme.cn/#/zh-CN/component/form) 的组合拳。

### 特性

- 打开弹框自动回显数据，关闭弹框自动重置数据
- 校验失败时平滑定位至错误项并震动提示
- 编辑模式 & 只读模式 & 强制确认模式
- 限制高度
- 拒绝按钮
- 全屏开关
- 局部注册 + 局部传参，也可以全局注册 + 全局传参 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称                 | 说明                                 | 类型     | 默认值                                |
| -------------------- | ------------------------------------ | -------- | ------------------------------------- |
| show.sync            | 是否开启                             | boolean  | `false`                               |
| title                | 对话框标题                           | string   |                                       |
| v-model              | 表单数据对象 (即 `el-form` 的 model) | any      |                                       |
| elFormProps          | `el-form` 的 props                   | object   |                                       |
| retrieve             | 获取数据                             | Function |                                       |
| loading              | 加载状态                             | boolean  | 默认由 retrieve 的 `Promise` 状态决定 |
| readonly             | 是否只读                             | boolean  | `false`                               |
| allowClose           | 是否允许直接关闭                     | boolean  | `true`                                |
| showFullscreenButton | 是否显示全屏开关                     | boolean  | `true`                                |
| confirm              | 确认                                 | Function |                                       |
| confirmButtonText    | 确认按钮的文案                       | string   | `'OK'`                                |
| cancelButtonText     | 取消按钮的文案                       | string   | `'Cancel'`                            |
| showDenyButton       | 是否显示拒绝按钮                     | boolean  | `false`                               |
| deny                 | 拒绝                                 | Function |                                       |
| denyButtonText       | 拒绝按钮的文案                       | string   | `'No'`                                |
| reverseButtons       | 是否反转按钮顺序                     | boolean  | `false`                               |
| ...                  | `el-dialog` 的 props                 |          |                                       |

#### elFormProps

⚠ ref、model、labelWidth 不可用。

#### retrieve

```vue
<template>
  <KiFormDialog
    :retrieve="() => {
      // 表格打开之后、获取数据之前
      $POST('').then(() => {
      // 获取数据之后
      })
    }"
  />
</template>
```

#### readonly

跟 `<el-form disabled />` 的区别是在样式上，更方便用户阅读。

如果希望部分组件不进入禁用状态：

- 单独给这个组件设置 `:disabled="false"`
- 给这部分组件包一层 `<el-form />`

#### allowClose

设置为 `false` 时，将仅能通过点击确认或拒绝按钮关闭弹框。

#### confirm

如果返回一个 Promise 实例，则在该 Promise 实例状态终结后弹框才会关闭。

```vue
<template>
  <KiFormDialog
    :confirm="() => {
      // 确认之前
      $POST('').then(() => {
      // 确认之后
      })
    }"
  />
</template>
```

返回 `Promise.reject()` / `Promise.resolve({ show: true })` / `{ show: true }` 时弹框不会关闭。

```vue
<template>
  <KiFormDialog
    :confirm="() => {
      const valid = true
      if (valid) {
        return $POST('')
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

如果返回一个 Promise 实例，则在该 Promise 实例状态终结后弹框才会关闭。

```vue
<template>
  <KiFormDialog
    :deny="() => {
      // 确认之前
      $POST('').then(() => {
      // 确认之后
      })
    }"
  />
</template>
```

返回 `Promise.reject()` / `Promise.resolve({ show: true })` / `{ show: true }` 时弹框不会关闭。

```vue
<template>
  <KiFormDialog
    :deny="() => {
      const valid = true
      if (valid) {
        return $POST('')
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

关于“确定”和“取消”按钮的顺序，可以看看这篇[知乎回答](https://www.zhihu.com/question/20694680/answer/1400624833)。

### Slots

#### footer

为了在自定义 footer 时不至于重写整个逻辑，footer 以作用域插槽的方式提供。

```html
<template #footer="{ close, closing, confirm, confirming }">
  <el-button @click="close" :disabled="closing">
    {{ form.status === 'r' ? '关 闭' : '取 消' }}
  </el-button>
  <el-button type="primary" @click="confirm" :disabled="closing"
    :loading="confirming" v-if="form.status !== 'r'">
    确 定
  </el-button>
</template>
```

### Events

| 名称              | 说明                  | 回调参数              |
| ----------------- | --------------------- | --------------------- |
| fullscreen-change | 切换全屏状态时触发    | (fullscreen: boolean) |
| ...               | `el-dialog` 的 events |                       |
| ...               | `el-form` 的 events   |                       |

### Methods

| 名称           | 说明                       | 参数                                                                                                     |
| -------------- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| highlightError | 平滑滚动至校验失败的表单项 | (selectors: string \| Element \| NodeList = '.el-form .el-form-item.is-error', container = window): void |

### 获取内部的 el-form

- 通过作用域插槽获取

```html
<KiFormDialog>
  <template #default="{ elFormRef }">
    <el-button @click="() => { elFormRef.resetFields() }">
      重置
    </el-button>
  </template>
</KiFormDialog>
```

- 通过 `$refs` 获取

```vue
<template>
  <KiFormDialog ref="kiFormDialogRef" />
</template>

<script setup>
const kiFormDialogRef = ref()
kiFormDialogRef.value.$refs.elFormRef
</script>
```

<br>

## Select

[el-select](https://element.eleme.cn/#/zh-CN/component/select) 封装。

### 特性

- 保留 `el-select` 及其子组件的所有特性
- 不需要自行循环 `el-option`，传 options 就好
- 多选时，提供全选按钮 (分组时不支持)
- options 的数组元素支持任意类型
- 用更简单的方式来获取 label 和 index，不需要加 ref，不需要判空
- 用更简单的方式来异步获取 options
- 局部注册 + 局部传参，也可以全局注册 + 全局传参 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称              | 说明                                   | 类型                   | 默认值 |
| ----------------- | -------------------------------------- | ---------------------- | ------ |
| v-model / value   | 绑定值                                 | string, number, object |        |
| label.sync        | 绑定值的标签 (不支持多选)              | string, number         |        |
| index.sync        | 绑定值的数组下标 (不支持多选)          | number                 |        |
| options(.sync)    | 选项                                   | { label, value }[]     |        |
| props             | 指定对象的属性                         | object                 |        |
| search            | 搜索获取 options，(remote-method 封装) | function               |        |
| searchImmediately | 是否立即执行搜索                       | boolean                | `true` |
| allowSelectAll    | 是否允许全选 (开启多选时)              | boolean                | `true` |
| ...               | `el-select` 的 props                   |                        |        |

#### props

```json
{
  "value": undefined, // 指定 options 中 key 的属性名 (options 为对象数组时有效)
  "label": undefined, // 指定 options 中 label 的属性名 (options 为对象数组时有效)
  "labelRight": undefined, // 指定 options 中右浮 label 的属性名 (options 为对象数组时有效)
  "disabled": "disabled", // 指定 options 中 disabled 的属性名 (options 为对象数组时有效)
  "groupLabel": undefined, // 指定组名 (分组时有效)
  "groupOptions": undefined, // 指定子选项组的属性名 (分组时有效)
  "groupDisabled": "disabled" // 指定子选项组是否禁用的属性名 (分组时有效)
}
```

```vue
<!-- props 中所有属性均支持以 Function 类型 -->

<template>
  <KiSelect
    :props="{
      value: (value, index) => String(index),
      label: ({ city, address }, index) => `${city} - ${address}`,
      labelRight: ({ x, y }, index) => `${x + y}`,
    }"
  />
</template>
```

#### label.sync，index.sync

为避免与 value 冲突，index 仅支持单向数据流 (子 → 父)，选中项依然以 value 为准。

当 value 在 options 中没有匹配到对应项时，label 也可以正常展示。

分组时，index 为组下标。

### Slots

支持 el-select 全部 slots。

```html
<!-- 使用默认插槽自定义选项内容 -->

<KiSelect>
  <template v-slot="{option, index}">
    {{ option.name }}
  </template>
</KiSelect>
```

### JSON 类型

如果 options 是对象数组且 props.value 是有效的对象键名时，value 将得到选中项对应对象中指定 value 的值，

否则，value 将得到选中项对应的数组元素。

Select 默认将 props.value 用作 value-key，
options 为对象数组且未指定 value 值时，绑定值将是 JSON 类型，此时必须按 el-select 的要求提供 value-key。

### 搜索

- 无需操心 loading 状态
- 清空输入时，自动恢复初始 options

```vue
<!-- 异步获取 options -->

<template>
  <KiSelect :search="(name) => $POST('', { name }).then(({ data }) => data)" />
</template>
```

```vue
<!-- 双向绑定 options -->

<template>
  <KiSelect
    :search="(name) => $POST('', { name }).then(({ data }) => data)"
    :options.sync="options"
  />
</template>

<script>
export default {
  data() {
    return {
      options: [],
    }
  },
}
</script>
```

```vue
<!-- 同步获取 options -->

<template>
  <KiSelect
    :search="keyword => ['1', '2', '3'].filter(v => v === keyword)"
  />
</template>
```

```vue
<!-- searchImmediately 为 true 时，search 将在 created 时被调用，可以用 search 方法的第二个参数 isImmediate 来判断是否为初始调用 -->
<!-- 你可以通过如下方式来自定义 search 的调用时机 -->

<template>
  <KiSelect
    ref="kiSelectRef"
    :search="(keyword, isImmediate) => {}"
  />
</template>

<script>
export default {
  watch: {
    x() {
      this.$refs.kiSelectRef.remoteMethod()
    }
  },
  mounted() {
    this.$refs.kiSelectRef.remoteMethod(undefined, true)
  }
}
</script>
```

### 分组

```vue
<!-- 示例 -->

<KiSelect
  :props="{
    value: 'code',
    label: 'name',
    groupLabel: 'name',
    groupOptions: 'children',
  }"
  :options="[
    {
      name: '广东省',
      children: [
        {
          name: '深圳市',
          code: '4403',
        },
        {
          name: '广州市',
          code: '4401',
        },
      ]
    },
    {
      name: '江苏省',
      children: [
        {
          name: '南京市',
          code: '3201',
        },
        {
          name: '苏州市',
          code: '3205',
        },
      ]
    }
  ]"
/>
```

多选且与 `el-form` 搭配时，会出现一开始就触发 rule 校验的问题 (而不是 blur 或 change 以后)，

这是 `el-select` 自身原因导致的，在多选时，`el-select` 会将 value 初始化为 `[]`，

解决方式：给 value 赋初值 `[]`。

<br>

## PopSwitch

`el-switch` + `el-popconfirm` + `el-popover` + `el-tooltip` 的组合拳。

### 特性

- 如果启用了 Popconfirm，则仅在点击了确认后才会触发 change 事件
- 支持描述内嵌，宽度自适应
- Popconfirm 的顶部间隔不再那么违和地高了
- Popover 宽度自适应，而不是写死一个最小宽度
- Tooltip 非手动控制显隐时，点击开关后会自动关闭，以避免与 Popconfirm 和 Popover 冲突
- Popconfirm，Popover，Tooltip 的内容为空时，默认不启用
- content 属性支持 html (但不再支持插槽)
- 局部注册 + 局部传参，也可以全局注册 + 全局传参 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称              | 说明                 | 类型    | 默认值 |
| ----------------- | -------------------- | ------- | ------ |
| textInside        | 是否内嵌描述         | boolean | `true` |
| elPopconfirmProps | `el-popconfirm` 属性 | object  |        |
| elPopoverProps    | `el-popover` 属性    | object  |        |
| elTooltipProps    | `el-tooltip` 属性    | object  |        |
| ...               | `el-switch` 的 props |         |        |

<br>

## PopButton

`el-button` + `el-popconfirm` + `el-popover` + `el-tooltip` 的组合拳。

### 特性

- 如果启用了 Popconfirm，则仅在点击了确认后才会触发 click 事件
- Popconfirm 的顶部间隔不再那么违和地高了
- Popover 宽度自适应，而不是写死一个最小宽度
- Tooltip 非手动控制显隐时，点击按钮后会自动关闭，以避免与 Popconfirm 和 Popover 冲突
- Popconfirm，Popover，Tooltip 的内容为空时，默认不启用
- content 属性支持 html (但不再支持插槽)
- 局部注册 + 局部传参，也可以全局注册 + 全局传参 ([vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持)

### Props

| 名称              | 说明                 | 类型   | 默认值 |
| ----------------- | -------------------- | ------ | ------ |
| elPopconfirmProps | `el-popconfirm` 属性 | object |        |
| elPopoverProps    | `el-popover` 属性    | object |        |
| elTooltipProps    | `el-tooltip` 属性    | object |        |
| ...               | `el-button` 的 props |        |        |

<br>

## 更新日志

各版本详细改动请参考 [release notes](https://github.com/cloydlau/kikimore/releases)。

<br>
