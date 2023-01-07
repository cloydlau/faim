<template>
  <KiFormDialog
    v-model="value"
    show
    title="FormDialog"
    showResetButton
  >
    <el-form-item label="PopButton">
      <KiPopButton
        :elTooltipProps="{ rawContent: true, content: `<i class='el-icon-warning'/> 删除` }"
        :elPopoverProps="{ content: `<i class='el-icon-warning'/> 权限不足`, disabled: true }"
        :elPopconfirmProps="{ title: '确认删除吗？' }"
        @click="console.log('[PopButton] click')"
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
        :elPopoverProps="{ content: `<i class='el-icon-warning'/> 权限不足`, disabled: true }"
        :elPopconfirmProps="{ title: '确认启用吗？' }"
        active-text="启用"
        inactive-text="停用"
      />
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
      />
    </el-form-item>
    <!-- <el-form-item
      label="KiUpload"
      prop="kiUpload"
    >
      <KiUpload v-model="value.kiUpload" aspectRatio="1/1" />
    </el-form-item> -->
    <!-- <el-form-item
      label="KiImage"
      prop="kiImage"
    >
      <KiImage :value="value.kiImage" />
    </el-form-item> -->
    <!-- <el-form-item
      label="KiMap"
      prop="kiMap"
    >
      <KiMap :show.sync="value.kiMap" />
      <el-button @click="() => { value.kiMap = true }">
        打开 KiMap
      </el-button>
    </el-form-item> -->
  </KiFormDialog>
</template>

<script setup>
const console = window.console

const value = reactive({
  elSelect: { a: 1, b: 1 },
  kiSelect: {
    name: 'n',
    code: 'c',
  },
  kiSelectLabel: undefined,
  kiPopSwitch: true,
  // kiUpload: 'https://picsum.photos/100',
  // kiImage: 'https://picsum.photos/100',
  // kiMap: false,
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
