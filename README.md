# kikimore / 趁手小型组件

## 特性

- 所有组件均支持全局或局部引入
- 所有组件均支持全局或局部参数

<br>

## 安装

![NPM](https://nodei.co/npm/kikimore.png)

```sh
npm add kikimore element-ui
```

```ts
// 全局引入

import 'kikimore/dist/style.css'
import Kikimore from 'kikimore'

Vue.use(Kikimore)
```

```ts
// 全局引入部分组件

import 'kikimore/dist/style.css'
import { FormDialog } from 'kikimore'

Vue.use(FormDialog, {
  // 全局配置
})
```

```vue
<!-- 局部引入 -->

<template>
  <KiPopButton v-bind="config"/>
</template>

<script>
import 'kikimore/dist/style.css'
import { PopButton } from 'kikimore'

export default {
  components: { [PopButton.name]: PopButton },
  data () {
    return {
      config: {
        // 局部配置
      }
    }
  }
}
</script>
```

<br>

## 配置规则

- 双向绑定参数（`v-model`, `*.sync`）仅支持局部配置
- 其余参数均支持全局或局部配置

权重：

- 局部配置高于全局配置
- 对于对象类型的参数 局部配置会与全局配置进行合并 同名属性会被局部配置覆盖

<br>

## 命名风格

所有组件命名均符合[Vue官方风格指南](https://v3.cn.vuejs.org/style-guide/#%E7%BB%84%E4%BB%B6%E5%90%8D%E4%B8%BA%E5%A4%9A%E4%B8%AA%E5%8D%95%E8%AF%8D%E5%BF%85%E8%A6%81)
指导的 `组件名为多个单词`

关于 `KiCheckAllBox` 和 `KiSelect` 组件中 value 和 label 的命名：

- `value`: 这里要表达的含义就是选中目标的“值”，等同于原生 `<input type="checkbox">` 和 `<select>`
  元素的 value 属性，不一定是其唯一标识，所以不应该使用 id 或者 key，且 key 与 Vue 的特殊 attribute 冲突

- `label`: html 中 `<label>` 与 `<input>` 元素相关联，用于对后者进行说明，所以 label 天生是用来表达选中目标的“展示名称”的， 而 name 由于与原生 input 元素的 name 属性冲突故不考虑使用 name

> `Element` 本身没有做到命名的统一，`el-select` 中 label 表示选项的标签，
> 但 `el-checkbox` 中 label 却表示的是选中状态的值

UI 组件库的标杆 `Ant Design` 也是使用 value 与 label 命名

<br>

## FormDialog / 表单对话框

[el-dialog](https://element.eleme.cn/#/zh-CN/component/dialog)
与 [el-form](https://element.eleme.cn/#/zh-CN/component/form) 的结合，用于表单的展示、填写和提交

### Props

| 参数              | 说明                                | 类型     | 可选值               | 默认值                              |
| ----------------- | ----------------------------------- | -------- | -------------------- | ----------------------------------- |
| show.sync         | 是否开启                            | boolean  |                      | false                               |
| title             | 对话框标题                          | string   |                      |                                     |
| readonly          | 是否只读                            | boolean  |                      | false                               |
| v-model           | 表单数据对象（即 el-form 的 model） | any      |                      | {}                                  |
| elFormProps       | el-form 属性                        | object   | el-form 绝大部分参数 | {}                                  |
| retrieve          | 获取数据                            | function |                      |                                     |
| loading           | 加载状态                            | boolean  |                      | 默认由 retrieve 的 Promise 状态决定 |
| submit            | 提交                                | function |                      |                                     |
| ...el-dialog 属性 |

**v-model**

即使不使用 el-form 插槽，也建议传入，表单关闭时会将数据对象重置为初始状态（以避免二次打开时显示上一次的 value）

<br>

**retrieve**

获取数据前后、提交前后的生命周期都是暴露出来的，如下所示

```vue

<script>
export default {
  methods: {
    retrieve () {
      // 表格打开之后、获取数据之前
      return request().then(() => {
        // 获取数据之后
      })
    }
  }
}
</script>
```

<br>

**submit**

```vue

<script>
export default {
  methods: {
    submit () {
      // 提交之前
      return this.$POST('').then(() => {
        // 提交之后
      })
    }
  }
}
</script>
```

提交拦截

```vue

<script>
export default {
  methods: {
    submit () {
      const valid = true
      if (valid) {
        return this.$POST('')
      } else {
        this.$swal.warning('校验失败')
        return {
          show: true,
        }
      }
    }
  }
}
</script>
```

<br>

submit 的返回值如果是一个 Promise，则 then 时默认关闭弹框，而 reject 时不关闭

注意：如果 catch 了 reject，则 reject 时也会关闭弹框，这是因为组件内部已无法获知被你捕获的 reject

你可以在最后一个 then / catch 中 `resolve({ show: true })` 或 `return { show: true }` 来控制是否关闭弹框

submit 没有返回值或者返回值不是 Promise 时，则 submit 执行完毕后默认关闭弹框，你可以 `resolve({ show: true })` 或 `return { show: true }` 来控制该行为

<br>

### Slots

| name             | description |
| ---------------- | ----------- |
| el-form          | el-form     |
| ...el-dialog插槽 |

#### el-form

- 非必须
- 提交前自动校验
- 校验失败后自动平滑滚动至错误的表单项

高度定制化场景：比如你的对话框内有多个 el-form，需要自定义校验，需要自定义平滑滚动的时机

你可以调用 `this.$refs.kiFormDialog.highlightError()` 来平滑滚动至错误的表单项

#### footer

为了便于在自定义 footer 时不至于重写整个 footer 逻辑，footer 被提供为作用域插槽。

```html
<template #footer="{ close, closing, confirm, submitting }">
  <el-button @click="close" :disabled="closing">
    {{ form.status === 'r' ? '关 闭' : '取 消' }}
  </el-button>
  <el-button type="primary" @click="confirm" :disabled="closing"
    :loading="submitting" v-if="form.status !== 'r'">
    确 定
  </el-button>
</template>
```

<br>

### Events

| name              | description | callback's arguments |
| ----------------- | ----------- | -------------------- |
| ...el-dialog 事件 |
| ...el-form 事件   |

### 完整示例

```vue

<template>
  <div>
    <el-button @click="open('id')">打开</el-button>

    <KiFormDialog
      :show.sync="form.show"
      v-model="form.data"
      :retrieve="retrieve"
      :submit="submit"
    >
      <template #el-form>
        <el-form-item prop="a">
          <el-input v-model="form.data.a"/>
        </el-form-item>
      </template>
    </KiFormDialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        show: false,
        data: {}
      }
    }
  },
  methods: {
    open (id) {
      this.form.data.id = id
      this.form.show = true
    },
    retrieve () {
      return this.$POST('', {
        id: this.form.data.id
      }).then(({ data }) => {
        this.form.data = data || {}
      })
    },
    submit () {
      return this.$POST('', this.form.data)
    },
  }
}
</script>
```

### 「确定」和「取消」按钮的左右顺序

可以看看这篇[知乎回答](https://www.zhihu.com/question/20694680/answer/1400624833)。

无论你的观点如何，你可以通过 slot 自定义 footer。

<br>

## PopSwitch / 气泡开关

四个组件的组合拳：`el-switch` + `el-popconfirm` + `el-popover` + `el-tooltip`

### Features

- 如果启用了 Popconfirm，则仅在点击了确认后才会触发 change 事件
- 支持描述内嵌，宽度自适应
- Popconfirm 的顶部间隔不再那么违和地高了
- Popover 宽度自适应，而不是写死一个最小宽度
- Tooltip 非手动控制显隐时，点击开关后会自动关闭，以避免与 Popconfirm 和 Popover 冲突
- Popconfirm, Popover, Tooltip 的内容为空时，默认不启用
- content 属性支持 html（但不再支持插槽）

### Props

| Attribute          | Description        | Type    | Default |
| ------------------ | ------------------ | ------- | ------- |
| textInside         | 是否内嵌描述       | boolean | true    |
| elPopconfirmProps  | el-popconfirm 属性 | object  |         |
| elPopoverProps     | el-popover 属性    | object  |         |
| elTooltipProps     | el-tooltip 属性    | object  |         |
| ... el-switch 属性 |

<br>

## PopButton / 气泡按钮

四个组件的组合拳：`el-button` + `el-popconfirm` + `el-popover` + `el-tooltip`

### Features

- 如果启用了 Popconfirm，则仅在点击了确认后才会触发 click 事件
- Popconfirm 的顶部间隔不再那么违和地高了
- Popover 宽度自适应，而不是写死一个最小宽度
- Tooltip 非手动控制显隐时，点击按钮后会自动关闭，以避免与 Popconfirm 和 Popover 冲突
- Popconfirm, Popover, Tooltip 的内容为空时，默认不启用
- content 属性支持 html（但不再支持插槽）

### Props

| Attribute          | Description        | Type   | Default |
| ------------------ | ------------------ | ------ | ------- |
| elPopconfirmProps  | el-popconfirm 属性 | object |         |
| elPopoverProps     | el-popover 属性    | object |         |
| elTooltipProps     | el-tooltip 属性    | object |         |
| ... el-button 属性 |

<br>

## Select / 下拉框

[el-select](https://element.eleme.cn/#/zh-CN/component/select) 封装

### Features

- 保留 el-select 及其子组件的所有特性。
- 不需要自行循环 `el-option`，传 options 就好。
- 多选时，提供全选按钮（分组时不支持）。
- options 的数组元素支持任意类型。
- 用更简单的方式来获取 label 和 index，不需要加 ref，不需要判空。
- 用更简单的方式来异步获取 options。
- 支持对超长的 label 作溢出省略处理。

### Props

| 参数              | 说明                                                      | 类型                   | 可选值 | 默认值 |
| ----------------- | --------------------------------------------------------- | ---------------------- | ------ | ------ |
| v-model / value   | 绑定值                                                    | string, number, object |        |        |
| label.sync        | 绑定值的标签                                              | string, number         |        |        |
| index.sync        | 绑定值的数组下标                                          | number                 |        |        |
| options(.sync)    | 选项                                                      | { label, value }[]     |        |        |
| props             | 指定对象的属性                                            | object                 |        |        |
| search            | 搜索获取 options，（`remote-method` 封装）                | function               |        |        |
| searchImmediately | 是否立即执行搜索                                          | boolean                |        | true   |
| ellipsis          | 是否限宽并对超长的 label 作溢出省略处理（默认是超长撑开） | boolean                |        | false  |
| ...el-select 属性 |

#### props

```
{
  value: undefined, // 指定 options 中 key 的属性名（options 为对象数组时有效）
  label: undefined, // 指定 options 中 label 的属性名（options 为对象数组时有效）
  labelRight: undefined, // 指定 options 中右浮 label 的属性名（options 为对象数组时有效）
  disabled: 'disabled', // 指定 options 中 disabled 的属性名（options 为对象数组时有效）
  groupLabel: undefined, // 指定组名（分组时有效）
  groupOptions: undefined, // 指定子选项组的属性名（分组时有效）
  groupDisabled: 'disabled', // 指定子选项组是否禁用的属性名（分组时有效）
}
```

```vue
<!-- props 中所有属性均支持以 function 形式定制返回值 -->

<template>
  <KiSelect
    :props="{
      value: (value, index) => String(index),
      label: ({ city, address }, index) => `${city} - ${address}`,
      labelRight: ({ x, y }, index) => `${x + y}`
    }"
  />
</template>
```

### label.sync, index.sync

为避免与 value 冲突，index 仅支持单向数据流（子 → 父），选中项依然以 value 为准。

当 value 在 options 中没有匹配到对应项时，label 也可以正常展示。

分组时，index 为组下标。

### Slots

支持 el-select 全部 slots

```html
<!-- 使用默认插槽自定义选项内容 -->

<KiSelect>
  <template v-slot="{option, index}">
    {{ option.name }}
  </template>
</KiSelect>
```

### object类型

如果 options 是对象数组且 props.value 是有效的对象键名时，value 将得到选中项对应对象中指定 value 的值

否则，value 将得到选中项对应的数组元素

Select 默认将 props.value 用作 `value-key`
options 为对象数组且未指定 value 值时，绑定值将是 object 类型，此时必须按 el-select 的要求提供 `value-key`

### 搜索

- 无需操心 loading 状态
- 清空输入时，自动恢复初始 options

```vue
<!-- 异步获取 options -->

<template>
  <KiSelect
    :search="keyword => new Promise((resolve, reject) => {
      $POST('xxx', {
        keyword
      }).then(({ data }) => {
        resolve(data)
      })
    })"
  />
</template>
```

```vue
<!-- 双向绑定 options -->

<template>
  <KiSelect
    :search="keyword => new Promise((resolve, reject) => {
      $POST('xxx', {
        keyword
      }).then(({ data }) => {
        resolve(data)
      })
    })"
    :options.sync="options"
  />
</template>

<script>
export default {
  data () {
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
    :search="(keyword, isImmediate) => {}"
    ref="kiSelect"
  />
</template>

<script>
export default {
  watch: {
    'x' () {
      this.$refs.kiSelect.remoteMethod()  
    }
  },
  mounted () {
    this.$refs.kiSelect.remoteMethod(undefined, true)
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

多选且与 el-form 搭配时，会出现一开始就触发 rule 校验的问题（而不是 blur 或 change 以后）

这是 el-select 自身原因导致的，在多选时，el-select 会将 value 初始化为 `[]`

解决方式：给 value 赋初值 `[]`

<br>

## Webcam / 摄像头拍照

### Props

| 参数             | 说明         | 类型              | 可选值 | 默认值 |
| ---------------- | ------------ | ----------------- | ------ | ------ |
| show.sync        | 是否开启     | boolean           |        | false  |
| count            | 拍照数量限制 | number / number[] |        | 1      |
| ...el-dialog属性 |

### Events

| name             | description      | callback's arguments   |
| ---------------- | ---------------- | ---------------------- |
| ...el-dialog事件 |
| confirm          | 点击确认按钮触发 | { base64, blob, file } |

### 获取照片

- 通过 `confirm` 事件获取

```html

<KiWebcam @confirm="({ base64, blob, file }) => {

"/>
```

- 通过 `ref` 获取
    - `this.$refs.webcam.base64`
    - `this.$refs.webcam.blob`
    - `this.$refs.webcam.file`

<br>

## UnivariateTable / 一维表格

```html

<KiUnivariateTable title="标题">
  <tr>
    <td>xxx</td>
    <td>xxx</td>
  </tr>
  <tr>
    <td>xxx</td>
    <td>xxx</td>
    <td>xxx</td>
    <td>xxx</td>
  </tr>
</KiUnivariateTable>
```

### Props

| 参数  | 说明 | 类型   | 可选值 | 默认值 |
| ----- | ---- | ------ | ------ | ------ |
| title | 标题 | string |        |        |

<br>

## CheckAllBox / 支持全选的复选框

```html

<KiCheckAllBox v-model="date" :options="[
  {
    value: 1,
    label: '周一',
  },
  {
    value: 2,
    label: '周二',
  },
]"/>
```

### Props

| 参数                 | 说明                   | 类型                      | 可选值 | 默认值 |
| -------------------- | ---------------------- | ------------------------- | ------ | ------ |
| v-model / value      | 绑定值                 | string / number / boolean |        |        |
| options              | 选项                   | { label, value }[]        |        |        |
| props                | 指定对象的属性         | object                    |        |        |
| elCheckboxGroupProps | el-checkbox-group 属性 | object                    |        |        |
| ...el-checkbox属性   |

#### props

```
{
  value: undefined, // 指定 options 中 key 的属性名
  label: undefined, // 指定 options 中 label 的属性名
}
```

<br>

## CountdownButton / 倒计时按钮

### Props

| 参数              | 说明           | 类型   | 可选值 | 默认值 |
| ----------------- | -------------- | ------ | ------ | ------ |
| cd                | 冷却时间（秒） | number |        | 60     |
| ...el-button 属性 |

| 事件  | 说明                                  | 回调参数 |
| ----- | ------------------------------------- | -------- |
| click | 点击后触发（返回值需为 Promise 类型） |          |

```vue
<!-- 示例 -->

<template>
  <el-form-item label="手机号" prop="phone" ref="formItemPhone">
    <el-input v-model="form.phone">
      <KiCountdownButton slot="append" @click="send"/>
    </el-input>
  </el-form-item>
</template>

<script>
export default {
  // 如果发送短信前需要先校验手机号
  methods: {
    send (e) {
      this.$refs.formItemPhone.elForm.validateField('phone', err => {
        if (err) {
          e.stopPropagation()
        } else {
          // 发送验证码短信
        }
      })
    }
  }
}
</script>
```

```html
<!-- 作用域插槽示例 -->

<KiCountdownButton>
  <template v-slot="{remaining}">
    {{ remaining ? `${remaining}s remaining` : `send verification code` }}
  </template>
</KiCountdownButton>
```
