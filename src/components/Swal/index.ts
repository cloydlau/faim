import 'sweetalert2/dist/sweetalert2.min.css'
import Swal from 'sweetalert2'
import './index.scss'
import { isPlainObject } from 'lodash-es'

function success (config: any) {
  return Swal.fire({
    titleText: config?.titleText || (typeof config === 'string' ? config : '操作成功'),
    icon: 'success',
    backdrop: false,
    timer: 2000,
    toast: true,
    position: 'top',
    showConfirmButton: false,
    ...isPlainObject(config) ? config : null,
  })
}

function info (config: any = {}) {
  let titleText
  if (typeof config === 'string') {
    titleText = config
    config = {}
  } else if (config) {
    titleText = config.titleText
  }

  return Swal.fire({
    titleText,
    icon: 'info',
    timer: 3000,
    toast: true,
    showConfirmButton: false,
    ...config,
  })
}

function warning (config: any = {}) {
  let titleText
  if (typeof config === 'string') {
    titleText = config
    config = {}
  } else if (config) {
    titleText = config.titleText
  }

  return Swal.fire({
    titleText,
    icon: 'warning',
    backdrop: false,
    timer: 5000,
    ...config,
  })
}

function error (cfg: string | object) {
  return Swal.fire({
    icon: 'error',
    //timer: 5000,
    allowOutsideClick: false,
    ...typeof cfg === 'string' ? { titleText: cfg } : cfg
  })
}

function confirm (config: any = {}) {
  return new Promise((resolve, reject) => {
    let titleText
    if (typeof config === 'string') {
      titleText = config
      config = {}
    } else if (config) {
      titleText = config.titleText
    }

    Swal.fire({
      titleText,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showCancelButton: true,
      ...config,
    }).then((e: any) => {
      e.isConfirmed ? resolve(e) : reject(e)
    })
  })
}

Swal.success = success
Swal.warning = warning
Swal.info = info
Swal.error = error
Swal.confirm = confirm

export {
  success, warning, info, error, confirm
}

export default Swal
