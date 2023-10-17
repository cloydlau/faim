/* eslint-disable prefer-rest-params */
import Swal from 'sweetalert2'
import type { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2'

type Awaited<T> = T extends Promise<infer U> ? U : T

function success<T = any>(options: SweetAlertOptions): Promise<SweetAlertResult<Awaited<T>>>
function success<T = any>(title?: string, html?: string, icon?: SweetAlertIcon): Promise<SweetAlertResult<Awaited<T>>>
function success() {
  const [titleOrOptions, html, icon] = arguments

  if (!titleOrOptions) {
    console.error('Parameter is empty')
    return
  }

  const options = typeof titleOrOptions === 'string'
    ? {
        title: titleOrOptions,
        ...html && { html },
        ...icon && { icon },
      }
    : titleOrOptions

  return Swal.fire({
    icon: 'success',
    toast: true,
    timer: 2000,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    position: 'top',
    showConfirmButton: false,
    ...options,
  })
}

function info<T = any>(options: SweetAlertOptions): Promise<SweetAlertResult<Awaited<T>>>
function info<T = any>(title?: string, html?: string, icon?: SweetAlertIcon): Promise<SweetAlertResult<Awaited<T>>>
function info() {
  const [titleOrOptions, html, icon] = arguments

  if (!titleOrOptions) {
    console.error('Parameter is empty')
    return
  }

  const options = typeof titleOrOptions === 'string'
    ? {
        title: titleOrOptions,
        ...html && { html },
        ...icon && { icon },
      }
    : titleOrOptions

  return Swal.fire({
    icon: 'info',
    toast: true,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    showConfirmButton: false,
    ...options,
  })
}

function warning<T = any>(options: SweetAlertOptions): Promise<SweetAlertResult<Awaited<T>>>
function warning<T = any>(title?: string, html?: string, icon?: SweetAlertIcon): Promise<SweetAlertResult<Awaited<T>>>
function warning() {
  const [titleOrOptions, html, icon] = arguments

  if (!titleOrOptions) {
    console.error('Parameter is empty')
    return
  }

  const options = typeof titleOrOptions === 'string'
    ? {
        title: titleOrOptions,
        ...html && { html },
        ...icon && { icon },
      }
    : titleOrOptions

  return Swal.fire({
    icon: 'warning',
    backdrop: false,
    confirmButtonColor: '#66b1ff',
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    ...options,
  })
}

function error<T = any>(options: SweetAlertOptions): Promise<SweetAlertResult<Awaited<T>>>
function error<T = any>(title?: string, html?: string, icon?: SweetAlertIcon): Promise<SweetAlertResult<Awaited<T>>>
function error() {
  const [titleOrOptions, html, icon] = arguments

  if (!titleOrOptions) {
    console.error('Parameter is empty')
    return
  }

  const options = typeof titleOrOptions === 'string'
    ? {
        title: titleOrOptions,
        ...html && { html },
        ...icon && { icon },
      }
    : titleOrOptions

  // timer 不为0时才会触发 Promise.resolve
  return Swal.fire({
    icon: 'error',
    allowOutsideClick: false,
    confirmButtonColor: '#66b1ff',
    ...options,
  })
}

function confirm<T = any>(options: SweetAlertOptions): Promise<SweetAlertResult<Awaited<T>>>
function confirm<T = any>(title?: string, html?: string, icon?: SweetAlertIcon): Promise<SweetAlertResult<Awaited<T>>>
function confirm() {
  const [titleOrOptions, html, icon] = arguments

  if (!titleOrOptions) {
    console.error('Parameter is empty')
    return
  }

  const options = typeof titleOrOptions === 'string'
    ? {
        title: titleOrOptions,
        ...html && { html },
        ...icon && { icon },
      }
    : titleOrOptions

  return new Promise((resolve, reject) => {
    Swal.fire({
      icon: 'question',
      confirmButtonColor: '#66b1ff',
      showCancelButton: true,
      reverseButtons: true,
      allowOutsideClick: false,
      ...options,
    }).then((e: any) => {
      e.isConfirmed ? resolve(e) : reject(e)
    })
  })
}

export default Object.assign(Swal, { success, warning, info, error, confirm })
