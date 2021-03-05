<template>
  <div>
    <el-button @click="showFormDialog=true">打开FormDialog</el-button>

    <FormDialog
      :show.sync="showFormDialog"
      :retrieve="retrieve"
      :submit="submit"
      title="FormDialog"
      ref="formDialog"
      @open="console.log('open')"
      @opened="console.log('opened')"
      @close="console.log('close')"
      @closed="console.log('closed')"
    >
      <template #el-form>
        <el-form-item label="SweetAlert">
          <el-button-group>
            <el-button @click="success__().then(() => {window.alert('success')})">成功</el-button>
            <el-button @click="info__('info').then(() => {window.alert('info')})">提示</el-button>
            <el-button @click="warning__('warning').then(() => {window.alert('warning')})">警告</el-button>
            <el-button @click="error__('error').then(() => {window.alert('error')})">错误</el-button>
            <el-button
              @click="confirm__('confirm').then(() => {window.alert('确认')}).catch(() => {window.alert('取消')})">
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
            <Selector/>
            <Selector
              :options="options.index"
              placeholder="number[]"
            />
            <Selector
              v-model="Selector.value"
              :label.sync="Selector.label"
              :options.sync="options.obj"
              :props="{
                key:'a',
                label:'name',
                rightLabel:'rightLabel',
                disabled: '__disabled'
              }"
              placeholder="rightLabel"
              :search="search"
              :immediate="false"
              :object-value="false"
            />
            <Selector
              :options="options.obj"
              :props="{
                key:'a',
                label:'${name}---${b}',
                rightLabel:'rightLabel'
              }"
              placeholder="a/${name}---${b}/rightLabel"
            />
          </div>
        </el-form-item>

        <el-form-item label="AuthButton" prop="AuthButton">
          <AuthButton
            name="test"
            @click="console.log('[AuthButton] click')"
            :elPopconfirmProps="{}"
            show
            circle
          />
        </el-form-item>

        <el-form-item label="AuthTree" prop="AuthTree">
          <AuthTree v-model="form.AuthTree"/>
        </el-form-item>

        <el-form-item label="SmsButton" prop="SmsButton">
          <el-input v-model="form.SmsButton">
            <SmsButton slot="append" @click="send($event)"/>
          </el-input>
        </el-form-item>

        <el-form-item label="Tag">
          <Tag :value="1" :options="'being'"/>
        </el-form-item>

        <el-form-item label="QR">
          <QR value="123123" @load="()=>{console.log('qr loaded')}"/>
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

        <el-form-item label="AudioPlayer">
          <el-button @click="showAudioPlayer=true">音乐播放器</el-button>
          <AudioPlayer :show.sync="showAudioPlayer" :src="showAudioPlayerSrc"/>
        </el-form-item>

        <el-form-item label="AudioPlayer(inline)">
          <AudioPlayer inline :src="showAudioPlayerSrc"/>
        </el-form-item>

        <el-form-item label="VideoPlayer">
          <el-button @click="showVideoPlayer=true">视频播放器</el-button>
          <VideoPlayer :show.sync="showVideoPlayer" :src="videoPlayerSrc" :poster="poster"/>
        </el-form-item>

        <el-form-item label="VideoPlayer(inline)">
          <VideoPlayer inline :src="videoPlayerSrc" :poster="poster"/>
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

        <el-form-item label="SvgIcon">
          <SvgIcon icon-class="avatar"/>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script>
import {
  SmsButton,
  QR,
  CheckAllBox,
  OnefoldTable,
  VideoPlayer,
  AudioPlayer,
  AuthTree,
  Swal,
  FormDialog,
  Selector,
  FormItemTip,
  AuthButton,
  Tag,
  Pagination,
} from '../src/main'

import Vue from 'vue'
Vue.use(Swal)

export default {
  components: {
    FormDialog,
    SmsButton,
    QR,
    CheckAllBox,
    OnefoldTable,
    VideoPlayer,
    AudioPlayer,
    AuthTree,
    Selector,
    FormItemTip,
    AuthButton,
    Tag,
    Pagination,
  },
  data () {
    return {
      form: {},
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
          name: '111',
          b: 'bbb',
          rightLabel: 'rightLabel111',
          disabled: true,
          //__disabled: true,
        }, {
          a: 2,
          name: '222',
          b: 'ccc',
          rightLabel: 'rightLabel222'
        }]
      },
      showAudioPlayer: false,
      showAudioPlayerSrc: '',
      showVideoPlayer: false,
      videoPlayerSrc: '',
      poster: '',
      dateOptions: {
        周一: 1,
        周二: 2
      },
      showFormDialog: true,
    }
  },
  methods: {
    asyncConfirmation () {
      this.confirm__({
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
    },
    send (e) {
      this.$refs.formDialog.$refs.elForm.validateField('SmsButton', err => {
        if (err) {
          // 不开始计时
          e.stopPropagation()
        } else {
          // 调用短信接口
        }
      })
    },
    retrieve () {
      console.log('表格打开之后、获取数据之前')
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.form.AuthTree = [
            {
              label: '子系统',
              type: '-1',
              children: [{
                children: [
                  {
                    children: null,
                    hasPermission: true,
                    label: 'a21',
                    id: 'a21',
                    type: '1',
                    pageButtonList: [
                      {
                        hasPermission: false,
                        name: '新增',
                        type: '2',
                      },
                      {
                        hasPermission: false,
                        name: '新增',
                        type: '2',
                      }
                    ],
                    parentId: null,
                  }, {
                    type: '1',
                    children: null,
                    hasPermission: true,
                    label: 'a22',
                    id: 'a22',
                    pageButtonList: null,
                    parentId: null,
                  },
                ],
                hasPermission: true,
                label: 'a2',
                id: 'a2',
                pageButtonList: null,
                parentId: null,
                type: '0'
              }]
            }, {
              children: null,
              hasPermission: true,
              label: 'a1',
              id: 'a1',
              pageButtonList: null,
              parentId: null,
              type: '0'
            },
          ]
          resolve()
        }, 500)
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
        resolve({
          data: [
            {
              a: 3,
              name: '333',
              b: 'xxx',
              rightLabel: 'rlxxx'
            }, {
              a: 4,
              name: '444',
              b: 'zzz',
              rightLabel: 'rlzzz'
            }
          ]
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  width: 875px;
}
</style>
