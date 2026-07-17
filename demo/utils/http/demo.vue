<script setup>
// 在 JS 中使用需导入，在 template 中使用无需导入
// import { $download, $get, $post, $postForm } from '@/utils/http'
</script>

<template>
  <div
    @click="() => {
      // 默认域名
      $post('xxx/xxx')

      // 非默认域名
      $post('https://xxx.com/xxx/xxx', { id: 1 })
      $post('xxx/xxx', { id: 1 }, { baseURL: 'https://xxx.com' })

      // 对于无请求体的请求方法（比如 GET），支持自动生成 URL 参数。比如 xxx/xxx?id=1 可以这样写：
      $get('xxx/xxx', { id: 1 })

      // 取消加载效果（比如想用按钮展示加载效果时）
      $post('xxx/xxx', { id: 1 }, { showLoading: false })

      // 提取响应值中的业务数据
      $post('xxx/xxx', { id: 1 }, { dataAt: response => response.data }) // 修改提取逻辑
      $post('xxx/xxx', { id: 1 }, { dataAt: false }) // 不提取，返回完整响应

      // 提取响应值中的业务消息
      $post('xxx/xxx', { id: 1 }, { messageAt: response => response.message }) // 修改提取逻辑
      $post('xxx/xxx', { id: 1 }, { messageAt: false }) // 不提示消息

      // 是否成功
      $post('xxx/xxx', { id: 1 }, { isOK: response => response.data.code === 200 }) // 修改成功判断逻辑
      $post('xxx/xxx', { id: 1 }, { isOK: true }) // 强制成功

      // 是否未授权
      $post('xxx/xxx', { id: 1 }, { isUnauthorized: response => response.statusCode === 401 }) // 修改未授权判断逻辑
      $post('xxx/xxx', { id: 1 }, { isUnauthorized: false }) // 忽略未授权

      // 是否无权限
      $post('xxx/xxx', { id: 1 }, { isForbidden: response => response.statusCode === 403 }) // 修改无权限判断逻辑
      $post('xxx/xxx', { id: 1 }, { isForbidden: false }) // 忽略无权限

      // 上传
      $postForm('xxx/xxx', { id: 1 })

      // 下载
      $post.download('xxx/xxx', { id: 1 })

      // 下载静态资源
      $download('https://xxx.jpg', 'xxx.jpg')

      // 下载跨域静态资源
      $get.download('https://xxx.jpg').then((data) => {
        $download(URL.createObjectURL(data), 'xxx.jpg')
      })

      // 下载本地纯文本静态资源
      const text = 'Hello World'
      $download(URL.createObjectURL(new Blob([text], { type: 'text/plain' })), 'xxx.txt')

      // 下载本地 JSON 静态资源
      const json = { hello: 'world' }
      $download(URL.createObjectURL(new Blob([JSON.stringify(json)], { type: 'application/json' })), 'xxx.json')
    }"
  />
</template>
