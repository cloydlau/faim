import './highlightError.scss'

export default (
  el: string | Element | NodeList = '.el-form .el-form-item.is-error',
  smoothScrollbar: object,
): void => {
  const scrollIntoView = element => {
    smoothScrollbar.scrollIntoView(element)
  }
  const isVisible = element => smoothScrollbar.isVisible(element)

  const animateCSS = (el, animationName) =>
    new Promise<void>((resolve, reject) => {
      if (el) {
        // @ts-ignore
        for (let v of el instanceof NodeList ? el : [el]) {
          v.classList.add('animate__animated', animationName)

          const handleAnimationEnd = () => {
            v.classList.remove('animate__animated', animationName)
            v.removeEventListener('animationend', handleAnimationEnd)
            resolve()
          }

          v.addEventListener('animationend', handleAnimationEnd)
        }
      } else {
        reject()
      }
    })

  // is-error类名需要异步才能获取到
  setTimeout(() => {
    const errFormItems = typeof el === 'string' ? document.querySelectorAll(el) : el

    // 打包后不生效
    /*if (IntersectionObserver) {
      const intersectionObserver = new IntersectionObserver((entries) => {
        let [entry] = entries
        if (entry.isIntersecting) {
          console.log(entry)
          // 对所有校验失败的表单项产生震动效果
          setTimeout(() => {
            animateCSS(errFormItems, 'animate__headShake').catch(e => {
              console.warn(e)
            })
          }, 100)
        }
      })
      intersectionObserver.observe(errFormItems[0])
    }*/

    // 视图滚动至校验失败的第一个表单项
    if (errFormItems[0]) {
      if (isVisible(errFormItems[0])) {
        animateCSS(errFormItems, 'animate__headShake').catch(e => {
          console.warn(e)
        })
      } else {
        let scrollTimeout

        const shake = () => {
          // 滚动时会持续触发该回调
          clearTimeout(scrollTimeout)
          // 100毫秒都没有触发 说明滚动停止
          scrollTimeout = setTimeout(() => {
            animateCSS(errFormItems, 'animate__headShake').catch(e => {
              console.warn(e)
            })
            smoothScrollbar.removeListener(shake)
          }, 100)
        }

        smoothScrollbar.addListener(shake)

        scrollIntoView(errFormItems[0])
      }
    }
  }, 0)
}
