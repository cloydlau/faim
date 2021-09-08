# kikimore / 趁手小型组件

## Installation

所有组件均支持全局或局部引入

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

## Config Rules

- 双向绑定参数（`v-model`, `*.sync`）仅支持局部配置
- 其余参数均支持全局或局部配置

权重：

- 局部配置高于全局配置
- 对于对象类型的参数 局部配置会与全局配置进行合并 同名属性会被局部配置覆盖

<br>

## Naming Rules

所有组件命名均符合[Vue官方风格指南](https://v3.cn.vuejs.org/style-guide/#%E7%BB%84%E4%BB%B6%E5%90%8D%E4%B8%BA%E5%A4%9A%E4%B8%AA%E5%8D%95%E8%AF%8D%E5%BF%85%E8%A6%81)
指导的 `组件名为多个单词`

::: tip 为什么Swal例外？

1. Swal为 `SweetAlert` 官方示例的缩写，故沿用。
2. Swal是指令式调用的，不会书写在html中，所以不会与其它组件冲突。
   :::

关于 `KiCheckAllBox` 和 `KiSelect` 组件中value和label的命名：

- `value`: 这里要表达的含义就是选中目标的“值”，等同于原生 `<input type="checkbox">` 和 `<select>`
  元素的value属性，不一定是其唯一标识，所以不应该使用id或者key，且key与Vue的特殊attribute冲突

- `label`: html中 `<label>` 与 `<input>` 元素相关联，用于对后者进行说明，所以label天生是用来表达选中目标的“展示名称”的， 而name由于与原生input元素的name属性冲突故不考虑使用name

> `Element` 本身没有做到命名的统一，`el-select` 中label表示选项的标签，
> 但 `el-checkbox` 中label却表示的是选中状态的值

::: tip  
UI组件库的标杆 `Ant Design` 也是使用value与label命名
:::

<br>

## FormDialog / 表单对话框

[el-dialog](https://element.eleme.cn/#/zh-CN/component/dialog)
与 [el-form](https://element.eleme.cn/#/zh-CN/component/form) 的结合 用于表单的展示、填写和提交

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| show.sync | 是否开启 | boolean | | false |
| title | 对话框标题 | string | | |
| readonly | 是否只读 | boolean | | false |
| v-model* | 表单数据对象（即el-form的model） | any | | {} |
| elFormProps | el-form属性 | object | el-form绝大部分参数 | {} |
| retrieve | 获取数据 | function | | |
| submit | 提交 | function | | |
| ...el-dialog属性 |

**v-model**

即使不使用el-form插槽 也建议传入 表单关闭时会将数据对象重置为初始状态（以避免二次打开时显示上一次的value）

<br>

**retrieve**

获取数据前后、提交前后的生命周期都是暴露出来的 如下所示

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
        this.$Swal.warning('校验失败')
        return {
          close: false
        }
      }
    }
  }
}
</script>
```

<br>

::: tip  
submit的返回值如果是一个Promise 则then时默认关闭弹框 而reject时不关闭

注意：如果catch了reject 则reject时也会关闭弹框 这是因为组件内部已无法获知被你捕获的reject

你可以在最后一个then/catch中```return { close: false }```来控制是否关闭弹框

submit没有返回值或者返回值不是Promise时 则submit执行完毕后默认关闭弹框 你可以```return { close: false }```来控制该行为
:::

<br>

### Slots

| name | description |
| --- | --- |
| el-form | el-form |
| ...el-dialog插槽 |

> el-form插槽不是必须的 你可以传任意slot进去 只是提交时不会帮你校验罢了 你可以自行校验

**footer slot 示例**

```vue

<template>
  <KiFormDialog
    :show.sync="form.show"
    ref="formDialog"
  >
    <div slot="footer" class="text-right pt-50px">
      <el-button
        type="primary"
        v-if="formDialog.readonly"
        @click="formDialog.confirm"
        :loading="formDialog.submitting"
      >
        提 交
      </el-button>
      <el-button @click="()=>{form.show=false}">
        取 消
      </el-button>
    </div>
  </KiFormDialog>
</template>

