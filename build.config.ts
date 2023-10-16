import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { builder: 'mkdist', input: './src', format: 'cjs' },
    { builder: 'mkdist', input: './src', format: 'esm' },
  ],
})
