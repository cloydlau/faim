<template>
  <div class="recursion">
    <div
      v-for="(page, i) of value"
      :key="i"
      :class="{
        'recursion-item': true, 
        'sys-root': page.type === '-1',
        'no-children': !page.children
      }"
    >
      <h3 :id="page.id" :class="['tree-title', page.type !== '-1' ? 'sub-title' : '']">
        <!-- 是否进入子菜单 -->
        <el-checkbox
          v-if="page.label && page.type !== '-1'"
          v-model="page.hasPermission"
          :true-label="1"
          :false-label="0"
          @change="changePageAuth($event, page)"
        >
          {{ page.label }}
        </el-checkbox>
        <template v-else>{{ page.label }}</template>
      </h3>
      <!-- 按钮列表 -->
      <el-checkbox
        v-model="v.hasPermission"
        v-for="(v, i) of page.pageButtonList"
        :key="i"
        :true-label="1"
        :false-label="0"
        @change="changeButtonAuth($event, page)"
      >
        {{ v.name }}
      </el-checkbox>

      <Recursion
        v-model="page.children"
        @enableParentAuth="enableParentAuth(page)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Recursion',
  model: {
    prop: 'value',
    event: 'change'
  },
  /*components: {
    //Treeselect,
    'H': {
      render: function (h) {
        return h(
          'h' + this.$attrs.level,   // 标签名称
          this.$slots.default // 子节点数组
        )
      }
    }
  },*/
  props: ['value'],
  methods: {
    enableParentAuth(page) {
      if(page.type !== '-1') {
        page.hasPermission = 1
        this.$emit('enableParentAuth')
      }
    },
    nodeClick(pageResourceId) {
      let selectedNode = document.getElementById(pageResourceId)
      selectedNode && selectedNode.scrollIntoView({ behavior: 'smooth' })
    },
    changePageAuth(newVal, page) {
      if (newVal) {
        this.$emit('enableParentAuth')
      } else {
        this.changeAllDescendant(page, 0)
      }
    },
    changeAllDescendant(cur, status) {
      const recursion = (cur) => {
        cur.hasPermission = status
        cur.pageButtonList?.map((v) => {
          v.hasPermission = status
        })

        cur.children?.map((v) => {
          recursion(v)
        })
      }

      recursion(cur)
    },
    changeButtonAuth(newVal, page) {
      if (newVal) {
        page.hasPermission = 1
        this.$emit('enableParentAuth')
      }
    }
  }
}
</script>