<script>
export default {
  mounted () {
    this.formDialog = this.$refs.formDialog
  },
  data () {
    return {
      formDialog: {}
    }
  },
}
</script>
```

<br>

### Events

| name | description | callback's arguments |
| --- | --- | --- |
| ...el-dialog事件 |
| ...el-form事件 |

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

无论你的观点如何，你可以通过slot自定义footer。

<br>

## PopSwitch / 气泡开关

四个组件的组合拳：`el-switch` + `el-popconfirm` + `el-popover` + `el-tooltip`

### Features

- 如果启用了Popconfirm，则仅在点击了确认后才会触发change事件
- 支持描述内嵌，宽度自适应
- Popconfirm的顶部间隔不再那么违和地高了
- Popover宽度自适应，而不是写死一个最小宽度
- Tooltip非手动控制显隐时，点击开关后会自动关闭，以避免与Popconfirm和Popover冲突
- Popconfirm, Popover, Tooltip的内容为空时，默认不启用
- content属性支持html（但不再支持插槽）

### Props

| Attribute | Description | Type |  Default |
| --- | --- | --- | --- |
| textInside | 是否内嵌描述 | boolean | true |
| elPopconfirmProps | el-popconfirm属性 | object | |
| elPopoverProps | el-popover属性 | object | |
| elTooltipProps | el-tooltip属性 | object | |
| ... el-switch属性 |

<br>

## PopButton / 气泡按钮

四个组件的组合拳：`el-button` + `el-popconfirm` + `el-popover` + `el-tooltip`

### Features

- 如果启用了Popconfirm，则仅在点击了确认后才会触发click事件
- Popconfirm的顶部间隔不再那么违和地高了
- Popover宽度自适应，而不是写死一个最小宽度
- Tooltip非手动控制显隐时，点击按钮后会自动关闭，以避免与Popconfirm和Popover冲突
- Popconfirm, Popover, Tooltip的内容为空时，默认不启用
- content属性支持html（但不再支持插槽）

### Props

| Attribute | Description | Type |  Default |
| --- | --- | --- | --- |
| elPopconfirmProps | el-popconfirm属性 | object | |
| elPopoverProps | el-popover属性 | object | |
| elTooltipProps | el-tooltip属性 | object | |
| ... el-button属性 |

<br>

## Select / 下拉框

[el-select](https://element.eleme.cn/#/zh-CN/component/select) 封装

### Features

- 保留el-select及其子组件的所有特性。
- 不需要自行循环 `el-option`，传options就好。
- 多选时，提供全选按钮（分组时不支持）。
- options的数组元素支持任意类型。
- 用更简单的方式来获取label和index，不需要加ref，不需要判空。
- 用更简单的方式来异步获取options。
- 支持对超长的label作溢出省略处理。

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| v-model / value | 绑定值 | string, number, object | | |
| label.sync | 绑定值的标签 | string, number | | |
| index.sync | 绑定值的数组下标 | number | | |
| options(.sync) | 选项 | { label, value }[] | | |
| props | 指定对象的属性 | object | | |
| search | 搜索获取options，（`remote-method` 封装） | function | | |
| searchImmediately | 是否立即执行搜索 | boolean | | true |
| ellipsis | 是否限宽并对超长的label作溢出省略处理（默认是超长撑开） | boolean | | false |
| ...el-select属性 |

#### props

```
{
  value: undefined, // 指定options中key的属性名（options为对象数组时有效）
  label: undefined, // 指定options中label的属性名（options为对象数组时有效）
  labelRight: undefined, // 指定options中右浮label的属性名（options为对象数组时有效）
  disabled: 'disabled', // 指定options中disabled的属性名（options为对象数组时有效）
  groupLabel: undefined, // 指定组名（分组时有效）
  groupOptions: undefined, // 指定子选项组的属性名（分组时有效）
  groupDisabled: 'disabled', // 指定子选项组是否禁用的属性名（分组时有效）
}
```

```vue
<!-- props中所有属性均支持以function形式定制返回值 -->

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

为避免与value冲突，index仅支持单向数据流（子→父），选中项依然以value为准。

当value在options中没有匹配到对应项时，label也可以正常展示。

::: warning  
分组时，index为组下标。
:::

### Slots

支持el-select全部slots

```html
<!-- 使用默认插槽自定义选项内容 -->

<KiSelect>
  <template v-slot="{option, index}">
    {{ option.name }}
  </template>
</KiSelect>
```

