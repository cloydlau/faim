import fs from 'node:fs'
import spawn from 'cross-spawn'
import { generateCode, loadFile, parseModule, writeFile } from 'magicast'
import { cyan, red } from 'kolorist'
import { deleteAsync } from 'del'
import { isVue3 } from 'vue-demi'

declare const process: NodeJS.Process

async function postinstall() {
  // 开发环境，配置 git 钩子
  if (process.env.INIT_CWD === process.cwd()) {
    spawn.sync('npx', ['simple-git-hooks'], { stdio: 'inherit' })
  }

  if (isVue3) {
    const elementPlusPath = `${process.env.INIT_CWD}/node_modules/element-plus`
    if (fs.existsSync(elementPlusPath)) {
      console.log(red('[INFO] Patching el-upload source code'))
      const elUploadSourcePath = `${elementPlusPath}/es/components/upload/src/upload2.mjs`
      let mod = await loadFile(elUploadSourcePath)
      let { code } = generateCode(mod)
      const whitespaces = code.match(/(?<=expose\({)\s*/)?.[0] || '\n'
      code = code.replace(/expose\({(?!\s*uploadFiles,)/, `expose({${whitespaces}uploadFiles,`)
      mod = parseModule(code)
      await writeFile(mod, elUploadSourcePath)

      console.log(cyan('[INFO] Re-bundling vite deps'))
      await deleteAsync([`${process.env.INIT_CWD}/node_modules/.vite/deps/element-plus.js*`])
    } else {
      console.log(cyan('[INFO] You are using kikimore without element-plus'))
    }
  }
}

try {
  postinstall()
} catch (e) {
  console.error(e)
}
