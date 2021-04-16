# kikimore / 趁手小型组件

::: tip  
所有组件均可具名引入 均可全局注册或局部注册 后文不再赘述
:::

```js
import { AuthButton } from 'kikimore'

// 全局注册
Vue.use(AuthButton, {
  // 全局配置
})

// 局部注册
components: {
  AuthButton
}
```

```js
// 局部注册
import { AuthButton } from 'kikimore'

components: {
  AuthButton
}
```

<br/>

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

即使不使用el-form插槽 也建议传入 表单关闭时会将数据对象重置为初始状态（以避免二次打开时显示上次value）

<br/>

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

<br/>

**submit**

```js
submit()
{
  // 提交之前
  return this.POST('').then(() => {
    // 提交之后
  })
}
```

提交拦截

```
submit()
{
  if (...) {
    return this.POST('')
  } else {
    this.warning__('校验失败')
    return {
      close: false
    }
  }
}
```

<br/>

::: tip  
submit的返回值如果是一个Promise 则then时默认关闭弹框 而reject时不关闭

注意：如果catch了reject 则reject时也会关闭弹框 这是因为组件内部已无法获知被你捕获的reject

你可以在最后一个then/catch中```return { close: false }```来控制是否关闭弹框

submit没有返回值或者返回值不是Promise时 则submit执行完毕后默认关闭弹框 你可以```return { close: false }```来控制该行为
:::

<br/>

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
    <div slot="footer" class="footer">
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

<br/>

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
      return this.POST('', {
        id: this.form.data.id
      }).then(({ data }) => {
        this.form.data = data || {}
      })
    },
    submit () {
      return this.POST('', this.form.data)
    },
  }
}
</script>
```

<br/>

## AuthButton / 权限按钮

| Attribute | Description | Configuration Mode | Type |  Default |
| --- | --- | --- | --- | --- |
| name | 文案 | local | string | |
| show | 是否显示 | local, global | boolean, function | false |
| catalog | 目录 | global | object | |
| elPopconfirmProps | el-popconfirm的配置 未配置时默认不开启popconfirm | local, global | object | |
| elTooltipProps | el-tooltip的配置 默认circle为true时开启tooltip | local, global | object | |
| ...el-button属性 |

**show**

show为function时支持返回boolean或者返回promise在promise内resolve一个boolean

> show为function时 参数1为当前组件实例的name属性值

**catalog**

如果同一个name的AuthButton需要多处使用 你可以在catalog中针对这个name进行全局配置

> elPopconfirmProps、elTooltipProps也支持在catalog中使用

默认值：

```
{
  新增: {
    type: 'primary',
    icon: 'el-icon-circle-plus-outline'
  },
  查看: {
    icon: 'el-icon-search',
    circle: true
  },
  编辑: {
    type: 'primary',
    icon: 'el-icon-edit',
    circle: true
  },
  删除: {
    type: 'danger',
    icon: 'el-icon-delete',
    circle: true,
    elPopconfirmProps: {}
  },
  停用: {
    type: 'warning',
    icon: 'el-icon-video-pause',
    circle: true,
    elPopconfirmProps: {}
  },
  启用: {
    type: 'success',
    icon: 'el-icon-video-play',
    circle: true,
    elPopconfirmProps: {}
  },
}
```

- 使用在catalog中定义过的AuthButton

```html

<AuthButton @click="" name="编辑"/>
```

- 未在catalog中定义的AuthButton

```html

<AuthButton @click="" name="" circle type="primary">
  <i class="el-icon-finished"/>
</AuthButton>
```

<br/>

## Selector / 下拉框

[el-select](https://element.eleme.cn/#/zh-CN/component/select) 封装

```html

<Selector
  v-model="list__.query.status"
  :options="['停用', '启用']"
  placeholder="状态"
/>
```

| 参数 | 说明 | 类型 | 可选值 | 默认值 | 配置方式 |
| --- | --- | --- | --- | --- | --- |
| v-model / value | 绑定值 | string, number, object | | | props |
| label.sync | label双绑 | string, number | | | props |
| options(.sync) | 选项 | array | | | props |
| ellipsis | 是否限宽并对超长的label作溢出省略处理（默认是超长撑开） | boolean | | false | props, global |
| search | 搜索方法（即el-select的remote-method） | function | | | props, global |
| immediate | 是否立即执行搜索 | boolean | | true | props, global |
| props* | 指定对象的属性 | object | | | props, global |
| objectValue | 指定value的类型为object（options为对象数组时有效） | boolean | | | props, global |
| ...el-select属性 |

<br/>

**props**

```
{
  key: 'dataValue', // 指定options中key的属性名（options为对象数组时有效）
  label: 'dataName', // 指定options中label的属性名（options为对象数组时有效）
  disabled: 'disabled', // 指定options中disabled的属性名（options为对象数组时有效）
  rightLabel: undefined, // 指定options中右浮label的属性名（options为对象数组时有效）
  searchResponse: 'data', // 指定search方法返回值中数据所在位置（支持路径形式）
}
```

::: tip  
props.label支持模板字符串形式 如 ```'${startTime}-${endTime}'```

场景：label由对象中多个属性构成
:::

<br/>

**search 示例**

- 无需操心loading状态
- 清空输入时 自动恢复初值options

```vue

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
      return this.POST('', {
        keyword: value
      })
    }
  }
}
</script>
```

<br/>

## Pagination / 分页

[el-pagination](https://element.eleme.cn/#/zh-CN/component/pagination) 封装

<br/>

## FormItemTip / 表单项补充说明

用于表单项的填写规则说明 搭配 [el-form-item](https://element.eleme.cn/#/zh-CN/component/form) 使用

```html

