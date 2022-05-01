<template>
  <div>
    <el-button @click="showFormDialog = true">打开FormDialog</el-button>
    只读：
    <el-switch v-model="readonly" />
    全屏：
    <el-switch v-model="fullscreen" />

    <KiFormDialog :fullscreen="fullscreen" :show.sync="showFormDialog" :retrieve="retrieve" :submit="submit"
      title="FormDialog" ref="formDialog" v-model="form" @open="console.log('open')" @opened="console.log('opened')"
      @close="console.log('close')" @closed="console.log('closed')" @validate="console.log('validate')"
      :readonly="readonly" :elFormProps="{
        'labelPosition': 'top',
      }">
      <template #el-form>
        <el-form-item label="Select" required prop="KiSelect[0].value">
          <div class="flex justify-between">
            <!--            <el-select
                          v-model="form.KiSelect[0].value"
                          clearable
                        >
                          <el-option
                            v-for="item in form.KiSelect[0].options"
                            :key="item"
                            :label="item"
                            :value="item"
                          />
                        </el-select>-->
            <KiSelect v-model="form.KiSelect[0].value" :label.sync="form.KiSelect[0].label"
              :index.sync="form.KiSelect[0].index" :options="form.KiSelect[0].options" placeholder="number[]">
              <template v-slot="{ option, index }">
                option: {{ option }}
                index: {{ index }}
              </template>
              <div slot="prefix">pre</div>
              <div slot="empty">empty</div>
            </KiSelect>
            <KiSelect v-model="form.KiSelect[1].value" :label.sync="form.KiSelect[1].label"
              :index.sync="form.KiSelect[1].index" :options="form.KiSelect[1].options" value-key="a" :props="{
                value: null,
                label: 'name',
                labelRight: 'labelRight',
                disabled: '__disabled',
                groupOptions: 'children',
                groupLabel: 'label',
              }" placeholder="labelRight" :search="search" :searchImmediately="true" />
            <KiSelect v-model="form.KiSelect[2].value" :label.sync="form.KiSelect[2].label"
              :index.sync="form.KiSelect[2].index" :options="form.KiSelect[2].options" :props="{
                value: 'a',
                label: ({ name, b }) => `${name}-${b}`,
                labelRight: ({ name, b }) => `${b}-${name}`
              }" placeholder="a/${name}-${b}/labelRight" />
          </div>
          <div class="flex justify-between">
            <div>{{ form.KiSelect[0].value }}</div>
            <div>{{ form.KiSelect[1].value }}</div>
            <div>{{ form.KiSelect[2].value }}</div>
          </div>
          <div class="flex justify-between">
            <div>{{ form.KiSelect[0].label }}</div>
            <div>{{ form.KiSelect[1].label }}</div>
            <div>{{ form.KiSelect[2].label }}</div>
          </div>
          <div class="flex justify-between">
            <div>{{ form.KiSelect[0].index }}</div>
            <div>{{ form.KiSelect[1].index }}</div>
            <div>{{ form.KiSelect[2].index }}</div>
          </div>
        </el-form-item>

        <el-form-item label="Webcam" prop="KiWebcam">
          <el-button @click="showKiWebcam = true">打开摄像头</el-button>
          <KiWebcam :show.sync="showKiWebcam" ref="webCam" />
          <PicViewer :value="$refs.webCam && $refs.webCam.base64" />
        </el-form-item>

        <el-form-item label="CheckAllBox: 对象数组，值为对象的某个属性" prop="CheckAllBox[0].value">
          <KiCheckAllBox v-model="form.CheckAllBox[0].value" :options="form.CheckAllBox[0].options" :props="{
            value: 'id',
            label: 'name'
          }" />
          {{ form.CheckAllBox[0].value }}
        </el-form-item>

        <el-form-item label="CheckAllBox: 对象数组，值为对象本身" prop="CheckAllBox[1].value">
          <KiCheckAllBox v-model="form.CheckAllBox[1].value" :options="form.CheckAllBox[1].options" :props="{
            label: 'name'
          }" />
          {{ form.CheckAllBox[1].value }}
        </el-form-item>

        <el-form-item label="CheckAllBox: 值类型数组" prop="CheckAllBox[2].value" required>
          <KiCheckAllBox v-model="form.CheckAllBox[2].value" :options="form.CheckAllBox[2].options" />
          {{ form.CheckAllBox[2].value }}
        </el-form-item>

        <el-form-item label="PopSwitch" prop="PopSwitch">
          <KiPopSwitch v-model="popSwitch" @click.native="console.log('[PopSwitch] click')"
            :elTooltipProps="{ content: `<i class='el-icon-warning'/> 已停用` }"
            :elPopoverProps="{ content: `<i class='el-icon-warning'/> 权限不足`, disabled: true }"
            :elPopconfirmProps="{ title: '确认启用吗？' }" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="PopButton">
          <KiPopButton @click="console.log('[PopButton] click')"
            :elTooltipProps="{ content: `<i class='el-icon-warning'/> 删除` }"
            :elPopoverProps="{ content: `<i class='el-icon-warning'/> 权限不足`, disabled: true }"
            :elPopconfirmProps="{ title: '确认删除吗？' }">
            删除
          </KiPopButton>
        </el-form-item>

        <el-form-item label="UnivariateTable">
          <KiUnivariateTable title="两列">
            <tr>
              <td>xxx</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>xxx</td>
              <td>xxx</td>
            </tr>
          </KiUnivariateTable>

          <KiUnivariateTable title="四列">
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
          </KiUnivariateTable>
        </el-form-item>

        <el-form-item label="CountdownButton" prop="phone" ref="formItemPhone" required>
          <el-input v-model="form.phone">
            <KiCountdownButton slot="append" @click="send" :cd="3">
              <!--<template v-slot="{remaining}">
                {{ remaining ? `${remaining}s remaining` : `send verification code` }}
              </template>-->
            </KiCountdownButton>
          </el-input>
        </el-form-item>
      </template>
    </KiFormDialog>
  </div>
