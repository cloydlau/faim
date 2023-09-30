import Swal from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2'

function success(options: string | SweetAlertOptions) {
  if (!options) {
    console.error('Options is required.')
    return
  }

  const Options = typeof options === 'string' ? { titleText: options } : options

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
    ...Options,
  })
}

function info(options: string | SweetAlertOptions) {
  if (!options) {
    console.error('Options is required.')
    return
  }

  const Options = typeof options === 'string' ? { titleText: options } : options

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
    ...Options,
  })
}

function warning(options: string | SweetAlertOptions) {
  if (!options) {
    console.error('Options is required.')
    return
  }

  const Options = typeof options === 'string' ? { titleText: options } : options

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
    ...Options,
  })
}

function error(options: string | SweetAlertOptions) {
  if (!options) {
    console.error('Options is required.')
    return
  }

  const Options = typeof options === 'string' ? { titleText: options } : options

  // timer 不为0时才会触发 Promise.resolve
  return Swal.fire({
    icon: 'error',
    allowOutsideClick: false,
    confirmButtonColor: '#66b1ff',
    ...Options,
  })
}

function confirm(options: string | SweetAlertOptions) {
  if (!options) {
    console.error('Options is required.')
    return
  }

  const Options = typeof options === 'string' ? { titleText: options } : options

  return new Promise((resolve, reject) => {
    Swal.fire({
      icon: 'question',
      confirmButtonColor: '#66b1ff',
      showCancelButton: true,
      reverseButtons: true,
      allowOutsideClick: false,
      ...Options,
    }).then((e: any) => {
      e.isConfirmed ? resolve(e) : reject(e)
    })
  })
}

export default { success, warning, info, error, confirm }
