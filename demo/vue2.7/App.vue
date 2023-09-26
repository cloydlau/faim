<script setup>
import TestImage from '../TestImage.vue'
import TestImageUpload from '../TestImageUpload.vue'

const show = ref(true)

const console = window.console

const value = reactive({
  elSelect: { a: 1, b: 1 },
  kiSelect: {
    name: 'n',
    code: 'c',
  },
  kiSelectLabel: undefined,
  kiPopSwitch: true,
  showPopper: false,
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
  <div>
    <el-button @click="show = true">打开</el-button>
    <KiFormDialog
      v-model="value"
      :show.sync="show"
      title="FormDialog"
      showResetButton
      width="90%"
    >
      <el-form-item label="Image">
        <TestImage />
      </el-form-item>

      <el-form-item label="ImageUpload">
        <TestImageUpload />
      </el-form-item>

      <el-form-item label="PopButton">
        <KiPopButton
          :elTooltipProps="{ rawContent: true, content: `<i class='el-icon-warning'/> 删除` }"
          :elPopoverProps="{ content: `<i class='el-icon-warning'/> 权限不足`, disabled: true }"
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
          :elTooltipProps="{ rawContent: true, content: `<i class='el-icon-warning'/> 已停用` }"
          :elPopoverProps="{
            'trigger': 'manual',
            'value': value.showPopper,
            '@input': (e) => {
              value.showPopper = e
            },
            'content': `<i class='el-icon-warning'/> 权限不足`,
          }"
          :elPopconfirmProps="{ title: '确认启用吗？', disabled: false }"
          active-text="启用"
          inactive-text="停用"
          @change="console.log('[KiPopSwitch] change')"
        />
        <el-button
          style="margin-left: 1rem;"
          @click="() => {
            value.showPopper = !value.showPopper
          }"
        >
          切换 showPopper
        </el-button>
      </el-form-item>
      <el-form-item
        label="ElSelect"
        prop="elSelect"
      >
        {{ value.elSelect }}
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
      <el-form-item
        label="KiSelect"
        prop="kiSelect"
      >
        {{ value.kiSelect }}
        {{ value.kiSelectLabel }}
        <KiSelect
          v-model="value.kiSelect"
          :label.sync="value.kiSelectLabel"
          :options="options.kiSelect"
          :props="{ label: 'name' }"
          value-key="code"
        >
        <!-- <template #prefix>
          Local Slot
        </template>
        <template #default="{ option, index }">
          {{ option.name }} (From Local Scoped Slot)
        </template> -->
        </KiSelect>
      </el-form-item>
    </KiFormDialog>
  </div>
</template>
