/**
 * 请求调度中心
 * 能力：并发加载效果、业务异常处理、网络异常处理、全局默认配置、响应解套、错误提示、公共标头、便捷导出等
 * 用法示意参考 @/utils/http/demo.vue
 */

import axios from 'axios'
import { isPlainObject } from 'lodash-es'
import NProgress from './progress'

const methods = ['get', 'put', 'post', 'head', 'patch', 'delete', 'options', 'trace', 'connect']
const methodsHaveRequestBody = ['put', 'post', 'patch', 'delete', 'options']
const methodsHaveResponseBody = ['get', 'put', 'post', 'patch', 'delete', 'options', 'trace']

// 解析支持固定值或回调函数的请求配置项
const resolveOption = (option, response, defaultValue) => typeof option === 'function' ? option(response) : (option ?? defaultValue)

// 通过全局事件发送请求结果消息
const showMessage = (message, type = 'error') => {
  if (message) {
    document.dispatchEvent(new CustomEvent('http-message', {
      detail: { message, type },
    }))
  }
}

const axiosInstance = axios.create()

axiosInstance.interceptors.request.use((config) => {
  // config.showLoading 控制是否展示加载效果
  if (config.showLoading !== false) {
    NProgress.start()
  }
  // 参数为空时要传空对象，否则后端会报错
  if (methodsHaveRequestBody.includes(config.method.toLowerCase())) {
    config.data ??= {}
  }
  return config
})

axiosInstance.interceptors.response.use((response) => {
  const config = Object.assign({
    // 是否展示加载效果
    showLoading: true,
    // 提取响应值中的业务数据
    dataAt: response => response.data.data,
    // 提取响应值中的业务消息
    messageAt: response => response.data.message,
    // 是否成功
    isOK: response => response.data.code === '10000',
    // 是否未授权，未授权默认跳转登录
    isUnauthorized: response => response.data.code === '401',
    // 是否无权限，无权限默认跳转无权限页
    isForbidden: response => response.data.code === '98',
  }, response.config)
  if (config.showLoading) {
    NProgress.done()
  }
  if (isPlainObject(response.data)) {
    if (resolveOption(config.isUnauthorized, response, false)) {
      showMessage(resolveOption(config.messageAt, response))
      return Promise.reject(response.data)
    }
    else if (resolveOption(config.isForbidden, response, false)) {
      showMessage(resolveOption(config.messageAt, response))
      return Promise.reject(response.data)
    }
    else if (resolveOption(config.isOK, response, true)) {
      showMessage(resolveOption(config.messageAt, response), 'success')
      return config.dataAt === false ? response : resolveOption(config.dataAt, response)
    }
    else {
      showMessage(resolveOption(config.messageAt, response, '系统异常 请稍后重试'))
      return Promise.reject(response)
    }
  }
  return response
}, (error) => {
  if (error.code !== 'ERR_CANCELED') {
    showMessage(error.message ?? '网络异常 请稍后重试')
  }
  return Promise.reject(error)
})

// 为 Axios 实例生成请求、表单上传及下载快捷方法
const toShortcut = axios => ({
  ...Object.fromEntries(
    Array.from(methods, (method) => {
      const haveRequestBody = methodsHaveRequestBody.includes(method)
      const haveResponseBody = methodsHaveResponseBody.includes(method)

      const value = (url, dataOrParams, config) =>
        axios({
          ...config,
          data: dataOrParams,
          ...!haveRequestBody && { params: dataOrParams },
          method,
          url,
        })

      if (haveResponseBody) {
        value.download = (url, dataOrParams, config) =>
          axios({
            ...config,
            data: dataOrParams,
            ...!haveRequestBody && { params: dataOrParams },
            responseType: 'blob',
            method,
            url,
          })
      }

      return [`$${method}`, value]
    }),
  ),
  $download: (url, fileName = '') => {
    // 如果是浏览器支持预览的文件会优先预览，否则才会下载
    // window.open(url + stringify(params, { addQueryPrefix: true }))

    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url

    // Content-Disposition 响应头中指定的文件名优先级更高
    a.download = fileName

    // appendChild 和 remove 操作主要是为了兼容 Firefox 浏览器
    // 在 Firefox 浏览器下调用该方法如果不将创建的 <a> 标签添加到 body 里，点击链接不会有任何反应，无法触发下载
    // 而在 Chrome 浏览器中则不受此影响
    document.body.appendChild(a)

    a.click()
    URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  },
  $postForm: axiosInstance.postForm,
  $putForm: axiosInstance.putForm,
  $patchForm: axiosInstance.patchForm,
})

export const { $connect, $delete, $get, $head, $options, $patch, $post, $put, $trace, $download, $postForm, $putForm, $patchForm } = toShortcut(axiosInstance)
export default axiosInstance
