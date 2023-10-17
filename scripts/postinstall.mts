import fs from 'node:fs'
import spawn from 'cross-spawn'
import { cyan, red } from 'kolorist'
import { deleteAsync } from 'del'
import { isVue3 } from 'vue-demi'
import { name } from '../package.json'

declare const process: NodeJS.Process
type Format = 'cjs' | 'esm'

async function postinstall() {
  const cwd = process.cwd()
  const isDev = process.env.INIT_CWD === cwd
  const elementPlusPath = `${process.env.INIT_CWD}/node_modules/element-plus`
  const isElementPlusAvailable = isVue3 && fs.existsSync(elementPlusPath)

  if (isElementPlusAvailable) {
    console.log(red('[INFO] Patching el-upload source code'))
    const elUploadSourcePath = `${elementPlusPath}/es/components/upload/src/upload2.mjs`
    const elUploadSource = fs.readFileSync(elUploadSourcePath, 'utf-8')
    const whitespaces = elUploadSource.match(/(?<=expose\({)\s*/)?.[0] || '\n'
    fs.writeFileSync(elUploadSourcePath, elUploadSource.replace(/expose\({(?!\s*uploadFiles,)/, `expose({${whitespaces}uploadFiles,`))

    console.log(cyan('[INFO] Vite re-bundling element-plus'))
    // Cannot delete files/directories outside the current working directory. Can be overridden with the `force` option.
    await deleteAsync([`${process.env.INIT_CWD}/node_modules/.vite/deps/element-plus.js*`], { force: true })
  }

  const dir = isDev ? 'src' : 'dist'
  const formats: Format[] = ['esm']
  if (!isDev) {
    formats.unshift('cjs')
  }
  const componentsRelyOnElFormDisabled = {
    cjs: ['RichText/index.js'],
    esm: ['ImageUpload/index.vue', 'Upload/index.vue', ...isDev ? ['RichText/index.ts'] : ['RichText/index.mjs']],
  }
  const useFormDisabledSources: Record<Format, [string, string]> = {
    cjs: [
      'require("element-plus/es/components/form/src/hooks/use-form-common-props.mjs")',
      '() => undefined',
    ],
    esm: [
      'import \{ useFormDisabled \} from \'element-plus/es/components/form/src/hooks/use-form-common-props.mjs\'',
      'const useFormDisabled = () => undefined',
    ],
  }
  for (const format of formats) {
    if (isElementPlusAvailable) {
      useFormDisabledSources[format].reverse()
    }
    for (const component of componentsRelyOnElFormDisabled[format]) {
      const componentPath = `${cwd}/${dir}/components/${component}`
      console.log(cyan(`[INFO] Patching ${componentPath}`))
      fs.writeFileSync(componentPath, fs.readFileSync(componentPath, 'utf-8').replace(...useFormDisabledSources[format as Format]))
      if (isDev) {
        console.log(cyan(`[INFO] Linting ${componentPath}`))
        spawn('npx', ['eslint', componentPath, '--fix'], { stdio: 'inherit' })
      }
    }
  }

  if (isDev) {
    spawn.sync('npx', ['simple-git-hooks'], { stdio: 'inherit' })
  } else {
    console.log(cyan(`[INFO] Vite re-bundling ${name}`))
    // Cannot delete files/directories outside the current working directory. Can be overridden with the `force` option.
    await deleteAsync([`${process.env.INIT_CWD}/node_modules/.vite/deps/${name}`], { force: true })
  }
}

try {
  postinstall()
} catch (e) {
  console.error(e)
}
