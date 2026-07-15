import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import spawn from 'cross-spawn'

// 构建演示站点，并在同级文档仓库存在时同步构建产物。
function buildDemo() {
  const buildResult = spawn.sync('pnpm', ['exec', 'vite', 'build', '--mode', 'demo'], { stdio: 'inherit' })
  if (buildResult.status !== 0) {
    process.exit(buildResult.status ?? 1)
  }

  const distPath = path.resolve('dist.demo')
  const playgroundPath = path.resolve('..', 'cloydlau.github.io', 'playground')
  if (!fs.existsSync(playgroundPath)) {
    console.info(`未找到 ${playgroundPath}，跳过同步演示站点`)
    return
  }

  const targetPath = path.join(playgroundPath, 'faim')
  try {
    fs.rmSync(targetPath, { recursive: true, force: true })
  }
  catch (error) {
    console.warn(`移除 ${targetPath} 失败，将继续尝试覆盖复制`, error)
  }

  fs.cpSync(distPath, targetPath, { recursive: true, force: true })
  console.info(`已将演示站点同步至 ${targetPath}`)
}

buildDemo()
