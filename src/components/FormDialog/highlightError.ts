import elementIsVisible from './elementIsVisible'
import './highlightError.css'

export default (
  selectors: string | Element | NodeList = '.el-form .el-form-item.is-error',
  container = window,
): void => {
  const scrollIntoView = (element: Element) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  const animateCSS = (el: Element | NodeList, animationName: string) =>
    new Promise<void>((resolve) => {
      if (el) {
        for (const v of el instanceof NodeList ? Array.from(el) : [el]) {
          (v as Element).classList.add('animate__animated', animationName)

          const handleAnimationEnd = () => {
            (v as Element).classList.remove('animate__animated', animationName)
            v.removeEventListener('animationend', handleAnimationEnd)
            resolve()
          }

          v.addEventListener('animationend', handleAnimationEnd)
        }
      }
    })

  // is-error类名需要异步才能获取到
  setTimeout(() => {
    const errFormItems
      = typeof selectors === 'string' ? document.querySelectorAll(selectors) : selectors as NodeList

    // 打包后不生效
    /* if (IntersectionObserver) {
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
    } */

    // 视图滚动至校验失败的第一个表单项
    if (errFormItems.item(0)) {
      if (elementIsVisible(errFormItems.item(0) as Element)) {
        animateCSS(errFormItems, 'animate__headShake').catch((e) => {
          console.warn(e)
        })
      }
      else {
        let scrollTimeout: number

        function shake() {
          // 第二次触发会清除第一次，第三次触发会清除第二次...
          // 直到最后一次超过100毫秒才清除，此时清除已经无效
          // 100毫秒都没有触发，说明滚动停止
          clearTimeout(scrollTimeout)
          scrollTimeout = window.setTimeout(() => {
            animateCSS(errFormItems, 'animate__headShake').catch((e) => {
              console.warn(e)
            })
            container.removeEventListener('scroll', shake)
          }, 100)
        }

        container.addEventListener('scroll', shake)
        scrollIntoView(errFormItems.item(0) as Element)
      }
    }
  }, 0)
}
