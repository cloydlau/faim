import fs from 'node:fs'
import spawn from 'cross-spawn'

console.info('正在更新所有依赖...')
spawn.sync('pnpm', ['up', '--latest'], { stdio: 'inherit' })

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const versionsToModify = {
  cropperjs: '^1',
  tinymce: '^6',
}

for (const [pkg, version] of Object.entries(versionsToModify)) {
  if (packageJson.dependencies?.[pkg]) {
    packageJson.dependencies[pkg] = version
    console.info(`已修改 dependencies.${pkg} 为 ${version}`)
  }
  if (packageJson.devDependencies?.[pkg]) {
    packageJson.devDependencies[pkg] = version
    console.info(`已修改 devDependencies.${pkg} 为 ${version}`)
  }
}

fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`)

console.info('\n正在安装依赖...')
spawn('pnpm', ['install'], { stdio: 'inherit' })
