import fs from 'node:fs'
import process from 'node:process'
import spawn from 'cross-spawn'
import ncu from 'npm-check-updates'
import { minVersion } from 'semver'
import { dependencyConstraints } from './dependency-constraints.mjs'

console.info('正在更新所有依赖...')
const excludedDependencies = Object.keys(dependencyConstraints).map(name => `!${name}`)
const updateResult = spawn.sync('nup', ['-L', ...excludedDependencies], { stdio: 'inherit' })
if (updateResult.status !== 0) {
  process.exit(updateResult.status ?? 1)
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

for (const [pkg, allowedRange] of Object.entries(dependencyConstraints)) {
  const dependencyType = packageJson.dependencies?.[pkg]
    ? 'dependencies'
    : packageJson.devDependencies?.[pkg]
      ? 'devDependencies'
      : undefined

  if (!dependencyType) {
    throw new Error(`未找到依赖 ${pkg}`)
  }

  const major = minVersion(allowedRange)?.major
  if (major === undefined) {
    throw new Error(`无法解析 ${pkg} 的版本范围 ${allowedRange}`)
  }

  const upgrades = await ncu({
    cooldown: '1d',
    packageData: {
      [dependencyType]: {
        [pkg]: `${major}.0.0`,
      },
    },
    packageManager: 'pnpm',
    target: 'minor',
    jsonUpgraded: true,
    silent: true,
  })
  const latestVersion = upgrades?.[pkg] ?? `${major}.0.0`
  const rangePrefix = allowedRange.match(/^[~^]/)?.[0] ?? ''
  const latestRange = `${rangePrefix}${latestVersion}`

  packageJson[dependencyType][pkg] = latestRange
  console.info(`已选择 ${pkg}@${latestRange}`)
}

fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`)

console.info('\n正在安装依赖...')
const installResult = spawn.sync('pnpm', ['install'], { stdio: 'inherit' })
if (installResult.status !== 0) {
  process.exit(installResult.status ?? 1)
}