</template>

<script>
import 'pic-viewer/dist/style.css'
import PicViewer from 'pic-viewer'
import JsonEditorVue from 'json-editor-vue'

export default {
  components: {
    JsonEditorVue,
    PicViewer,
  },
  data() {
    return {
      popSwitch: false,
      showKiWebcam: false,
      form: {
        CheckAllBox: [
          {
            value: [1],
            options: [
              {
                id: 1,
                name: '周一',
              }, {
                id: 2,
                name: '周二',
              }
            ]
          },
          {
            value: [{
              id: 1,
              name: '周一',
            }],
            options: [
              {
                id: 1,
                name: '周一',
              }, {
                id: 2,
                name: '周二',
              }
            ]
          },
          {
            value: ['周一'],
            options: ['周一', '周二'],
          },
        ],
        phone: '',
        KiSelect: [
          {
            value: undefined,
            label: undefined,
            index: undefined,
            options: Array.from(Array(3)).map((e, i) => i + 1),
          }, {
            value: undefined,
            label: undefined,
            index: undefined,
            options: [{
              label: 'label1',
              children: [
                {
                  a: 1,
                  b: 'bbb',
                  labelRight: 'labelRight111',
                  disabled: true,
                  //__disabled: true,
                  name: 'name',
                }, {
                  a: 3,
                  b: 'ccc',
                  labelRight: 'labelRight333',
                  disabled: true,
                  name: '777',
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
            }],
          }, {
            value: undefined,
            label: undefined,
            index: undefined,
            options: [{
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
          },
        ],
      },
      pageSize: 10,
      pageNo: 2,
      console,
      window,
      dateOptions: [
        {
          value: 1,
          label: '周一',
        }, {
          value: 2,
          label: '周二',
        }
      ],
      showFormDialog: true,
      readonly: false,
      fullscreen: false,
    }
  },
  methods: {
    send(e) {
      this.$refs.formItemPhone.elForm.validateField('phone', err => {
        if (err) {
          e.stopPropagation()
        } else {
          // 发送验证码短信
        }
      })
    },
    retrieve() {
      console.log('表格打开之后、获取数据之前')
      return new Promise((resolve, reject) => {
        resolve()
      }).then(() => {
        console.log('获取数据之后')
      })
    },
    submit() {
      console.log('提交之前')
      return new Promise(resolve => {
        setTimeout(resolve, 500)
      }).then(() => {
        console.log('提交之后')
      })
    },
    search(e, isImmediate) {
      console.log('是否为初始调用：', isImmediate)
      return new Promise(resolve => {
        resolve([{
          label: 'label2',
          children: [
            {
              a: 2,
              name: '222',
              b: 'ccc',
              labelRight: 'labelRight222',
            },
          ]
        }])
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
