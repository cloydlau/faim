<script setup>
import TestImage from '../TestImage.vue'
import TestImageUpload from '../TestImageUpload.vue'

const console = window.console
const show = ref(true)

const value = reactive({
  kiPopSwitch: true,
  elSelect: { a: 1, b: 1 },
  kiSelect: undefined,
  kiSelectLabel: undefined,
})

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
  <el-button @click="show = true">打开</el-button>
  <KiFormDialog
    v-model="value"
    v-model:show="show"
    :show.sync="show"
    title="FormDialog"
    showResetButton
  >
    <el-form-item label="Image">
      <TestImage />
    </el-form-item>

    <el-form-item label="ImageUpload">
      <TestImageUpload />
    </el-form-item>

    <el-form-item label="PopButton">
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
      label="PopSwitch"
      prop="kiPopSwitch"
    >
      <KiPopSwitch
        v-model="value.kiPopSwitch"
        :elTooltipProps="{ rawContent: true, content: '已停用' }"
        :elPopoverProps="{ content: `权限不足` }"
        :elPopconfirmProps="{ title: '确认启用吗？' }"
        active-text="启用"
        inactive-text="停用"
        @change="console.log('[KiPopSwitch] change')"
      />
    </el-form-item>
    {{ value.elSelect }}
    <el-form-item
      label="ElSelect"
      prop="elSelect"
    >
      <el-select
        v-model="value.elSelect"
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
    {{ value.kiSelect }}
    {{ value.kiSelectLabel }}
    <el-form-item
      label="KiSelect"
      prop="kiSelect"
    >
      <KiSelect
        v-model="value.kiSelect"
        v-model:label="value.kiSelectLabel"
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
        v-model="value.kiSelect"
        v-model:label="value.kiSelectLabel"
        :options="options.kiSelect"
        :props="{ label: 'name' }"
        value-key="code"
        multiple
      /> -->
    </el-form-item>
  </KiFormDialog>
</template>
