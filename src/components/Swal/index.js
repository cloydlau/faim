import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'
import './index.scss'
import { isPlainObject } from 'lodash-es'

function success (config) {
  return Swal.fire({
    titleText: config?.titleText || (typeof config === 'string' ? config : '操作成功'),
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    ...isPlainObject(config) ? config : null,
  })
}

function info (config = {}) {
  let titleText
  if (typeof config === 'string') {
    titleText = config
    config = {}
  } else if (config) {
    titleText = config.titleText
  }

  if (titleText) {
    return Swal.fire({
      titleText,
      icon: 'info',
      timer: 2000,
      toast: true,
      showConfirmButton: false,
      ...config,
    })
  }
}

function warning (config = {}) {
  let titleText
  if (typeof config === 'string') {
    titleText = config
    config = {}
  } else if (config) {
    titleText = config.titleText
  }

  if (titleText) {
    return Swal.fire({
      titleText,
      icon: 'warning',
      timer: 3000,
      toast: true,
      ...config,
    })
  }
}

function error (titleText) {
  if (titleText) {
    return Swal.fire({
      icon: 'error',
      titleText,
      timer: 5000,
      allowOutsideClick: false,
      allowEscapeKey: true,
    })
  }
}

function confirm (config = {}, force) {
  return new Promise((resolve, reject) => {
    let title
    if (typeof config === 'string') {
      title = config
      config = {}
    } else if (config) {
      title = config.title
    }

    title && Swal.fire({
      title,
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      ...force && {
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      },
      ...config,
    }).then(e => {
      e.isConfirmed ? resolve(e) : reject(e)
    })
  })
}

Swal.success = success
Swal.warning = warning
Swal.info = info
Swal.error = error
Swal.confirm = confirm

Swal.install = Vue => {
  Vue.prototype.Swal__ = Swal
  Vue.prototype.success__ = success
  Vue.prototype.info__ = info
  Vue.prototype.warning__ = warning
  Vue.prototype.error__ = error
  Vue.prototype.confirm__ = confirm
}

export {
  success, warning, info, error, confirm
}

export default Swal