<el-form-item>
  <el-input/>
  <form-item-tip>xxx</form-item-tip>
</el-form-item>
```

<br/>

## Tag / 标签

[el-tag](https://element.eleme.cn/#/zh-CN/component/tag) 封装

使用场景：在预设的范围中根据某个动态的值显示其对应的标签

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 值 | any | | |
| options* | 选项 | string, array | | |

options

预设值：

- `'whether'`：是/否
- `'being'`：有/无
- `'status'`：启用/停用
- `'required'`：需要/不需要
- `'auth'`：已授权/未授权

```html

<Tag :value="value" options="whether"/>
```

支持自定义

```html

<Tag :value="0" :options="[
  { 
    value: 0,         // 支持数组 数组以是否包含作为判断依据
    text: '0对应文案', // 即el-tag的innerText
    type: 'danger'    // 即el-tag的type
  },
  { 
    value: 1,
    text: '1对应文案',
    type: 'warning'
  },
]"/>
```

<br/>

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

Vue.use(Swal)

// 之后你可以通过以下方式访问

this.Swal__

this.success__

this.info__

this.warning__

this.error__

this.confirm__
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
      this.Swal__.showValidationMessage(`请填写备注`)
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

<br/>

## QR / 支持蒙层的二维码

```html

<QR :value=""/>
```

如果value的值比较小 而size的值比较大 会导致图片模糊 此时可以增大scale解决：

```html

<QR :value="" :options="{scale:25}"/>
```

> scale指二维码每个黑点占用的px数量 可选值为整数的二次方 如25 36 49 64 81

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 二维码字符串（如果为base64编码 则不经过转换直接展示） | string | | |
| mask-text | 蒙层文案 | string | | |
| size | 宽高（单位px） | string | | 200 |
| options | 底层依赖qrcode的参数 | object | <a>https:// github.com/soldair/node-qrcode</a><OutboundLink/> | {margin:0, scale:16, errorCorrectionLevel:'L'} |

<br/>

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| load | 加载完成后触发 | |
| error | 加载出错后触发 | event |

<br/>

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

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| title | 标题 | string | | |

<br/>

## CheckAllBox / 支持全选的复选框

```html

<CheckAllBox v-model="date" :options="{
  周一: 1,
  周二: 2
}"/>
```

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| v-model / value | 绑定值 | string / number / boolean | | |
| options | 选项 key即label value即value | object | | |
| ...el-checkbox属性 |

<br/>

## AuthTree / 权限编辑树

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| v-model / value | 绑定值 | array | | |

<br/>

## SmsButton / 短信验证码按钮

```vue

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

作用域插槽示例：

```html

<SmsButton>
  <template v-slot="{remaining}">
    {{ remaining ? `${remaining}s remaining` : `send verification code` }}
  </template>
</SmsButton>
```

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| cd | 冷却时间（秒） | number | | 60 |
| ...el-button属性 |

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| click | 点击后触发（返回值需为Promise类型） | |

<br/>

## AudioPlayer / 音乐播放

> 原生audio元素封装

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| show.sync | 是否开启 | boolean | | false |
| src | 音频文件链接 | string | | |
| inline* | 以行内元素的方式显示 | boolean | | false |
| ...audio属性 |

inline

- 默认false表示以弹框形式显示
- 开启后不再需要show参数

<br/>

## VideoPlayer / 视频播放

> 原生video元素封装

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| show.sync | 是否开启 | boolean | | false |
| src | 视频文件链接 | string | | |
| poster | 视频封面图片链接 | string | | |
| inline* | 以行内元素的方式显示 | boolean | | false |
| ...video属性 |

inline

- 默认false表示以弹框形式显示
- 开启后不再需要show参数

<br/>

## Camera / 摄像头拍照

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| show.sync | 是否开启 | boolean | | false |
| count | 拍照数量限制 | number / [number, number] | | 1 |
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
