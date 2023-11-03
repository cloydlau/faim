import fs from 'node:fs'
import spawn from 'cross-spawn'
import { cyan, green, red } from 'kolorist'
import { deleteAsync } from 'del'
import { isVue3 } from 'vue-demi'
import { name } from '../package.json'

declare const process: NodeJS.Process
type Format = 'cjs' | 'esm'

async function postinstall() {
  const cwd = process.cwd()
  const isDev = process.env.INIT_CWD === cwd
  const elementPlusPath = `${process.env.INIT_CWD}/node_modules/element-plus`

  if (isVue3) {
    if (fs.existsSync(elementPlusPath)) {
      console.log(cyan('[INFO] Patching el-upload source code'))
      const elUploadSourcePath = `${elementPlusPath}/es/components/upload/src/upload2.mjs`
      const elUploadSource = fs.readFileSync(elUploadSourcePath, 'utf-8')
      const whitespaces = elUploadSource.match(/(?<=expose\({)\s*/)?.[0] || '\n'
      const elUploadSourceNew = elUploadSource.replace(/expose\({(?!\s*uploadFiles,)/, `expose({${whitespaces}uploadFiles,`)
      if (elUploadSource !== elUploadSourceNew) {
        fs.writeFileSync(elUploadSourcePath, elUploadSourceNew)
        console.log(green('[INFO] Successfully patched el-upload source code'))
        console.log(cyan('[INFO] Vite re-bundling element-plus'))
        // Cannot delete files/directories outside the current working directory. Can be overridden with the `force` option.
        await deleteAsync([`${process.env.INIT_CWD}/node_modules/.vite/deps/element-plus.js*`], { force: true })
      }
    } else {
      throw new Error('Element Plus not installed')
    }
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
  const useFormDisabledSources: [string, string] = [
    'element-plus/es/components/form/src/hooks/use-form-common-props.mjs',
    '../../use-form-common-props',
  ]
  if (isVue3) {
    useFormDisabledSources.reverse()
  }

  for (const format of formats) {
    for (const component of componentsRelyOnElFormDisabled[format]) {
      const componentPath = `${cwd}/${dir}/components/${component}`
      console.log(cyan(`[INFO] Patching ${componentPath}`))
      const componentSource = fs.readFileSync(componentPath, 'utf-8')
      const componentSourceNew = componentSource.replace(...useFormDisabledSources)
      fs.writeFileSync(componentPath, componentSourceNew)
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

postinstall()
