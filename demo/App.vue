<template>
  <div>
    <el-button @click="showFormDialog=true">打开FormDialog</el-button>
    只读：
    <el-switch
      v-model="readonly"
    />
    全屏：
    <el-switch
      v-model="fullscreen"
    />

    <FormDialog
      :fullscreen="fullscreen"
      :show.sync="showFormDialog"
      :retrieve="retrieve"
      :submit="submit"
      title="FormDialog"
      ref="formDialog"
      v-model="form"
      @open="console.log('open')"
      @opened="console.log('opened')"
      @close="console.log('close')"
      @closed="console.log('closed')"
      :readonly="readonly"
    >
      只读：
      <el-switch
        v-model="readonly"
      />
      全屏：
      <el-switch
        v-model="fullscreen"
      />
      <template #el-form>
        <el-form-item label="Camera" prop="Camera">
          <el-button @click="showCamera=true">打开摄像头</el-button>
          <Camera
            :show.sync="showCamera"
            ref="camera"
          />
          <PicViewer :value="$refs.camera&&$refs.camera.base64"/>
        </el-form-item>

        <el-form-item label="SweetAlert">
          <el-button-group>
            <el-button @click="$Swal.success().then(() => {console.log('success')})">成功</el-button>
            <el-button @click="$Swal.info('info').then(() => {console.log('info')})">提示</el-button>
            <el-button @click="$Swal.warning('warning').then(() => {console.log('warning')})">警告</el-button>
            <el-button @click="$Swal.error('error').then(() => {console.log('error')})">错误</el-button>
            <el-button
              @click="$Swal.confirm('confirm').then(() => {console.log('确认')}).catch(() => {console.log('取消')})">
              确认
            </el-button>
            <el-button
              @click="asyncConfirmation">
              异步确认
            </el-button>
          </el-button-group>
        </el-form-item>

        <el-form-item label="CheckAllBox" prop="CheckAllBox">
          <CheckAllBox v-model="form.CheckAllBox" :options="dateOptions"/>
          <form-item-tip>
            <div>1. 第一条</div>
            <div>2. 第二条</div>
            innerText
          </form-item-tip>
        </el-form-item>

        <el-form-item label="Selector">
          <div style="display: flex; justify-content: space-between">
            <Selector placeholder="空"/>
            <Selector
              :options="options.index"
              placeholder="number[]"
            >
              <template v-slot="{option}">
                default: {{ option }}
              </template>
              <div slot="prefix">prefix</div>
              <div slot="empty">empty</div>
            </Selector>
            <Selector
              v-model="Selector.value"
              :label.sync="Selector.label"
              :options.sync="options.group"
              :props="{
                key:null,
                label:'name',
                labelRight:'labelRight',
                disabled: '__disabled',
                groupOptions: 'children',
                groupLabel: 'label',
              }"
              placeholder="labelRight"
              :search="search"
              :searchImmediately="false"
            />
            <Selector
              :options="options.obj"
              :props="{
                key:'a',
                label:({name,b})=>`${name}-${b}`,
                rightLabel:({name,b})=>`${b}-${name}`
              }"
              placeholder="a/${name}-${b}/rightLabel"
            />
          </div>
        </el-form-item>

        <el-form-item label="PopSwitch" prop="PopSwitch">
          <PopSwitch
            v-model="popSwitch"
            @click.native="console.log('[PopSwitch] click')"
            :elTooltipProps="{content:`<i class='el-icon-warning'/> 已停用`}"
            :elPopoverProps="{content:`<i class='el-icon-warning'/> 权限不足`,disabled:false}"
            :elPopconfirmProps="{title:'确认启用吗？',disabled:true}"
          />
        </el-form-item>

        <el-form-item label="PopButton" prop="PopButton">
          <PopButton
            @click="console.log('[PopButton] click')"
            :elTooltipProps="{content:`<i class='el-icon-warning'/> 删除`}"
            :elPopoverProps="{content:`<i class='el-icon-warning'/> 权限不足`,disabled:true}"
            :elPopconfirmProps="{title:'确认删除吗？'}"
          >
            删除
          </PopButton>
        </el-form-item>

        <el-form-item label="OnefoldTable">
          <OnefoldTable title="两列">
            <tr>
              <td>xxx</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>xxx</td>
              <td>xxx</td>
            </tr>
          </OnefoldTable>

          <OnefoldTable title="四列">
            <tr>
              <td>xxx</td>
              <td>xxx</td>
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
        </el-form-item>

        <el-form-item label="Pagination">
          <Pagination
            :total="99"
            :currentPage.sync="pageNo"
            :page-size.sync="pageSize"
            @size-change="e=>{console.log('size-change: '+e)}"
            @prev-click="e=>{console.log('prev-click: '+e)}"
            @next-click="e=>{console.log('next-click: '+e)}"
            @current-change="e=>{console.log('current-change: '+e)}"
          />
          pageSize:
          <el-input-number v-model="pageSize" style="width: 180px;"/>
        </el-form-item>

        <el-form-item label="手机号" prop="phone" ref="formItemPhone" required>
          <el-input v-model="form.phone">
            <SmsButton slot="append" @click="send" :cd="3">
              <!--<template v-slot="{remaining}">
                {{ remaining ? `${remaining}s remaining` : `send verification code` }}
              </template>-->
            </SmsButton>
          </el-input>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script>
