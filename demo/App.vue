<script setup>
import { reactive, ref } from 'vue-demi'
import JsonEditorVue from 'json-editor-vue'

const show = ref(true)

const data = reactive({
  value: {
    kiPopSwitch: true,
    elSelect: { a: 1, b: 1 },
    kiSelect: undefined,
    kiSelectLabel: undefined,
  },
})

const console = window.console

const options = reactive({
  elSelect: [
    { a: 2, b: 2 },
    { a: 3, b: 3 },
  ],
  kiSelect: [
    {
      name: '广东省',
      code: '440000',
      children: [
        {
          name: '深圳市',
          code: '440300',
        },
        {
          name: '广州市',
          code: '440100',
        },
      ],
    },
    {
      name: '江苏省',
      code: '320000',
      children: [
        {
          name: '南京市',
          code: '320100',
        },
        {
          name: '苏州市',
          code: '320500',
        },
      ],
    },
  ],
})
</script>

<template>
  <div>
    <el-button @click="show = true">打开</el-button>
    <KiFormDialog
      v-model:show="show"
      v-model="data.value"
      :show.sync="show"
      title="Kikimore"
      fullscreen
      append-to-body
    >
      <p>
        <JsonEditorVue
          v-model="data.value"
          :main-menu-bar="false"
          :navigation-bar="false"
        />
      </p>

      <el-form-item label="KiPopButton">
        <KiPopButton
          :elTooltipProps="{ rawContent: true, content: '删除' }"
          :elPopoverProps="{ content: `权限不足`, disabled: true }"
          :elPopconfirmProps="{ title: '确认删除吗？' }"
          @click="console.log('[KiPopButton] click')"
        >
          删除
        </KiPopButton>
      </el-form-item>

      <el-form-item
        label="KiPopSwitch"
        prop="KiPopSwitch"
      >
        <KiPopSwitch
          v-model="data.value.kiPopSwitch"
          :elTooltipProps="{ rawContent: true, content: '已停用' }"
          :elPopoverProps="{ content: `权限不足` }"
          :elPopconfirmProps="{ title: '确认启用吗？' }"
          active-text="启用"
          inactive-text="停用"
          @change="console.log('[KiPopSwitch] change')"
        />
      </el-form-item>
      {{ data.value.elSelect }}
      <el-form-item
        label="ElSelect"
        prop="elSelect"
      >
        <el-select
          v-model="data.value.elSelect"
          value-key="a"
        >
          <el-option
            v-for="v of options.elSelect"
            :key="v.a"
            :value="v.a"
            :label="v.b"
          />
        </el-select>
      </el-form-item>
      {{ data.value.kiSelect }}
      {{ data.value.kiSelectLabel }}
      <el-form-item
        label="KiSelect"
        prop="kiSelect"
      >
        <KiSelect
          v-model="data.value.kiSelect"
          v-model:label="data.value.kiSelectLabel"
          :options="options.kiSelect"
          :props="{ label: 'name' }"
          value-key="code"
          multiple
        >
          <template #prefix>
            Local Slot
          </template>
          <template #default="{ option }">
            {{ option.name }} (From Local Scoped Slot)
          </template>
        </KiSelect>
        <!-- <KiSelect
            v-model="data.value.kiSelect"
            v-model:label="data.value.kiSelectLabel"
            :options="options.kiSelect"
            :props="{ label: 'name' }"
            value-key="code"
            multiple
          /> -->
      </el-form-item>
    </KiFormDialog>
  </div>
</template>