### object类型

如果options是对象数组且props.value是有效的对象键名时，value将得到选中项对应对象中指定value的值

否则，value将得到选中项对应的数组元素

::: warning  
Select默认将props.value用作 `value-key`
options为对象数组且未指定value值时，绑定值将是object类型，此时必须按el-select的要求提供 `value-key`
:::

### 搜索

- 无需操心loading状态
- 清空输入时，自动恢复初始options

```vue
<!-- 异步获取options -->

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
<!-- 双向绑定options -->

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
<!-- 同步获取options -->

<template>
  <KiSelect
    :search="keyword => ['1', '2', '3'].filter(v => v === keyword)"
  />
</template>
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

::: tip  
多选且与el-form搭配时，会出现一开始就触发rule校验的问题（而不是blur或change以后）

这是el-select自身原因导致的，在多选时，el-select会将value初始化为 `[]`

解决方式：给value赋初值 `[]`
:::

<br>

## Webcam / 摄像头拍照

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| show.sync | 是否开启 | boolean | | false |
| count | 拍照数量限制 | number / number[] | | 1 |
| ...el-dialog属性 |

### Events

| name | description | callback's arguments |
| --- | --- | --- |
| ...el-dialog事件 |
| confirm | 点击确认按钮触发 | { base64, blob, file } |

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

## Swal / 弹框提示

[sweetalert2](https://sweetalert2.github.io/) 封装

::: tip  
Swal只是对最常用的五种场景做了封装 支持只传字符串作为title
:::

```ts
import { Swal } from 'kikimore'

const { success, info, warning, error, confirm } = Swal

success('成功')
.then(() => {
  // 关闭时
})

info('提示')
.then(() => {
  // 关闭时
})

warning('警告')
.then(() => {
  // 关闭时
})

error('错误')
.then(() => {
  // 关闭时
})

confirm('确认')
.then(e => {
  // 点击确认
})
.catch(e => {
  if (e.isDenied) {
    // 点击拒绝
  } else if (e.isDismissed) {
    // 点击取消
  }
})
```

### 全局引入

```ts
import { Swal } from 'kikimore'

Object.defineProperty(Vue.prototype, '$Swal', {
  value: Swal
})
```

### 强制confirm

无取消按钮、点击弹框外部、按下esc键均无效果

```ts
// 示例

Swal.confirm({
  titleText: '同意以继续',
  showCancelButton: false,
  allowOutsideClick: false,
  allowEscapeKey: false,
})
```

### 复杂confirm

```ts
// 简单表单 + 三个按钮 + 异步确认的例子

Swal.confirm({
  input: 'text',
  inputAttributes: {
    placeholder: '备注'
  },
  confirmButtonText: `同意`,
  showLoaderOnConfirm: true,
  preConfirm: input => {
    return new Promise(resolve => {
      setTimeout(resolve, 500)
    }).then(() => {
      alert('同意成功')
    }).catch(e => {
      alert('同意失败')
    })
  },
  // 拒绝按钮
  showDenyButton: true,
  denyButtonText: `拒绝`,
  returnInputValueOnDeny: true,
  preDeny: input => {
    if (input) {
      return new Promise((resolve, reject) => {
        setTimeout(reject, 500)
      }).then(() => {
        alert('拒绝成功')
      }).catch(e => {
        alert('拒绝失败')
      })
    } else {
      this.$Swal.showValidationMessage(`请填写备注`)
      return false
    }
  },
}).then(e => {
  alert('同意')
}).catch(e => {
  if (e.isDenied) {
    alert('拒绝')
  } else if (e.isDismissed) {
    alert('取消')
  }
})
```

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

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| title | 标题 | string | | |

<br>

## CheckAllBox / 支持全选的复选框

```html

<KiCheckAllBox v-model="date" :options="{
  周一: 1,
  周二: 2
}"/>
```

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| v-model / value | 绑定值 | string / number / boolean | | |
| options | 选项 | { label, value }[] | | |
| ...el-checkbox属性 |

<br>

## CountdownButton / 倒计时按钮

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| cd | 冷却时间（秒） | number | | 60 |
| ...el-button属性 |

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| click | 点击后触发（返回值需为Promise类型） | |

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