import {
  SmsButton,
  CheckAllBox,
  OnefoldTable,
  Swal,
  FormDialog,
  Selector,
  FormItemTip,
  PopButton,
  Pagination,
  Camera,
  PopSwitch,
} from '../src/main'

import Vue from 'vue'
Vue.prototype.$Swal = Swal

Vue.use(Selector, {
  props: {
    key: 'a'
  }
})

import PicViewer from 'pic-viewer'
import JsonEditorVue from 'json-editor-vue'

export default {
  components: {
    PicViewer,
    Camera,
    FormDialog,
    SmsButton,
    CheckAllBox,
    OnefoldTable,
    //Selector,
    FormItemTip,
    PopButton,
    Pagination,
    PopSwitch,
    JsonEditorVue
  },
  data () {
    return {
      popSwitch: false,
      showCamera: false,
      form: {
        phone: ''
      },
      Selector: {
        value: undefined,
        label: undefined
      },
      Swal,
      pageSize: 10,
      pageNo: 2,
      console,
      window,
      options: {
        index: Array.from(Array(3)).map((e, i) => i + 1),
        obj: [{
          a: 1,
          b: 'bbb',
          labelRight: 'labelRight111',
          disabled: true,
          //__disabled: true,
          name: 'name',
        }, {
          a: 2,
          name: '222',
          b: 'ccc',
          labelRight: 'labelRight222',
        }],
        group: [{
          label: 'label1',
          children: [
            {
              a: 1,
              b: 'bbb',
              labelRight: 'labelRight111',
              disabled: true,
              //__disabled: true,
              name: 'name',
            },
          ]
        }, {
          label: 'label2',
          children: [
            {
              a: 2,
              name: '222',
              b: 'ccc',
              labelRight: 'labelRight222',
            },
          ]
        }]
      },
      dateOptions: {
        周一: 1,
        周二: 2
      },
      showFormDialog: true,
      readonly: false,
      fullscreen: false,
    }
  },
  methods: {
    asyncConfirmation () {
      this.$Swal.confirm({
        title: '异步确认',
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
    },
    send (e) {
      this.$refs.formItemPhone.elForm.validateField('phone', err => {
        if (err) {
          e.stopPropagation()
        } else {
          // 发送验证码短信
        }
      })
    },
    retrieve () {
      console.log('表格打开之后、获取数据之前')
      return new Promise((resolve, reject) => {
        resolve()
      }).then(() => {
        console.log('获取数据之后')
      })
    },
    submit () {
      console.log('提交之前')
      return new Promise(resolve => {
        setTimeout(resolve, 500)
      }).then(() => {
        console.log('提交之后')
      })
    },
    search (e) {
      return new Promise(resolve => {
        resolve([...this.options.group, ...this.options.group])
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
