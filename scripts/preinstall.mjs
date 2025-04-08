import fs from 'node:fs'
import process from 'node:process'
import spawn from 'cross-spawn'
import { destr } from 'destr'
import { cyan } from 'kolorist'

async function postinstall() {
  const cwd = process.cwd()
  console.info(cyan(`[INFO] process.cwd(): ${process.cwd()}`))
  console.info(cyan(`[INFO] process.env.PWD: ${process.env.PWD}`))
  console.info(cyan(`[INFO] process.env.INIT_CWD: ${process.env.INIT_CWD}`))
  const isDev = process.env.INIT_CWD === cwd

  if (isDev) {
    spawn.sync('npx', ['only-allow', 'pnpm'], { stdio: 'inherit' })
    spawn.sync('pnpm', ['config', 'set', 'registry', 'https://registry.npmmirror.com'], { stdio: 'inherit' })
    const npmConfig = destr(fs.readFileSync('./package.json', 'utf-8'))
    npmConfig.dependencies.cropperjs = '^1'
    npmConfig.dependencies.tinymce = '^6'
    fs.writeFileSync('./package.json', JSON.stringify(npmConfig, null, 2))
  }
}

postinstall()
