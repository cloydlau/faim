import spawn from 'cross-spawn'
import { generateCode, loadFile, parseModule, writeFile } from 'magicast'
import { cyan } from 'kolorist'
import { deleteAsync } from 'del'

declare const process: NodeJS.Process

async function postinstall() {
  console.log('postinstall')
  // 开发环境，配置 git 钩子
  if (process.env.INIT_CWD === process.cwd()) {
    console.log(1)
    spawn.sync('npx', ['simple-git-hooks'], { stdio: 'inherit' })
  }

  console.log(cyan('Patching el-upload source code'))
  const elUploadSourcePath = './node_modules/element-plus/es/components/upload/src/upload2.mjs'
  let mod = await loadFile(elUploadSourcePath)
  let { code } = generateCode(mod)
  const whitespaces = code.match(/(?<=expose\({)\s*/)?.[0] || '\n'
  code = code.replace(/expose\({(?!\s*uploadFiles,)/, `expose({${whitespaces}uploadFiles,`)
  mod = parseModule(code)
  await writeFile(mod, elUploadSourcePath)

  console.log(cyan('Re-bundling vite deps'))
  console.log(await deleteAsync(['./node_modules/.vite/deps/element-plus.js*']))
}

try {
  postinstall()
} catch (e) {
  console.error(e)
}
