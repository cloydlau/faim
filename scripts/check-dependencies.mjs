import fs from 'node:fs'
import process from 'node:process'
import { subset, validRange } from 'semver'
import { dependencyConstraints } from './dependency-constraints.mjs'

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const errors = []

for (const [name, allowedRange] of Object.entries(dependencyConstraints)) {
  const declaredRange = packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name]

  if (!declaredRange) {
    errors.push(`${name} 缺失，要求版本范围为 ${allowedRange}`)
    continue
  }

  if (!validRange(declaredRange) || !subset(declaredRange, allowedRange)) {
    errors.push(`${name} 当前为 ${declaredRange}，允许的版本范围为 ${allowedRange}`)
  }
}

if (errors.length) {
  console.error(`依赖版本检查失败：\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.info('依赖版本检查通过')
