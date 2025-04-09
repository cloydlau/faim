#!/usr/bin/env node

import process from 'node:process'
import spawn from 'cross-spawn'
import { cyan } from 'kolorist'

async function postinstall() {
  const cwd = process.cwd()
  console.info(cyan(`[INFO] process.cwd(): ${process.cwd()}`))
  console.info(cyan(`[INFO] process.env.PWD: ${process.env.PWD}`))
  console.info(cyan(`[INFO] process.env.INIT_CWD: ${process.env.INIT_CWD}`))

  const isDev = process.env.INIT_CWD === cwd
  if (isDev) {
    spawn.sync('npx', ['simple-git-hooks'], { stdio: 'inherit' })
    spawn.sync('git', ['config', 'core.hooksPath', '.git/hooks/'], { stdio: 'inherit' })
    spawn.sync('npx', ['license-checker', '--summary', '--out', './licenses.txt'], { stdio: 'inherit' })
  }
}

postinstall()
