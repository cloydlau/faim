import FaimLocale from 'faim/dist/locale/zh-cn.mjs'
import { POST } from '../request'

export default {
  locale: FaimLocale.FaImageUpload,
  size: 0.5,
  // width: 800,
  // height: 800,
  // resolution: 640000,
  count: 5,
  extensions: '.jpg,.jpeg,.png',
  editable: true,
  arrayed: undefined,
  aspectRatioTolerance: 0.1,
  requestParam: {
    original: 'true',
  },
  // srcAt: 'url',
  /* async upload(binary) {
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
  }, */
}
