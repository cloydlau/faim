let globalProps = {}

export const init = (opts = {}) => {
  for (let k in opts) {
    globalProps[k] = opts[k]
  }
}

export default globalProps
