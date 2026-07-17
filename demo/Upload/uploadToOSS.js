import { $post, $postForm } from '@/utils/http'
import FaMessageBox from '../../src/components/MessageBox'

// 从业务响应、Axios 响应或普通异常中提取错误消息
function getErrorMessage(error) {
  return error?.data?.message
    ?? error?.response?.data?.message
    ?? error?.message
    ?? '上传失败，请稍后重试'
}

// 获取 OSS 临时凭证并将文件直传至 OSS
export default async function uploadToOSS(file, progress, abortController) {
  try {
    const policyResponse = await $post(
      import.meta.env.VITE_APP_OSS_POLICY_API,
      {
        bizType: 'ITEM',
        fileName: file.name,
      },
      {
        headers: {
          [import.meta.env.VITE_APP_OSS_TOKEN_HEADER]: import.meta.env.VITE_APP_OSS_TOKEN,
        },
        withCredentials: true,
        signal: abortController?.signal,
      },
    )
    const { host, policy, accessId, signature, objectKey, ossUrl } = policyResponse

    await $postForm(
      host,
      {
        policy,
        OSSAccessKeyId: accessId,
        signature,
        name: file.name,
        key: objectKey,
        file,
      },
      {
        withCredentials: false,
        onUploadProgress({ event }) {
          if (event.lengthComputable) {
            progress?.((event.loaded / file.size) * 100)
          }
        },
        signal: abortController?.signal,
      },
    )

    return ossUrl
  }
  catch (error) {
    progress?.(100)
    if (error?.code !== 'ERR_CANCELED') {
      void FaMessageBox.error(getErrorMessage(error))
    }
    throw error
  }
}
