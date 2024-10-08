import { POST } from '@/utils/http'
import FaimLocale from '../../src/locale/zh-cn'

export default {
  locale: FaimLocale.FaImageUpload,
  maxCount: 5,
  maxSize: 512 * 1024,
  width: 800,
  height: 800,
  // resolution: 640000,
  // aspectRatio: '1:1',
  accept: '.jpg,.jpeg,.png,.gif',
  editable: true,
  arrayed: undefined,
  // outputType: 'image/png',
  requestParam: {
    original: 'true',
  },
  // srcAt: 'url',
  async upload(binary) {
    await new Promise(resolve => setTimeout(resolve, 500))

    return POST.upload(`${import.meta.env.VITE_APP_UPLOAD_API}/upload-api-noauth/upload`, {
      file: binary,
      dir: 'img',
      domainId: '1',
      ...this.$attrs.requestParam,
    }, {
      baseURL: '', // 针对 baseAPI 为相对路径的情况
      timeout: 20000,
    }).then(res => res.data.data)
  },
}
