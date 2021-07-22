<template>
  <el-select
    v-model="value__"
    :loading="loading"
    v-bind="elSelectProps"
    @change="onChange"
    ref="elSelect"
  >
    <template v-if="Props.groupOptions&&Props.groupLabel">
      <el-option-group
        v-for="group of options"
        :key="uuidv1()"
        :label="group[Props.groupLabel]"
        :disabled="group[Props.groupDisabled]"
      >
        <el-option
          v-for="v in group[Props.groupOptions]"
          :key="uuidv1()"
          :value="valueComesFromObject?v[Key]:v"
          :label="getLabel(v)"
          :disabled="v[Props.disabled]"
        >
          <slot v-if="$scopedSlots.default" :option="v"/>
          <template v-else>
            <el-tooltip
              :disabled="!Ellipsis"
              effect="dark"
              :content="getLabel(v)"
              placement="right"
            >
              <span class="label-left" :ref="'leftLabel'+(Label?v[Key]:v)">{{ getLabel(v) }}</span>
            </el-tooltip>
            <span class="label-right">{{ getRightLabel(v) }}</span>
          </template>
        </el-option>
      </el-option-group>
    </template>

    <template v-else>
      <el-option
        v-for="v in options"
        :key="uuidv1()"
        :value="valueComesFromObject?v[Key]:v"
        :label="getLabel(v)"
        :disabled="v[Props.disabled]"
      >
        <slot v-if="$scopedSlots.default" :option="v"/>
        <template v-else>
          <el-tooltip
            :disabled="!Ellipsis"
            effect="dark"
            :content="getLabel(v)"
            placement="right"
          >
            <span class="label-left" :ref="'leftLabel'+(valueComesFromObject?v[Key]:v)">{{ getLabel(v) }}</span>
          </el-tooltip>
          <span class="label-right">{{ getRightLabel(v) }}</span>
        </template>
      </el-option>
    </template>

    <template v-for="(v,k) in ScopedSlots" v-slot:[k]>
      <slot :name="k"/>
    </template>
  </el-select>
</template>

<script>
import { typeOf, isEmpty } from 'kayran'
import globalProps from './config'
import { getFinalProp } from '../../utils'
import { v1 as uuidv1 } from 'uuid'

