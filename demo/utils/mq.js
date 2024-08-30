// 简易的前端消息队列，可控制请求并发上限，对于 HTTP ≤1.1 尤其有用
export default (concurrentMax = 6) => {
  const queue = []
  let currentActive = 0

  // 出队/消费消息
  const dequeue = () => {
    if (queue.length > 0 && currentActive < concurrentMax) {
      currentActive++
      const { promise, resolve, reject } = queue.shift()

      promise()
        .then((response) => {
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
        .finally(() => {
          currentActive--
          dequeue()
        })
    }
  }

  // 入队/生产消息
  const enqueue = (promise) => {
    return new Promise((resolve, reject) => {
      queue.push({ promise, resolve, reject })
      dequeue()
    })
  }

  return {
    produce: enqueue,
    consume: dequeue,
  }
}
