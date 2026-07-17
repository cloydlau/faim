export default function modifyQRCode(src) {
  // 二维码画布
  const width = 444
  const height = 444
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.src = src

  return new Promise((resolve, reject) => {
    img.onerror = (reason) => {
      reject(reason)
    }
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 内嵌图标
      const canvasEmbedded = document.createElement('canvas')
      const widthEmbedded = 148
      const heightEmbedded = 52
      canvasEmbedded.width = widthEmbedded
      canvasEmbedded.height = heightEmbedded

      // 背景
      const ctxEmbedded = canvasEmbedded.getContext('2d')
      ctxEmbedded.fillStyle = 'white'
      ctxEmbedded.fillRect(0, 0, widthEmbedded, heightEmbedded)

      // 边框
      ctxEmbedded.lineWidth = 5
      ctxEmbedded.strokeStyle = 'rgb(93,155,74)'
      ctxEmbedded.strokeRect(0, 0, widthEmbedded, heightEmbedded)

      // 编号，可换成图标等
      const text = '12345'
      const fontSize = 52
      ctxEmbedded.font = `bolder ${fontSize}px Arial`
      ctxEmbedded.fillStyle = 'rgb(93,155,74)'
      const textMetrics = ctxEmbedded.measureText(text)
      const textX = (widthEmbedded - textMetrics.width) / 2
      const textY = (heightEmbedded + 38) / 2
      ctxEmbedded.fillText(text, textX, textY)
      const x = (canvas.width - canvasEmbedded.width) / 2
      const y = (canvas.height - canvasEmbedded.height) / 2

      ctx.drawImage(canvasEmbedded, x, y)
      resolve(canvas.toDataURL())
    }
  })
}
