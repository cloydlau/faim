<template>
  <div>
    <el-button @click="showFormDialog = true">
      打开 FormDialog
    </el-button>
    只读：
    <el-switch v-model="readonly" />
    全屏：
    <KiSelect
      v-model="fullscreen"
      :options="[
        { dataName: '关闭', dataValue: false },
        { dataName: '开启', dataValue: true },
      ]"
      :props="{ label: 'dataName', value: 'dataValue' }"
      :clearable="false"
    />

    <KiFormDialog
      ref="formDialog"
      v-model="form"
      :show.sync="showFormDialog"
      :fullscreen="fullscreen"
      :retrieve="retrieve"
      :confirm="confirm"
      title="FormDialog"
      :readonly="readonly"
      :elFormProps="{
        labelPosition: 'top',
      }"
      @open="console.log('open')"
      @opened="console.log('opened')"
      @close="console.log('close')"
      @closed="console.log('closed')"
      @validate="console.log('validate')"
    >
      <el-form-item
        label="Select"
        required
        prop="KiSelect[0].value"
      >
        <div class="flex justify-between">
          <!-- <el-select
              v-model="form.KiSelect[0].value"
              clearable
            >
              <el-option
                v-for="item in form.KiSelect[0].options"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select> -->
          <KiSelect
            v-model="form.KiSelect[0].value"
            :label.sync="form.KiSelect[0].label"
            :index.sync="form.KiSelect[0].index"
            :options="form.KiSelect[0].options"
            placeholder="number[]"
          >
            <template #default="{ option, index }">
              option: {{ option }}
              index: {{ index }}
            </template>
            <template #prefix>
              pre
            </template>
            <template #empty>
              empty
            </template>
          </KiSelect>
          <KiSelect
            v-model="form.KiSelect[1].value"
            :label.sync="form.KiSelect[1].label"
            :index.sync="form.KiSelect[1].index"
            :options="form.KiSelect[1].options"
            value-key="a"
            :props="{
              value: null,
              label: 'name',
              disabled: '__disabled',
              groupOptions: 'children',
              groupLabel: 'label',
            }"
            placeholder="labelRight"
            :search="search"
            :searchImmediately="true"
          />
          <KiSelect
            v-model="form.KiSelect[2].value"
            :label.sync="form.KiSelect[2].label"
            :index.sync="form.KiSelect[2].index"
            :options="form.KiSelect[2].options"
            :props="{
              value: 'a',
              label: ({ name, b }) => `${name}-${b}`,
              labelRight: ({ name, b }) => `${b}-${name}`,
            }"
            placeholder="a/${name}-${b}/labelRight"
          />
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

      <el-form-item label="PopButton">
        <KiPopButton
          :elTooltipProps="{ content: `<i class='el-icon-warning'/> 删除` }"
          :elPopoverProps="{ content: `<i class='el-icon-warning'/> 权限不足`, disabled: true }"
          :elPopconfirmProps="{ title: '确认删除吗？' }"
          @click="console.log('[PopButton] click')"
        >
          删除
        </KiPopButton>
      </el-form-item>

      <el-form-item
        label="PopSwitch"
        prop="PopSwitch"
      >
        <KiPopSwitch
          v-model="popSwitch"
          :elTooltipProps="{ content: `<i class='el-icon-warning'/> 已停用` }"
          :elPopoverProps="{ content: `<i class='el-icon-warning'/> 权限不足`, disabled: true }"
          :elPopconfirmProps="{ title: '确认启用吗？' }"
          active-text="启用"
          inactive-text="停用"
          @click.native="console.log('[PopSwitch] click')"
        />
      </el-form-item>
    </KiFormDialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      popSwitch: false,
      form: {
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
                  // __disabled: true,
                  name: 'name',
                }, {
                  a: 3,
                  b: 'ccc',
                  labelRight: 'labelRight333',
                  disabled: true,
                  name: '777',
                },
              ],
            }, {
              label: 'label2',
              children: [
                {
                  a: 2,
                  name: '222',
                  b: 'ccc',
                  labelRight: 'labelRight222',
                },
              ],
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
              // __disabled: true,
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
        },
      ],
      showFormDialog: true,
      readonly: false,
      fullscreen: undefined,
    }
  },
  methods: {
    retrieve() {
      console.log('表格打开之后、获取数据之前')
      return new Promise((resolve, reject) => {
        resolve()
      }).then(() => {
        console.log('获取数据之后')
      })
    },
    confirm() {
      console.log('提交之前')
      return new Promise((resolve) => {
        setTimeout(resolve, 500)
      }).then(() => {
        console.log('提交之后')
      })
    },
    search(e, isImmediate) {
      console.log('是否为初始调用：', isImmediate)
      return new Promise((resolve) => {
        resolve([{
          label: 'label2',
          children: [
            {
              a: 2,
              name: '222',
              b: 'ccc',
              labelRight: 'labelRight222',
            },
          ],
        }])
      })
    },
  },
}
</script>
