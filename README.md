# kikimore / 趁手小型组件

::: tip  
所有组件均可具名引入 均可全局注册或局部注册 后文不再赘述
:::

```ts
// 全局引入

import 'kikimore/dist/style.css'
import { PopButton } from 'kikimore'

Vue.use(PopButton, {
  // 全局配置
})
```

```vue
<!-- 局部引入 -->

<template>
  <PopButton v-bind="config"/>
</template>

<script>
import 'kikimore/dist/style.css'
import { PopButton } from 'kikimore'

export default {
  components: { PopButton },
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

**Config rules**

- 双向绑定参数（`v-model`, `*.sync`）仅支持局部配置
- 其余参数均支持全局或局部配置

权重：

- 局部配置高于全局配置
- 对于对象类型的参数 局部配置会与全局配置进行合并 同名属性会被局部配置覆盖

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

```js
retrieve()
{
  // 表格打开之后、获取数据之前
  return request().then(() => {
    // 获取数据之后
  })
}
```

<br>

**submit**

```js
submit()
{
  // 提交之前
  return this.$POST('').then(() => {
    // 提交之后
  })
}
```

提交拦截

```
submit()
{
  if (...) {
    return this.$POST('')
  } else {
    this.$Swal.warning('校验失败')
    return {
      close: false
    }
  }
}
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
  <FormDialog
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
  </FormDialog>
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

    <FormDialog
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
    </FormDialog>
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

## PopSwitch

四个组件的组合拳：`el-switch` + `el-popconfirm` + `el-popover` + `el-tooltip`

### Features

- 如果启用了Popconfirm，则仅在点击了确认后才会触发change事件
- Popconfirm的顶部间隔不再那么违和地高了
- Popover宽度自适应，而不是写死一个最小宽度
- Tooltip非手动控制显隐时，点击开关后会自动关闭，以避免与Popconfirm和Popover冲突
- Popconfirm, Popover, Tooltip的内容为空时，默认不启用
- content属性支持html（但不再支持插槽）

### Props

| Attribute | Description | Type |  Default |
| --- | --- | --- | --- |
| elPopconfirmProps | el-popconfirm属性 | object | |
| elPopoverProps | el-popover属性 | object | |
| elTooltipProps | el-tooltip属性 | object | |
| ... el-switch属性 |

<br>

## PopButton

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

## Selector / 下拉框

[el-select](https://element.eleme.cn/#/zh-CN/component/select) 封装

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| v-model / value | 绑定值 | string, number, object | | |
| label.sync | label双绑 | string, number | | |
| options(.sync) | 选项 | array | | | props |
| ellipsis | 是否限宽并对超长的label作溢出省略处理（默认是超长撑开） | boolean | | false | 
| search | 搜索获取options，（`remote-method` 封装） | function | | |
| searchImmediately | 是否立即执行搜索 | boolean | | true |
| props | 指定对象的属性 | object | | |
| ...el-select属性 |

#### props

```
{
  key: undefined, // 指定options中key的属性名（options为对象数组时有效）
  label: undefined, // 指定options中label的属性名（options为对象数组时有效）
  disabled: 'disabled', // 指定options中disabled的属性名（options为对象数组时有效）
  rightLabel: undefined, // 指定options中右浮label的属性名（options为对象数组时有效）
  groupLabel: undefined, // 指定组名（分组时有效）
  groupOptions: undefined, // 指定子选项组的属性名（分组时有效）
  groupDisabled: 'disabled', // 指定子选项组是否禁用的属性名（分组时有效）
}
```

::: tip  
label, rightLabel均支持以function形式定制返回值
:::

```vue
<!-- 示例 -->

<template>
  <Selector
    :props="{
      label: ({ city, address }) => `${city} - ${address}`,
      rightLabel: ({ x, y }) => `${x + y}`
    }"
  />
</template>
```

### Slots

支持el-select全部slots

```html
<!-- 使用默认插槽自定义选项内容 -->

<Selector>
  <template v-slot="{option}">
    {{ option.name }}
  </template>
</Selector>
```

### object类型

如果options为对象数组且props.key有效时，value将得到选中项对应对象中指定key的值

否则，value将得到选中项对应的数组元素

### 搜索

- 无需操心loading状态
- 清空输入时，自动恢复初值options

```vue
<!-- 异步获取options -->

<template>
  <Selector
    v-model="value"
    :options.sync="options"
    :search="search"
  />
</template>

<script>
export default {
  data () {
    return {
      value: undefined,
      options: [],
    }
  },
  methods: {
    search (value) {
      return new Promise((resolve, reject) => {
        this.$POST('xxx', {
          keyword: value
        }).then(({ data }) => {
          resolve(data)
        })
      })
    }
  }
}
</script>
```

```vue
<!-- 同步获取options -->

<template>
  <Selector
    v-model="value"
    :options.sync="options"
    :search="search"
  />
</template>

<script>
export default {
  data () {
    return {
      value: undefined,
      options: [],
    }
  },
  methods: {
    search (value) {
      return ['1', '2', '3'].filter(v => v === value)
    }
  }
}
</script>
```

### 分组

```vue
<!-- 示例 -->

<Selector
  :props="{
    key: 'code',
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

<br>

## Pagination / 分页

[el-pagination](https://element.eleme.cn/#/zh-CN/component/pagination) 封装

<br>

## FormItemTip / 表单项补充说明

用于表单项的填写规则说明 搭配 [el-form-item](https://element.eleme.cn/#/zh-CN/component/form) 使用

### Slots

```vue
<!-- 默认插槽可以是普通文本 -->

<template>
  <el-form-item>
    <el-input/>
    <form-item-tip>普通文本</form-item-tip>
  </el-form-item>
</template>
```

```vue
<!-- 也可以是html -->

<template>
  <el-form-item>
    <el-input/>
    <form-item-tip>
      <div>html</div>
    </form-item-tip>
  </el-form-item>
</template>
```

<br>

## Swal / 弹框提示

[sweetalert2](https://sweetalert2.github.io/) 封装

::: tip  
Swal只是对最常用的五种场景做了封装 支持只传字符串作为title
:::

```js
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

### 全局注册

```js
import { Swal } from 'kikimore'

Object.defineProperty(Vue.prototype, '$Swal', {
  value: Swal
})
```

### 强制confirm

```js
// 强制状态下无法取消（无取消按钮、点击弹框外部、按下esc键均无效果）
Swal.confirm('同意以继续', true)
```

### 复杂confirm

```js
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

## OnefoldTable / 一维表格

```html

<OnefoldTable title="标题">
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
</OnefoldTable>
```

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| title | 标题 | string | | |

<br>

## CheckAllBox / 支持全选的复选框

```html

<CheckAllBox v-model="date" :options="{
  周一: 1,
  周二: 2
}"/>
```

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| v-model / value | 绑定值 | string / number / boolean | | |
| options | 选项 key即label value即value | object | | |
| ...el-checkbox属性 |

<br>

## SmsButton / 短信验证码按钮

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
      <SmsButton slot="append" @click="send"/>
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

<SmsButton>
  <template v-slot="{remaining}">
    {{ remaining ? `${remaining}s remaining` : `send verification code` }}
  </template>
</SmsButton>
```

<br>

## Camera / 摄像头拍照

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

<Camera @confirm="({ base64, blob, file }) => {

"/>
```

- 通过 `ref` 获取
    - `this.$refs.camera.base64`
    - `this.$refs.camera.blob`
    - `this.$refs.camera.file`