export default {
  name: 'Selector',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {},
    label: {},
    options: {
      validator: value => ['null', 'array'].includes(typeOf(value)),
    },
    props: Object,
    placeholder: String,
    ellipsis: {
      // 不能用type 因为type为Boolean时 如果用户没传 默认值为false而不是undefined 会影响getFinalProp的判断
      validator: value => value === '' || ['boolean'].includes(typeOf(value)),
    },
    search: Function,
    searchImmediately: {
      validator: value => value === '' || ['boolean'].includes(typeOf(value)),
    }
  },
  computed: {
    itemTypeIsObject () {
      return typeof this.options?.[0] === 'object'
    },
    valueComesFromObject () {
      if (['symbol', 'string', 'number', 'null'].includes(typeOf(this.Key))) {
        if (isEmpty(this.Key)) {
          return false
        } else {
          return this.itemTypeIsObject
        }
      } else {
        throw Error(`${import.meta.env.VITE_APP_CONSOLE_PREFIX}props.key的类型仅能为string/number/symbol`)
      }
    },
    ScopedSlots () {
      let result = {}
      for (let k in this.$scopedSlots) {
        if (k !== 'default') {
          result[k] = this.$scopedSlots[k]
        }
      }
      return result
    },
    elSelectProps () {
      return {
        clearable: true,
        filterable: true,
        remote: Boolean(this.Search),
        'reserve-keyword': true,
        'remote-method': this.remoteMethod,
        'value-key': this.valueComesFromObject ? this.Key : undefined,
        ...globalProps,
        ...this.$attrs,
        placeholder: this.Placeholder,
      }
    },
    Ellipsis () {
      const result = getFinalProp(this.ellipsis, globalProps.ellipsis, false)
      if (result) {
        this.$nextTick(() => {
          this.popper = this.$refs.elSelect.$refs.popper
          this.unwatchOptions = this.$watch('options', newVal => {
            if (newVal && newVal.length) {
              setTimeout(() => {
                if (this.popper) {
                  this.popper.$el.style.maxWidth = this.popper.minWidth
                }
              })
            }
          }, {
            immediate: true,
          })
        })
      } else {
        this.unwatchOptions?.()
      }
    },
    Placeholder () {
      return getFinalProp(this.placeholder, globalProps.placeholder, this.search ? '输入关键字搜索' : '请选择')
    },
    Key () {
      return this.Props.key
    },
    Label () {
      return this.Props.label
    },
    Props () {
      return getFinalProp(this.props, globalProps.props, {
        disabled: 'disabled',
        searchResponse: 'data',
        groupDisabled: 'disabled',
      })

      /*if (result.label) {
        const placeholders = result.label?.match(/\${[\dA-z_\$]*}/g)
        if (placeholders) {
          // 坑：ios不支持正则后顾 (?<=exp2)exp1 编译阶段就会报错 导致白屏
          // const props = this.label.match(/(?<=\${)[\dA-z_\$]*(?=})/g)
          const __labelTemplate = result.label
          result.label = objOption => {
            let res = __labelTemplate
            placeholders.map((v, i) => {
              const prop = v?.slice(2, -1)
              if (prop) {
                res = res.replace(placeholders[i], objOption[prop])
              } else {

              }
            })
            return res
          }
        }
      }*/
    },
    Search () {
      return getFinalProp(this.search, globalProps.search,)
    },
    SearchImmediately () {
      return getFinalProp(this.searchImmediately, globalProps.searchImmediately, true)
    }
  },
  data () {
    return {
      value__: this.value,
      popper: null,
      //showDropdown: false
      unwatchOptions: null,
      loading: false,
      defaultSearchResult: null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (newVal, oldVal) {
        this.value__ = newVal
      }
    },
    value__: {
      handler (newVal, oldVal) {
        if (isEmpty(newVal)) {
          if (this.defaultSearchResult) {
            this.$emit('update:options', this.defaultSearchResult)
          } else {
            this.remoteMethod()
          }
        }
        this.onBlur()
      }
    },
  },
  created () {
    if (this.SearchImmediately) {
      this.remoteMethod()
    }
  },
  methods: {
    uuidv1,
    remoteMethod (e) {
      if (!this.Search) {
        return
      }
      this.loading = true
      const result = this.Search(e)
      if (result instanceof Promise) {
        result.then(res => {
          this.$emit('update:options', res)
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.$emit('update:options', result)
        this.loading = false
      }
    },
    onChange (value) {
      if (this.valueComesFromObject) {
        this.$nextTick(() => {
          this.$emit('update:label', this.$refs.elSelect.selectedLabel)
        })
      }
      this.$emit('change', value)
    },
    onBlur () {
      // fix: 用于el表单中 且校验触发方式为blur时 没有生效
      if (this.$parent?.$options?._componentTag === ('el-form-item') && this.$parent.rules?.trigger === 'blur') {
        this.$parent.$emit('el.form.blur')
      }
    },
    getLabel (v) {
      let result = v
      if (this.Label) {
        if (typeof this.Label === 'function') {
          result = this.Label(v)
        } else if (this.itemTypeIsObject) {
          result = v[this.Label]
        }
      }
      return isEmpty(result) ? '' : String(result)
    },
    getRightLabel (v) {
      let result
      if (this.Props.rightLabel) {
        if (typeof this.Props.rightLabel === 'function') {
          result = this.Props.rightLabel(v)
        } else {
          result = v[this.Props.rightLabel]
        }
      }
      return isEmpty(result) ? '' : String(result)
    }
    /*onVisibleChange (show) {
      this.showDropdown = show
    },
    isEllipsis*/
  }
}
</script>

<style lang="scss">
.el-select-dropdown__item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > .label-left {
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    line-height: normal;
  }

  & > .label-right {
    flex-shrink: 0;
    color: #8492a6;
    font-size: 13px;
    margin-left: 1rem;
    font-weight: normal; // 默认选中时加粗
  }
}
</style>
